import { useState } from 'react';
import {
  MapPin,
  Bell,
  ArrowRight,
  Volume2,
  ShieldCheck,
  CreditCard,
  Check,
} from 'lucide-react';
import {
  ROUTE_S1_STOPS,
  RouteStop,
  UpdateLevel,
  VoiceStyle,
} from '../data/calmRideData';

interface WelcomeOverlayProps {
  onComplete: (
    destination: RouteStop | null,
    updateLevel: UpdateLevel,
    voiceStyle: VoiceStyle,
  ) => void;
}

export function WelcomeOverlay({ onComplete }: WelcomeOverlayProps) {
  const [step, setStep] = useState<'destination' | 'preferences'>('destination');
  const [chosenDest, setChosenDest] = useState<RouteStop | null>(null);
  const [updateLevel, setUpdateLevel] = useState<UpdateLevel>('important');
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('warm-local');
  const [helperCardApplied, setHelperCardApplied] = useState<boolean>(false);

  const destinationOptions = ROUTE_S1_STOPS.filter((s) => s.isDestinationOption);

  const handlePickDestination = (stop: RouteStop) => {
    setChosenDest(stop);
    setStep('preferences');
  };

  const handleApplyHelperCard = () => {
    setUpdateLevel('every-turn');
    setVoiceStyle('warm-local');
    setHelperCardApplied(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-card-title"
      className="absolute inset-0 z-30 bg-[#0F233C]/55 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div className="w-full max-w-4xl bg-[#FAF9F5] border-2 border-[#3B6284] rounded-3xl shadow-2xl p-5 sm:p-6 space-y-3.5">
        {/* Calm Green Privacy Pill Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 bg-[#E3F4ED] border-2 border-[#0D6E4E] text-[#084732] px-3.5 py-1 rounded-full">
            <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="text-[20px] font-bold leading-tight">
              Private Seat Session • Zero personal data collected or stored
            </span>
          </div>
          <span className="text-[20px] font-bold text-[#0D6E4E]">
            Route S1 · Sheffield Shuttle
          </span>
        </div>

        {step === 'destination' ? (
          <>
            <div className="space-y-0.5">
              <h2
                id="welcome-card-title"
                className="text-2xl sm:text-3xl font-extrabold text-[#0F233C]"
              >
                Welcome aboard! No account or login needed.
              </h2>
              <p className="text-[20px] font-semibold text-[#2B435E]">
                Where are you heading today?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {destinationOptions.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => handlePickDestination(stop)}
                  className="min-h-[64px] px-4 py-3 rounded-2xl bg-white border-2 border-[#3B6284] hover:bg-[#E3F4ED] hover:border-[#0D6E4E] text-left flex items-center justify-between gap-3 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <MapPin
                      className="w-6 h-6 text-[#0D6E4E] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-[20px] font-extrabold text-[#0F233C] leading-snug">
                      {stop.name}
                    </span>
                  </span>
                  <ArrowRight
                    className="w-5 h-5 text-[#3B6284] shrink-0"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-0.5">
              <button
                type="button"
                onClick={handleApplyHelperCard}
                className={`flex-1 w-full min-h-[56px] px-4 py-2.5 rounded-2xl border-2 text-[20px] font-bold flex items-center justify-center gap-2.5 transition-colors cursor-pointer ${
                  helperCardApplied
                    ? 'bg-[#E3F4ED] text-[#084732] border-[#0D6E4E]'
                    : 'bg-[#E9EFF5] text-[#0F233C] border-[#3B6284] hover:bg-[#DCE6EE]'
                }`}
              >
                {helperCardApplied ? (
                  <>
                    <Check className="w-6 h-6 shrink-0" aria-hidden="true" />
                    <span>Calm preferences applied</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6 shrink-0" aria-hidden="true" />
                    <span>
                      Using a Council Helper Card? Tap to apply calm preferences
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onComplete(null, updateLevel, voiceStyle)}
                className="min-h-[56px] px-5 py-2.5 rounded-2xl text-[20px] font-semibold text-[#2B435E] underline underline-offset-4 hover:text-[#0F233C] shrink-0 cursor-pointer"
              >
                Skip — just enjoy the ride
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-0.5">
              <p className="text-[20px] font-bold text-[#0D6E4E]">
                Destination set: {chosenDest?.name}
              </p>
              <h2
                id="welcome-card-title"
                className="text-2xl sm:text-3xl font-extrabold text-[#0F233C]"
              >
                Choose how you&apos;d like your updates
              </h2>
            </div>

            {/* Two Preference Toggles Side-by-Side so Card Fits Cleanly */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[20px] font-bold text-[#0F233C]">
                  Update Level
                </p>
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    aria-pressed={updateLevel === 'important'}
                    onClick={() => setUpdateLevel('important')}
                    className={`min-h-[54px] px-4 py-2.5 rounded-2xl border-2 text-[20px] font-bold transition-colors cursor-pointer ${
                      updateLevel === 'important'
                        ? 'bg-[#0D6E4E] text-white border-[#0D6E4E]'
                        : 'bg-white text-[#0F233C] border-[#3B6284] hover:bg-[#E9EFF5]'
                    }`}
                  >
                    Only Important Updates
                  </button>
                  <button
                    type="button"
                    aria-pressed={updateLevel === 'every-turn'}
                    onClick={() => setUpdateLevel('every-turn')}
                    className={`min-h-[54px] px-4 py-2.5 rounded-2xl border-2 text-[20px] font-bold transition-colors cursor-pointer ${
                      updateLevel === 'every-turn'
                        ? 'bg-[#0D6E4E] text-white border-[#0D6E4E]'
                        : 'bg-white text-[#0F233C] border-[#3B6284] hover:bg-[#E9EFF5]'
                    }`}
                  >
                    Gentle Updates Every Turn
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[20px] font-bold text-[#0F233C] flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-[#3B6284]" aria-hidden="true" />
                  <span>Voice Style</span>
                </p>
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    aria-pressed={voiceStyle === 'warm-local'}
                    onClick={() => setVoiceStyle('warm-local')}
                    className={`min-h-[54px] px-4 py-2.5 rounded-2xl border-2 text-[20px] font-bold transition-colors cursor-pointer ${
                      voiceStyle === 'warm-local'
                        ? 'bg-[#0F233C] text-white border-[#0F233C]'
                        : 'bg-white text-[#0F233C] border-[#3B6284] hover:bg-[#E9EFF5]'
                    }`}
                  >
                    Warm Local Voice
                  </button>
                  <button
                    type="button"
                    aria-pressed={voiceStyle === 'calm-standard'}
                    onClick={() => setVoiceStyle('calm-standard')}
                    className={`min-h-[54px] px-4 py-2.5 rounded-2xl border-2 text-[20px] font-bold transition-colors cursor-pointer ${
                      voiceStyle === 'calm-standard'
                        ? 'bg-[#0F233C] text-white border-[#0F233C]'
                        : 'bg-white text-[#0F233C] border-[#3B6284] hover:bg-[#E9EFF5]'
                    }`}
                  >
                    Calm Standard Voice
                  </button>
                </div>
              </div>
            </div>

            {/* Armrest Vibration Notice */}
            <div className="bg-[#E3F4ED] border-2 border-[#0D6E4E] rounded-2xl px-4 py-3 flex items-center gap-3">
              <Bell
                className="w-7 h-7 text-[#084732] shrink-0"
                aria-hidden="true"
              />
              <p className="text-[20px] font-semibold text-[#084732]">
                When we are 1 stop away, your seat armrests will gently vibrate so you never miss your stop.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onComplete(chosenDest, updateLevel, voiceStyle)}
              className="w-full min-h-[60px] px-6 py-3 rounded-2xl bg-[#0D6E4E] text-white border-2 border-[#0D6E4E] hover:bg-[#084732] text-2xl font-extrabold flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Start My Ride</span>
              <ArrowRight className="w-6 h-6 shrink-0" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
