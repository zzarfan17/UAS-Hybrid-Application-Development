const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// --- PORT SERVER BACKEND ---
// Pastikan frontend kamu (constants/Api.js) mengarah ke port ini juga (http://IP_LAPTOP:4000)
const PORT = 4000; 

app.use(cors());
app.use(bodyParser.json());

// --- KONEKSI DATABASE ---
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'uas_laundry_db',
  port: 3307 // Sesuai settingan XAMPP kamu
});

db.connect((err) => {
  if (err) console.error("Database Gagal Konek:", err);
  else console.log(`>>> Database Terhubung! (Port: 3307) <<<`);
});

// ================= ROUTES =================

// 1. REGISTER
app.post('/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  
  // Cek Email
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).send("Error server");
    if (results.length > 0) return res.status(400).send("Email sudah terdaftar!");

    // Cek No HP
    db.query('SELECT * FROM users WHERE phone = ?', [phone], (err, resultsPhone) => {
      if (err) return res.status(500).send("Error server");
      if (resultsPhone.length > 0) return res.status(400).send("Nomor HP sudah terdaftar!");

      // Simpan User Baru
      const hashedPassword = bcrypt.hashSync(password, 8);
      db.query('INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)', 
        [name, email, phone, hashedPassword], (err, result) => {
        if (err) return res.status(500).send("Gagal register user");
        res.status(200).send({ message: "User berhasil didaftarkan!" });
      });
    });
  });
});

// 2. LOGIN
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).send("Error server");
    
    if (results.length === 0 || !bcrypt.compareSync(password, results[0].password)) {
        return res.status(401).send("Email atau Password anda salah");
    }

    res.status(200).send({ message: "Login sukses", data: results[0] });
  });
});

// 3. GET SERVICES (Menu Laundry)
app.get('/services', (req, res) => {
  db.query('SELECT * FROM services', (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

// 4. BOOKINGS (Buat Pesanan Baru)
app.post('/bookings', (req, res) => {
  const { user_id, service_id, total_price, pickup_time, notes } = req.body;
  
  // REVISI PENTING: Status awal set ke 'pending' (bukan Diproses)
  // Supaya tombol "Batalkan" & "Bayar" muncul di aplikasi.
  const sql = 'INSERT INTO bookings (user_id, service_id, total_price, pickup_time, notes, status) VALUES (?, ?, ?, ?, ?, "pending")';
  
  db.query(sql, [user_id, service_id, total_price, pickup_time, notes], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "Booking berhasil!", id: result.insertId });
  });
});

// 5. GET BOOKINGS (List Pesanan + AUTO EXPIRE / HANGUS)
app.get('/bookings/:userId', (req, res) => {
  const userId = req.params.userId;

  // --- LOGIKA "HANGUS" 10 MENIT ---
  // Konsep: Seperti Diskon/Flash Sale.
  // Kalau status masih 'pending' TAPI sudah lewat 10 menit dari created_at,
  // maka UBAH statusnya jadi 'cancelled' (Bukan dihapus).
  
  const sqlAutoExpire = `
    UPDATE bookings 
    SET status = 'cancelled' 
    WHERE status = 'pending' 
    AND created_at < DATE_SUB(NOW(), INTERVAL 10 MINUTE)
  `;

  db.query(sqlAutoExpire, (err, result) => {
    if (err) {
      console.error("Gagal Auto Expire:", err);
      // Lanjut aja, jangan bikin aplikasi crash
    } else {
      if (result.changedRows > 0) {
        console.log(`>>> Auto-Expire: Ada ${result.changedRows} pesanan yang hangus karena telat bayar.`);
      }
    }

    // --- AMBIL DATA (YANG SUDAH DIUPDATE) ---
    const sqlGet = `
      SELECT bookings.*, 
             services.name as service_name, 
             services.image_url,
             services.price as service_price 
      FROM bookings 
      JOIN services ON bookings.service_id = services.id 
      WHERE bookings.user_id = ? 
      ORDER BY bookings.id DESC
    `;

    db.query(sqlGet, [userId], (errGet, results) => {
      if (errGet) return res.status(500).send(errGet);
      res.send(results);
    });
  });
});

// 6. CANCEL BOOKING (Batalkan Pesanan) - FITUR BARU
app.delete('/bookings/:id', (req, res) => {
  const bookingId = req.params.id;
  
  // SQL KERAS: Hapus data dari tabel bookings selamanya
  const sql = "DELETE FROM bookings WHERE id = ?";
  
  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      console.error("Gagal delete:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Pesanan berhasil dihapus permanen", result });
  });
});

// --- JALANKAN SERVER ---
app.listen(PORT, () => {
  console.log(`>>> Server Backend SIAP di Port ${PORT} <<<`); 
});