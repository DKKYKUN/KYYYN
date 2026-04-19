// ============================================================
//  app.js — Logika utama: polling, update UI, alert
// ============================================================

let lastRowId     = null;   // Cegah update duplikat
let isConnected   = false;
let historyRows   = [];

// Audio alert
let audioCtx  = null;
let audioOn   = false;

// ---- Audio ----
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playAlert(level) {
  if (!audioOn || !audioCtx) return;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = level === 3 ? 'square' : 'sine';
  osc.frequency.value = level === 3 ? 880 : 600;
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (level === 3 ? 1.2 : 0.6));
  osc.start();
  osc.stop(audioCtx.currentTime + (level === 3 ? 1.2 : 0.6));
}

function toggleAudio() {
  initAudio();
  audioOn = !audioOn;
  const icon = document.getElementById('audio-icon');
  const btn  = document.getElementById('toggle-audio');
  if (audioOn) {
    icon.className = 'ph ph-speaker-high';
    btn.classList.add('audio-active');
    showToast('audio', 'Suara Aktif', 'Alert akan berbunyi saat kondisi bahaya.', 'info');
  } else {
    icon.className = 'ph ph-speaker-slash';
    btn.classList.remove('audio-active');
  }
}

// ---- Polling Supabase ----
async function pollLatest() {
  try {
    const row = await fetchLatest();
    if (!row) return;

    // Cegah re-render jika data sama
    if (row.id === lastRowId) return;
    lastRowId = row.id;

    if (!isConnected) {
      isConnected = true;
      setConnectionStatus(true, 'Data dari Supabase');
      showToast('conn', 'Terhubung ke Supabase', 'Data realtime diterima.', 'ok');
    }

    setLastUpdate(row.created_at);
    processDashboard(row);

  } catch (err) {
    console.error('[Poll] Error:', err);
    if (isConnected) {
      isConnected = false;
      setConnectionStatus(false, 'Gagal menerima data');
      showToast('conn', 'Koneksi Terputus', err.message, 'danger');
    }
  }
}

async function pollHistory() {
  try {
    historyRows = await fetchHistory(CONFIG.maxHistory);
    renderHistoryTable(historyRows);
  } catch (err) {
    console.error('[History] Error:', err);
  }
}

// ---- Process & Update Dashboard ----
let alertCooldown = {}; // hindari spam alert per sensor

function processDashboard(row) {
  let maxLevel = -1;
  const criticals = [];
  const dangers   = [];

  SENSORS.forEach(sensor => {
    const value  = row[sensor.id] ?? null;
    const status = getStatus(sensor, value);
    const time   = new Date(row.created_at).toLocaleTimeString('id-ID');

    // Update kartu
    updateCard(sensor, value, status);

    // Update grafik
    updateChart(sensor, value, time, status.level);

    // Track level tertinggi
    if (status.level > maxLevel) maxLevel = status.level;
    if (status.level === 3) criticals.push(sensor.name);
    if (status.level === 2) dangers.push(sensor.name);

    // Alert per sensor (dengan cooldown 30 detik)
    if (status.level >= 3 && !alertCooldown[sensor.id]) {
      alertCooldown[sensor.id] = true;
      setTimeout(() => delete alertCooldown[sensor.id], 30000);
    }
  });

  // Alert global
  if (maxLevel === 3) {
    showToast('alert-crit', '⚠ KRITIS — SEGERA EVAKUASI!', `Level berbahaya: ${criticals.join(', ')}`, 'critical');
    playAlert(3);
  } else if (maxLevel === 2 && !alertCooldown['_global_danger']) {
    alertCooldown['_global_danger'] = true;
    setTimeout(() => delete alertCooldown['_global_danger'], 20000);
    showToast('alert-warn', '⚠ BAHAYA — Ventilasi Ruangan', `Perhatikan: ${dangers.join(', ')}`, 'danger');
    playAlert(2);
  }

  // Update status bar kecil di header
  updateStatusBar(maxLevel);
}

function updateStatusBar(level) {
  const bar = document.getElementById('status-bar');
  if (!bar) return;
  const labels = { '-1': '', 0: 'Semua Normal', 1: 'Peringatan', 2: 'Bahaya', 3: 'KRITIS!' };
  const cls    = { '-1': '', 0: 'bar-ok', 1: 'bar-warn', 2: 'bar-danger', 3: 'bar-critical' };
  bar.textContent = labels[level] ?? '';
  bar.className   = `status-bar ${cls[level] ?? ''}`;
}

// ---- Init ----
window.addEventListener('DOMContentLoaded', () => {
  // Build UI structure
  buildCards();
  buildHistoryTable();
  initAllCharts();

  // Set default tab
  switchTab('dashboard');

  // Audio button
  document.getElementById('toggle-audio')?.addEventListener('click', toggleAudio);

  // First poll immediately
  pollLatest();
  pollHistory();

  // Start polling intervals
  setInterval(pollLatest,  CONFIG.pollInterval);
  setInterval(pollHistory, CONFIG.pollInterval * 4); // history refresh lebih jarang
});
