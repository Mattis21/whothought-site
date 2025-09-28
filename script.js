// Helper: get random integer within range
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Home-Seite Logik
function initHomePage() {
  const searchInput = document.getElementById('home-search');
  const suggestionsList = document.getElementById('suggestions');
  const liveTicker = document.getElementById('home-live-ticker');
  // Vordefinierte Vorschläge mit Live-Zahlen
  const suggestionData = [
    { text: 'Schuhtrends 2025', count: 1203 },
    { text: 'Schuhsohlen nachhaltige', count: 420 },
    { text: 'Sneaker neue Modelle', count: 870 },
    { text: 'Barfußlaufen Vorteile', count: 310 }
  ];

  // Zeigt die Vorschläge passend zur Eingabe
  function updateSuggestions(value) {
    // Leeren der Liste
    suggestionsList.innerHTML = '';
    if (!value) return;
    const lower = value.toLowerCase();
    const matches = suggestionData.filter(item => item.text.toLowerCase().includes(lower));
    matches.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.text}</span><span class=\"suggestion-count\">${item.count} live</span>`;
      li.addEventListener('click', () => {
        goToResults(item.text);
      });
      suggestionsList.appendChild(li);
    });
  }

  // Navigiert zur Ergebnisseite
  function goToResults(query) {
    // Encode query for URL
    const encoded = encodeURIComponent(query);
    window.location.href = `feed.html?q=${encoded}`;
  }

  // Suchfeld-Eingabe überwachen
  searchInput.addEventListener('input', (e) => {
    updateSuggestions(e.target.value);
  });

  // Bei Enter die Suche starten
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        goToResults(query);
      }
    }
  });

  // Live-Ticker Text basierend auf zufälligem Thema aktualisieren
  function updateLiveTicker() {
    const randomIndex = getRandomInt(0, suggestionData.length - 1);
    const item = suggestionData[randomIndex];
    liveTicker.innerHTML = `🔥 <span id=\"live-count\">${item.count}</span> Menschen denken gerade über <strong>${item.text.split(' ')[0]}</strong> nach`;
  }
  updateLiveTicker();
}

// Ergebnisseite Logik
function initResultsPage() {
  const queryBubble = document.getElementById('results-query');
  const liveCountElem = document.getElementById('results-live-count');
  const changeElem = document.getElementById('results-change');
  const relatedList = document.getElementById('related-list');
  // Lese Suchparameter
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || 'Gedanke';
  // Setze Suchbegriff
  queryBubble.textContent = query;
  // Generiere Live-Zahlen
  const baseCount = getRandomInt(200, 1500);
  const diff = getRandomInt(-50, 50);
  liveCountElem.textContent = baseCount;
  const diffText = diff >= 0 ? `▲ Zuwachs +${diff}` : `▼ Abnahme ${diff}`;
  changeElem.textContent = diffText + ' in den letzten 5 Minuten';
  changeElem.style.color = diff >= 0 ? '#2fd472' : '#e3626b';
  // Zeichne Diagramm
  drawChart();
  // Fülle verwandte Themen (Beispiele)
  const relatedTopics = [
    { text: 'Schuhpflege', count: getRandomInt(100, 500) },
    { text: 'Schuhtrends', count: getRandomInt(100, 500) },
    { text: 'Einlegesohlen', count: getRandomInt(50, 300) },
    { text: 'Sneaker Pflege', count: getRandomInt(50, 200) }
  ];
  relatedList.innerHTML = '';
  relatedTopics.forEach(topic => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${topic.text}</span><span class=\"count\">${topic.count}</span>`;
    li.addEventListener('click', () => {
      window.location.href = `feed.html?q=${encodeURIComponent(topic.text)}`;
    });
    relatedList.appendChild(li);
  });
}

// Zeichne das Liniendiagramm mit Chart.js
function drawChart() {
  const ctx = document.getElementById('liveChart').getContext('2d');
  // Erstelle zufällige Datenpunkte
  const dataPoints = [];
  for (let i = 0; i < 20; i++) {
    dataPoints.push(getRandomInt(100, 500));
  }
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: dataPoints.length }, (_, i) => i + 1),
      datasets: [{
        data: dataPoints,
        borderColor: '#6dd5fa',
        backgroundColor: 'transparent',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: {
          display: false
        },
        y: {
          display: false
        }
      }
    }
  });
}

// Share-Funktion (einfach kopieren des Links)
function shareThought() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert('Link zum Teilen wurde kopiert!');
  });
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('home-search')) {
    initHomePage();
  }
  if (document.getElementById('results-query')) {
    initResultsPage();
  }
});
