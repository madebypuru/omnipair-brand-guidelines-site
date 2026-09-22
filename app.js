import groups from './content.json';
import './content.css';
import './style.css';

const $ = (s, parent=document) => parent.querySelector(s);
const $$ = (s, parent=document) => [...parent.querySelectorAll(s)];
const topics=groups.flatMap(group=>group.topics.map(topic=>({...topic,group})));
const topicMap=new Map(topics.map(topic=>[topic.id,topic]));
const groupMap=new Map(groups.map(group=>[group.id,group]));
const sectionMap=new Map(topics.flatMap(topic=>topic.sections.map(id=>[id,topic])));
const paths={
  link:'<path d="m10 13 4-4m-6 7-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m4 0 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0) scale(.9)"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon:'<path d="M20.8 13.6A9 9 0 0 1 10.4 3.2 9 9 0 1 0 20.8 13.6Z"/>',
  download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  external:'<path d="M6 18 18 6M6 6h12v12"/>',
  next:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  prev:'<path d="M20 12H4m6-6-6 6 6 6"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  quote:'<path d="M10 7H4v6h5c0 3-2 4-4 4m15-10h-6v6h5c0 3-2 4-4 4"/>',
  asterisk:'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/>',
  palette:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="3"/><circle cx="11" cy="17" r="3"/>',
  type:'<path d="m3 18 6-13 6 13M5 14h8m5-3h3v7m-3-3h3"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  layers:'<path d="m3 8 9-5 9 5-9 5Zm0 5 9 5 9-5M3 18l9 5 9-5" transform="translate(0 -1)"/>',
  shapes:'<rect x="3" y="3" width="8" height="8" rx="1.5"/><circle cx="17" cy="17" r="5"/><path d="m15 3 6 8h-8Z"/>'
};
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.compass}</svg>`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const downloads=[
 ['Complete logo pack','Symbol, horizontal & stacked · SVG, PNG, JPG','Omnipair-Logo-Pack.zip'],
 ['Horizontal lockups','Three colourways · SVG, PNG, JPG','Omnipair-Horizontal-Pack.zip'],
 ['Stacked lockups','White & silver · SVG, PNG, JPG','Omnipair-Vertical-Pack.zip'],
 ['Symbols','White & silver · SVG, PNG, JPG','Omnipair-Icon-Pack.zip'],
 ['App icons','Leverage, Lending & Trade · PNG','Omnipair-AppIcons-Pack.zip'],
 ['Social assets','Discord, X, LinkedIn & GitHub · PNG','Omnipair-Social-Pack.zip'],
 ['M Saans','Variable font · WOFF2','Omnipair-Fonts-Pack.zip'],
 ['Colour tokens','Palettes and CSS variables · Markdown','Omnipair-Colours.md']
];
let mode='topics',currentTopic=null,currentGroup=null,observer=null,scrollFrame=null,toastTimer,menuReturn=null;
const collapsed=new Set();
const readState=()=>{const q=new URLSearchParams(location.search);return {mode:q.get('view')==='continuous'?'continuous':'topics',topic:q.get('topic')||'',chapter:q.get('chapter')||''};};
const route=(topic,forMode=mode)=>forMode==='continuous'?`./?view=continuous#topic-${topic.id}`:`./?view=topics&topic=${topic.id}`;
const groupRoute=(g,forMode=mode)=>forMode==='continuous'?`./?view=continuous#chapter-${g.id}`:g.topics.length===1?route(g.topics[0],forMode):`./?view=topics&chapter=${g.id}`;
const imageAsset=(src,alt,cls='')=>`<div class="card-art ${cls}"><img src="./assets/${src}" alt="${alt}" loading="lazy" decoding="async" /></div>`;
function cardArt(g){
  switch(g.id){
    case 'logo':return imageAsset('downloads/Omnipair-Horizontal-DarkWhite-SVG.svg','Omnipair primary lockup','logo-art');
    case 'colour':return '<div class="card-art colour-art" aria-label="Sky, Aqua and Dawn"><i>Sky</i><i>Aqua</i><i>Dawn</i></div>';
    case 'typography':return '<div class="card-art type-art"><b>Aa Bb</b><span>M Saans · 100 — 900</span></div>';
    case 'photography':return imageAsset('imagery/reference-cliff.jpg','A lone figure above a turquoise sea and orange cliff');
    case 'foundation':return '<div class="card-art quote-art">'+icon('compass')+'<blockquote>Every asset.<br>Every use case.<br>One unified pool.</blockquote></div>';
    case 'verbal':return '<div class="card-art quote-art">'+icon('quote')+'<blockquote>Built by builders.<br>Verified by anyone.</blockquote></div>';
    case 'graphic':return imageAsset('shaders/dither-hero.jpg','Omnipair dither shader treatment');
    case 'diagrams':return imageAsset('diagrams/gamm-pool.jpg','Anatomy of a GAMM pool');
    case 'applications':return imageAsset('graphics/merch-tee-cap.jpg','Omnipair apparel and cap');
  }
}
function renderNav(){
  const oldScroll=$('#sidebar').scrollTop;
  $('#navigation').innerHTML=`<div class="nav-top"><a data-route href="./?view=${mode}" class="${!currentTopic&&!currentGroup?'active':''}">Index</a><a data-route href="./?view=${mode}&assets=1">Downloads</a><a href="https://www.figma.com/design/JBWgIiO6PUwlgCN6lIgKT0/Omnipair-branding-by-37degree?node-id=257-2691&t=OPmNKrr6dLvbn4xv-1" target="_blank" rel="noopener noreferrer">Figma brandbook <span aria-hidden="true">↗</span></a></div>`+groups.map(g=>`<div class="nav-group ${collapsed.has(g.id)?'collapsed':''}" data-group="${g.id}" style="--category:var(--${g.color})"><div class="nav-group-title"><a data-route href="${groupRoute(g)}">${icon(g.icon)}<span>${g.title}</span></a><button class="nav-collapse" data-collapse="${g.id}" aria-label="${collapsed.has(g.id)?'Expand':'Collapse'} ${g.title}" aria-expanded="${!collapsed.has(g.id)}" aria-controls="nav-${g.id}">${icon('down')}</button></div><ul class="nav-items" id="nav-${g.id}">${g.topics.map(t=>`<li><a data-route data-topic="${t.id}" href="${route(t)}" ${currentTopic?.id===t.id?'class="active" aria-current="page"':''}>${t.title}</a></li>`).join('')}</ul></div>`).join('');
  $('#sidebar').scrollTop=oldScroll;
}
function updateModeLinks(){
  $$('.view-switch a').forEach(a=>{const target=a.dataset.view;a.href=currentTopic?route(currentTopic,target):currentGroup?groupRoute(currentGroup,target):`./?view=${target}`;if(target===mode)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
}
function readingModes(){return '<nav class="view-switch" aria-label="Reading experience"><a data-view="topics" href="./?view=topics">Topics</a><a data-view="continuous" href="./?view=continuous">Continuous</a></nav>';}
function pageTitle(title){return `<div class="title-row"><h1>${title}</h1>${readingModes()}</div>`;}
function indexPage(){
  const order=['logo','colour','typography','photography','foundation','verbal','graphic','diagrams','applications'];
  return `<section class="intro">${pageTitle('Brand guidelines')}<p>A shared reference for how Omnipair looks, speaks and shows up.</p><p class="intro-secondary">Start with <a data-route href="${route(topics[0])}">the foundation</a>, or explore the visual identity below.</p></section><button class="resource-row" data-download><span class="resource-icon">${icon('download')}</span><span><strong>Brand assets</strong><span>Logos, colour tokens, M Saans and social files</span></span>${icon('next')}</button><h2 class="index-heading">The guidelines <span>09 chapters</span></h2><div class="card-grid">${order.map(id=>{const g=groupMap.get(id);return `<a class="chapter-card" style="--category:var(--${g.color})" data-route href="${groupRoute(g)}">${cardArt(g)}<div class="card-meta"><h3 class="card-title">${g.title}</h3><p>${g.description}</p></div></a>`;}).join('')}</div>`;
}
function groupPage(g){return `<header class="topic-header">${pageTitle(g.title)}<p class="topic-description">${g.description}</p></header><div class="chapter-overview">${g.topics.map((t,i)=>`<a class="topic-row" data-route href="${route(t)}"><div><span>${String(i+1).padStart(2,'0')}</span><h2>${t.title}</h2></div>${icon('next')}</a>`).join('')}</div>`;}
function topicPage(t){
  const i=topics.findIndex(x=>x.id===t.id),prev=topics[i-1],next=topics[i+1];
  return `<header class="topic-header">${pageTitle(t.title)}</header><article class="article-body">${t.html}</article><nav class="topic-pager" aria-label="Previous and next topic">${prev?`<a data-route href="${route(prev)}">${icon('prev')}<span><span>Previous</span>${prev.title}</span></a>`:'<span></span>'}${next?`<a data-route href="${route(next)}"><span><span>Next</span>${next.title}</span>${icon('next')}</a>`:'<a data-route href="./?view=topics"><span><span>Back to</span>Index</span></a>'}</nav>`;
}
function continuousPage(){return `<section class="intro continuous-intro">${pageTitle('Brand guidelines')}<p>The complete guide to our identity, voice and visual world.</p><button class="inline-download" data-download>${icon('download')}Download brand assets</button></section>`+groups.map((g,i)=>`<section class="continuous-chapter" id="chapter-${g.id}" data-chapter="${g.id}" style="--category:var(--${g.color})"><header class="continuous-chapter-header"><h2><span class="chapter-number">${String(i+1).padStart(2,'0')}</span>${g.title}</h2><p>${g.description}</p></header>${g.topics.map(t=>`<article class="continuous-topic article-body" data-current="${t.id}" id="topic-${t.id}"><h3 class="topic-label">${t.title}</h3>${t.html}</article>`).join('')}</section>`).join('');}
function assetPage(){return `<header class="topic-header">${pageTitle('Brand assets')}<p class="topic-description">Official artwork, colours and type. Ready for your next project.</p></header><div class="article-body">${downloadRows()}</div><div class="callout"><div class="callout-label">Keep the identity intact</div><div class="callout-text">Use the supplied files. Never alter the mark, proportions or colourways. Choose SVG for web and product, PNG when transparency matters, and JPG for a fixed background.</div></div>`;}
function downloadRows(){return downloads.map(([title,desc,file])=>`<a class="download-item" href="./assets/downloads/${file}" download><span><strong>${title}</strong><small>${desc}</small></span>${icon('download')}</a>`).join('');}
function enhanceContent(){
  $$('.article-body .lockup-card img,.article-body .lockup-hero img').forEach(img=>{const b=document.createElement('button');b.type='button';b.className='image-zoom';b.setAttribute('aria-label',`Enlarge ${img.alt||'brand image'}`);img.replaceWith(b);b.append(img);});
  if(currentTopic){const first=$('.article-body .sect-title');const label=first?.textContent.trim().toLowerCase();if(first&&(currentTopic.sections.length===1||label===currentTopic.title.toLowerCase()))first.classList.add('single-topic-title');}
  const specimen=$('#type-primary .callout-text');if(specimen)specimen.innerHTML='M Saans is used throughout these guidelines. Download the variable font (100–900) in the <a href="./assets/downloads/Omnipair-Fonts-Pack.zip" download>M Saans font pack</a>.';
}
function activate(id){
  currentTopic=topicMap.get(id)||null;currentGroup=currentTopic?.group||null;
  const indexLink=$('.nav-top a');if(indexLink)indexLink.classList.toggle('active',!id);
  $$('.nav-items a').forEach(a=>{const selected=a.dataset.topic===id;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  updateModeLinks();
}
function startScrollTracking(){
  if(observer)observer.disconnect();
  const nodes=$$('.continuous-topic');
  if(!nodes.length)return;
  observer=new IntersectionObserver(()=>{if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=null;let selected=null;for(const node of nodes){if(node.getBoundingClientRect().top<=180)selected=node;else break;}activate(selected?.dataset.current||'');});},{rootMargin:'-100px 0px -60% 0px',threshold:0});
  nodes.forEach(n=>observer.observe(n));
}
function hashScroll(){if(location.hash){const id=decodeURIComponent(location.hash.slice(1));const el=document.getElementById(id);if(el)requestAnimationFrame(()=>el.scrollIntoView({behavior:'instant',block:'start'}));}else window.scrollTo({top:0,behavior:'instant'});}
function render({keepScroll=false}={}){
  const state=readState();mode=state.mode;currentTopic=topicMap.get(state.topic)||null;currentGroup=groupMap.get(state.chapter)||currentTopic?.group||null;
  if(currentGroup)collapsed.delete(currentGroup.id);
  if(observer)observer.disconnect();
  const assets=new URLSearchParams(location.search).has('assets');
  $('#page').innerHTML=assets?assetPage():mode==='continuous'?continuousPage():currentTopic?topicPage(currentTopic):currentGroup?groupPage(currentGroup):indexPage();
  document.title=`${assets?'Brand assets':mode==='continuous'?'Complete brandbook':currentTopic?.title||currentGroup?.title||'Brand guidelines'} — Omnipair`;
  renderNav();updateModeLinks();enhanceContent();closeMenu(false);
  if(!keepScroll)hashScroll();
  if(mode==='continuous'&&!assets)startScrollTracking();
}
function navigate(href){
  const url=new URL(href,location.origin);const prev=readState();
  const continuousSame=prev.mode==='continuous'&&url.search===location.search;
  history.pushState(null,'',url.pathname+url.search+url.hash);
  if(continuousSame){hashScroll();closeMenu();}else{render();$('#main').focus({preventScroll:true});}
}
function showToast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2300);}
async function copy(text,message='Copied to clipboard'){try{await navigator.clipboard.writeText(text);showToast(message);}catch{showToast('Copy unavailable in this browser. Select and copy the text.');}}
function updateThemeButton(){const isDark=document.documentElement.dataset.theme==='dark';$('#theme-toggle').innerHTML=icon(isDark?'sun':'moon');$('#theme-toggle').setAttribute('aria-label',`Switch to ${isDark?'light':'dark'} theme`);$('#theme-toggle').title=`Switch to ${isDark?'light':'dark'} theme`;$('meta[name="theme-color"]').content=isDark?'#101112':'#fafaf9';}
function openMenu(){menuReturn=document.activeElement;document.body.classList.add('menu-open');$('#sidebar').inert=false;$('#menu-toggle').setAttribute('aria-expanded','true');$('#menu-toggle').setAttribute('aria-label','Close navigation');$('#menu-toggle').innerHTML=icon('close');$('#sidebar a').focus();}
function closeMenu(returnFocus=true){const wasOpen=document.body.classList.contains('menu-open');document.body.classList.remove('menu-open');$('#sidebar').inert=innerWidth<=900;$('#menu-toggle').setAttribute('aria-expanded','false');$('#menu-toggle').setAttribute('aria-label','Open navigation');$('#menu-toggle').innerHTML=icon('menu');if(returnFocus&&wasOpen)menuReturn?.focus();}
function openDownloads(){closeMenu(false);$('#download-dialog').showModal();}
$('#copy-link').innerHTML=icon('link');$('#download-open').innerHTML=icon('download');$('#menu-toggle').innerHTML=icon('menu');$('.close-dialog').innerHTML=icon('close');$('.close-image').innerHTML=icon('close');$('#download-list').innerHTML=downloadRows();updateThemeButton();
$('#theme-toggle').addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('omnipair-theme',theme);}catch{}updateThemeButton();});
$('#copy-link').addEventListener('click',()=>{const url=new URL(location.href);if(mode==='continuous'&&currentTopic)url.hash=`topic-${currentTopic.id}`;copy(url.href,'Page link copied');});
$('#download-open').addEventListener('click',openDownloads);$('.close-dialog').addEventListener('click',()=>$('#download-dialog').close());$('.close-image').addEventListener('click',()=>$('#image-dialog').close());
$('#menu-toggle').addEventListener('click',()=>document.body.classList.contains('menu-open')?closeMenu():openMenu());$('#nav-backdrop').addEventListener('click',()=>closeMenu());
document.addEventListener('click',e=>{
  const a=e.target.closest('a[data-route],.view-switch a,.brand');
  if(a&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey&&e.button===0){e.preventDefault();navigate(a.href);return;}
  const toggle=e.target.closest('[data-collapse]');if(toggle){const id=toggle.dataset.collapse;collapsed.has(id)?collapsed.delete(id):collapsed.add(id);renderNav();$(`[data-collapse="${id}"]`).focus();return;}
  if(e.target.closest('[data-download]')){openDownloads();return;}
  const cp=e.target.closest('[data-copy],[data-copy-el]');if(cp){e.preventDefault();const text=cp.dataset.copy||document.getElementById(cp.dataset.copyEl)?.textContent.trim();if(text)copy(text,cp.dataset.copyEl?'Global prompt copied':`Copied ${text}`);return;}
  const zoom=e.target.closest('.image-zoom');if(zoom){const source=$('img',zoom);$('#image-dialog img').src=source.currentSrc||source.src;$('#image-dialog img').alt=source.alt;$('#image-dialog').showModal();}
});
for(const dialog of $$('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom||dialog.id==='image-dialog')dialog.close();}});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeMenu();
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-copy][role=button],[data-copy-el][role=button]')){e.preventDefault();e.target.click();}
  if(e.key==='Tab'&&document.body.classList.contains('menu-open')){const focusable=$$('#sidebar a,#sidebar button').filter(el=>el.offsetParent!==null);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
window.addEventListener('popstate',()=>render());
window.addEventListener('resize',()=>{if(innerWidth>900)closeMenu(false);else $('#sidebar').inert=!document.body.classList.contains('menu-open');});
render();
