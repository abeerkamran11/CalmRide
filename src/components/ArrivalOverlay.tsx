import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Frown,
  Meh,
  Smile,
  Compass,
  Smartphone,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

interface ArrivalOverlayProps {
  destinationName: string;
  exitDirections: string;
  onClearAndReset: () => void;
}

type FeelingRating = 'anxious' | 'okay' | 'very-calm';

function SimulatedQrCode() {
  const modules = [
    '11111110101101111111',
    '10000010011001000001',
    '10111010100101011101',
    '10111010011001011101',
    '10111010110101011101',
    '10000010001001000001',
    '11111110101011111111',
    '00000000110100000000',
    '10110111001011010110',
    '01001010110100101001',
    '11011001101110110100',
    '00100110010011001011',
    '00000000101101010101',
    '11111110010110101110',
    '10000010110010010011',
    '10111010011011101100',
    '10111010100100110010',
    '10111010011101001101',
    '10000010100010110010',
    '11111110110101101101',
  ];

  return (
    <svg
      viewBox="0 0 22 22"
      role="img"
      aria-label="QR code to scan with your own phone to send an I've Arrived Safely message"
      className="w-24 h-24 bg-white p-1 rounded-xl border-2 border-[#0F233C] shrink-0"
    >
      {modules.map((row, y) =>
        row.split('').map((cell, x) =>
          cell === '1' ? (
            <rect
              key={`${x}-${y}`}
              x={x + 1}
              y={y + 1}
              width="1"
              height="1"
              fill="#0F233C"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

export function ArrivalOverlay({
  destinationName,
  exitDirections,
  onClearAndReset,
}: ArrivalOverlayProps) {
  const [feeling, setFeeling] = useState<FeelingRating | null>(null);
  const [autoClearSeconds, setAutoClearSeconds] = useState<number>(45);

  useEffect(() => {
    const id = window.setInterval(() => {
      setAutoClearSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          onClearAndReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [onClearAndReset]);

  const feelings: {
    id: FeelingRating;
    label: string;
    Icon: typeof Smile;
  }[] = [
    { id: 'anxious', label: 'Anxious', Icon: Frown },
    { id: 'okay', label: 'Okay', Icon: Meh },
    { id: 'very-calm', label: 'Very Calm', Icon: Smile },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="arrival-title"
      className="absolute inset-0 z-30 bg-[#0F233C]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div className="w-full max-w-4xl bg-[#FAF9F5] border-2 border-[#0D6E4E] rounded-3xl shadow-2xl p-5 sm:p-6 space-y-3.5">
        {/* Safe Arrival Heading */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E3F4ED] border-2 border-[#0D6E4E] flex items-center justify-center shrink-0">
              <CheckCircle2
                className="w-7 h-7 text-[#0D6E4E]"
                aria-hidden="true"
              />
            </div>
            <div>
              <h2
                id="arrival-title"
                className="text-2xl sm:text-3xl font-extrabold text-[#0F233C] leading-tight"
              >
                You&apos;ve Arrived Safely!
              </h2>
              <p className="text-[20px] font-bold text-[#0D6E4E]">
                {destinationName} · Step-Free Doors Open
              </p>
            </div>
          </div>
        </div>

        {/* Landmark-Based Exit Directions */}
        <div className="bg-[#E3F4ED] border-2 border-[#0D6E4E] rounded-2xl px-4 py-3 flex items-start gap-3">
          <Compass
            className="w-7 h-7 text-[#084732] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-[20px] font-semibold text-[#0F233C] leading-snug">
            <span className="font-extrabold text-[#084732]">
              Landmark Exit Directions:{' '}
            </span>
            {exitDirections}
          </p>
        </div>

        {/* Middle Two-Column Row: QR Code + 3-Face Anonymous Comfort Check */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
          <div className="md:col-span-6 bg-white border-2 border-[#3B6284] rounded-2xl p-3.5 flex items-center gap-3.5">
            <SimulatedQrCode />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#0F233C]">
                <Smartphone
                  className="w-5 h-5 text-[#3B6284] shrink-0"
                  aria-hidden="true"
                />
                <p className="text-[20px] font-extrabold leading-tight">
                  Message Family Yourself
                </p>
              </div>
              <p className="text-[20px] text-[#2B435E] leading-snug">
                Scan with your own phone to send an &apos;I&apos;ve Arrived Safely&apos; message (nothing sent from this bus).
              </p>
            </div>
          </div>

          <div className="md:col-span-6 bg-white border-2 border-[#3B6284] rounded-2xl p-3.5 flex flex-col justify-between gap-2">
            <div>
              <p className="text-[20px] font-extrabold text-[#0F233C] leading-tight">
                How calm did you feel?
              </p>
              <p className="text-[18px] font-semibold text-[#2B435E]">
                Anonymous feedback to help improve Route S1
              </p>
            </div>

            <div
              role="radiogroup"
              aria-label="How calm did you feel? Anonymous feedback to help improve Route S1"
              className="grid grid-cols-3 gap-2"
            >
              {feelings.map(({ id, label, Icon }) => {
                const selected = feeling === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setFeeling(id)}
                    className={`min-h-[68px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#E3F4ED] border-[#0D6E4E] text-[#084732]'
                        : 'bg-[#FAF9F5] border-[#3B6284] text-[#0F233C] hover:bg-[#E9EFF5]'
                    }`}
                  >
                    <Icon className="w-7 h-7 shrink-0" aria-hidden="true" />
                    <span className="text-[20px] font-bold leading-tight">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Finish & Clear Screen Now + Auto-Wipe Countdown */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onClearAndReset}
            className="w-full min-h-[58px] px-6 py-3 rounded-2xl bg-[#0F233C] text-white border-2 border-[#0F233C] hover:bg-[#1E3A5F] text-[22px] font-extrabold flex items-center justify-center gap-3 cursor-pointer"
          >
            <Trash2 className="w-6 h-6 shrink-0" aria-hidden="true" />
            <span>Finish &amp; Clear Screen Now</span>
          </button>

          <p className="text-center text-[20px] font-semibold text-[#2B435E] flex items-center justify-center gap-2">
            <ShieldCheck
              className="w-5 h-5 text-[#0D6E4E] shrink-0"
              aria-hidden="true"
            />
            <span>
              Screen automatically clears and wipes this trip when you stand up (
              <span className="font-mono tabular-nums font-bold text-[#0F233C]">
                {autoClearSeconds}s
              </span>
              )
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
