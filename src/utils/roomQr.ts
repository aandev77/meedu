const PIN_PATTERN = /^\d{4,6}$/;

/** Tautan gabung yang dikodekan ke dalam QR: https://situs-kamu/?pin=123456 */
export const buildJoinUrl = (code: string): string => {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('pin', code);
  return url.toString();
};

/** Mengambil PIN dari isi QR: bisa berupa tautan ...?pin=123456 atau angka PIN saja. */
export const extractPin = (raw: string): string | null => {
  const text = raw.trim();

  if (PIN_PATTERN.test(text)) return text;

  try {
    const pin = new URL(text).searchParams.get('pin');
    if (pin && PIN_PATTERN.test(pin)) return pin;
  } catch {
    // Bukan URL: abaikan.
  }

  return null;
};

/** Membaca ?pin= dari alamat halaman (dipakai saat siswa membuka QR lewat kamera HP). */
export const readPinFromLocation = (): string | null => {
  try {
    const pin = new URLSearchParams(window.location.search).get('pin');
    return pin && PIN_PATTERN.test(pin) ? pin : null;
  } catch {
    return null;
  }
};

/** Menghapus ?pin= dari alamat halaman setelah siswa bergabung. */
export const clearPinFromLocation = () => {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('pin')) return;
    url.searchParams.delete('pin');
    window.history.replaceState({}, '', url.toString());
  } catch {
    // abaikan
  }
};