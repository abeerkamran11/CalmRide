import { useEffect, useState } from 'react';
import { PhoneOff, Volume2, Headphones } from 'lucide-react';
import { RideState, SARAH_HELPER, VoiceStyle } from '../data/calmRideData';
import { speakPlainText, stopSpeaking } from '../utils/audioFeedback';

interface HumanHelperPanelProps {
  rideState: RideState;
  destinationName: string;
  stopsRemaining: number;
  voiceStyle: VoiceStyle;
  onEndCall: () => void;
}

export function HumanHelperPanel({
  rideState,
  destinationName,
  stopsRemaining,
  voiceStyle,
  onEndCall,
}: HumanHelperPanelProps) {
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [callSeconds, setCallSeconds] = useState(0);
  const [captionText, setCaptionText] = useState(SARAH_HELPER.greetingCaption);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const speakResponse = (text: string) => {
    setCaptionText(text);
    const started = speakPlainText(text, {
      voiceStyle,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
    if (!started) {
      setIsSpeaking(true);
      window.setTimeout(() => setIsSpeaking(false), 4500);
    }
  };

  useEffect(() => {
    speakResponse(SARAH_HELPER.greetingCaption);
    const timer = window.setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const quickQuestions: { label: string; answer: string }[] = [
    {
      label: 'Why did we just stop?',
      answer:
        rideState === 'safe-failure'
          ? 'We pulled over safely for roadworks ahead. A replacement shuttle is 3 minutes away.'
          : rideState === 'slowdown'
          ? 'A delivery van is parked ahead. Shuttle S1 is waiting for clear space to pass.'
          : 'Shuttle S1 is checking a crossing ahead. Everything is clear and safe.',
    },
    {
      label: 'Will I still make my stop on time?',
      answer:
        stopsRemaining <= 1
          ? `Yes, you are almost at ${destinationName}—just a minute or two away.`
          : `Yes, Shuttle S1 is on schedule for ${destinationName}, with ${stopsRemaining} stops left.`,
    },
    {
      label: 'Can you stay on the line until we move?',
      answer:
        "Of course. I'll stay right on the line with you until we are moving smoothly again.",
    },
  ];

  const waveHeights = [0.45, 0.85, 0.6, 1.0, 0.72, 0.9, 0.5, 0.8, 0.4];

  return (
    <aside
      aria-label="Human Helper Call"
      className="w-full md:w-[440px] lg:w-[480px] shrink-0 h-[62%] md:h-full min-h-0 bg-[#FAF9F5] border-t-2 md:border-t-0 md:border-l-2 border-[#3B6284] flex flex-col overflow-hidden"
    >
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3">
        {/* Top Connection Status & Call Timer */}
        <div className="flex items-center justify-between gap-2">
          <div className="bg-[#E3F4ED] border-2 border-[#0D6E4E] text-[#084732] px-3 py-1 rounded-xl min-w-0">
            <span className="text-[18px] font-extrabold truncate block">
              {SARAH_HELPER.connectionBadge}
            </span>
          </div>
          <span className="text-[20px] font-bold font-mono tabular-nums text-[#0F233C] shrink-0">
            {formatTimer(callSeconds)}
          </span>
        </div>

        {/* Clean Voice/Helper Header Card (No Photo) */}
        <div className="bg-[#0F233C] text-white rounded-2xl border-2 border-[#3B6284] p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <Headphones className="w-7 h-7 text-[#6EE7B7]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[20px] font-extrabold text-white leading-snug truncate">
                {SARAH_HELPER.name}
              </p>
              <p className="text-[18px] font-bold text-[#6EE7B7]">
                Live Connected
              </p>
            </div>
          </div>

          <div
            aria-label={isSpeaking ? 'Sarah is speaking' : 'Audio standby'}
            className="flex items-center gap-1 h-9 px-2.5 py-1 rounded-lg bg-white/10 border border-white/25 shrink-0"
          >
            {waveHeights.map((h, i) => (
              <span
                key={i}
                style={{
                  height: `${Math.round(h * 20)}px`,
                  animationDelay: `${i * 0.09}s`,
                }}
                className={`w-1.5 rounded-full bg-[#34D399] ${
                  isSpeaking ? 'wave-bar' : 'opacity-40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Live Closed Captions */}
        <div className="bg-white border-2 border-[#3B6284] rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[20px] font-extrabold text-[#0F233C]">
              Live Captions
            </p>
            <button
              type="button"
              onClick={() => speakResponse(captionText)}
              className="min-h-[42px] px-3 py-1 rounded-xl bg-[#E9EFF5] text-[#0F233C] border border-[#3B6284] hover:bg-[#DCE6EE] text-[20px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>Replay</span>
            </button>
          </div>
          <p className="text-[20px] text-[#0F233C] leading-snug">
            “{captionText}”
          </p>
        </div>

        {/* 3 Quick-Question Chips */}
        <div className="space-y-2">
          <p className="text-[20px] font-bold text-[#2B435E]">
            Quick questions:
          </p>
          <div className="flex flex-col gap-2">
            {quickQuestions.map((q) => {
              const selected = activeQuestion === q.label;
              return (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => {
                    setActiveQuestion(q.label);
                    speakResponse(q.answer);
                  }}
                  className={`min-h-[48px] px-4 py-2 rounded-xl border-2 text-left text-[20px] font-bold leading-snug transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#0F233C] text-white border-[#0F233C]'
                      : 'bg-white text-[#0F233C] border-[#3B6284] hover:bg-[#E9EFF5]'
                  }`}
                >
                  {q.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Always-Visible Red End Call Button */}
      <div className="shrink-0 p-3.5 sm:px-4 sm:py-3 border-t-2 border-[#CBD5E1] bg-[#FAF9F5]">
        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            onEndCall();
          }}
          className="w-full min-h-[54px] px-5 py-2.5 rounded-2xl bg-[#B91C1C] text-white border-2 border-[#991B1B] hover:bg-[#991B1B] text-[22px] font-extrabold flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <PhoneOff className="w-6 h-6 shrink-0" aria-hidden="true" />
          <span>End Call</span>
        </button>
      </div>
    </aside>
  );
}
