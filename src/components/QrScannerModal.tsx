import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, X } from 'lucide-react';
import { extractPin } from '../utils/roomQr';

interface QrScannerModalProps {
  /** Dipanggil sekali saat QR room Meedu Quiz berhasil dibaca. */
  onDetected: (pin: string) => void;
  onClose: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  onDetected,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onDetectedRef = useRef(onDetected);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let frame = 0;
    let cancelled = false;
    let finished = false;
    let lastScan = 0;

    const stop = () => {
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    };

    const tick = (time: number) => {
      if (cancelled || finished) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (
        video &&
        canvas &&
        video.readyState === video.HAVE_ENOUGH_DATA &&
        video.videoWidth > 0 &&
        time - lastScan > 120
      ) {
        lastScan = time;

        const scale = Math.min(1, 640 / video.videoWidth);
        const width = Math.round(video.videoWidth * scale);
        const height = Math.round(video.videoHeight * scale);

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (context) {
          context.drawImage(video, 0, 0, width, height);
          const image = context.getImageData(0, 0, width, height);
          const result = jsQR(image.data, width, height, {
            inversionAttempts: 'dontInvert',
          });

          if (result?.data) {
            const pin = extractPin(result.data);

            if (pin) {
              finished = true;
              stop();
              onDetectedRef.current(pin);
              return;
            }

            setHint('QR terbaca, tetapi bukan QR room Meedu Quiz.');
          }
        }
      }

      frame = requestAnimationFrame(tick);
    };

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Browser ini tidak mendukung akses kamera. Masukkan PIN secara manual.');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        if (cancelled) {
          stop();
          return;
        }

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();
        frame = requestAnimationFrame(tick);
      } catch (err: any) {
        if (err?.name === 'NotAllowedError') {
          setError('Izin kamera ditolak. Aktifkan izin kamera di browser, lalu coba lagi.');
        } else if (err?.name === 'NotFoundError') {
          setError('Kamera tidak ditemukan di perangkat ini.');
        } else {
          setError('Kamera tidak dapat dibuka. Masukkan PIN secara manual.');
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-pink-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-scan-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-pink-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
              <Camera className="h-4 w-4" />
            </div>
            <h2 id="qr-scan-title" className="text-sm font-extrabold text-slate-800">
              Scan QR Room
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-pink-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-xs text-rose-700">
              {error}
            </div>
          ) : (
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-900">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                muted
              />

              {/* Bingkai pemindai */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-3/5 w-3/5">
                  <span className="absolute left-0 top-0 h-6 w-6 rounded-tl-lg border-l-4 border-t-4 border-pink-400" />
                  <span className="absolute right-0 top-0 h-6 w-6 rounded-tr-lg border-r-4 border-t-4 border-pink-400" />
                  <span className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-pink-400" />
                  <span className="absolute bottom-0 right-0 h-6 w-6 rounded-br-lg border-b-4 border-r-4 border-pink-400" />
                </div>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          <p className="mt-3 text-center text-xs text-slate-500">
            {hint || 'Arahkan kamera ke QR code yang ditampilkan guru.'}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full rounded-xl border border-pink-100 bg-pink-50 py-2.5 text-sm font-bold text-pink-700 transition hover:bg-pink-100"
          >
            Masukkan PIN Manual
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrScannerModal;