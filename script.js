// ===== Pas hier aan =====
// Prijzen komen van hun Fresha-pagina (opgehaald 6 okt 2026).
const BOOKING_URL = "https://www.fresha.com/nl/a/fofo-leuven-parijsstraat-43-b87y7ksf/booking?menu=true";

const PRICES = {
  heren: [
    { name: "Knippen", time: "30 min", price: 20 },
    { name: "Baard", time: "20 min", price: 15 },
    { name: "Haar & baard", time: "45 min", price: 30 },
    { name: "Wassen", time: "10 min", price: 5 },
    { name: "Wenkbrauwen", time: "15 min", price: 10 },
    { name: "Threading gezichtshaar", time: "15 min", price: 10 },
  ],
  dames: [
    { name: "Haarsnit kort", time: "45 min", price: 25 },
    { name: "Haarsnit lang", time: "45 min", price: 35 },
    { name: "Wenkbrauwen", time: "30 min", price: 15 },
    { name: "Threading gezichtshaar", time: "30 min", price: 20 },
    { name: "Wassen", time: "10 min", price: 5 },
  ],
};

// 0 = zondag … 6 = zaterdag. null = gesloten.
const HOURS = { 0: ["10:00", "19:00"], 1: null, 2: ["10:00", "19:00"], 3: ["10:00", "19:00"], 4: ["10:00", "19:00"], 5: ["10:00", "19:00"], 6: ["10:00", "19:00"] };
const DAY_NAMES = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

// ===== Boeking-links =====
document.querySelectorAll("[data-book]").forEach(a => {
  a.href = BOOKING_URL;
  a.target = "_blank";
  a.rel = "noopener";
});

// ===== Prijzen + tabs =====
const list = document.getElementById("priceList");
function renderPrices(kind) {
  list.innerHTML = PRICES[kind].map((p, i) => `
    <div class="row" style="animation-delay:${i * 60}ms">
      <h3>${p.name}</h3><span class="price">€${p.price}</span>
      <small>${p.time}</small>
    </div>`).join("");
}
document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(t => {
    const on = t === tab;
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-selected", on);
  });
  renderPrices(tab.dataset.tab);
}));
renderPrices("heren");

// ===== Openingsuren + live status (Belgische tijd) =====
function brusselsNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), mins: (+get("hour") % 24) * 60 + +get("minute") };
}
const toMins = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

function renderHours() {
  const { day, mins } = brusselsNow();
  document.getElementById("hours").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
    const h = HOURS[d];
    return `<tr class="${d === day ? "is-today" : ""}"><td>${DAY_NAMES[d]}</td><td>${h ? `${h[0]} – ${h[1]}` : "Gesloten"}</td></tr>`;
  }).join("");

  const today = HOURS[day];
  const isOpen = !!today && mins >= toMins(today[0]) && mins < toMins(today[1]);
  let text;
  if (isOpen) text = `Nu open · tot ${today[1]}`;
  else if (today && mins < toMins(today[0])) text = `Gesloten · opent vandaag om ${today[0]}`;
  else {
    let n = 1;
    while (n < 8 && !HOURS[(day + n) % 7]) n++;
    const d = (day + n) % 7;
    text = `Gesloten · opent ${n === 1 ? "morgen" : DAY_NAMES[d].toLowerCase()} om ${HOURS[d][0]}`;
  }
  document.querySelector("[data-status-text]").textContent = text;
  document.querySelector("[data-status-box]").classList.toggle("is-open", isOpen);
  const s = document.querySelector("[data-status]");
  s.classList.toggle("is-open", isOpen);
  s.textContent = isOpen ? "Nu open · Parijsstraat 43, Leuven" : "Parijsstraat 43 · Leuven";
}
renderHours();
setInterval(renderHours, 60_000);

// ===== Nav =====
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 30);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}));

// ===== Reveal =====
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
}), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 90}ms`;
  io.observe(el);
});

document.getElementById("year").textContent = new Date().getFullYear();
