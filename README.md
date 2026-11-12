# 📖 Intermediate Bible

**Pembaca dan ruang studi Alkitab multiterjemahan dalam satu halaman web.** Bandingkan terjemahan, telusuri bahasa asli Ibrani/Yunani, sorot ayat, simpan bookmark, dan kelola catatan di perangkat sendiri.

**🔗 [Buka Intermediate Bible](https://a105ty.github.io/IntermediateBible/)** · [Kode aplikasi (`index.html`)](./index.html)

> **Status:** aplikasi berorientasi *local-first*. Catatan, bookmark, highlight, dan pengaturan disimpan di browser pengguna. Firebase tidak diperlukan untuk menggunakan aplikasi. Ketersediaan ayat online bergantung pada layanan penyedia terjemahan.

## ✨ Fitur utama

| Fitur | Keterangan |
| --- | --- |
| **Multiterjemahan** | 11 versi bawaan, maksimal 8 versi aktif ditampilkan bersamaan; katalog versi tambahan dapat dimuat secara online. |
| **Warna setiap versi** | Setiap terjemahan bawaan memiliki warna identitas yang berbeda dan latar lembut agar mudah dibandingkan. |
| **Ruang Baca** | Pengaturan ukuran dan jenis font, lebar area baca, jarak, tata letak, dan mode fokus/layar penuh. |
| **Navigasi kitab–pasal–ayat** | Dua mode: **Papan angka** dan **Daftar kitab** (PL/PB), termasuk pemilihan pasal. |
| **Pencarian ayat** | Cari kata/frasa di beberapa versi sekaligus, nomor Strong's, transliterasi, dan sebagian data Ibrani/Yunani. |
| **Sorot** | Pilih warna, lalu ketuk ayat. Ayat bersebelahan dengan warna **sama** bergabung menjadi satu outline. |
| **Bookmark** | Tekan lama ayat (sekitar 0,5 detik); ikon 📌 hanya tampak pada ayat yang tersimpan. |
| **Catatan** | Tulis catatan per ayat dan lampirkan foto/audio apabila didukung browser. |
| **Offline** | Unduh terjemahan yang mengizinkan penyimpanan; ada progres serta opsi hentikan dan lanjutkan. |
| **Indikator loading** | Animasi saat teks diambil, dan satu label diagnostik jika suatu versi gagal dimuat. |

## 🚀 Cara menggunakan

1. Kunjungi **[website Intermediate Bible](https://a105ty.github.io/IntermediateBible/)** di browser. Akses lewat HTTPS lebih disarankan daripada membuka berkas HTML langsung melalui `file://` atau `content://` di ponsel.
2. Gunakan tombol **📖** untuk membuka pemilih kitab. Pilih **Papan angka** atau **Daftar kitab**, lalu tentukan pasal dan ayat.
3. Tekan **+ Tambah versi** untuk memilih terjemahan. Terjemahan yang dipilih muncul di pembaca, dengan warna identitasnya masing-masing.
4. Gunakan **⌕ Cari** untuk mencari kata, referensi (misalnya `Yohanes 3:16`), atau lema/nomor Strong's. Pilih cakupan pencarian: **Pasal ini**, **Kitab ini**, atau **Pasal tersimpan offline**.
5. Tekan **🎨** untuk masuk/keluar mode sorot; ketuk ayat untuk menandai. Untuk bookmark, **tekan lama ayat**. Bukalah **⚙ Pengaturan → Ruang Baca** untuk menyesuaikan tampilan.

### 11 terjemahan bawaan

| Bahasa | Versi |
| --- | --- |
| Indonesia | AYT — Alkitab Yang Terbuka; TSI — Terjemahan Sederhana Indonesia; AGS — Alkitab Gratis untuk Semua |
| English | BSB — Berean Standard Bible; KJV — King James Version; ASV — American Standard Version; WEB — World English Bible; NLT — New Living Translation; ESV — English Standard Version |
| 中文 | CUV 简体; CUV 繁體 |

Daftar tambahan berasal dari katalog online. Ketersediaan teks, izin penggunaan, dan fitur offline tiap terjemahan tidak selalu sama.

## ⬇️ Unduhan dan penyimpanan lokal

- Buka **Download / Perpustakaan offline**. Tab **Tersimpan** menunjukkan progres lokal, sedangkan **Jelajahi & unduh** menampilkan versi yang dapat dipilih dan **Load other versions**.
- Untuk terjemahan dengan izin offline yang sesuai, aplikasi menyediakan unduhan **66 kitab / 1.189 pasal**, dengan penghentian dan kelanjutan unduhan. Keberhasilan bergantung koneksi, ruang penyimpanan, dan ketersediaan API.
- **ESV dan NLT tidak tersedia untuk unduhan seluruh Alkitab.** Keduanya menggunakan API resmi penerbit dan mengikuti batas lisensi masing-masing.
- Highlight, bookmark, catatan, serta pengaturan tersimpan **per browser/perangkat**. Gunakan fitur **ekspor cadangan** secara berkala. Menghapus data situs atau berpindah domain/browser dapat menghilangkan data lokal.
- Pencarian menyeluruh hanya berlaku untuk konten yang telah tersedia secara offline; pencarian online dibatasi oleh cakupan, kuota, dan koneksi.

## 🌍 Arsitektur dan deployment

Aplikasi frontend disimpan dalam **satu `index.html`**, berisi HTML, CSS, dan JavaScript. Ia tetap mengambil data dari layanan eksternal saat diperlukan. *Satu file frontend* **tidak** berarti seluruh backend/API disematkan ke file tersebut.

```text
GitHub Pages / index.html
  ├── Pembaca & pengaturan
  ├── Data lokal browser (localStorage / IndexedDB)
  ├── Katalog dan teks Alkitab yang tersedia
  └── Cloudflare Worker → API ESV / NLT (sesuai konfigurasi server)
```

**Deploy di GitHub Pages:** unggah/perbarui `index.html` di branch `main`, kemudian pastikan **Settings → Pages** menggunakan branch dan folder yang benar. `README.md` ini hanya dokumentasi; tidak perlu dimasukkan ke dalam HTML.

**Keamanan API:** jangan menaruh token Crossway/ESV, token layanan lain, atau service-account key di HTML maupun README. Kunci API berprivilegi disimpan sebagai secret di backend Worker. Sumber Worker di repository adalah kode backend, bukan script yang harus dimuat berdampingan dengan HTML. Akses Worker dapat gagal karena jaringan atau kebijakan browser; pengujian dari server tidak otomatis membuktikan akses dari semua perangkat.

## 🛠️ Masalah umum

| Masalah | Yang perlu diperiksa |
| --- | --- |
| ESV tidak tampil | Koneksi ke Worker ESV, izin CORS/origin, jangkauan domain Worker dari jaringan pengguna, dan status API penerbit. |
| Sebagian terjemahan gagal | Periksa label diagnostik di atas pembaca dan koneksi API; versi yang gagal tidak perlu menampilkan kartu kosong per ayat. |
| Unduhan offline terhenti | Cek koneksi, kuota penyimpanan browser, dan gunakan **Lanjutkan**. |
| Data lokal tidak muncul | Pastikan memakai browser, profil, dan alamat website yang sama; periksa apakah data situs dibersihkan. |
| Input Search terasa sempit | Tutup keyboard untuk melihat daftar hasil/versi; gunakan filter cakupan dan pilihan versi. |

## 🥚 Easter eggs — pesan tersembunyi

Ada beberapa kode tersembunyi yang membuka **ayat Alkitab pilihan**. Masukkan kode persis (huruf besar/kecil tidak berpengaruh) ke kolom **⌕ Cari ayat**, lalu tekan **Cari** atau **Enter**. Aplikasi akan berpindah ke referensi tersebut dengan terjemahan yang saat itu aktif. Karena teks diambil dari sumber terjemahan, kode tidak menyimpan salinan ayat berhak cipta di dalam aplikasi.

<details>
<summary>🔐 Klik untuk mengungkap kode rahasia (spoiler)</summary>

| Kode rahasia | Ayat yang terbuka | Tema |
| --- | --- | --- |
| `IB:TERANG` | Yohanes 1:5 | Terang dalam kegelapan |
| `IB:KASIH` | 1 Yohanes 4:8 | Kasih |
| `IB:DAMAI` | Filipi 4:7 | Damai |
| `IB:HARAPAN` | Roma 15:13 | Harapan |
| `IB:HIKMAT` | Yakobus 1:5 | Hikmat |
| `IB:777` | Wahyu 21:4 | Penghiburan dan pemulihan |

**Tantangan:** coba satu kode setiap hari, baca konteks pasalnya, lalu bandingkan minimal dua terjemahan dan teks aslinya bila tersedia.

</details>

## 📚 Sumber dan hak cipta

Konten Alkitab berasal dari berbagai penyedia/terjemahan dengan ketentuan masing-masing. **ESV** merupakan terjemahan berlisensi Crossway; **NLT** milik Tyndale. Periksa ketentuan penggunaan masing-masing sebelum mengutip, menyimpan, mendistribusikan, atau menggunakan secara komersial. Ketersediaan teks dan definisi bahasa asli juga bergantung pada sumber datanya. Lisensi kode aplikasi, jika diperlukan untuk kontribusi atau distribusi ulang, harus dinyatakan terpisah dalam berkas `LICENSE`.

---

**Intermediate Bible** — Read, compare, study, remember.
