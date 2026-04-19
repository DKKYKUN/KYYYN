// ============================================================
//  ui.js — Rendering kartu, tabel, toast, dan navigasi tab
//  FIX: tab switching menggunakan class view-hidden yang benar
// ============================================================

// ---- Tab Navigation ----
// Setiap view adalah .view-panel di luar .content
// Sembunyikan dengan .view-hidden, tampilkan dengan hapus class itu
const ALL_TABS = ['dashboard', 'history', 'about'];

function switchTab(tabId) {
  ALL_TABS.forEach(v => {
    const panel = document.getElementById(`view-${v}`);
    const btn   = document.getElementById(`btn-${v}`);
    if (!panel || !btn) return;

    if (v === tabId) {
      // Tampilkan
      panel.classList.remove('view-hidden');
      btn.classList.add('active-nav');
      btn.classList.remove('inactive-nav');
    } else {
      // Sembunyikan
      panel.classList.add('view-hidden');
      btn.classList.remove('active-nav');
      btn.classList.add('inactive-nav');
    }
  });

  const titles = {
    dashboard: 'Real-time Overview',
    history:   'Riwayat Data Sensor',
    about:     'Tentang Sistem',
  };
  const el = document.getElementById('page-title');
  if (el) el.textContent = titles[tabId] || tabId;
}

// ---- Build Dashboard Cards ----
// Setiap kartu berisi: icon, badge, nama, nilai besar, dan grafik mini inline
function buildCards() {
  const groups = [
    { id: 'vital', label: '❤ Vital Signs'      },
    { id: 'env',   label: '🌡 Lingkungan'        },
    { id: 'gas',   label: '🧪 Kualitas Udara'    },
  ];

  const container = document.getElementById('cards-container');
  if (!container) return;
  container.innerHTML = '';

  groups.forEach(group => {
    const groupSensors = SENSORS.filter(s => s.group === group.id);
    if (!groupSensors.length) return;

    const section = document.createElement('div');
    section.className = 'sensor-group';

    const gridId = `grid-${group.id}`;
    section.innerHTML = `
      <h3 class="group-label">${group.label}</h3>
      <div class="cards-grid" id="${gridId}"></div>
    `;
    container.appendChild(section);

    const grid = document.getElementById(gridId);
    groupSensors.forEach(sensor => {
      const card = document.createElement('div');
      card.id = `card-${sensor.id}`;
      card.className = 'sensor-card';
      card.innerHTML = `
        <div class="card-header">
          <div class="card-icon" id="icon-${sensor.id}">
            <i class="ph ph-${sensor.icon}"></i>
          </div>
          <span class="card-badge unknown" id="badge-${sensor.id}">WAIT</span>
        </div>
        <div class="card-name">${sensor.name}</div>
        <div class="card-value-row">
          <span class="card-value" id="val-${sensor.id}">—</span>
          <span class="card-unit">${sensor.unit}</span>
        </div>
        <div class="card-chart-wrap">
          <canvas id="chart-${sensor.id}"></canvas>
        </div>
      `;
      grid.appendChild(card);
    });
  });
}

// ---- Update a Single Card ----
function updateCard(sensor, value, status) {
  const valEl   = document.getElementById(`val-${sensor.id}`);
  const badgeEl = document.getElementById(`badge-${sensor.id}`);
  const cardEl  = document.getElementById(`card-${sensor.id}`);
  const iconEl  = document.getElementById(`icon-${sensor.id}`);
  if (!valEl) return;

  valEl.textContent  = formatValue(sensor, value);
  badgeEl.textContent = status.label;
  badgeEl.className   = `card-badge ${status.cls}`;
  cardEl.className    = `sensor-card level-${status.level}`;
  iconEl.className    = `card-icon icon-${status.cls}`;
}

// ---- Build History Table Header ----
function buildHistoryTable() {
  const thead = document.getElementById('history-head');
  if (!thead) return;
  thead.innerHTML = `
    <tr>
      <th class="th">Waktu</th>
      ${SENSORS.map(s =>
        `<th class="th">${s.name}<br><span class="th-unit">${s.unit}</span></th>`
      ).join('')}
    </tr>`;
}

// ---- Render History Table Rows ----
function renderHistoryTable(rows) {
  const tbody = document.getElementById('history-body');
  const count = document.getElementById('history-count');
  if (!tbody) return;

  if (count) count.textContent = `${rows.length} baris`;

  tbody.innerHTML = '';
  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.className = i === 0 ? 'row-latest' : '';

    const time = row.created_at
      ? new Date(row.created_at).toLocaleString('id-ID', {
          day: '2-digit', month: '2-digit', year: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        })
      : '—';

    const cells = SENSORS.map(s => {
      const val = row[s.id];
      const st  = getStatus(s, val);
      return `<td class="td ${st.cls}">${formatValue(s, val)}</td>`;
    }).join('');

    tr.innerHTML = `<td class="td td-time">${time}</td>${cells}`;
    tbody.appendChild(tr);
  });
}

// ---- Toast Notifications ----
let toastTimeout = {};
function showToast(id, title, msg, type = 'info') {
  if (toastTimeout[id]) return;
  toastTimeout[id] = setTimeout(() => delete toastTimeout[id], 15000);

  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  const icons = { info: 'info', danger: 'warning', critical: 'warning-octagon', ok: 'check-circle' };
  const cls   = { info: 'toast-info', danger: 'toast-danger', critical: 'toast-critical', ok: 'toast-ok' };

  toast.className = `toast ${cls[type] || 'toast-info'}`;
  toast.innerHTML = `
    <i class="ph-fill ph-${icons[type] || 'info'} toast-icon"></i>
    <div class="toast-body">
      <strong>${title}</strong>
      ${msg ? `<p>${msg}</p>` : ''}
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="ph ph-x"></i>
    </button>`;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-show'));
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 400);
  }, 6000);
}

// ---- Connection Status ----
function setConnectionStatus(connected, extra = '') {
  const dot  = document.getElementById('status-dot');
  const ping = document.getElementById('status-ping');
  const text = document.getElementById('conn-status');
  const sub  = document.getElementById('data-source');

  if (connected) {
    dot.className  = 'dot dot-green';
    ping.className = 'ping ping-green';
    text.textContent = 'Terhubung';
    text.className = 'conn-label green';
  } else {
    dot.className  = 'dot dot-red';
    ping.className = 'ping ping-red';
    text.textContent = 'Terputus';
    text.className = 'conn-label red';
  }
  if (extra) sub.textContent = extra;
}

// ---- Last Update Timestamp ----
function setLastUpdate(isoStr) {
  const el = document.getElementById('last-update');
  if (!el || !isoStr) return;
  el.textContent = `Update: ${new Date(isoStr).toLocaleTimeString('id-ID')}`;
}
