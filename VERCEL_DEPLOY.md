# Panduan Deploy Meedu ke Vercel

## Persiapan
- Gunakan Node.js 24.12 atau lebih baru.
- Jangan unggah `.env`, `firebase-service-account.json`, `node_modules`, atau folder `.git` ke repository publik.
- Frontend dibangun oleh `npm run build` ke folder `dist`.
- API Express dijalankan melalui Vercel Function pada `api/index.ts`.

## Environment Variables di Vercel
Tambahkan pada Project Settings → Environment Variables:

- `GEMINI_API_KEY`: API key Gemini.
- `FIREBASE_SERVICE_ACCOUNT_JSON`: seluruh isi JSON service account Firebase dalam satu nilai JSON (bukan nama/path file).
- `APP_URL`: URL deployment, misalnya `https://nama-project.vercel.app` (jika fitur aplikasi memerlukannya).

Jangan menaruh nilai rahasia di `VITE_*` karena variabel tersebut dapat ikut terkirim ke browser.

## Firebase
1. Firebase Console → Authentication → Settings → Authorized domains.
2. Tambahkan domain Vercel (`nama-project.vercel.app`) dan domain production sendiri bila ada.
3. Pastikan Google provider aktif.
4. Pastikan Firestore Rules tidak memberi akses baca/tulis seluruh database kepada publik.

## Deploy
1. Upload folder project ke GitHub tanpa file rahasia dan tanpa `node_modules`.
2. Import repository tersebut di Vercel.
3. Framework Preset: Vite; Build Command: `npm run build`; Output Directory: `dist`.
4. Tambahkan Environment Variables di atas.
5. Deploy.

## Perilaku role
- Role Guru/Murid dipilih di halaman login setiap kali pengguna masuk.
- Tombol ganti role di dalam aplikasi dihapus.
- Untuk berganti role, pengguna harus logout lalu login kembali dan memilih role.
- Pemilihan Guru terbuka untuk akun Google mana pun sesuai keputusan pemilik aplikasi.
