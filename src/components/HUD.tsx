import React from 'react';
import { createPortal } from 'react-dom';
import { GameRoom, Player, Question } from '../types/game';
import { Volume2, VolumeX, Flame, Trophy, Copy, Check, Sparkles, LogOut } from 'lucide-react';

interface HUDProps {
  room: GameRoom;
  currentPlayer: Player;
  onLeaveRoom: () => void;
  /** Dipanggil saat guru (host) mengonfirmasi mengakhiri room. Jika tidak diberikan, memakai onLeaveRoom. */
  onEndRoom?: () => void;
  isHost?: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  room,
  currentPlayer,
  onLeaveRoom,
  onEndRoom,
  isHost = false,
  isMuted,
  onToggleMute,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = React.useState(false);

  // Tutup dialog konfirmasi dengan tombol Escape
  React.useEffect(() => {
    if (!showLeaveConfirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLeaveConfirm(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showLeaveConfirm]);

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    if (isHost) {
      (onEndRoom ?? onLeaveRoom)();
    } else {
      onLeaveRoom();
    }
  };
  const currentQuestion: Question | undefined = room.quizPack.questions[room.currentQuestionIndex];

  const handleCopyPin = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate player rank
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const myRank = sortedPlayers.findIndex((p) => p.id === currentPlayer.id) + 1;

  // Time bar percentage
  const timePercent = room.totalTime > 0 ? (room.timeLeft / room.totalTime) * 100 : 0;
  const isTimeUrgent = room.timeLeft <= 5 && room.stage === 'answering';

  // Mode Adventure: tanpa skor/peringkat, PIN + suara + keluar dirapikan rata kiri.
  const isAdventure = room.mode === 'adventure';

  // Tema Adventure: pink & putih. Mode lain tetap gelap.
  const pillClass = isAdventure
    ? 'bg-white/95 border-pink-200'
    : 'bg-slate-900/90 border-slate-700/80';
  const labelClass = isAdventure ? 'text-pink-400' : 'text-slate-400';
  const pinClass = isAdventure ? 'text-pink-600' : 'text-indigo-300';
  const iconBtnClass = isAdventure
    ? 'text-pink-500 hover:text-pink-700 hover:bg-pink-50'
    : 'text-slate-400 hover:text-white hover:bg-slate-800';
  const muteBtnClass = isAdventure
    ? 'text-pink-500 hover:text-pink-700 hover:bg-pink-50'
    : 'text-slate-300 hover:text-white hover:bg-slate-800';
  const leaveBtnClass = isAdventure
    ? 'text-rose-600 hover:text-white hover:bg-rose-500'
    : 'text-rose-300 hover:text-white hover:bg-rose-600/30';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 z-20">
      {/* TOP SECTION: BAR & QUESTION CARD DOCKED AT TOP */}
      <div
        className={`flex flex-col gap-3 w-full ${
          isAdventure ? 'pointer-events-none' : 'pointer-events-auto max-w-4xl mx-auto'
        }`}
      >
        {/* Top Info Bar */}
        <div
          className={`flex flex-wrap gap-1.5 sm:gap-3 ${
            isAdventure ? 'items-center justify-start' : 'items-start justify-between'
          }`}
        >
          {/* Room Code Badge */}
          <div
            className={`pointer-events-auto flex h-10 sm:h-9 min-w-0 max-w-[min(58%,260px)] items-center gap-1 sm:gap-2 ${pillClass} border px-2 sm:px-3.5 rounded-xl sm:rounded-2xl shadow-xl backdrop-blur-md`}
          >
            <span className={`shrink-0 text-[9px] sm:text-[11px] font-semibold ${labelClass}`}>PIN</span>
            <span className={`min-w-0 truncate font-black ${pinClass} tracking-wide text-[10px] sm:text-sm`}>{room.code}</span>
            <button
              onClick={handleCopyPin}
              className={`shrink-0 p-1 rounded-lg ${iconBtnClass} transition cursor-pointer`}
              title="Salin PIN"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Player Stats & Rank */}
          <div
            className={`flex min-w-0 flex-wrap items-center gap-1 sm:gap-2.5 ${
              isAdventure ? 'justify-start' : 'justify-end'
            }`}
          >
            {!isAdventure && currentPlayer.streak > 1 && (
              <div className="flex shrink-0 items-center gap-1 px-1.5 sm:gap-1.5 sm:px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 rounded-lg sm:rounded-xl text-orange-400 font-bold text-[9px] sm:text-xs shadow-md animate-pulse">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>x{currentPlayer.streak} Streak!</span>
              </div>
            )}

            {!isAdventure && (
              <div className="flex shrink-0 items-center gap-1 sm:gap-2 bg-slate-900/90 border border-slate-700/80 px-1.5 sm:px-3 py-1 rounded-lg sm:rounded-xl shadow-xl backdrop-blur-md">
                <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                <div className="flex items-center gap-1">
                  <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase">
                    #{myRank}
                  </span>
                  <span className="text-[9px] sm:text-xs font-black text-white tabular-nums whitespace-nowrap">
                    {currentPlayer.score.toLocaleString()} pts
                  </span>
                </div>
              </div>
            )}

            {/* Tombol suara dan logout dipisah agar rapi dan konsisten */}
            <div className="pointer-events-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
                title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
                className={`flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl border ${pillClass} shadow-xl backdrop-blur-md ${muteBtnClass} transition active:scale-95`}
              >
                {isMuted
                  ? <VolumeX className="h-4 w-4 text-red-400" />
                  : <Volume2 className={`h-4 w-4 ${isAdventure ? 'text-pink-500' : 'text-emerald-400'}`} />}
              </button>
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(true)}
                aria-label={isHost ? 'Akhiri Room' : 'Logout'}
                title={isHost ? 'Akhiri Room' : 'Logout'}
                className={`flex h-10 w-10 sm:h-9 sm:w-auto items-center justify-center gap-1.5 rounded-lg sm:rounded-xl border border-rose-200 bg-white px-0 sm:px-3 text-[10px] sm:text-xs font-bold ${leaveBtnClass} shadow-xl transition active:scale-95`}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* QUESTION DISPLAY CARD (DOCKED AT TOP) */}
        {currentQuestion && room.mode !== 'adventure' && (
          <div className="bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden transition-all">
            {/* Top Info Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-indigo-400 uppercase tracking-wider text-[11px]">
                  Soal {room.currentQuestionIndex + 1} / {room.quizPack.questions.length}
                </span>
                {currentQuestion.category && (
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium text-[10px]">
                    {currentQuestion.category}
                  </span>
                )}
              </div>

              {/* Countdown Timer Badge */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400">WAKTU:</span>
                <span
                  className={`text-sm font-black px-2 py-0.5 rounded-lg tabular-nums ${
                    isTimeUrgent
                      ? 'bg-red-500/30 text-red-400 border border-red-500/40 animate-ping'
                      : 'bg-indigo-500/20 text-indigo-300'
                  }`}
                >
                  {room.timeLeft}s
                </span>
              </div>
            </div>

            {/* Timer Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isTimeUrgent
                    ? 'bg-red-500'
                    : timePercent < 50
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, timePercent))}%` }}
              />
            </div>

            {/* Question Text */}
            <h2 className="text-base md:text-lg font-extrabold text-white mt-2 leading-snug">
              {currentQuestion.question}
            </h2>

            {/* Current Player Zone Hint */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <span>Zona Kamu:</span>
                <span
                  className={`font-black px-2 py-0.5 rounded text-[10px] ${
                    currentPlayer.currentZone === 'none'
                      ? 'bg-slate-800 text-slate-400'
                      : currentPlayer.currentZone === 'O'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : currentPlayer.currentZone === 'X'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {currentPlayer.currentZone === 'none' ? 'Belum Masuk Zona' : `Zona ${currentPlayer.currentZone}`}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 hidden sm:block">
                {currentQuestion.type === 'ox' ? 'Lari ke sisi O (Benar) atau X (Salah)!' : 'Lari ke sudut A, B, C, atau D!'}
              </div>
            </div>

            {/* REVEAL EXPLANATION OVERLAY */}
            {(room.stage === 'reveal' || room.stage === 'times_up' || room.stage === 'round_result') && (
              <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/90 to-purple-950/90 border border-indigo-500/50 text-left animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Jawaban Benar: Zona {room.roundResults?.correctZone}
                </div>
                {currentQuestion.explanation && (
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DIALOG KONFIRMASI KELUAR / AKHIRI ROOM */}
      {/* Dirender ke document.body agar tidak tertutup D-pad / canvas */}
      {showLeaveConfirm && createPortal(
        <div
          className="pointer-events-auto fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowLeaveConfirm(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="leave-confirm-title"
            aria-describedby="leave-confirm-desc"
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-2xl border p-5 text-center shadow-2xl ${
              isAdventure ? 'border-pink-200 bg-white' : 'border-slate-700 bg-slate-900'
            }`}
          >
            <div
              className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
                isAdventure ? 'bg-rose-100 text-rose-600' : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              <LogOut className="h-6 w-6" />
            </div>
            <h3
              id="leave-confirm-title"
              className={`text-base font-extrabold ${isAdventure ? 'text-slate-800' : 'text-white'}`}
            >
              {isHost ? 'Akhiri room ini?' : 'Keluar dari room?'}
            </h3>
            <p
              id="leave-confirm-desc"
              className={`mt-1.5 text-sm leading-relaxed ${isAdventure ? 'text-slate-500' : 'text-slate-400'}`}
            >
              {isHost
                ? 'Room akan ditutup untuk semua murid dan permainan berhenti.'
                : 'Kamu akan meninggalkan permainan ini.'}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => setShowLeaveConfirm(false)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-bold transition active:scale-95 ${
                  isAdventure
                    ? 'border-pink-200 bg-pink-50 text-pink-600 hover:bg-pink-100'
                    : 'border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="flex-1 rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-rose-500 active:scale-95"
              >
                {isHost ? 'Keluar' : 'Keluar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};