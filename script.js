// ===== Helpers =====
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ===== Home =====
function initHomePage() {
  const searchInput = document.getElementById('home-search');
  const suggestionsList = document.getElementById('suggestions');
  const liveTicker = document.getElementById('home-live-ticker');
  const suggestionData = [
    { text: 'Schuhtrends 2025', count: 1203 },
    { text: 'Schuhsohlen nachhaltige', count: 420 },
    { text: 'Sneaker neue Modelle', count: 870 },
    { text: 'Barfußlaufen Vorteile', count: 310 },
  ];

  function updateSuggestions(v){
    suggestionsList.innerHTML='';
    if(!v) return;
    const m = suggestionData.filter(i => i.text.toLowerCase().includes(v.toLowerCase()));
    m.forEach(i => {
      const li=document.createElement('li');
      li.innerHTML=`<span>${i.text}</span><span class="suggestion-count">${i.count} live</span>`;
      li.addEventListener('click',()=>goToResults(i.text));
      suggestionsList.appendChild(li);
    });
  }

  function goToResults(q){ window.location.href=`feed.html?q=${encodeURIComponent(q)}`; }

  // ✅ fix: richtiger if-Block
  if (searchInput) {
    searchInput.addEventListener('input',e=>updateSuggestions(e.target.value));
    searchInput.addEventListener('keypress',e=>{
      if(e.key==='Enter'){
        e.preventDefault();
        const q=searchInput.value.trim();
        if(q) goToResults(q);
      }
    });
  }

  if (liveTicker) {
    const item = suggestionData[getRandomInt(0, suggestionData.length-1)];
    liveTicker.innerHTML = `🔥 <span id="live-count">${item.count}</span> Menschen denken gerade über <strong>${item.text.split(' ')[0]}</strong> nach`;
  }
}

// ===== Results =====
function initResultsPage() {
  const resultsSearch = document.getElementById('results-search');
  const liveCountElem = document.getElementById('results-live-count');
  const changeElem = document.getElementById('results-change');
  const relatedList = document.getElementById('related-list');
  const badge = document.getElementById('chartBadge');

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || 'Gedanke';
  if(resultsSearch) resultsSearch.value = query;

  const baseCount = getRandomInt(200, 1500);
  const diff = getRandomInt(-50, 50);
  if (liveCountElem) liveCountElem.textContent = baseCount;
  if (changeElem) {
    const diffText = diff >= 0 ? `▲ Zuwachs +${diff}` : `▼ Abnahme ${Math.abs(diff)}`;
    changeElem.textContent = `${diffText} in den letzten 5 Minuten`;
    changeElem.style.color = diff >= 0 ? '#2fd472' : '#e3626b';
  }

  drawChart();
  if (badge) badge.textContent = `${baseCount} live`;

  // Related
  const relatedTopics = [
    { text:'Schuhpflege', count:getRandomInt(100,500) },
    { text:'Schuhtrends', count:getRandomInt(100,500) },
    { text:'Einlegesohlen', count:getRandomInt(50,300) },
    { text:'Sneaker Pflege', count:getRandomInt(50,200) },
  ];
  if (relatedList) {
    relatedList.innerHTML='';
    relatedTopics.forEach(t=>{ const li=document.createElement('li');
      li.innerHTML=`<span>${t.text}</span><span class="count">${t.count}</span>`;
      li.addEventListener('click',()=>{ window.location.href = `feed.html?q=${encodeURIComponent(t.text)}`; });
      relatedList.appendChild(li);
    });
  }

  // Time buttons
  document.querySelectorAll('.time-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const active=document.querySelector('.time-btn.active'); if(active) active.classList.remove('active');
      btn.classList.add('active');
      const range = btn.getAttribute('data-range');
      updateChart(range);
    });
  });

  // Region buttons
  document.querySelectorAll('.category').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const active=document.querySelector('.category.active');
      if(active) active.classList.remove('active');
      btn.classList.add('active');
      currentRegion = btn.textContent.trim().toLowerCase() === 'de' ? 'de' : 'global';
      const activeRange = document.querySelector('.time-btn.active')?.getAttribute('data-range') || '24h';
      updateChart(activeRange);
    });
  });

  // Search enter
  if(resultsSearch){
    resultsSearch.addEventListener('keypress', e=>{
      if(e.key==='Enter'){
        e.preventDefault();
        const q=resultsSearch.value.trim();
        if(q) window.location.href=`feed.html?q=${encodeURIComponent(q)}`;
      }
    });
  }
}

// ===== Chart.js =====
let myChart;
let currentRegion = 'global';

// data
const chartData = {
  '24h': { labels: Array.from({length:24},(_,i)=>`${i+1} h`),  data: Array.from({length:24},()=>getRandomInt(120,520)) },
  '7d' : { labels: Array.from({length:7 },(_,i)=>`${i+1} d`),  data: Array.from({length:7 },()=>getRandomInt(120,520)) },
  '30d': { labels: Array.from({length:30},(_,i)=>`${i+1} d`),  data: Array.from({length:30},()=>getRandomInt(120,520)) },
  '1y' : { labels: ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'], data: Array.from({length:12},()=>getRandomInt(120,520)) },
  'max': { labels: ['2019','2020','2021','2022','2023','2024','2025'], data: Array.from({length:7},()=>getRandomInt(120,520)) },
};

// DE ~ 60% von global
const chartDataDe = {};
for (const range in chartData) {
  chartDataDe[range] = {
    labels: chartData[range].labels,
    data: chartData[range].data.map(v => Math.floor(v * 0.6))
  };
}

function makeDataset(ctx, data){
  const grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  grad.addColorStop(0, 'rgba(109,213,250,0.28)');
  grad.addColorStop(1, 'rgba(109,213,250,0.00)');
  return {
    data,
    borderColor: '#6dd5fa',
    backgroundColor: grad,
    fill: true,
    tension: 0.35,
    borderWidth: 3,
    pointRadius: 0,
    hoverRadius: 0,
  };
}

const crosshairPlugin = {
  id: 'crosshair',
  afterDatasetsDraw(chart) {
    const {ctx, chartArea:{top,bottom}, tooltip} = chart;
    const active = tooltip && tooltip.getActiveElements && tooltip.getActiveElements();
    if (!active || !active.length) return;
    const x = chart.tooltip.caretX;
    ctx.save();
    ctx.strokeStyle = 'rgba(167,184,230,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4,4]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.restore();
  }
};
if (window.Chart && !Chart.registry.plugins.get('crosshair')) {
  Chart.register(crosshairPlugin);
}

function drawChart(){
  const canvas = document.getElementById('liveChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const {labels, data} = chartData['24h'];

  myChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [makeDataset(ctx, data)] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect:false, mode:'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          displayColors: false,
          backgroundColor: 'rgba(12,18,40,0.92)',
          borderColor: 'rgba(255,255,255,0.15)',
          borderWidth: 1,
          padding: 8,
          callbacks: {
            title: items => items[0]?.label ?? '',
            label: item => ` ${Math.round(item.parsed.y)} live`,
          },
        },
      },
      scales: {
        x: { ticks: { color:'#a7b8e6', maxTicksLimit:6 }, grid: { display:false } },
        y: { ticks: { color:'#a7b8e6', maxTicksLimit:5 }, grid: { color:'#203056' } },
      },
      elements: { line: { capBezierPoints:true } },
    },
  });

  const last = data[data.length-1];
  const badge = document.getElementById('chartBadge');
  if (badge) badge.textContent = `${last} live`;
}

function updateChart(range){
  const canvas = document.getElementById('liveChart');
  const dataObj = currentRegion === 'de' ? chartDataDe[range] : chartData[range];
  if(!myChart || !dataObj || !canvas) return;
  const {labels, data} = dataObj;
  const ctx = canvas.getContext('2d');

  myChart.data.labels = labels;
  myChart.data.datasets[0] = makeDataset(ctx, data);
  myChart.update();

  const badge = document.getElementById('chartBadge');
  if (badge) badge.textContent = `${data[data.length-1]} live`;
}

// ===== Share =====
function shareThought() {
  const url = window.location.href;
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(()=>alert('Link zum Teilen wurde kopiert!'));
  else prompt('Kopiere den Link:', url);
}

// ===== Bootstrap =====
document.addEventListener('DOMContentLoaded', ()=>{
  if(document.getElementById('home-search')) initHomePage();
  if(document.getElementById('results-search') || document.getElementById('liveChart')) initResultsPage();
});

// ===== Realtime Socket.IO integration =====
(function(){
  const socketScript = document.createElement('script');
  socketScript.src = 'https://cdn.socket.io/4.6.1/socket.io.min.js';
  socketScript.onload = () => {
    // 👉👉 HIER KOMMT GLEIsocket.on('connect', () => {
  if (currentTerm) socket.emit('searchTerm', currentTerm);
});
socket.on('reconnect', () => {
  if (currentTerm) socket.emit('searchTerm', currentTerm);
});
CH DEINE SERVER-URL REIN (Schritt 3):
    // ZUERST SO LASSEN, dann gleich ersetzen!
    const WS_BASE = 'https://whothought.onrender.com';

    const socket = io(WS_BASE, { transports: ['websocket'] });
    
    const norm = (q) => (q || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 140);
    let currentTerm = '';

    function updateUI(term, count) {
      if (document.getElementById('home-live-ticker')) {
        const homeSpan = document.getElementById('live-count');
        if (homeSpan && norm(term) === norm(currentTerm)) homeSpan.textContent = count;
      }
      const resultsSpan = document.getElementById('results-live-count');
      if (resultsSpan && norm(term) === norm(currentTerm)) {
        resultsSpan.textContent = count;
        const badge = document.getElementById('chartBadge');
        if (badge) badge.textContent = `${count} live`;
      }
    }

    socket.on('updateCount', ({ term, count }) => updateUI(term, count));

    function emitTerm(raw) {
      const term = norm(raw);
      if (!term || term === currentTerm) return;
      currentTerm = term;
      socket.emit('searchTerm', term);
    }

    // Home page search
    const homeInput = document.getElementById('home-search');
    if (homeInput) {
      homeInput.addEventListener('input', e => emitTerm(e.target.value));
      homeInput.addEventListener('keypress', e => { if (e.key === 'Enter') emitTerm(e.target.value); });
    }

    // Results page search
    const resultsInput = document.getElementById('results-search');
    if (resultsInput) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) emitTerm(q);

      resultsInput.addEventListener('input', e => emitTerm(e.target.value));
      resultsInput.addEventListener('keypress', e => { if (e.key === 'Enter') emitTerm(e.target.value); });
    }
  };
  document.head.appendChild(socketScript);
})();
