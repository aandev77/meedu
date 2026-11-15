import React, { useEffect, useRef, useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface SplashScreenProps {
  /** Dipanggil setelah animasi selesai (atau saat layar disentuh untuk melewati). */
  onFinish: () => void;
  /** Lama animasi sebelum mulai memudar, dalam milidetik. */
  duration?: number;
}

const FADE_OUT_MS = 450;
const BRAND = '#e6097f';
const OUTLINE = '#334155';

/* Sapi kartun menghadap kanan, memakai topi toga pink. */
const Cow: React.FC = () => {
  // Kaki berayun bergantian secara diagonal (kaki depan dekat + belakang jauh sefase).
  const leg = (x: number, far: boolean, alt: boolean) => (
    <g
      className="ms-anim"
      style={{
        transformOrigin: `${x + 5.5}px 80px`,
        transformBox: 'view-box',
        animation: `${alt ? 'ms-legB' : 'ms-legA'} .5s ease-in-out infinite alternate`,
      }}
    >
      <rect
        x={x}
        y={80}
        width={11}
        height={28}
        rx={4}
        fill={far ? '#e2e8f0' : '#ffffff'}
        stroke={OUTLINE}
        strokeWidth={2.5}
      />
      <rect x={x + 1.2} y={101} width={8.6} height={6} rx={2} fill="#475569" />
    </g>
  );

  return (
    <svg viewBox="0 0 160 120" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <clipPath id="ms-cow-body">
          <rect x={30} y={42} width={84} height={44} rx={22} />
        </clipPath>
      </defs>

      <g
        className="ms-anim"
        style={{ animation: 'ms-bob .25s ease-in-out infinite alternate' }}
      >
        {/* Kaki yang jauh */}
        {leg(38, true, false)}
        {leg(88, true, true)}

        {/* Ekor */}
        <g
          className="ms-anim"
          style={{
            transformOrigin: '30px 52px',
            transformBox: 'view-box',
            animation: 'ms-tail .5s ease-in-out infinite alternate',
          }}
        >
          <path
            d="M30 52 C14 50 10 68 18 78"
            fill="none"
            stroke={OUTLINE}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <ellipse cx={18} cy={80} rx={4} ry={6} fill={OUTLINE} />
        </g>

        {/* Ambing */}
        <ellipse cx={62} cy={86} rx={9} ry={6} fill="#f9a8d4" stroke={OUTLINE} strokeWidth={2} />

        {/* Badan + bercak */}
        <rect x={30} y={42} width={84} height={44} rx={22} fill="#ffffff" stroke={OUTLINE} strokeWidth={2.5} />
        <g clipPath="url(#ms-cow-body)" fill="#475569">
          <ellipse cx={54} cy={55} rx={10} ry={8} />
          <ellipse cx={90} cy={50} rx={8} ry={6} />
          <ellipse cx={86} cy={76} rx={9} ry={6} />
        </g>

        {/* Kaki yang dekat */}
        {leg(50, false, true)}
        {leg(98, false, false)}

        {/* Telinga (berkedip pelan) */}
        <g
          className="ms-anim"
          style={{
            transformOrigin: '110px 44px',
            transformBox: 'view-box',
            animation: 'ms-ear 2.6s ease-in-out infinite',
          }}
        >
          <ellipse
            cx={106}
            cy={42}
            rx={9}
            ry={5}
            transform="rotate(-28 106 42)"
            fill="#fbcfe8"
            stroke={OUTLINE}
            strokeWidth={2}
          />
        </g>

        {/* Kepala */}
        <ellipse cx={124} cy={48} rx={21} ry={19} fill="#ffffff" stroke={OUTLINE} strokeWidth={2.5} />
        <ellipse cx={137} cy={58} rx={12} ry={9.5} fill="#fbcfe8" stroke={OUTLINE} strokeWidth={2} />
        <circle cx={134} cy={58} r={1.4} fill={OUTLINE} />
        <circle cx={140.5} cy={58} r={1.4} fill={OUTLINE} />
        <path d="M133 63 Q138.5 66.5 144 63" fill="none" stroke={OUTLINE} strokeWidth={1.6} strokeLinecap="round" />
        <ellipse cx={119} cy={54} rx={4} ry={2.5} fill="#f9a8d4" opacity={0.75} />

        {/* Mata */}
        <g
          className="ms-anim"
          style={{
            transformOrigin: '128px 44px',
            transformBox: 'view-box',
            animation: 'ms-blink 3s ease-in-out infinite',
          }}
        >
          <circle cx={128} cy={44} r={3} fill="#1e293b" />
          <circle cx={129} cy={43} r={0.9} fill="#ffffff" />
        </g>

        {/* Topi toga */}
        <path d="M112 28 V35 Q124 41 136 35 V28 Z" fill="#be0a68" stroke={OUTLINE} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M103 25 L124 16 L146 25 L124 33 Z" fill={BRAND} stroke={OUTLINE} strokeWidth={1.8} strokeLinejoin="round" />
        <path d="M146 25 V37" stroke="#fbbf24" strokeWidth={2} strokeLinecap="round" />
        <circle cx={146} cy={38} r={2.6} fill="#fbbf24" />
      </g>
    </svg>
  );
};

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 4200,
}) => {
  const [leaving, setLeaving] = useState(false);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const finish = React.useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setLeaving(true);
    window.setTimeout(() => onFinishRef.current(), FADE_OUT_MS);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(finish, duration);
    return () => window.clearTimeout(timer);
  }, [duration, finish]);

  return (
    <div
      role="status"
      aria-label="Memuat Meedu Quiz"
      onClick={finish}
      className={`fixed inset-0 z-[2000] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-100 px-4 transition-opacity ease-out ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_OUT_MS}ms` }}
    >
      <style>{`
        @keyframes ms-pop {
          0%   { opacity: 0; transform: scale(.3) rotate(-14deg); }
          60%  { opacity: 1; transform: scale(1.12) rotate(4deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
        @keyframes ms-ring {
          0%   { opacity: .45; transform: scale(.9); }
          100% { opacity: 0;   transform: scale(2.3); }
        }
        @keyframes ms-cap {
          0%, 100% { transform: translateY(0) rotate(0); }
          40%      { transform: translateY(-6px) rotate(-8deg); }
          70%      { transform: translateY(0) rotate(4deg); }
        }
        @keyframes ms-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ms-slide {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ms-bar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes ms-legA {
          from { transform: rotate(-24deg); }
          to   { transform: rotate(24deg); }
        }
        @keyframes ms-legB {
          from { transform: rotate(24deg); }
          to   { transform: rotate(-24deg); }
        }
        @keyframes ms-bob {
          from { transform: translateY(0); }
          to   { transform: translateY(-2.5px); }
        }
        @keyframes ms-tail {
          from { transform: rotate(-12deg); }
          to   { transform: rotate(16deg); }
        }
        @keyframes ms-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95%           { transform: scaleY(.1); }
        }
        @keyframes ms-ear {
          0%, 85%, 100% { transform: rotate(0); }
          92%           { transform: rotate(-14deg); }
        }
        @keyframes ms-walkx {
          from { left: -5rem; }
          to   { left: calc(100% - 5rem); }
        }
        @keyframes ms-moo {
          0%   { opacity: 0; transform: scale(.5) translateY(6px); }
          15%  { opacity: 1; transform: scale(1) translateY(0); }
          80%  { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(.9) translateY(-4px); }
        }
        @keyframes ms-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-18px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ms-anim { animation: none !important; opacity: 1 !important; transform: none !important; }
          .ms-ring, .ms-moo { display: none; }
        }
      `}</style>

      {/* Lingkaran lembut di latar */}
      <div
        aria-hidden
        className="ms-anim pointer-events-none absolute -left-16 top-1/4 h-56 w-56 rounded-full bg-pink-200/40 blur-2xl"
        style={{ animation: 'ms-float 6s ease-in-out infinite' }}
      />
      <div
        aria-hidden
        className="ms-anim pointer-events-none absolute -right-12 bottom-1/4 h-64 w-64 rounded-full bg-rose-200/40 blur-2xl"
        style={{ animation: 'ms-float 7s ease-in-out infinite 1s' }}
      />

      {/* Logo */}
      <div className="relative flex items-center gap-4 sm:gap-5">
        <div className="relative shrink-0">
          {/* Gelombang di belakang ikon */}
          <span
            aria-hidden
            className="ms-anim ms-ring absolute inset-0 rounded-3xl"
            style={{
              backgroundColor: BRAND,
              animation: 'ms-ring 1.6s ease-out .55s 2 both',
            }}
          />

          <div
            className="ms-anim relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl shadow-pink-400/40 sm:h-20 sm:w-20 sm:rounded-3xl"
            style={{
              backgroundColor: BRAND,
              animation: 'ms-pop .75s cubic-bezier(.2,.9,.3,1.2) both',
            }}
          >
            <GraduationCap
              className="ms-anim h-8 w-8 text-white sm:h-10 sm:w-10"
              strokeWidth={2.2}
              style={{ animation: 'ms-cap .9s ease-in-out .7s both' }}
            />
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="flex items-baseline gap-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span
              className="ms-anim text-slate-900"
              style={{ animation: 'ms-slide .6s ease-out .75s both' }}
            >
              Meedu
            </span>
            <span
              className="ms-anim"
              style={{
                color: BRAND,
                animation: 'ms-slide .6s ease-out .95s both',
              }}
            >
              Quiz
            </span>
          </h1>

          <p
            className="ms-anim mt-1 text-xs text-slate-500 sm:text-sm"
            style={{ animation: 'ms-rise .6s ease-out 1.3s both' }}
          >
            Learning &amp; Multiplayer Platform
          </p>
        </div>
      </div>

      {/* Lintasan progres: sapi berjalan mengikuti bar yang terisi */}
      {(() => {
        const trackMs = Math.max(600, duration - 1300);

        return (
          <div className="relative mt-14 w-64 pt-14 sm:w-80">
            <div
              className="ms-anim h-1.5 w-full overflow-hidden rounded-full bg-pink-100"
              style={{ animation: 'ms-rise .5s ease-out 1.1s both' }}
            >
              <div
                className="ms-anim h-full w-full origin-left rounded-full"
                style={{
                  backgroundColor: BRAND,
                  animation: `ms-bar ${trackMs}ms ease-in-out 1.2s both`,
                }}
              />
            </div>

            {/* Sapi: kaki berada tepat di atas bar */}
            <div
              className="ms-anim pointer-events-none absolute left-0 top-0 z-10 h-[60px] w-20"
              style={{
                animation: `ms-rise .5s ease-out 1.1s both, ms-walkx ${trackMs}ms ease-in-out 1.2s both`,
              }}
            >
              <Cow />

              <span
                className="ms-anim ms-moo absolute -top-7 left-9 whitespace-nowrap rounded-xl border border-pink-200 bg-white px-2 py-0.5 text-xs font-extrabold shadow-md"
                style={{
                  color: BRAND,
                  animation: 'ms-moo 1.2s ease-out 2.1s 2 both',
                }}
              >
                Moo!
                <span className="absolute -bottom-1 left-3 h-2 w-2 rotate-45 border-b border-r border-pink-200 bg-white" />
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default SplashScreen;