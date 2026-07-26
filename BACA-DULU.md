# Intermediate Bible — berkas PWA

## Isi paket

| Berkas | Guna |
|---|---|
| `index.html` | Aplikasinya. Sama persis dengan `intermediate-bible.html`, hanya namanya `index.html` supaya jadi halaman default saat dihosting. |
| `manifest.json` | Manifest PWA lengkap. |
| `icon-*.png` | Ikon 48–512 px, plus dua versi *maskable*. |
| `screenshot-*.png` | Screenshot untuk halaman pemasangan / daftar toko. |

**Keempat jenis berkas harus berada di folder yang sama.** Manifest memakai
jalur relatif (`./`), jadi bisa dihosting di subfolder mana pun tanpa diubah.

## Cara memasang (hosting)

1. Unggah seluruh isi folder ini ke hosting statis apa pun — GitHub Pages,
   Netlify, Cloudflare Pages, semuanya gratis.
2. Buka URL-nya di Chrome Android. Akan muncul tawaran **"Pasang aplikasi"**.

Hosting lewat `https://` juga yang **mengaktifkan mikrofon** untuk fitur rekam
suara di catatan. Kalau `index.html` diklik langsung dari folder (`file://`),
aplikasinya tetap jalan tetapi mikrofon diblokir peramban dan PWA tidak bisa
dipasang.

## Membuat APK

1. Hosting dulu (langkah di atas) — PWABuilder butuh URL, bukan berkas.
2. Buka <https://www.pwabuilder.com>, masukkan URL-nya.
3. Pilih **Android** → **Generate Package**.
4. Untuk pemasangan pribadi, pakai APK dari paket itu. Untuk Play Store, pakai
   berkas `.aab` dan ikuti petunjuk penandatanganan (signing) yang disertakan.

## Peringatan PWABuilder yang sengaja TIDAK dipenuhi

Sebagian saran PWABuilder tidak berlaku untuk aplikasi ini. Menambahkannya
justru bikin rusak atau berbohong, jadi sengaja dilewati:

- **`iarc_rating_id`** — kode ini tidak boleh dikarang. Harus didapat gratis
  lewat kuesioner IARC saat mendaftar ke toko aplikasi, lalu ditempel sendiri
  ke `manifest.json`.
- **`related_applications`** — hanya diisi kalau ada aplikasi native terpisah
  di Play Store. Belum ada.
- **`file_handlers`, `protocol_handlers`, `share_target`** — aplikasi ini belum
  punya penanganan untuk membuka berkas, protokol seperti `mailto:`, atau
  menerima kiriman dari tray "Bagikan". Mendaftarkannya membuat sistem
  mengirim data yang tidak bisa diolah.
- **`scope_extensions`** — hanya berguna kalau aplikasi merentang ke domain
  atau subdomain lain. Semua berjalan di satu tempat.
- **`widgets`, `edge_side_panel`, `tabbed`, `note_taking` lanjutan** — fitur
  khusus Windows/ChromeOS yang butuh tata letak tersendiri.
- **`window-controls-overlay`** di `display_override` — akan menimpa bilah
  judul dan menutupi topbar aplikasi, karena CSS-nya belum menangani area
  aman bilah judul.

Yang **sudah** ada di manifest: `id`, `scope`, `start_url`, `dir`, `lang`,
`orientation`, `categories`, `description`, `display_override`,
`launch_handler`, `prefer_related_applications`, ikon lengkap termasuk
maskable, screenshot `narrow` + `wide`, `shortcuts`, dan `note_taking`.

## Tentang screenshot

Diambil dari aplikasi yang benar-benar berjalan, jadi tata letak, warna, dan
hurufnya asli. Tetapi jaringan ke API Alkitab diblokir di lingkungan tempat
berkas ini dibuat, sehingga teks ayatnya memakai contoh pendek — itu sebabnya
papan angka tertulis "5 ayat", padahal Kejadian 1 sebenarnya 31 ayat.

Kalau paketnya mau dikirim ke Play Store, sebaiknya ganti dengan screenshot
asli dari ponsel sendiri. Ukurannya harus tetap sama seperti yang tertulis di
`manifest.json`, atau angka `sizes` di manifest ikut disesuaikan.

## Pintasan

`shortcuts` di manifest memakai rute hash yang sudah ditangani aplikasi:
`#cari`, `#catatan`, `#catatan-baru`, `#renungan`, `#silabus`, `#tutorial`,
dan `#unduhan`. Tekan lama ikon aplikasi setelah dipasang untuk mencobanya.
