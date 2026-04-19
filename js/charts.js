// ============================================================
//  charts.js — Inisialisasi dan update grafik Chart.js
// ============================================================

const charts = {};

// Warna per level status
const LEVEL_COLORS = {
  '-1': '#4b5563',  // unknown
   '0': '#22d3ee',  // good    → cyan
   '1': '#fbbf24',  // warning → amber
   '2': '#f97316',  // danger  → orange
   '3': '#ef4444',  // critical→ red
};

function initChart(sensor) {
  const canvas = document.getElementById(`chart-${sensor.id}`);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const emptyLabels = Array(CONFIG.maxChartPoints).fill('');
  const emptyData   = Array(CONFIG.maxChartPoints).fill(null);

  charts[sensor.id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [...emptyLabels],
      datasets: [{
        data: [...emptyData],
        borderColor: LEVEL_COLORS[0],
        backgroundColor: LEVEL_COLORS[0] + '18',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          borderColor: '#334155',
          borderWidth: 1,
          titleColor: '#94a3b8',
          bodyColor: '#f1f5f9',
          padding: 8,
          callbacks: {
            label: ctx => `${ctx.parsed.y} ${sensor.unit}`,
          },
        },
      },
      scales: {
        x: { display: false },
        y: {
          display: true,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#475569',
            maxTicksLimit: 4,
            font: { size: 9, family: "'DM Mono', monospace" },
          },
          border: { display: false },
        },
      },
    },
  });
}

function updateChart(sensor, value, timeLabel, level) {
  const chart = charts[sensor.id];
  if (!chart) return;

  const ds = chart.data.datasets[0];
  const color = LEVEL_COLORS[level] ?? LEVEL_COLORS[0];

  ds.data.push(value);
  ds.data.shift();
  chart.data.labels.push(timeLabel);
  chart.data.labels.shift();

  ds.borderColor      = color;
  ds.backgroundColor  = color + '18';

  chart.update('none'); // no animation for performance
}

function initAllCharts() {
  SENSORS.forEach(sensor => initChart(sensor));
}
