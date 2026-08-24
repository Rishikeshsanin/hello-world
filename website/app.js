const REPO = 'Rishikeshsanin/hello-world';
const BRANCH = 'main';
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/`;
const BLOB_BASE = `https://github.com/${REPO}/blob/${BRANCH}/`;

const el = id => document.getElementById(id);
const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const encodePath = path => path.split('/').map(encodeURIComponent).join('/');

let catalog = [];
let activeCategory = 'All';
let activeModalItem = null;
let currentQuestion = null;
let score = 0;
let streak = 0;
let questionLocked = false;
const sourceCache = new Map();

const knownMeta = {
  'C': {born:'1972', creator:'Dennis Ritchie', typing:'Static', execution:'Compiled', used:'Systems · Embedded'},
  'C++': {born:'1985', creator:'Bjarne Stroustrup', typing:'Static', execution:'Compiled', used:'Systems · Games'},
  'C#': {born:'2000', creator:'Microsoft', typing:'Static', execution:'Compiled / JIT', used:'.NET · Apps · Games'},
  'Java': {born:'1995', creator:'James Gosling', typing:'Static', execution:'JVM', used:'Backend · Android · Enterprise'},
  'JavaScript': {born:'1995', creator:'Brendan Eich', typing:'Dynamic', execution:'JIT / Interpreted', used:'Web · Apps · Servers'},
  'TypeScript': {born:'2012', creator:'Microsoft', typing:'Static', execution:'Transpiled', used:'Web · Apps'},
  'Python': {born:'1991', creator:'Guido van Rossum', typing:'Dynamic', execution:'Interpreted', used:'AI · Data · Web · Automation'},
  'Rust': {born:'2010', creator:'Graydon Hoare', typing:'Static', execution:'Compiled', used:'Systems · Performance'},
  'Go': {born:'2009', creator:'Google', typing:'Static', execution:'Compiled', used:'Cloud · Backend · Systems'},
  'Swift': {born:'2014', creator:'Apple', typing:'Static', execution:'Compiled', used:'Apple platforms'},
  'Kotlin': {born:'2011', creator:'JetBrains', typing:'Static', execution:'JVM / Native', used:'Android · Backend'},
  'Ruby': {born:'1995', creator:'Yukihiro Matsumoto', typing:'Dynamic', execution:'Interpreted', used:'Web · Scripting'},
  'PHP': {born:'1995', creator:'Rasmus Lerdorf', typing:'Dynamic', execution:'Interpreted / JIT', used:'Web · Backend'},
  'Dart': {born:'2011', creator:'Google', typing:'Static', execution:'JIT / AOT', used:'Flutter · Apps'},
  'R': {born:'1993', creator:'Ross Ihaka & Robert Gentleman', typing:'Dynamic', execution:'Interpreted', used:'Statistics · Data'},
  'Julia': {born:'2012', creator:'Bezanson et al.', typing:'Dynamic', execution:'JIT', used:'Scientific · Numerical'},
  'Haskell': {born:'1990', creator:'Haskell Committee', typing:'Static', execution:'Compiled / Interpreted', used:'Functional · Research'},
  'Fortran': {born:'1957', creator:'John Backus team', typing:'Static', execution:'Compiled', used:'Scientific · HPC'},
  'COBOL': {born:'1959', creator:'CODASYL', typing:'Static', execution:'Compiled', used:'Business · Mainframes'},
  'SQL': {born:'1974', creator:'Chamberlin & Boyce', typing:'Declarative', execution:'Database engine', used:'Data · Queries'},
  'Lua': {born:'1993', creator:'PUC-Rio team', typing:'Dynamic', execution:'Interpreted', used:'Games · Embedded'},
  'Scala': {born:'2004', creator:'Martin Odersky', typing:'Static', execution:'JVM', used:'Backend · Data'},
  'Elixir': {born:'2011', creator:'José Valim', typing:'Dynamic', execution:'BEAM', used:'Distributed · Web'},
  'Erlang': {born:'1986', creator:'Ericsson', typing:'Dynamic', execution:'BEAM', used:'Distributed · Telecom'},
  'Solidity': {born:'2014', creator:'Ethereum team', typing:'Static', execution:'EVM', used:'Smart contracts'},
  'Zig': {born:'2016', creator:'Andrew Kelley', typing:'Static', execution:'Compiled', used:'Systems'},
  'Objective-C': {born:'1984', creator:'Brad Cox & Tom Love', typing:'Dynamic / Static', execution:'Compiled', used:'Apple · Legacy'},
  'BASIC': {born:'1964', creator:'Kemeny & Kurtz', typing:'Varies', execution:'Interpreted / Compiled', used:'Education · Classic'},
  'Pascal': {born:'1970', creator:'Niklaus Wirth', typing:'Static', execution:'Compiled', used:'Education · Classic'}
};

const syntaxFor = item => {
  const name = item.name;
  const ext = item.file.includes('.') ? item.file.slice(item.file.lastIndexOf('.')).toLowerCase() : '';
  if (['C','C++','C#','D','Dart','F#','Go','Groovy','Java','JavaScript','Kotlin','Objective-C','Rust','Scala','Solidity','Swift','TypeScript','Zig'].includes(name)) return '//';
  if (['Python','Bash','Crystal','Elixir','Julia','Nim','Perl','PowerShell','R','Ruby','Tcl'].includes(name)) return '#';
  if (['Ada','Haskell','Lua','SQL'].includes(name)) return '--';
  if (['Clojure','Common Lisp','Racket','Scheme','Assembly (x86-64)'].includes(name)) return ';';
  if (['Erlang','MATLAB','Prolog'].includes(name)) return '%';
  if (name === 'Fortran') return '!';
  if (name === 'COBOL') return '*';
  if (name === 'Pascal') return '{ }';
  if (name === 'VB.NET' || name === 'BASIC') return "'";
  if (name === 'HTML' || name === 'XML' || name === 'Markdown') return '<!-- -->';
  if (name === 'CSS') return '/* */';
  if (name === 'OCaml') return '(* *)';
  if (ext === '.php') return '//';
  return 'varies';
};

const metaFor = item => ({
  born: knownMeta[item.name]?.born || '—',
  creator: knownMeta[item.name]?.creator || 'Community / language team',
  typing: knownMeta[item.name]?.typing || item.category,
  execution: knownMeta[item.name]?.execution || 'Language-specific',
  used: knownMeta[item.name]?.used || `${item.category} ecosystem`,
  comment: syntaxFor(item),
  file: item.file,
  category: item.category
});

function accentFor(name){
  const accents = ['#38bdf8','#a78bfa','#34d399','#f59e0b','#fb7185','#22d3ee'];
  return accents[[...name].reduce((sum,ch)=>sum+ch.charCodeAt(0),0)%accents.length];
}

async function fetchSource(item){
  if (sourceCache.has(item.path)) return sourceCache.get(item.path);
  const url = RAW_BASE + encodePath(item.path);
  const promise = fetch(url).then(r => {
    if (!r.ok) throw new Error(`Could not load ${item.path}`);
    return r.text();
  });
  sourceCache.set(item.path, promise);
  try { return await promise; } catch (error) { sourceCache.delete(item.path); throw error; }
}

function openView(view){
  document.querySelectorAll('.museum-tab').forEach(btn => {
    const active = btn.dataset.view === view;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('.museum-view').forEach(panel => {
    const active = panel.dataset.panel === view;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });
  el('museum').scrollIntoView({behavior:'smooth', block:'start'});
}

document.querySelectorAll('.museum-tab').forEach(btn => btn.addEventListener('click', () => openView(btn.dataset.view)));
document.querySelectorAll('[data-open-view]').forEach(btn => btn.addEventListener('click', () => openView(btn.dataset.openView)));

function renderFilters(){
  const categories = ['All', ...new Set(catalog.map(x => x.category))];
  el('filters').innerHTML = categories.map(category => `<button class="filter ${category===activeCategory?'active':''}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
}

function visibleItems(){
  const q = el('searchInput').value.trim().toLowerCase();
  return catalog.filter(item => {
    const categoryOK = activeCategory === 'All' || item.category === activeCategory;
    const searchOK = `${item.name} ${item.category} ${item.file}`.toLowerCase().includes(q);
    return categoryOK && searchOK;
  });
}

function renderExplore(){
  const items = visibleItems();
  el('languageGrid').innerHTML = items.map(item => `
    <button class="language-card" style="--card-accent:${accentFor(item.name)}" data-path="${escapeHtml(item.path)}">
      <span class="language-card-top"><span><h4>${escapeHtml(item.name)}</h4><small>${escapeHtml(item.category)}</small></span><span class="arrow">↗</span></span>
      <code>${escapeHtml(item.file)}</code>
    </button>`).join('');
  el('resultCount').textContent = `${items.length} ${items.length===1?'language':'languages'}`;
  el('emptyState').hidden = items.length !== 0;
  const filtered = activeCategory !== 'All' || el('searchInput').value.trim();
  el('clearButton').hidden = !filtered;
}

el('filters').addEventListener('click', e => {
  const btn = e.target.closest('[data-category]');
  if (!btn) return;
  activeCategory = btn.dataset.category;
  renderFilters(); renderExplore();
});
el('searchInput').addEventListener('input', renderExplore);
el('clearButton').addEventListener('click', resetExplore);
el('emptyResetButton').addEventListener('click', resetExplore);
function resetExplore(){
  activeCategory='All'; el('searchInput').value=''; renderFilters(); renderExplore();
}

el('languageGrid').addEventListener('click', e => {
  const card = e.target.closest('[data-path]');
  if (!card) return;
  const item = catalog.find(x => x.path === card.dataset.path);
  if (item) openModal(item);
});

async function openModal(item){
  activeModalItem = item;
  el('modalLanguage').textContent = item.name;
  el('modalCategory').textContent = item.category;
  el('modalFile').textContent = item.file;
  el('modalLoading').hidden = false;
  el('modalCode').textContent = 'Loading source…';
  el('githubFileLink').href = BLOB_BASE + encodePath(item.path);
  el('modalBackdrop').hidden = false;
  el('codeModal').classList.add('open');
  el('codeModal').setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  try { el('modalCode').textContent = await fetchSource(item); }
  catch { el('modalCode').textContent = 'Source preview could not be loaded. Open the file on GitHub instead.'; }
  el('modalLoading').hidden = true;
}
function closeModal(){
  el('codeModal').classList.remove('open');
  el('codeModal').setAttribute('aria-hidden','true');
  el('modalBackdrop').hidden = true;
  document.body.style.overflow='';
}
el('modalClose').addEventListener('click', closeModal);
el('modalBackdrop').addEventListener('click', closeModal);
el('copyButton').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(el('modalCode').textContent); showToast('Copied to clipboard ✦'); }
  catch { showToast('Copy failed — select the code manually'); }
});
el('compareFromModal').addEventListener('click', () => {
  if (!activeModalItem) return;
  closeModal();
  el('compareLeft').value = activeModalItem.name;
  renderCompare();
  openView('compare');
});

function showToast(text){
  const toast=el('toast'); toast.textContent=text; toast.classList.add('show');
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove('show'),1800);
}

function randomItem(){
  return catalog[Math.floor(Math.random()*catalog.length)];
}
function randomHello(){
  const item = randomItem();
  if (item) openModal(item);
}
el('randomButton').addEventListener('click', randomHello);
el('randomHeroButton').addEventListener('click', randomHello);

function fillSelects(){
  const options = catalog.map(x => `<option value="${escapeHtml(x.name)}">${escapeHtml(x.name)}</option>`).join('');
  ['compareLeft','compareRight','passportSelect'].forEach(id => el(id).innerHTML = options);
  el('compareLeft').value = catalog.some(x=>x.name==='Python') ? 'Python' : catalog[0]?.name;
  el('compareRight').value = catalog.some(x=>x.name==='Rust') ? 'Rust' : catalog[1]?.name;
  el('passportSelect').value = catalog.some(x=>x.name==='Python') ? 'Python' : catalog[0]?.name;
}

function findByName(name){ return catalog.find(x=>x.name===name); }

async function populateCompare(side, item){
  if (!item) return;
  const meta = metaFor(item);
  el(`${side}Name`).textContent = item.name;
  el(`${side}Category`).textContent = item.category.toUpperCase();
  el(`${side}File`).textContent = item.file;
  el(`${side}Strip`).innerHTML = [
    ['Comment',meta.comment],['Mode',meta.execution],['Type',meta.typing]
  ].map(([k,v])=>`<div class="passport-chip"><small>${escapeHtml(k)}</small><b>${escapeHtml(v)}</b></div>`).join('');
  el(`${side}Code`).textContent='Loading source…';
  el(`${side}Source`).href=BLOB_BASE+encodePath(item.path);
  try { el(`${side}Code`).textContent=await fetchSource(item); }
  catch { el(`${side}Code`).textContent='Source preview unavailable.'; }
}
function renderCompare(){
  populateCompare('left', findByName(el('compareLeft').value));
  populateCompare('right', findByName(el('compareRight').value));
}
el('compareLeft').addEventListener('change', renderCompare);
el('compareRight').addEventListener('change', renderCompare);
el('swapCompare').addEventListener('click', () => {
  const temp=el('compareLeft').value; el('compareLeft').value=el('compareRight').value; el('compareRight').value=temp; renderCompare();
});
el('randomPairButton').addEventListener('click', () => {
  if (catalog.length<2) return;
  let a=randomItem(), b=randomItem();
  while (b.name===a.name) b=randomItem();
  el('compareLeft').value=a.name; el('compareRight').value=b.name; renderCompare();
});

async function renderPassport(){
  const item=findByName(el('passportSelect').value);
  if (!item) return;
  const meta=metaFor(item);
  el('passportTitle').textContent=item.name;
  el('passportFile').textContent=item.file;
  el('passportGrid').innerHTML=[
    ['Born',meta.born],['Creator',meta.creator],['Typing',meta.typing],['Execution',meta.execution],['Comment',meta.comment],['Common use',meta.used]
  ].map(([k,v])=>`<div class="passport-item"><small>${escapeHtml(k)}</small><b>${escapeHtml(v)}</b></div>`).join('');
  el('passportCode').textContent='Loading source…';
  try { el('passportCode').textContent=await fetchSource(item); }
  catch { el('passportCode').textContent='Source preview unavailable.'; }
}
el('passportSelect').addEventListener('change', renderPassport);

function renderCommentAtlas(){
  const groups = new Map();
  catalog.forEach(item => {
    const syntax=syntaxFor(item);
    if(!groups.has(syntax)) groups.set(syntax,[]);
    groups.get(syntax).push(item.name);
  });
  const sorted=[...groups.entries()].sort((a,b)=>b[1].length-a[1].length);
  el('commentGroups').innerHTML=sorted.map(([syntax,names],i)=>`
    <button class="comment-group ${i===0?'active':''}" data-syntax="${escapeHtml(syntax)}">
      <code>${escapeHtml(syntax)} comment</code><span>${names.length} ${names.length===1?'entry':'entries'}</span>
    </button>`).join('');
  if(sorted[0]) showCommentMembers(sorted[0][0], sorted[0][1]);
}
function showCommentMembers(syntax,names){
  el('commentMembers').querySelector('.comment-members-title').textContent=`Languages using ${syntax}`;
  el('commentMemberList').innerHTML=names.map(name=>`<span class="member-pill">${escapeHtml(name)}</span>`).join('');
  document.querySelectorAll('.comment-group').forEach(btn=>btn.classList.toggle('active',btn.dataset.syntax===syntax));
}
el('commentGroups').addEventListener('click', e=>{
  const btn=e.target.closest('[data-syntax]'); if(!btn)return;
  const syntax=btn.dataset.syntax;
  showCommentMembers(syntax,catalog.filter(x=>syntaxFor(x)===syntax).map(x=>x.name));
});

const gamePoolNames=['Python','C','C++','Java','JavaScript','TypeScript','Rust','Go','Swift','Kotlin','Ruby','PHP','Lua','Haskell','SQL','Scala','Elixir','Fortran','COBOL','Dart','Julia','Solidity','Zig'];
function gamePool(){ return catalog.filter(x=>gamePoolNames.includes(x.name)); }
async function nextQuestion(){
  const pool=gamePool().length>=4?gamePool():catalog;
  if(pool.length<4)return;
  questionLocked=false;
  el('nextQuestionButton').hidden=true;
  el('gameFeedback').textContent='Pick an answer.';
  currentQuestion=pool[Math.floor(Math.random()*pool.length)];
  el('gameCode').textContent='Loading challenge…';
  try { el('gameCode').textContent=await fetchSource(currentQuestion); }
  catch { el('gameCode').textContent='Could not load this challenge.'; }
  const choices=[currentQuestion];
  while(choices.length<4){
    const candidate=pool[Math.floor(Math.random()*pool.length)];
    if(!choices.some(x=>x.name===candidate.name))choices.push(candidate);
  }
  choices.sort(()=>Math.random()-.5);
  el('gameChoices').innerHTML=choices.map(item=>`<button class="game-choice" data-answer="${escapeHtml(item.name)}">${escapeHtml(item.name)}</button>`).join('');
}
el('gameChoices').addEventListener('click',e=>{
  const btn=e.target.closest('[data-answer]');
  if(!btn||questionLocked||!currentQuestion)return;
  questionLocked=true;
  const correct=btn.dataset.answer===currentQuestion.name;
  if(correct){score+=100+streak*20;streak+=1;btn.classList.add('correct');el('gameFeedback').textContent=`✓ Correct — ${currentQuestion.name}.`;}
  else{
    streak=0;btn.classList.add('wrong');el('gameFeedback').textContent=`Not quite — this one is ${currentQuestion.name}.`;
    [...el('gameChoices').children].find(x=>x.dataset.answer===currentQuestion.name)?.classList.add('correct');
  }
  [...el('gameChoices').children].forEach(x=>x.disabled=true);
  el('scoreValue').textContent=score;el('streakValue').textContent=streak;el('nextQuestionButton').hidden=false;
});
el('nextQuestionButton').addEventListener('click',nextQuestion);

const heroNames=['Python','Rust','Go','JavaScript','C','Swift'];
let heroIndex=0;
async function updateHero(){
  if(!catalog.length)return;
  const name=heroNames[heroIndex++%heroNames.length];
  const item=findByName(name)||catalog[heroIndex%catalog.length];
  el('heroFile').textContent=item.file;
  try{el('heroCode').textContent=await fetchSource(item);}catch{}
}
setInterval(updateHero,4200);

el('themeButton').addEventListener('click',()=>{
  const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=next;localStorage.setItem('hwa-theme',next);
});
const savedTheme=localStorage.getItem('hwa-theme');
if(savedTheme)document.documentElement.dataset.theme=savedTheme;

document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeModal();
  if(e.key==='/' && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){
    e.preventDefault();openView('explore');setTimeout(()=>el('searchInput').focus(),250);
  }
  if((e.key==='r'||e.key==='R') && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))randomHello();
});

async function init(){
  try{
    const response=await fetch('./catalog.json');
    if(!response.ok)throw new Error('catalog');
    catalog=await response.json();
    el('languageCount').textContent=catalog.length;
    el('categoryCount').textContent=new Set(catalog.map(x=>x.category)).size;
    renderFilters();renderExplore();fillSelects();renderCompare();renderPassport();renderCommentAtlas();nextQuestion();updateHero();
  }catch{
    el('languageGrid').innerHTML='<p class="empty-state">The catalog could not be loaded. Browse the repository on GitHub instead.</p>';
  }
}
init();
