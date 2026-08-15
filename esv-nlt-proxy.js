/* Proksi ESV & NLT — Cloudflare Worker.

   STATUS DI PROYEK INI: sudah dideploy di
   https://sweet-mode-3679.tanokominecraft.workers.dev/?url= dan alamat itu
   sudah menjadi DEFAULT_PROXY bawaan di index.html — pengguna aplikasi
   tidak perlu mengatur apa pun. Berkas INI (yang ikut ke git) tetap versi
   TANPA kunci — yang berisi kunci sungguhan hanya salinan di dalam
   dashboard Cloudflare. Kalau perlu mengubah worker itu, edit langsung di
   dashboard, atau tempel ulang berkas ini ke sana setelah diubah.
   JANGAN tempel kunci sungguhan ke berkas ini lalu di-commit ke git.

   KENAPA PROKSI INI WAJIB (bukan opsional):
   api.esv.org tidak mengirim header CORS, jadi peramban SELALU menolak
   panggilan langsung ke sana. Kunci API saja tidak cukup — tanpa proksi,
   ESV tidak akan pernah tampil di aplikasi. Sekalian, kunci jadi tersimpan
   di sisi server, bukan di perangkat pengguna.

   ── UNTUK MENDEPLOY WORKER BARU (mis. mengganti yang sudah ada) ─────────
   Cara cepat, lewat dashboard, tanpa memasang apa pun:
   1. dash.cloudflare.com → Workers & Pages → Create → Start with Hello
      World → Deploy → Edit code.
   2. Hapus isinya, tempel seluruh berkas ini, isi ESV_KEY di bawah, Deploy.
   3. Salin alamat worker-nya, lalu ganti DEFAULT_PROXY di index.html
      dengan alamat itu + akhiran "/?url=".

   Cara rapi, kunci disimpan sebagai secret (tidak ikut ke git):
   1. npm i -g wrangler && wrangler login
   2. wrangler secret put ESV_KEY
      wrangler secret put NLT_KEY
      wrangler secret put ALLOW_ORIGIN     # mis. https://<akun>.github.io
   3. wrangler deploy
   Kalau secret dipakai, kosongkan kembali konstanta di bawah.
*/

/* Diisi hanya kalau memakai cara cepat di atas, DAN hanya di dalam
   dashboard Cloudflare — jangan pernah di berkas yang ikut ke git. */
const ESV_KEY_INLINE = "";
const NLT_KEY_INLINE = "";
/* Kosong = siapa pun boleh memakai proksi ini, termasuk di luar aplikasi
   ini (alamat proksi kini publik, ikut terlihat di index.html). Isi dengan
   alamat GitHub Pages-mu sendiri, mis. "https://<akun>.github.io", supaya
   jatah API tidak dipakai orang lain. */
const ALLOW_ORIGIN_INLINE = "";

const UPSTREAM = {
  "api.esv.org": "esv",
  "api.nlt.to":  "nlt",
};

export default {
  async fetch(req, env) {
    const ESV_KEY = env.ESV_KEY || ESV_KEY_INLINE;
    const NLT_KEY = env.NLT_KEY || NLT_KEY_INLINE;
    const ORIGIN_OK = env.ALLOW_ORIGIN || ALLOW_ORIGIN_INLINE;
    const allow = ORIGIN_OK || "*";
    const cors = {
      "Access-Control-Allow-Origin": allow,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Authorization,Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };
    const fail = (status, msg) =>
      new Response(msg, { status, headers: { ...cors, "content-type": "text/plain;charset=utf-8" } });

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (req.method !== "GET") return fail(405, "Hanya GET yang dilayani.");

    // Tolak pemanggil dari luar aplikasi kalau ALLOW_ORIGIN diisi.
    const origin = req.headers.get("Origin");
    if (ORIGIN_OK && origin && origin !== ORIGIN_OK)
      return fail(403, "Origin tidak diizinkan.");

    const raw = new URL(req.url).searchParams.get("url");
    if (!raw) return fail(400, "Parameter ?url= kosong.");

    let target;
    try { target = new URL(raw); } catch { return fail(400, "Alamat tujuan tidak sah."); }
    if (target.protocol !== "https:") return fail(400, "Tujuan harus https.");

    const kind = UPSTREAM[target.hostname];
    if (!kind) return fail(403, "Host tidak diizinkan: " + target.hostname);

    // Kunci HANYA dari worker. Apa pun yang dikirim klien dibuang.
    const headers = new Headers();
    if (kind === "esv") {
      if (!ESV_KEY) return fail(500, "Kunci ESV belum diisi di worker (ESV_KEY_INLINE atau secret ESV_KEY).");
      headers.set("Authorization", "Token " + ESV_KEY);
    } else {
      if (!NLT_KEY) return fail(500, "Kunci NLT belum diisi di worker (NLT_KEY_INLINE atau secret NLT_KEY).");
      target.searchParams.set("key", NLT_KEY);
    }

    let upstream;
    try {
      upstream = await fetch(target.toString(), { headers });
    } catch (e) {
      return fail(502, "Gagal menghubungi " + target.hostname + ": " + e.message);
    }

    const out = new Headers(cors);
    const ct = upstream.headers.get("content-type");
    if (ct) out.set("content-type", ct);
    // Satu pasal jarang berubah; cache singkat menghemat kuota API.
    out.set("cache-control", "public, max-age=3600");
    return new Response(upstream.body, { status: upstream.status, headers: out });
  },
};
