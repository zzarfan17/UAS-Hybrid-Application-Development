const express = require('express');
const app = express();
const port = 3001; // Kita pakai port 3001 sesuai contoh screenshot soal

// Agar aplikasi bisa membaca data inputan (jika nanti dibutuhkan)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route untuk halaman utama (supaya tidak muncul Cannot GET /)
app.get('/', (req, res) => {
    res.send('Server sudah jalan! Silakan buka route lain, misal: /tipe-ruangan');
});

// --- DI BAWAH INI ADALAH JAWABAN TUGAS ROUTING ---

// SOAL 1: List semua tipe ruangan [cite: 3]
app.get('/tipe-ruangan', (req, res) => {
    res.send("SELECT * FROM TipeRuangan");
});

// SOAL 2: Detail tipe ruangan tertentu [cite: 4]
app.get('/tipe-ruangan/detail/:id', (req, res) => {
    const id = req.params.id;
    res.send(`SELECT * FROM TipeRuangan WHERE id_tipe = ${id}`);
});

// SOAL 3: Filter tipe ruangan by kapasitas minimum [cite: 5]
app.get('/tipe-ruangan/filter', (req, res) => {
    const minKapasitas = req.query.kapasitas;
    res.send(`SELECT * FROM TipeRuangan WHERE kapasitas >= ${minKapasitas}`);
});

// SOAL 4: List ruangan berdasarkan status [cite: 6]
app.get('/ruangan/status/:status', (req, res) => {
    const status = req.params.status;
    res.send(`SELECT * FROM Ruangan WHERE status = '${status}'`);
});

// SOAL 5: Cek ketersediaan ruangan pada tanggal dan jam tertentu [cite: 7]
app.get('/ruangan/check', (req, res) => {
    const { tanggal, jam_mulai, jam_selesai } = req.query;
    // Query ini mencari ruangan yang TIDAK ada di jadwal reservasi pada jam tersebut
    const sql = `SELECT * FROM Ruangan WHERE id_ruangan NOT IN (SELECT ruangan FROM Reservasi WHERE tanggal = '${tanggal}' AND NOT (jam_selesai <= '${jam_mulai}' OR jam_mulai >= '${jam_selesai}'))`;
    res.send(sql);
});

// SOAL 6: Cari user berdasarkan email [cite: 8]
// Ini mirip dengan contoh di dokumen soal
app.get('/user/search', (req, res) => {
    const email = req.query.email;
    res.send(`SELECT * FROM Pelanggan WHERE email = '${email}'`);
});

// SOAL 7: List semua reservasi [cite: 9]
app.get('/reservasi', (req, res) => {
    res.send("SELECT * FROM Reservasi");
});

// SOAL 8: List reservasi berdasarkan pelanggan [cite: 10]
app.get('/reservasi/pelanggan/:id', (req, res) => {
    const idPelanggan = req.params.id;
    res.send(`SELECT * FROM Reservasi WHERE pelanggan = ${idPelanggan}`);
});

// SOAL 9: Cek total reservasi dalam range tanggal [cite: 11]
app.get('/reservasi/total', (req, res) => {
    const { start, end } = req.query;
    res.send(`SELECT COUNT(*) as total_reservasi FROM Reservasi WHERE tanggal BETWEEN '${start}' AND '${end}'`);
});

// SOAL 10: Statistic pendapatan harian [cite: 12]
app.get('/reservasi/pendapatan', (req, res) => {
    res.send("SELECT tanggal, SUM(total_biaya) as pendapatan_harian FROM Reservasi GROUP BY tanggal");
});

// Menjalankan Server
app.listen(port, () => {
    console.log(`Aplikasi berjalan di http://localhost:${port}`);
});