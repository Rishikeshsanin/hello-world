const REPO = "Rishikeshsanin/hello-world";
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/main/`;
const GITHUB_BASE = `https://github.com/${REPO}/blob/main/`;

const palette = ["#c7ff6b", "#79d9ff", "#a78bfa", "#ffb68a", "#ff91c8", "#76e6c8", "#f9d66b"];
const heroSamples = [
  { file: "hello.py", comment: "# small starts become big things", code: '<span class="fn">print</span><span class="plain">(</span><span class="string">"Hello, World!"</span><span class="plain">)</span>' },
  { file: "main.rs", comment: "// begin curious, keep building", code: '<span class="fn">println!</span><span class="plain">(</span><span class="string">"Hello, World!"</span><span class="plain">);</span>' },
  { file: "main.go", comment: "// one line can open a whole world", code: '<span class="fn">fmt.Println</span><span class="plain">(</span><span class="string">"Hello, World!"</span><span class="plain">)</span>' },
  { file: "hello.js", comment: "// make something that makes you smile", code: '<span class="fn">console.log</span><span class="plain">(</span><span class="string">"Hello, World!"</span><span class="plain">);</span>' },
];

const state = { languages: [], query: "", category: "All", current: null };
const $ = (selector) => document.querySelector(selector);
const grid = $("#languageGrid");
const filters = $("#filters");
const searchInput = $("#searchInput");
const resultCount = $("#resultCount");
const emptyState = $("#emptyState");
const clearButton = $("#clearButton");
const modal = $("#codeModal");
const backdrop = $("#modalBackdrop");
const modalCode = $("#modalCode");
const modalLoading = $("#modalLoading");
const copyButton = $("#copyButton");
const toast = $("#toast");

async function boot() {
  restoreTheme();
  rotateHero();
  try {
    const response = await fetch("./catalog.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Catalog unavailable");
    state.languages = await response.json();
    hydrateStats();
    renderFilters();
    renderLanguages();
  } catch (error) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-face">:(</div><h3>The atlas could not load.</h3><p>Please refresh and try again.</p></div>`;
  }
}

function hydrateStats() {
  $("#languageCount").textContent = state.languages.length;
  $("#categoryCount").textContent = new Set(state.languages.map((item) => item.category)).size;
}

function renderFilters() {
  const categories = ["All", ...new Set(state.languages.map((item) => item.category).sort())];
  filters.innerHTML = categories.map((category) => `<button class="filter-chip${category === state.category ? " active" : ""}" data-category="${escapeHtml(category)}" type="button">${escapeHtml(category)}</button>`).join("");
  filters.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;
      renderFilters();
      renderLanguages();
    });
  });
}

function getFilteredLanguages() {
  const query = state.query.trim().toLowerCase();
  return state.languages.filter((item) => {
    const categoryMatch = state.category === "All" || item.category === state.category;
    const haystack = `${item.name} ${item.file} ${item.category}`.toLowerCase();
    return categoryMatch && (!query || haystack.includes(query));
  });
}

function renderLanguages() {
  const items = getFilteredLanguages();
  resultCount.textContent = `${items.length} ${items.length === 1 ? "language" : "languages"}`;
  clearButton.hidden = !state.query && state.category === "All";
  emptyState.hidden = items.length !== 0;
  grid.hidden = items.length === 0;

  grid.innerHTML = items.map((item) => {
    const index = state.languages.indexOf(item);
    const accent = palette[index % palette.length];
    const initials = getInitials(item.name);
    return `
      <button class="language-card" data-index="${index}" type="button" style="--accent:${accent}" aria-label="Open ${escapeHtml(item.name)} Hello World">
        <div class="card-top"><span class="language-icon">${escapeHtml(initials)}</span><span class="card-arrow">↗</span></div>
        <h3>${escapeHtml(item.name)}</h3>
        <div class="card-meta"><span>${escapeHtml(item.file)}</span><span>•</span><span>${escapeHtml(item.category)}</span></div>
      </button>`;
  }).join("");

  grid.querySelectorAll(".language-card").forEach((card) => {
    card.addEventListener("click", () => openLanguage(state.languages[Number(card.dataset.index)]));
  });
}

function getInitials(name) {
  const cleaned = name.replace(/\([^)]*\)/g, "").trim();
  if (["C", "R", "D"].includes(cleaned)) return cleaned;
  if (cleaned.includes("#")) return "C#";
  if (cleaned === "C++") return "C+";
  const parts = cleaned.split(/[\s.-]+/).filter(Boolean);
  return parts.length > 1 ? parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase() : cleaned.slice(0, 2).toUpperCase();
}

async function openLanguage(item) {
  if (!item) return;
  state.current = item;
  $("#modalLanguage").textContent = item.name;
  $("#modalCategory").textContent = item.category;
  $("#modalFile").textContent = item.file;
  $("#githubFileLink").href = `${GITHUB_BASE}${encodePath(item.path)}`;
  modalCode.textContent = "Loading source…";
  modalLoading.textContent = "loading source…";
  copyButton.textContent = "Copy code";
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add("show"));
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  try {
    const response = await fetch(`${RAW_BASE}${encodePath(item.path)}`);
    if (!response.ok) throw new Error("Could not load source");
    modalCode.textContent = await response.text();
    modalLoading.textContent = "source loaded ✓";
  } catch (error) {
    modalCode.textContent = "// Source preview is unavailable right now.\n// Open the file on GitHub to view it.";
    modalLoading.textContent = "preview unavailable";
  }
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  backdrop.classList.remove("show");
  document.body.style.overflow = "";
  window.setTimeout(() => { backdrop.hidden = true; }, 250);
}

function randomHello() {
  if (!state.languages.length) return;
  const pool = getFilteredLanguages().length ? getFilteredLanguages() : state.languages;
  let pick = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length > 1 && state.current && pick.path === state.current.path) pick = pool[(pool.indexOf(pick) + 1) % pool.length];
  openLanguage(pick);
}

function resetFilters() {
  state.query = "";
  state.category = "All";
  searchInput.value = "";
  renderFilters();
  renderLanguages();
  searchInput.focus();
}

async function copyCurrentCode() {
  const text = modalCode.textContent;
  if (!text || text.startsWith("Loading")) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  copyButton.textContent = "Copied ✓";
  showToast("Copied to clipboard ✦");
  window.setTimeout(() => { copyButton.textContent = "Copy code"; }, 1500);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1700);
}

function rotateHero() {
  let index = 0;
  const update = () => {
    const sample = heroSamples[index % heroSamples.length];
    $("#heroFile").textContent = sample.file;
    $("#heroComment").textContent = sample.comment;
    $("#heroCode").innerHTML = sample.code;
    index += 1;
  };
  update();
  window.setInterval(update, 3200);
}

function restoreTheme() {
  const saved = localStorage.getItem("hello-world-theme");
  const preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.documentElement.dataset.theme = saved || preferred;
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("hello-world-theme", next);
  showToast(`${next === "dark" ? "Dark" : "Light"} mode ✦`);
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

searchInput.addEventListener("input", (event) => { state.query = event.target.value; renderLanguages(); });
$("#randomButton").addEventListener("click", randomHello);
$("#randomHeroButton").addEventListener("click", randomHello);
$("#clearButton").addEventListener("click", resetFilters);
$("#emptyResetButton").addEventListener("click", resetFilters);
$("#modalClose").addEventListener("click", closeModal);
backdrop.addEventListener("click", closeModal);
copyButton.addEventListener("click", copyCurrentCode);
$("#themeButton").addEventListener("click", toggleTheme);

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
  if (event.key === "/" && !typing) { event.preventDefault(); searchInput.focus(); }
  if ((event.key === "r" || event.key === "R") && !typing && modal.getAttribute("aria-hidden") === "true") randomHello();
  if (event.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeModal();
});

boot();
