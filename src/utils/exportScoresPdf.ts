import { jsPDF } from 'jspdf';

export interface ScoreRow {
  name: string;
  score: number;
}

const BRAND: [number, number, number] = [230, 9, 127];
const SOFT_PINK: [number, number, number] = [253, 242, 248];
const DARK: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [100, 116, 139];

// Font bawaan PDF hanya mendukung karakter Latin; emoji/simbol lain dibuang
// supaya nama tidak tampil sebagai karakter acak.
const toPdfText = (value: string) =>
  value.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '').trim() || '-';

const fitText = (doc: jsPDF, text: string, maxWidth: number) => {
  if (doc.getTextWidth(text) <= maxWidth) return text;

  let result = text;
  while (result.length > 1 && doc.getTextWidth(`${result}...`) > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}...`;
};

/**
 * Membuat dan mengunduh PDF daftar skor siswa.
 * `rows` harus sudah terurut dari skor tertinggi.
 */
export const exportScoresPdf = (roomCode: string, rows: ScoreRow[]) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const tableW = pageW - margin * 2;
  const rowH = 10;
  const bottomLimit = pageH - 20;

  const colRank = margin + 5;
  const colName = margin + 22;
  const colStatus = margin + 98;
  const colScore = pageW - margin - 5; // rata kanan

  const now = new Date();
  const dateText = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeText = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const total = rows.length;
  const average = total
    ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / total)
    : 0;

  // Judul
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...BRAND);
  doc.text('Skor Siswa', margin, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Room ${roomCode}  |  ${dateText}, ${timeText}`, margin, 29);
  doc.text(`Total siswa: ${total}  |  Rata-rata skor: ${average}`, margin, 34.5);

  const drawTableHeader = (y: number) => {
    doc.setFillColor(...BRAND);
    doc.roundedRect(margin, y, tableW, rowH, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const textY = y + rowH / 2 + 1.3;
    doc.text('No', colRank, textY);
    doc.text('Nama', colName, textY);
    doc.text('Status', colStatus, textY);
    doc.text('Skor', colScore, textY, { align: 'right' });
  };

  let y = 42;
  drawTableHeader(y);
  y += rowH + 1;

  rows.forEach((row, index) => {
    if (y + rowH > bottomLimit) {
      doc.addPage();
      y = 20;
      drawTableHeader(y);
      y += rowH + 1;
    }

    if (index % 2 === 0) {
      doc.setFillColor(...SOFT_PINK);
      doc.rect(margin, y, tableW, rowH, 'F');
    }

    const textY = y + rowH / 2 + 1.3;
    doc.setFontSize(10);
    doc.setTextColor(...DARK);

    doc.setFont('helvetica', index < 3 ? 'bold' : 'normal');
    doc.text(String(index + 1), colRank, textY);

    doc.setFont('helvetica', 'bold');
    doc.text(fitText(doc, toPdfText(row.name), colStatus - colName - 4), colName, textY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(row.score > 0 ? 'Sudah memperoleh skor' : 'Belum memperoleh skor', colStatus, textY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND);
    doc.text(String(row.score), colScore, textY, { align: 'right' });

    y += rowH;
  });

  if (total === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text('Belum ada siswa yang bergabung.', pageW / 2, y + 12, { align: 'center' });
  }

  // Footer: nama aplikasi + nomor halaman
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('Meedu Quiz', margin, pageH - 10);
    doc.text(`Halaman ${page} / ${pages}`, pageW - margin, pageH - 10, { align: 'right' });
  }

  doc.save(`skor-siswa-${roomCode}.pdf`);
};