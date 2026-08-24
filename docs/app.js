const grid = document.querySelector('#languageGrid');
const searchInput = document.querySelector('#searchInput');
const filters = document.querySelector('#filters');
const emptyState = document.querySelector('#emptyState');
const languageCount = document.querySelector('#languageCount');

let catalog = [];
let activeCategory = 'All';

const accentFor = (name) => {
  const accents = ['#38bdf8', '#a78bfa', '#34d399', '#f59e0b', '#fb7185', '#22d3ee'];
  return accents[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % accents.length];
};

const repoBase = 'https://github.com/Rishikeshsanin/hello-world/blob/main/';

function renderFilters() {
  const categories = ['All', ...new Set(catalog.map(item => item.category))];
  filters.innerHTML = categories.map(category => `
    <button class="filter ${category === activeCategory ? 'active' : ''}" data-category="${category}">${category}</button>
  `).join('');
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const visible = catalog.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const haystack = `${item.name} ${item.category} ${item.file}`.toLowerCase();
    return matchesCategory && haystack.includes(query);
  });

  grid.innerHTML = visible.map(item => `
    <a class="card" style="--card-accent:${accentFor(item.name)}" href="${repoBase}${item.path}" target="_blank" rel="noreferrer">
      <div class="card-top">
        <div><h3>${item.name}</h3><small>${item.category}</small></div>
        <span class="arrow">↗</span>
      </div>
      <code>${item.file}</code>
    </a>
  `).join('');

  emptyState.hidden = visible.length !== 0;
}

filters.addEventListener('click', event => {
  const button = event.target.closest('button[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  render();
});

searchInput.addEventListener('input', render);

fetch('./catalog.json')
  .then(response => {
    if (!response.ok) throw new Error('Catalog failed to load');
    return response.json();
  })
  .then(data => {
    catalog = data;
    languageCount.textContent = catalog.length;
    renderFilters();
    render();
  })
  .catch(() => {
    grid.innerHTML = '<p class="empty">The catalog could not be loaded. Browse the repository on GitHub instead.</p>';
  });
