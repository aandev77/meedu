import React, { useEffect, useRef, useState } from 'react';
import { Question } from '../types/game';

interface AdventureQuestionModalProps {
  question: Question;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  isOpen: boolean;
  showAnswer: boolean;
  /** Jawaban terakhir benar atau tidak (mengatur judul pada layar pembahasan). */
  isCorrect?: boolean;
  onAnswer: (answer: string | number) => void;
  onClose: () => void;
  onContinue: () => void;
}

export const AdventureQuestionModal: React.FC<AdventureQuestionModalProps> = ({
  question,
  timeLeft,
  setTimeLeft,
  isOpen,
  showAnswer,
  isCorrect = false,
  onAnswer,
  onClose,
  onContinue,
}) => {
  const [essayAnswer, setEssayAnswer] = useState('');

  const onAnswerRef = useRef(onAnswer);
  const timeoutHandled = useRef(false);

  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  useEffect(() => {
    timeoutHandled.current = false;
    setEssayAnswer('');
  }, [question.id]);

  useEffect(() => {
    if (!isOpen || showAnswer || timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft(previous => {
        if (previous <= 1) {
          window.clearInterval(timer);

          if (!timeoutHandled.current) {
            timeoutHandled.current = true;
            onAnswerRef.current(
              question.type === 'ox' ? '__TIMEOUT__' : -1
            );
          }

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isOpen, showAnswer, question.id, question.type, setTimeLeft]);

  if (!isOpen) return null;

  const handleAnswer = (answer: string | number) => {
    if (showAnswer || timeoutHandled.current) return;
    onAnswer(answer);
  };

  const handleEssaySubmit = () => {
    const answer = essayAnswer.trim();

    if (!answer) return;

    handleAnswer(answer);
  };

  const getCorrectAnswer = () => {
    if (question.type === 'ox') {
      return String(question.correctAnswer).toUpperCase();
    }

    if (question.type === 'multiple') {
      return question.options?.[Number(question.correctAnswer)] ?? 'Tidak tersedia';
    }

    return String(question.correctAnswer || 'Jawaban belum tersedia');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-pink-950/50 p-3 backdrop-blur-sm sm:p-4">
      <div className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-pink-100 bg-gradient-to-br from-white via-white to-pink-50 p-4 text-slate-800 shadow-2xl shadow-pink-500/20 sm:max-h-[calc(100dvh-2rem)] sm:p-6">

        {!showAnswer ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-2 sm:mb-5">
              <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-700 sm:text-sm">
                PETI HARTA KARUN
              </span>

              <span
                className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm font-bold tabular-nums sm:px-4 sm:py-2 sm:text-base ${
                  timeLeft <= 5
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-pink-200 bg-pink-50 text-pink-700'
                }`}
              >
                {timeLeft} detik
              </span>
            </div>

            <h2 className="mb-5 text-lg font-bold leading-relaxed text-slate-800 sm:mb-6 sm:text-xl">
              {question.question}
            </h2>

            {question.type === 'ox' ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => handleAnswer('O')}
                  className="rounded-xl bg-pink-600 p-4 text-xl font-bold text-white shadow-md shadow-pink-500/30 transition hover:bg-pink-700 active:scale-95 sm:p-5 sm:text-2xl"
                >
                  O
                </button>

                <button
                  onClick={() => handleAnswer('X')}
                  className="rounded-xl border-2 border-pink-300 bg-white p-4 text-xl font-bold text-pink-600 shadow-md shadow-pink-500/10 transition hover:bg-pink-50 active:scale-95 sm:p-5 sm:text-2xl"
                >
                  X
                </button>
              </div>
            ) : question.type === 'multiple' ? (
              <div className="grid gap-2.5 sm:gap-3">
                {(question.options ?? []).map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className="rounded-xl border border-pink-100 bg-white p-3 text-left text-sm text-slate-700 shadow-sm transition hover:border-pink-400 hover:bg-pink-50 active:scale-[0.99] sm:p-4 sm:text-base"
                  >
                    <span className="mr-3 font-bold text-pink-600">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <textarea
                  value={essayAnswer}
                  onChange={(e) => setEssayAnswer(e.target.value)}
                  placeholder="Ketik jawabanmu di sini..."
                  rows={4}
                  className="w-full resize-y rounded-xl border border-pink-200 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 sm:p-4 sm:text-base"
                />

                <button
                  onClick={handleEssaySubmit}
                  disabled={!essayAnswer.trim()}
                  className="w-full rounded-xl bg-pink-600 py-3 font-bold text-white shadow-md shadow-pink-500/30 transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Kirim Jawaban
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-5 w-full rounded-xl border border-pink-100 bg-pink-50 py-3 font-semibold text-pink-700 transition hover:bg-pink-100 sm:mt-6"
            >
              Tutup Sementara
            </button>
          </>
        ) : (
          <div className="py-2 text-center sm:py-4">
            {isCorrect ? (
              <>
                <h2 className="mb-1 text-xl font-extrabold text-emerald-600 sm:text-2xl">
                  JAWABAN KAMU BENAR!
                </h2>
                <p className="mb-4 text-sm text-slate-500">
                  Kerja bagus, peti berhasil dibuka.
                </p>
              </>
            ) : (
              <h2 className="mb-4 text-xl font-extrabold text-pink-600 sm:text-2xl">
                BELAJAR LEBIH GIAT LAGI YAAAAA
              </h2>
            )}

            <p className="mb-3 text-slate-500">
              Jawaban yang benar:
            </p>

            <p className="mb-5 whitespace-pre-wrap text-lg font-bold text-emerald-600 sm:text-xl">
              {getCorrectAnswer()}
            </p>

            <div className="mb-5 rounded-xl border border-pink-100 bg-pink-50 p-4 text-left sm:mb-6">
              <p className="mb-2 font-bold text-pink-700">
                Pembahasan
              </p>
              <p className="text-sm leading-relaxed text-slate-600">
                {question.explanation || 'Tidak ada penjelasan untuk soal ini.'}
              </p>
            </div>

            <button
              onClick={onContinue}
              className="w-full rounded-xl bg-pink-600 py-3 font-bold text-white shadow-md shadow-pink-500/30 transition hover:bg-pink-700"
            >
              Lanjutkan Petualangan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};