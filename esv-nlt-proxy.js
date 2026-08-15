/* Proksi ESV & NLT — Cloudflare Worker.

   Gunanya: kunci API tidak perlu ada di perangkat sama sekali. Aplikasi
   memanggil  https://proksi-kamu/?url=<alamat API ter-encode>  dan worker
   ini yang menempelkan kuncinya. Sekalian menyelesaikan masalah CORS.

   ── Cara pasang ────────────────────────────────────────────────────────
   1. npm i -g wrangler   lalu   wrangler login
   2. Buat wrangler.toml:
        name = "esv-nlt-proxy"
        main = "esv-nlt-proxy.js"
        compatibility_date = "2024-11-01"
   3. Simpan kunci sebagai secret (tidak ikut masuk kode):
        wrangler secret put ESV_KEY
        wrangler secret put NLT_KEY
   4. Batasi siapa yang boleh memakai — isi alamat aplikasimu:
        wrangler secret put ALLOW_ORIGIN     -> mis. https://a105ty.github.io
   5. wrangler deploy
   6. Di aplikasi: ⚙ → Proksi → https://esv-nlt-proxy.<akun>.workers.dev/?url=
      Dua kolom kunci di atasnya boleh dikosongkan.

   Catatan: tanpa ALLOW_ORIGIN, worker ini terbuka untuk siapa saja dan
   kuota API-mu bisa dipakai orang lain. Isi selalu di pemakaian nyata.
*/

const UPSTREAM = {
  "api.esv.org": "esv",
  "api.nlt.to":  "nlt",
};

export default {
  async fetch(req, env) {
    const allow = env.ALLOW_ORIGIN || "*";
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
    if (env.ALLOW_ORIGIN && origin && origin !== env.ALLOW_ORIGIN)
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
      if (!env.ESV_KEY) return fail(500, "ESV_KEY belum diatur di worker.");
      headers.set("Authorization", "Token " + env.ESV_KEY);
    } else {
      if (!env.NLT_KEY) return fail(500, "NLT_KEY belum diatur di worker.");
      target.searchParams.set("key", env.NLT_KEY);
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
