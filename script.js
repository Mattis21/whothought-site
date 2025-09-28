// =============== Helpers ===============
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// =============== Home-Seite ===============
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

  function updateSuggestions(value) {
    suggestionsList.innerHTML = '';
    if (!value) return;
    const lower = value.toLowerCase();
    const matches = suggestionData.filter((item) =>
      item.text.toLowerCase().includes(lower)
    );
    matches.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.text}</span><span class="suggestion-count">${item.count} live</span>`;
      li.addEventListener('click', () => goToResults(item.text));
      suggestionsList.appendChild(li);
    });
  }

  function goToResults(query) {
    const encoded = encodeURIComponent(query);
    window.location.href = `feed.html?q=${encoded}`;
  }

  // Events
  searchInput.addEventListener('input', (e) => updateSuggestions(e.target.value));
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) goToResults(query);
    }
  });

  function updateLiveTicker() {
    const item = suggestionData[getRandomInt(0, suggestionData.length - 1)];
    liveTicker.innerHTML = `🔥 <span id="live-count">${item.count}</span> Menschen denken gerade über <strong>${item.text.split(' ')[0]}</strong> nach`;
  }
  updateLiveTicker();
}

// =============== Ergebnisseite ===============
function initResultsPage() {
  const resultsSearch = document.getElementById('results-search');
  const liveCountElem = document.getElementById('results-live-count');
  const changeElem = document.getElementById('results-change');
  const relatedList = document.getElementById('related-list');

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || 'Gedanke';
  if (resultsSearch) resultsSearch.value = query;

  // Live-Zahlen
  const baseCount = getRandomInt(200, 1500);
  const diff = getRandomInt(-50, 50);
  liveCountElem.textContent = baseCount;
  const diffText = diff >= 0 ? `▲ Zuwachs +${diff}` : `▼ Abnahme ${Math.abs(diff)}`;
  changeElem.textContent = `${diffText} in den letzten 5 Minuten`;
  changeElem.style.color = diff >= 0 ? '#2fd472' : '#e3626b';

  // Chart initial
  drawChart();

  // Verwandte Themen
  const relatedTopics = [
    { text: 'Schuhpflege',       count: getRandomInt(100, 500) },
    { text: 'Schuhtrends',       count: getRandomInt(100, 500) },
    { text: 'Einlegesohlen',     count: getRandomInt(50, 300) },
    { text: 'Sneaker Pflege',    count: getRandomInt(50, 200) },
  ];
  relatedList.innerHTML = '';
  relatedTopics.forEach((topic) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${topic.text}</span><span class="count">${topic.count}</span>`;
    li.addEventListener('click', () => {
      window.location.href = `feed.html?q=${encodeURIComponent(topic.text)}`;
    });
    relatedList.appendChild(li);
  });

  // Zeitbereiche
  const timeButtons = document.querySelectorAll('.time-btn');
  timeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const activeBtn = document.querySelector('.time-btn.active');
      if (activeBtn) activeBtn.classList.remove('active');
      btn.classList.add('active');
      const range = btn.getAttribute('data-range');
      updateChart(range);
    });
  });

  // Neue Suche
  if (resultsSearch) {
    resultsSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const newQuery = resultsSearch.value.trim();
        if (newQuery) {
          window.location.href = `feed.html?q=${encodeURIComponent(newQuery)}`;
        }
      }
    });
  }
}

// ===== Chart.js Setup =====
let myChart;
const chartData = {
  '24h': {
    labels: Array.from({ length: 24 }, (_, i) => `${i + 1} h`),
    data: Array.from({ length: 24 }, () => getRandomInt(100, 500)),
  },
  '7d': {
    labels: Array.from({ length: 7 }, (_, i) => `${i + 1} d`),
    data: Array.from({ length: 7 }, () => getRandomInt(100, 500)),
  },
  '30d': {
    labels: Array.from({ length: 30 }, (_, i) => `${i + 1} d`),
    data: Array.from({ length: 30 }, () => getRandomInt(100, 500)),
  },
  '1y': {
    labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    data: Array.from({ length: 12 }, () => getRandomInt(100, 500)),
  },
  max: {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
    data: Array.from({ length: 7 }, () => getRandomInt(100, 500)),
  },
};

function drawChart() {
  const canvas = document.getElementById('liveChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const { labels, data } = chartData['24h'];

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data,
          borderColor: '#6dd5fa',
          backgroundColor: 'transparent',
          tension: 0.3,
          borderWidth: 3,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        x: { display: false },
        y: { display: false },
      },
    },
  });
}

function updateChart(range) {
  if (!myChart || !chartData[range]) return;
  const { labels, data } = chartData[range];
  myChart.data.labels = labels;
  myChart.data.datasets[0].data = data;
  myChart.update();
}

// ===== Share =====
function shareThought() {
  const url = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      alert('Link zum Teilen wurde kopiert!');
    });
  } else {
    prompt('Kopiere den Link:', url);
  }
}

// ===== Bootstrap =====
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('home-search')) {
    initHomePage();
  }
  if (document.getElementById('results-search') || document.getElementById('liveChart')) {
    initResultsPage();
  }
});

