# GymAI: Sistem Penjadwalan Kebugaran Cerdas Berbasis AI

https://github.com/user-attachments/assets/a915419b-d4e7-481f-a141-e941bb22deff


## Penjelasan Proyek

GymAI adalah aplikasi web *full-stack* yang dirancang untuk mengoptimalkan perencanaan kebugaran pribadi. Dengan mengintegrasikan algoritma *Constraint Satisfaction Problems* (CSP) dan *Generative AI* (Google Gemini), sistem ini menghasilkan jadwal latihan yang dipersonalisasi serta mematuhi batasan spesifik pengguna, metrik fisik, dan ketersediaan waktu. Aplikasi ini memfasilitasi interaksi yang mulus antara pengguna dan data kebugaran mereka melalui antarmuka *chatbot* cerdas dan dasbor web yang responsif.

## Daftar Isi

1.  [Fitur Utama](https://www.google.com/search?q=%23fitur-utama)
2.  [Fitur Kecerdasan Buatan (AI)](https://www.google.com/search?q=%23fitur-kecerdasan-buatan-ai)
3.  [Algoritma Penjadwalan & Batasan (Constraint)](https://www.google.com/search?q=%23algoritma-penjadwalan--batasan-constraint)
4.  [Tumpukan Teknologi](https://www.google.com/search?q=%23tumpukan-teknologi)
5.  [Panduan Instalasi](https://www.google.com/search?q=%23panduan-instalasi)
6.  [Konfigurasi Sistem](https://www.google.com/search?q=%23konfigurasi-sistem)

-----

## Fitur Utama

Aplikasi ini menawarkan serangkaian fitur inti untuk manajemen kebugaran yang holistik:

  * **Penjadwalan Berbasis Batasan (CSP):** Menggunakan algoritma kustom untuk menyusun rencana latihan mingguan yang secara ketat mematuhi ketersediaan waktu pengguna, preferensi lokasi (Rumah/Gym), dan batasan fisik (cedera).
  * **Manajemen Profil Pengguna:** Mencatat dan melacak data antropometrik (berat, tinggi), tingkat kebugaran (*Beginner* hingga *Athlete*), serta tujuan spesifik (*Muscle Gain*, *Fat Loss*, dsb.) untuk personalisasi yang akurat.
  * **Pelacakan Aktivitas & Log Latihan:** Sistem pencatatan realisasi latihan yang memungkinkan pengguna menandai aktivitas sebagai selesai, melacak durasi aktual, dan menghitung estimasi kalori yang terbakar.
  * **Dasbor Analitik:** Visualisasi statistik performa pengguna, termasuk total sesi latihan, total menit aktivitas, dan akumulasi pembakaran kalori.
  * **Otentikasi Aman:** Implementasi standar keamanan menggunakan JWT (*JSON Web Token*) untuk pendaftaran, *login*, dan manajemen sesi pengguna yang aman.

## Fitur Kecerdasan Buatan (AI)

GymAI memanfaatkan model **Google Gemini 2.0 Flash** untuk memberikan pengalaman pengguna yang interaktif dan adaptif. Integrasi AI mencakup:

### 1\. Chatbot Hybrid (Info & Aksi)

Asisten virtual yang beroperasi dalam dua mode:

  * **Mode Informasi:** Menjawab pertanyaan umum seputar kebugaran, nutrisi, dan teknik latihan dengan konteks data pengguna yang sedang *login*.
  * **Mode Aksi (*Function Calling*):** Mampu menerjemahkan bahasa alami menjadi perintah sistem, seperti memperbarui profil (*"Ubah berat saya jadi 70kg"*) atau mengatur waktu sibuk (*"Saya sibuk hari Senin"*) yang secara otomatis memicu regenerasi jadwal.

### 2\. Personalisasi Konten

  * **Motivasi Mingguan:** Menghasilkan pesan motivasi yang relevan dengan tujuan utama pengguna setiap kali jadwal baru dibuat.
  * **Tips Latihan Kontekstual:** Menyediakan instruksi teknis singkat untuk setiap jenis latihan yang disesuaikan dengan tingkat pengalaman pengguna (misal: tips berbeda untuk pemula vs. ahli).

### 3\. Pelaporan & Analisis

  * **Penulis Laporan Mingguan:** Menganalisis log aktivitas mingguan untuk menyusun narasi ringkasan progres secara otomatis.
  * **Saran Perbaikan (*AI Coach*):** Menganalisis kesenjangan antara rencana dan realisasi latihan untuk memberikan saran strategis guna meningkatkan performa di minggu berikutnya.

## Algoritma Penjadwalan & Batasan (Constraint)

Inti dari GymAI adalah `CSP Service` yang memastikan jadwal latihan logis dan dapat dilaksanakan. Sistem ini menerapkan berbagai batasan (*constraints*) sebagai berikut:

### Hard Constraints (Wajib Dipenuhi)

1.  **Ketersediaan Waktu (Unary Constraint):** Latihan tidak akan dijadwalkan pada hari yang ditandai sebagai "Sibuk Sepenuhnya" (*Full Day Busy*) oleh pengguna.
2.  **Batasan Lokasi & Peralatan:**
      * Jika lokasi adalah **Home**, sistem hanya memilih latihan dengan peralatan *None* (Bodyweight) atau kategori *Cardio/HIIT/Flexibility*. Latihan berbasis alat berat dieksklusi.
3.  **Batasan Cedera (Safety Constraint):** Latihan yang melibatkan kelompok otot yang cedera (misal: *Shoulders*) akan dieliminasi total dari kandidat jadwal.
4.  **Kesesuaian Tingkat Kebugaran:** Pengguna dengan level *Beginner* dibatasi dari melakukan latihan dengan tingkat kesulitan *Advanced*.
5.  **Batas Kapasitas Harian:** Membatasi jumlah sesi latihan maksimal per hari (default: 4 sesi) untuk mencegah *overtraining*.

### Soft Constraints & Heuristics (Optimasi)

1.  **Preferensi Waktu:** Algoritma memprioritaskan penjadwalan pada jam preferensi pengguna (*Morning, Afternoon, Evening, Night*).
2.  **Variasi Otot (Recovery):** Menerapkan penalti skor heuristik jika kelompok otot yang sama dilatih secara berturut-turut dalam riwayat jangka pendek, mendorong variasi latihan.
3.  **Kesesuaian Tujuan (Goal Alignment):** Memberikan skor prioritas lebih tinggi pada jenis latihan yang sesuai dengan tujuan utama (misal: Latihan *Strength* diprioritaskan untuk tujuan *Muscle Gain*).

## Tumpukan Teknologi

### Backend

  * **Bahasa & Framework:** Python 3.10+, FastAPI
  * **Database & ORM:** MySQL, SQLAlchemy
  * **AI & LLM:** Google Generative AI SDK (Gemini)
  * **Keamanan:** OAuth2 dengan Password Bearer, Passlib (Bcrypt), Python-JOSE

### Frontend

  * **Library:** React.js (Vite)
  * **Styling:** Tailwind CSS
  * **HTTP Client:** Axios
  * **State Management:** React Hooks

## Panduan Instalasi

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di lingkungan lokal:

1.  **Persiapan Database**
    
    Impor skema database dan data awal ke MySQL server Anda:

    ```bash
    mysql -u root -p gymai < database/gymai.sql
    ```

2.  **Instalasi Backend**

    ```bash
    cd backend/
    pip install -r requirements.txt
    ```

3.  **Instalasi Frontend**

    ```bash
    cd frontend/
    npm install
    ```

4.  **Konfigurasi Environment**
    Buat file `.env` di dalam folder `backend/` dengan konfigurasi berikut:

    ```ini
    DATABASE_URL=mysql+pymysql://user:password@localhost/gymai
    GEMINI_API_KEY=isi_dengan_api_key_google_anda
    ```

5.  **Menjalankan Server**

      * **Backend:** `uvicorn app.main:app --reload` (Berjalan di port 8000)
      * **Frontend:** `npm run dev` (Berjalan di port 5173)



## Dokumentasi
<div>
    <a>Klik untuk melihat vidio dokumentasi demo aplikasi</a><br><br>
    <a href="https://youtu.be/cQY0GuRAdeM"><img src="https://img.shields.io/badge/YouTube-%23FF0000.svg?style=for-the-badge&logo=YouTube&logoColor=white" /></a>
</div>