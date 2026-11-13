import { useEffect, useState } from 'react';
import {
  Video,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import {
  RIDE_STATE_COPY,
  RideState,
  ROUTE_S1_STOPS,
  RouteStop,
  UpdateLevel,
  VoiceStyle,
} from './data/calmRideData';
import { RoadPerspectiveCanvas } from './components/RoadPerspectiveCanvas';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { HumanHelperPanel } from './components/HumanHelperPanel';
import { RouteCountdownBar } from './components/RouteCountdownBar';
import { ArrivalOverlay } from './components/ArrivalOverlay';
import {
  playGentleChime,
  speakPlainText,
  stopSpeaking,
  triggerHaptic,
} from './utils/audioFeedback';

const RIDE_STATE_ORDER: RideState[] = [
  'cruising',
  'slowdown',
  'safe-failure',
  'arriving',
];

export default function App() {
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(3); // Default: Moor Market
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(0); // Start: Ecclesall Road
  const [updateLevel, setUpdateLevel] = useState<UpdateLevel>('important');
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('warm-local');
  const [rideState, setRideState] = useState<RideState>('cruising');
  const [helperCallOpen, setHelperCallOpen] = useState<boolean>(false);

  const selectedStop = ROUTE_S1_STOPS[selectedStopIndex];
  const stopsRemaining = Math.max(0, selectedStopIndex - currentStopIndex);
  const hasArrived = !showWelcome && stopsRemaining === 0;

  const handleWelcomeComplete = (
    destination: RouteStop | null,
    chosenUpdateLevel: UpdateLevel,
    chosenVoiceStyle: VoiceStyle,
  ) => {
    playGentleChime();
    if (destination) {
      const idx = ROUTE_S1_STOPS.findIndex((s) => s.id === destination.id);
      if (idx !== -1) {
        setSelectedStopIndex(idx);
      }
    }
    setUpdateLevel(chosenUpdateLevel);
    setVoiceStyle(chosenVoiceStyle);
    setShowWelcome(false);
  };

  const handleCycleRoadState = () => {
    const idx = RIDE_STATE_ORDER.indexOf(rideState);
    const nextState = RIDE_STATE_ORDER[(idx + 1) % RIDE_STATE_ORDER.length];
    setRideState(nextState);
    playGentleChime();

    const copy = RIDE_STATE_COPY[nextState];
    if (
      nextState === 'slowdown' ||
      nextState === 'safe-failure' ||
      nextState === 'arriving' ||
      updateLevel === 'every-turn'
    ) {
      speakPlainText(copy.spokenText, { voiceStyle });
    } else {
      stopSpeaking();
    }
  };

  const handleReplayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    playGentleChime();
    speakPlainText(RIDE_STATE_COPY[rideState].spokenText, { voiceStyle });
  };

  const handleAdvanceStop = () => {
    playGentleChime();
    setCurrentStopIndex((prev) => {
      if (prev >= selectedStopIndex) return 0;
      const next = prev + 1;
      if (selectedStopIndex - next === 1) {
        setRideState('arriving');
      } else if (next === 0) {
        setRideState('cruising');
      }
      return next;
    });
  };

  const handleRestartDemo = () => {
    stopSpeaking();
    setSelectedStopIndex(3);
    setUpdateLevel('important');
    setVoiceStyle('warm-local');
    setCurrentStopIndex(0);
    setRideState('cruising');
    setHelperCallOpen(false);
    setShowWelcome(true);
  };

  // Gentle armrest pulse + voice update at 1 stop away or arrival
  useEffect(() => {
    if (showWelcome) return;
    if (stopsRemaining === 1) {
      triggerHaptic([160, 80, 160]);
      if (!helperCallOpen) {
        speakPlainText(
          `Approaching ${selectedStop.name}. One stop away—your seat armrests are gently vibrating.`,
          { voiceStyle },
        );
      }
    } else if (stopsRemaining === 0 && !helperCallOpen) {
      triggerHaptic([120, 60, 120]);
      speakPlainText(
        `You have arrived safely at ${selectedStop.name}. ${selectedStop.exitDirections}`,
        { voiceStyle },
      );
    }
  }, [
    stopsRemaining,
    showWelcome,
    helperCallOpen,
    selectedStop.name,
    selectedStop.exitDirections,
    voiceStyle,
  ]);

  const activeCopy = RIDE_STATE_COPY[rideState];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#FAF9F5] text-[#0F233C]">
      {/* 1. TOP HEADER BAR */}
      <header className="shrink-0 bg-white border-b-2 border-[#3B6284] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F233C] whitespace-nowrap">
            CalmRide
          </h1>
          <p className="text-[20px] font-semibold text-[#2B435E] truncate">
            Route S1: Ecclesall Road → Sheffield City Centre
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            playGentleChime();
            setHelperCallOpen((prev) => !prev);
          }}
          className={`min-h-[50px] px-5 py-2 rounded-2xl border-2 text-[20px] font-extrabold flex items-center gap-2.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            helperCallOpen
              ? 'bg-[#0D6E4E] text-white border-[#0D6E4E]'
              : 'bg-[#0F233C] text-white border-[#0F233C] hover:bg-[#1E3A5F]'
          }`}
        >
          <Video className="w-6 h-6 shrink-0" aria-hidden="true" />
          <span>
            {helperCallOpen
              ? 'Human Helper Connected'
              : 'Speak to a Human Helper'}
          </span>
        </button>
      </header>

      {/* 3. MAIN CENTER AREA (+ 4. SPLIT-SCREEN HUMAN HELPER VIDEO CALL) */}
      <main className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden relative">
        <div className="flex-1 min-w-0 min-h-0 relative overflow-hidden">
          <RoadPerspectiveCanvas
            rideState={rideState}
            onCycleState={handleCycleRoadState}
          />

          {/* Interactive 4-State Status Banner Over Road View */}
          {!showWelcome && !hasArrived && (
            <div className="absolute top-4 inset-x-4 z-20 pointer-events-none flex justify-center">
              {rideState === 'cruising' && (
                <div
                  role="status"
                  aria-live="polite"
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto bg-[#E3F4ED]/95 border-2 border-[#0D6E4E] rounded-2xl shadow-md px-5 py-2.5 flex flex-wrap items-center justify-center gap-3"
                >
                  <CheckCircle2
                    className="w-6 h-6 text-[#0D6E4E] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-[20px] font-extrabold text-[#084732]">
                    {activeCopy.badge}
                  </span>
                  <span className="text-[20px] font-medium text-[#0F233C]">
                    · Tap road view to cycle states
                  </span>
                </div>
              )}

              {rideState === 'slowdown' && (
                <div
                  role="alert"
                  aria-live="assertive"
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto w-full max-w-4xl bg-[#FEF3C7] border-2 border-[#D97706] rounded-2xl shadow-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <AlertTriangle
                      className="w-8 h-8 text-[#B45309] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <p className="text-[20px] font-extrabold text-[#78350F] leading-snug">
                      {activeCopy.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReplayVoice}
                    className="min-h-[52px] px-4 py-2 rounded-xl bg-white text-[#0F233C] border-2 border-[#78350F] hover:bg-[#FDE68A] text-[20px] font-extrabold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-6 h-6 shrink-0" aria-hidden="true" />
                    <span>Replay Voice</span>
                  </button>
                </div>
              )}

              {rideState === 'safe-failure' && (
                <div
                  role="alert"
                  aria-live="assertive"
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto w-full max-w-4xl bg-[#E9EFF5] border-2 border-[#3B6284] rounded-2xl shadow-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <ShieldCheck
                      className="w-8 h-8 text-[#0F233C] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="space-y-1">
                      <p className="text-[20px] font-extrabold text-[#B45309]">
                        {activeCopy.badge}
                      </p>
                      <p className="text-[20px] font-bold text-[#0F233C] leading-snug">
                        {activeCopy.message}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleReplayVoice}
                    className="min-h-[52px] px-4 py-2 rounded-xl bg-white text-[#0F233C] border-2 border-[#3B6284] hover:bg-[#DCE6EE] text-[20px] font-extrabold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-6 h-6 shrink-0" aria-hidden="true" />
                    <span>Replay Voice</span>
                  </button>
                </div>
              )}

              {rideState === 'arriving' && (
                <div
                  role="status"
                  aria-live="polite"
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto w-full max-w-4xl bg-[#E3F4ED] border-2 border-[#0D6E4E] rounded-2xl shadow-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <MapPin
                      className="w-8 h-8 text-[#0D6E4E] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <p className="text-[20px] font-extrabold text-[#084732] leading-snug">
                      {activeCopy.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReplayVoice}
                    className="min-h-[52px] px-4 py-2 rounded-xl bg-white text-[#0F233C] border-2 border-[#0D6E4E] hover:bg-[#D1FAE5] text-[20px] font-extrabold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-6 h-6 shrink-0" aria-hidden="true" />
                    <span>Replay Voice</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. INITIAL PASSENGER WELCOME OVERLAY */}
          {showWelcome && (
            <WelcomeOverlay onComplete={handleWelcomeComplete} />
          )}

          {/* 5. SAFE ARRIVAL OVERLAY AT 0 STOPS */}
          {hasArrived && (
            <ArrivalOverlay
              destinationName={selectedStop.name}
              exitDirections={selectedStop.exitDirections}
              onClearAndReset={handleRestartDemo}
            />
          )}
        </div>

        {/* 4. SPLIT-SCREEN HUMAN HELPER VIDEO CALL */}
        {helperCallOpen && (
          <HumanHelperPanel
            rideState={rideState}
            destinationName={selectedStop.name}
            stopsRemaining={stopsRemaining}
            voiceStyle={voiceStyle}
            onEndCall={() => setHelperCallOpen(false)}
          />
        )}
      </main>

      {/* 5. BOTTOM ROUTE COUNTDOWN & SAFE ARRIVAL BAR */}
      <RouteCountdownBar
        currentStopIndex={currentStopIndex}
        selectedStopIndex={selectedStopIndex}
        onAdvanceStop={handleAdvanceStop}
      />
    </div>
  );
}
