import { GraduationCap, Heart } from "lucide-react";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TEAM = ["Lutfi Amelia", "Neng Riska Amelia", "Farhan Aan Hasbulloh"];
const MAP_QUERY =
  "Fakultas Ekonomi dan Bisnis Universitas Jenderal Soedirman, Jl. Profesor DR. HR Boenyamin No.708, Purwokerto, Jawa Tengah 53122";

const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;

/* Pixel cow: dibuat dari kotak-kotak kecil, menghadap kanan */
interface CowProps {
  x: number;
  y: number;
  dur: number;
  delay?: number;
  scale?: number;
}

function Cow({ x, y, dur, delay = 0, scale = 1 }: CowProps) {
  return (
    <g transform={`translate(0 ${y}) scale(${scale})`}>
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values={`${x} 0;${x + 260} 0`}
          dur={`${dur}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;0 -0.6;0 0"
            dur="0.8s"
            repeatCount="indefinite"
            additive="sum"
          />
          {/* ekor */}
          <rect x="-1" y="2" width="1" height="4" fill="#3b3b3b" />
          {/* badan */}
          <rect x="0" y="2" width="11" height="6" fill="#fff" />
          <rect x="2" y="2" width="3" height="3" fill="#3b3b3b" />
          <rect x="7" y="5" width="3" height="3" fill="#3b3b3b" />
          {/* kepala */}
          <rect x="11" y="1" width="4" height="5" fill="#fff" />
          <rect x="11" y="0" width="1" height="1" fill="#e5e5e5" />
          <rect x="14" y="0" width="1" height="1" fill="#e5e5e5" />
          <rect x="14" y="4" width="2" height="2" fill="#f9a8d4" />
          <rect x="13" y="2" width="1" height="1" fill="#222" />
          {/* kaki */}
          <rect x="1" y="8" width="2" height="3" fill="#3b3b3b" />
          <rect x="4" y="8" width="2" height="3" fill="#6b6b6b" />
          <rect x="7" y="8" width="2" height="3" fill="#3b3b3b" />
          <rect x="10" y="8" width="2" height="3" fill="#6b6b6b" />
        </g>
      </g>
    </g>
  );
}

interface CloudProps {
  y: number;
  dur: number;
  delay?: number;
  from?: number;
}

function Cloud({ y, dur, delay = 0, from = -30 }: CloudProps) {
  return (
    <g fill="#fff" opacity="0.9">
      <animateTransform
        attributeName="transform"
        type="translate"
        values={`${from} ${y};${from + 280} ${y}`}
        dur={`${dur}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
      <rect x="2" y="2" width="14" height="3" />
      <rect x="5" y="0" width="7" height="2" />
      <rect x="0" y="3" width="3" height="2" />
    </g>
  );
}

function PixelFarm() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 240 60"
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* langit */}
      <rect width="240" height="60" fill="#bfe6ff" />
      <Cloud y={6} dur={70} />
      <Cloud y={16} dur={95} delay={-30} from={-60} />
      {/* bukit */}
      <rect x="0" y="30" width="240" height="30" fill="#7bc96f" />
      <rect x="20" y="26" width="50" height="4" fill="#7bc96f" />
      <rect x="30" y="24" width="30" height="2" fill="#7bc96f" />
      <rect x="140" y="27" width="60" height="3" fill="#7bc96f" />
      {/* padang rumput */}
      <rect x="0" y="38" width="240" height="22" fill="#5fb55a" />
      <rect x="0" y="50" width="240" height="10" fill="#4a9e4c" />
      {/* tekstur rumput */}
      {Array.from({ length: 36 }).map((_, i) => (
        <rect
          key={i}
          x={(i * 37) % 240}
          y={40 + ((i * 13) % 18)}
          width="1"
          height="2"
          fill="#3f8d42"
        />
      ))}
      {/* pagar */}
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={i * 16 + 4} y="33" width="2" height="6" fill="#a9744f" />
      ))}
      <rect x="0" y="34" width="240" height="1" fill="#a9744f" />
      <rect x="0" y="37" width="240" height="1" fill="#a9744f" />
      {/* sapi */}
      <Cow x={-20} y={40} dur={48} />
      <Cow x={-120} y={46} dur={60} delay={-20} scale={1.2} />
      <Cow x={-70} y={36} dur={75} delay={-35} scale={0.8} />
    </svg>
  );
}

/* Peta interaktif Leaflet dengan kontrol zoom + / - */
const LAT = -7.404464;
const LON = 109.244108;

function OsmMap() {
  const mapElement = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapElement.current) return;

    const map = L.map(mapElement.current, {
      center: [LAT, LON],
      zoom: 17,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Google Maps Hybrid: citra satelit + nama jalan, bangunan & tempat
    L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
      attribution: "Map data ©2026 Google",
      maxZoom: 20,
    }).addTo(map);

    // Pin merah khusus untuk lokasi FEB Unsoed.
    const redPin = L.divIcon({
      className: "meedu-red-map-pin",
      html: `<div style="width:22px;height:22px;background:#e53935;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px #0006;position:relative"><span style="position:absolute;width:6px;height:6px;background:white;border-radius:50%;top:5px;left:5px"></span></div>`,
      iconSize: [28, 32],
      iconAnchor: [14, 30],
      popupAnchor: [0, -28],
    });

    L.marker([LAT, LON], { icon: redPin })
      .addTo(map)
      .bindPopup(
        '<strong>Fakultas Ekonomi dan Bisnis</strong><br/>Universitas Jenderal Soedirman'
      );

    return () => {
      map.remove();
    };
  }, []);

  return <div ref={mapElement} className="h-full w-full" aria-label="Peta lokasi dengan kontrol zoom" />;
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-pink-200 bg-pink-100">
      <style>{`
        @keyframes meeduFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
      `}</style>

      {/* Adegan pixel: hanya terlihat dari tengah ke kanan (kiri polos pink) */}
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, transparent 25%, #000 60%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, transparent 25%, #000 60%)",
        }}
      >
        <PixelFarm />
      </div>

      {/* Overlay pink samar supaya teks terbaca */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-100 via-pink-100/80 to-pink-100/60 md:via-pink-100/70 md:to-pink-100/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-pink-100/70 to-transparent md:hidden" />

      <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:gap-8 md:text-left">
          {/* Kiri: logo + deskripsi */}
          <div className="text-center sm:text-left">
            <a href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-600 text-white shadow-md transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                <GraduationCap
                  size={24}
                  style={{ animation: "meeduFloat 2.5s ease-in-out infinite" }}
                />
              </div>
              <div className="text-left leading-tight">
                <p className="text-xl font-bold text-slate-900">
                  Meedu <span className="text-pink-600">Quiz</span>
                </p>
                <p className="text-xs text-slate-500">
                  Learning &amp; Multiplayer Platform
                </p>
              </div>
            </a>
            <h3 className="mt-5 text-base font-semibold text-pink-800 sm:text-left">
              Belajar jadi lebih mudah dan menyenangkan.
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-pink-900/80 sm:mx-0 sm:text-left">
              Belajar, berlatih, dan uji kemampuanmu melalui kuis interaktif
              bersama teman-teman.
            </p>
          </div>

          {/* Tengah: tim */}
          <div className="flex flex-col items-center">
            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-pink-700">
              Dibuat dengan <Heart size={14} className="fill-pink-600 text-pink-600" /> oleh
            </h4>
            <ul className="mt-4 space-y-2 text-sm font-medium text-pink-900">
              {TEAM.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>

          {/* Kanan: kontak + copyright */}
          <div className="flex flex-col items-center md:items-end">
            <div className="relative z-10 h-44 w-full max-w-sm overflow-hidden rounded-xl border-2 border-white/80 bg-white/70 shadow-md md:max-w-none">
              <OsmMap />
            </div>
            <a
              href={MAP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-xs font-medium text-pink-800 underline"
            >
              Buka di Google Maps
            </a>
            <p className="mt-4 text-xs text-pink-900/80 md:text-right">
              © 2026 Meedu Quiz. Hak cipta dilindungi.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}