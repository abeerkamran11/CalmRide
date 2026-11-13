import { useEffect, useState } from 'react';
import { PhoneOff, Volume2, ShieldCheck } from 'lucide-react';
import { RideState, SARAH_HELPER, VoiceStyle } from '../data/calmRideData';
import { speakPlainText, stopSpeaking } from '../utils/audioFeedback';
import { ResilientImage } from './ResilientImage';

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
          ? 'We pulled over safely because there are roadworks up ahead on Ecclesall Road. A replacement shuttle is already 3 minutes away—you can stay seated right where you are.'
          : rideState === 'slowdown'
          ? 'There is a delivery van parked just ahead in the lane. Shuttle S1 is waiting politely for clear space before moving past.'
          : 'Shuttle S1 is simply checking a crossing ahead. Everything on the road is clear and running smoothly.',
    },
    {
      label: 'Will I still make my stop on time?',
      answer:
        stopsRemaining <= 1
          ? `Yes, you are almost at ${destinationName} now—just a minute or two away.`
          : `Yes, Shuttle S1 is right on schedule for ${destinationName}, with ${stopsRemaining} stops left along Route S1.`,
    },
    {
      label: 'Can you stay on the line until we move?',
      answer:
        "Of course. I'm staying right here on the video call with Seat 2 until Shuttle S1 is cruising smoothly again. Take your time.",
    },
  ];

  const waveHeights = [0.45, 0.85, 0.6, 1.0, 0.72, 0.9, 0.5, 0.8, 0.4];

  return (
    <aside
      aria-label="Human Helper Video Call"
      className="w-full md:w-[430px] lg:w-[460px] shrink-0 h-full bg-[#FAF9F5] border-l-2 border-[#3B6284] flex flex-col justify-between p-3.5 sm:p-4 gap-2.5 overflow-hidden"
    >
      {/* Top Badge & Timer */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 bg-[#E3F4ED] border-2 border-[#0D6E4E] text-[#084732] px-3 py-1 rounded-xl min-w-0">
          <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="text-[18px] font-extrabold truncate">
            {SARAH_HELPER.connectionBadge}
          </span>
        </div>
        <span className="text-[20px] font-bold font-mono tabular-nums text-[#0F233C] shrink-0">
          {formatTimer(callSeconds)}
        </span>
      </div>

      {/* Video Portrait Frame (Compact Height so Panel Fits Without Scroll) */}
      <div className="relative h-36 sm:h-40 w-full rounded-2xl overflow-hidden border-2 border-[#3B6284] bg-[#DCE6EE] shrink-0">
        <ResilientImage
          src={SARAH_HELPER.photoUrl}
          alt="Sarah at the Sheffield Control Centre smiling warmly on video call"
          fallbackTitle={SARAH_HELPER.name}
          className="w-full h-full object-cover object-[50%_20%]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F233C]/90 via-[#0F233C]/55 to-transparent p-3 flex items-end justify-between gap-2">
          <p className="text-[20px] font-extrabold text-white leading-tight truncate">
            {SARAH_HELPER.name}
          </p>
          <div
            aria-label={isSpeaking ? 'Sarah is speaking' : 'Audio standby'}
            className="flex items-center gap-1 h-7 px-2 py-1 rounded-lg bg-[#0F233C]/80 border border-white/30 shrink-0"
          >
            {waveHeights.map((h, i) => (
              <span
                key={i}
                style={{
                  height: `${Math.round(h * 18)}px`,
                  animationDelay: `${i * 0.09}s`,
                }}
                className={`w-1.5 rounded-full bg-[#34D399] ${
                  isSpeaking ? 'wave-bar' : 'opacity-40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Live Closed Captions */}
      <div className="bg-white border-2 border-[#3B6284] rounded-2xl p-3 space-y-1.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[20px] font-extrabold text-[#0F233C]">
            Live Captions
          </p>
          <button
            type="button"
            onClick={() => speakResponse(captionText)}
            className="min-h-[40px] px-3 py-1 rounded-xl bg-[#E9EFF5] text-[#0F233C] border border-[#3B6284] hover:bg-[#DCE6EE] text-[20px] font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Replay</span>
          </button>
        </div>
        <p className="text-[20px] text-[#0F233C] leading-snug">
          “{captionText}”
        </p>
      </div>

      {/* 3 Large One-Tap Quick-Question Chips */}
      <div className="space-y-1.5 shrink-0">
        <p className="text-[20px] font-bold text-[#2B435E]">
          Tap a question to ask Sarah:
        </p>
        <div className="flex flex-col gap-1.5">
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
                className={`min-h-[46px] px-3.5 py-1.5 rounded-xl border-2 text-left text-[20px] font-bold leading-snug transition-colors cursor-pointer ${
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

      {/* Big Red End Call Button */}
      <button
        type="button"
        onClick={() => {
          stopSpeaking();
          onEndCall();
        }}
        className="w-full min-h-[56px] px-5 py-2.5 rounded-2xl bg-[#B91C1C] text-white border-2 border-[#991B1B] hover:bg-[#991B1B] text-[22px] font-extrabold flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
      >
        <PhoneOff className="w-6 h-6 shrink-0" aria-hidden="true" />
        <span>End Call</span>
      </button>
    </aside>
  );
}
