// ============================================================
//  config.js — Supabase credentials & app configuration
//  Edit bagian ini sesuai dengan project Supabase kamu
// ============================================================

const CONFIG = {
  supabase: {
    url:    'https://pbkrrhcsfpoeqmslplff.supabase.co',
    apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBia3JyaGNzZnBvZXFtc2xwbGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMDc5MjEsImV4cCI6MjA5MDg4MzkyMX0.6otiJ_d5eqB9H1hUSSFfsFH0ZGJHd-Q1IqFotOsNZl4',
    table:  'sensor',
  },

  // Interval polling data dari Supabase (ms)
  pollInterval: 5000,

  // Berapa banyak data history yang disimpan di tabel
  maxHistory: 60,

  // Berapa titik yang ditampilkan di grafik
  maxChartPoints: 30,
};
