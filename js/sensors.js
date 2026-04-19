// ============================================================
//  sensors.js — Definisi sensor, threshold bahaya, dan status
// ============================================================

// Daftar semua sensor yang ditampilkan
const SENSORS = [
  // --- Vital Signs ---
  {
    id: 'heart_rate', name: 'Heart Rate',  unit: 'BPM',
    icon: 'pulse',    group: 'vital',
    thresholds: [
      { max: 49,  label: 'Rendah',   level: 2, cls: 'warn-orange' },
      { max: 59,  label: 'Lambat',   level: 1, cls: 'warn-yellow' },
      { max: 110, label: 'Normal',   level: 0, cls: 'good'        },
      { max: 120, label: 'Tinggi',   level: 1, cls: 'warn-yellow' },
      { max: 999, label: 'Kritis',   level: 3, cls: 'danger'      },
    ],
  },
  {
    id: 'spo2',       name: 'SpO₂',        unit: '%',
    icon: 'drop-half-bottom', group: 'vital',
    thresholds: [
      { max: 89,  label: 'Kritis',   level: 3, cls: 'danger'      },
      { max: 94,  label: 'Rendah',   level: 2, cls: 'warn-orange' },
      { max: 97,  label: 'Cukup',    level: 1, cls: 'warn-yellow' },
      { max: 100, label: 'Normal',   level: 0, cls: 'good'        },
    ],
  },

  // --- Lingkungan ---
  {
    id: 'temperature', name: 'Suhu',       unit: '°C',
    icon: 'thermometer', group: 'env',
    thresholds: [
      { max: 19,  label: 'Dingin',   level: 1, cls: 'info'        },
      { max: 26,  label: 'Nyaman',   level: 0, cls: 'good'        },
      { max: 35,  label: 'Hangat',   level: 1, cls: 'warn-yellow' },
      { max: 40,  label: 'Panas',    level: 2, cls: 'warn-orange' },
      { max: 999, label: 'Sangat Panas', level: 3, cls: 'danger'  },
    ],
  },
  {
    id: 'humidity',   name: 'Kelembaban',  unit: '%',
    icon: 'cloud-rain', group: 'env',
    thresholds: [
      { max: 29,  label: 'Kering',   level: 1, cls: 'warn-yellow' },
      { max: 60,  label: 'Ideal',    level: 0, cls: 'good'        },
      { max: 80,  label: 'Lembab',   level: 1, cls: 'warn-yellow' },
      { max: 100, label: 'Basah',    level: 2, cls: 'warn-orange' },
    ],
  },

  // --- Gas ---
  {
    id: 'co2',        name: 'CO₂',         unit: 'ppm',
    icon: 'cloud', group: 'gas',
    thresholds: [
      { max: 999,  label: 'Baik',    level: 0, cls: 'good'        },
      { max: 1499, label: 'Sedang',  level: 1, cls: 'warn-yellow' },
      { max: 1999, label: 'Bahaya',  level: 2, cls: 'warn-orange' },
      { max: 9999, label: 'Kritis',  level: 3, cls: 'danger'      },
    ],
  },
  {
    id: 'co',         name: 'CO',          unit: 'ppm',
    icon: 'gas-pump', group: 'gas',
    thresholds: [
      { max: 9,   label: 'Aman',    level: 0, cls: 'good'        },
      { max: 24,  label: 'Sedang',  level: 1, cls: 'warn-yellow' },
      { max: 50,  label: 'Bahaya',  level: 2, cls: 'warn-orange' },
      { max: 999, label: 'Kritis',  level: 3, cls: 'danger'      },
    ],
  },
  {
    id: 'nh3',        name: 'NH₃',         unit: 'ppm',
    icon: 'flask', group: 'gas',
    thresholds: [
      { max: 24,  label: 'Aman',    level: 0, cls: 'good'        },
      { max: 50,  label: 'Sedang',  level: 1, cls: 'warn-yellow' },
      { max: 100, label: 'Bahaya',  level: 2, cls: 'warn-orange' },
      { max: 999, label: 'Kritis',  level: 3, cls: 'danger'      },
    ],
  },
  {
    id: 'smoke',      name: 'Asap',        unit: 'ppm',
    icon: 'campfire', group: 'gas',
    thresholds: [
      { max: 99,  label: 'Aman',    level: 0, cls: 'good'        },
      { max: 200, label: 'Sedang',  level: 1, cls: 'warn-yellow' },
      { max: 400, label: 'Bahaya',  level: 2, cls: 'warn-orange' },
      { max: 9999,label: 'Kritis',  level: 3, cls: 'danger'      },
    ],
  },
  {
    id: 'benzene',    name: 'Benzene',     unit: 'ppm',
    icon: 'atom', group: 'gas',
    thresholds: [
      { max: 0.99,label: 'Aman',    level: 0, cls: 'good'        },
      { max: 2.99,label: 'Sedang',  level: 1, cls: 'warn-yellow' },
      { max: 5,   label: 'Bahaya',  level: 2, cls: 'warn-orange' },
      { max: 999, label: 'Kritis',  level: 3, cls: 'danger'      },
    ],
  },
  {
    id: 'alcohol',    name: 'Alkohol',     unit: 'ppm',
    icon: 'beer-bottle', group: 'gas',
    thresholds: [
      { max: 99,  label: 'Aman',    level: 0, cls: 'good'        },
      { max: 299, label: 'Sedang',  level: 1, cls: 'warn-yellow' },
      { max: 800, label: 'Bahaya',  level: 2, cls: 'warn-orange' },
      { max: 9999,label: 'Kritis',  level: 3, cls: 'danger'      },
    ],
  },
  {
    id: 'nox',        name: 'NOₓ',         unit: 'ppm',
    icon: 'warning-diamond', group: 'gas',
    thresholds: [
      { max: 0.1, label: 'Aman',    level: 0, cls: 'good'        },
      { max: 0.5, label: 'Sedang',  level: 1, cls: 'warn-yellow' },
      { max: 1,   label: 'Bahaya',  level: 2, cls: 'warn-orange' },
      { max: 999, label: 'Kritis',  level: 3, cls: 'danger'      },
    ],
  },
  {
    id: 'so2',        name: 'SO₂',         unit: 'ppm',
    icon: 'warning-circle', group: 'gas',
    thresholds: [
      { max: 0.5, label: 'Aman',    level: 0, cls: 'good'        },
      { max: 1,   label: 'Sedang',  level: 1, cls: 'warn-yellow' },
      { max: 5,   label: 'Bahaya',  level: 2, cls: 'warn-orange' },
      { max: 999, label: 'Kritis',  level: 3, cls: 'danger'      },
    ],
  },
];

// Kembalikan object status berdasarkan nilai sensor
//
// FIX: Sebelumnya hanya cek null/undefined/NaN.
// Nilai 0 dari Supabase adalah data valid (sensor baru warm up),
// bukan "tidak ada data" — jangan tampilkan '—' untuk nilai 0.
function getStatus(sensor, value) {
  // Hanya anggap "tidak ada data" jika null, undefined, atau NaN
  // nilai 0 tetap diproses sebagai data valid
  if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
    return { label: '—', level: -1, cls: 'unknown' };
  }
  const num = parseFloat(value);
  if (isNaN(num)) return { label: '—', level: -1, cls: 'unknown' };

  const t = sensor.thresholds.find(th => num <= th.max);
  return t || { label: '?', level: 0, cls: 'good' };
}

// Format angka sesuai kebutuhan tampilan
//
// BUG SEBELUMNYA: Math.round() dipakai untuk SEMUA gas → nilai kecil
// seperti CO=0.3 ppm, NH3=0.8 ppm, Smoke=0.4 ppm dibulatkan ke 0
// sehingga kartu menampilkan "0" padahal data ada.
//
// FIX: Tiap sensor punya format desimal yang sesuai range nilainya.
function formatValue(sensor, value) {
  if (value === null || value === undefined || isNaN(value)) return '—';

  switch (sensor.id) {
    // Vital — bilangan bulat sudah cukup
    case 'heart_rate': return Math.round(value);
    case 'spo2':       return value.toFixed(1);

    // Lingkungan
    case 'temperature': return value.toFixed(1);
    case 'humidity':    return value.toFixed(1);

    // Gas besar (ratusan–ribuan ppm) — 1 desimal
    case 'co2':     return value.toFixed(1);
    case 'smoke':   return value.toFixed(1);
    case 'alcohol': return value.toFixed(1);

    // Gas menengah (puluhan ppm) — 2 desimal
    case 'co':  return value.toFixed(2);
    case 'nh3': return value.toFixed(2);

    // Gas kecil (< 10 ppm) — 3 desimal agar tidak hilang jika < 0.01
    case 'benzene': return value.toFixed(3);
    case 'nox':     return value.toFixed(3);
    case 'so2':     return value.toFixed(3);

    default: return value.toFixed(2);
  }
}
