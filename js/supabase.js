// ============================================================
//  supabase.js — Fetch data realtime dari Supabase REST API
// ============================================================

// Ambil 1 baris data terbaru dari tabel sensor
async function fetchLatest() {
  const res = await fetch(
    `${CONFIG.supabase.url}/rest/v1/${CONFIG.supabase.table}` +
    `?select=*&order=created_at.desc&limit=1`,
    {
      headers: {
        'apikey':        CONFIG.supabase.apikey,
        'Authorization': `Bearer ${CONFIG.supabase.apikey}`,
        'Accept':        'application/json',
      },
    }
  );
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  const rows = await res.json();
  if (!rows.length) return null;

  // DEBUG: tampilkan raw data di console browser (F12 → Console)
  // Berguna untuk verifikasi nilai yang diterima dari Supabase
  const row = rows[0];
  console.table({
    co2:       row.co2,
    co:        row.co,
    nh3:       row.nh3,
    smoke:     row.smoke,
    benzene:   row.benzene,
    alcohol:   row.alcohol,
    nox:       row.nox,
    so2:       row.so2,
    temp:      row.temperature,
    humidity:  row.humidity,
    heart_rate:row.heart_rate,
    spo2:      row.spo2,
  });

  return row;
}

// Ambil N baris terbaru untuk tabel history
async function fetchHistory(limit = CONFIG.maxHistory) {
  const res = await fetch(
    `${CONFIG.supabase.url}/rest/v1/${CONFIG.supabase.table}` +
    `?select=*&order=created_at.desc&limit=${limit}`,
    {
      headers: {
        'apikey':        CONFIG.supabase.apikey,
        'Authorization': `Bearer ${CONFIG.supabase.apikey}`,
        'Accept':        'application/json',
      },
    }
  );
  if (!res.ok) throw new Error(`Supabase history error: ${res.status}`);
  return res.json();
}
