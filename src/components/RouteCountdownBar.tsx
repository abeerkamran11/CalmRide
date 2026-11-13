import { ChevronRight, MapPin } from 'lucide-react';
import { ROUTE_S1_STOPS } from '../data/calmRideData';

interface RouteCountdownBarProps {
  currentStopIndex: number;
  selectedStopIndex: number;
  onAdvanceStop: () => void;
}

export function RouteCountdownBar({
  currentStopIndex,
  selectedStopIndex,
  onAdvanceStop,
}: RouteCountdownBarProps) {
  const stopsRemaining = Math.max(0, selectedStopIndex - currentStopIndex);
  const selectedStop = ROUTE_S1_STOPS[selectedStopIndex];
  const isOneStopAway = stopsRemaining === 1;
  const hasArrived = stopsRemaining === 0;

  return (
    <footer
      role="button"
      tabIndex={0}
      aria-label="Route S1 stop progress bar. Click anywhere on this bar to advance to the next stop."
      onClick={onAdvanceStop}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAdvanceStop();
        }
      }}
      className={`shrink-0 border-t-2 transition-colors px-4 sm:px-6 py-2 cursor-pointer select-none ${
        isOneStopAway
          ? 'armrest-pulse border-[#D97706]'
          : 'bg-white border-[#3B6284] hover:bg-[#F3F6F9]'
      }`}
    >
      <div className="max-w-full mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* 5-Stop Visual Progress Line */}
        <div className="flex-1 flex items-center justify-between gap-1 sm:gap-2 overflow-hidden">
          {ROUTE_S1_STOPS.map((stop, idx) => {
            const isCurrent = idx === currentStopIndex;
            const isDest = idx === selectedStopIndex;
            const isPassed = idx < currentStopIndex;

            return (
              <div key={stop.id} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center text-center gap-0.5 min-w-[70px] sm:min-w-[100px] px-1">
                  <span
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-[#0D6E4E] border-[#0D6E4E] text-white'
                        : isDest
                        ? 'bg-[#D97706] border-[#78350F] text-white'
                        : isPassed
                        ? 'bg-[#3B6284] border-[#3B6284] text-white'
                        : 'bg-white border-[#3B6284] text-[#0F233C]'
                    }`}
                  >
                    {isDest ? (
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <span className="text-[15px] font-extrabold tabular-nums">
                        {idx + 1}
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-[20px] leading-tight truncate max-w-[145px] ${
                      isCurrent || isDest
                        ? 'font-extrabold text-[#0F233C]'
                        : isPassed
                        ? 'font-medium text-[#2B435E]'
                        : 'font-semibold text-[#0F233C]'
                    }`}
                  >
                    {stop.shortName}
                  </span>
                </div>

                {idx < ROUTE_S1_STOPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className={`h-1.5 flex-1 rounded-full mx-1 ${
                      idx < currentStopIndex ? 'bg-[#0D6E4E]' : 'bg-[#CBD5E1]'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Bold Countdown Badge / Armrest Pulse Notice */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 shrink-0">
          {isOneStopAway ? (
            <div
              role="status"
              aria-live="polite"
              className="px-3.5 py-1.5 rounded-2xl bg-[#FEF3C7] border-2 border-[#D97706] text-[#78350F] text-[20px] font-extrabold"
            >
              Approaching your stop — seat armrests vibrating gently.
            </div>
          ) : hasArrived ? (
            <div
              role="status"
              aria-live="polite"
              className="px-3.5 py-1.5 rounded-2xl bg-[#E3F4ED] border-2 border-[#0D6E4E] text-[#084732] text-[20px] font-extrabold"
            >
              Arrived at {selectedStop.name}
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-2xl bg-[#E9EFF5] border-2 border-[#3B6284] text-[#0F233C] text-[20px] font-extrabold tabular-nums">
              {stopsRemaining} {stopsRemaining === 1 ? 'stop' : 'stops'} until{' '}
              {selectedStop.name}
            </div>
          )}

          <span className="min-h-[44px] px-3.5 py-1.5 rounded-2xl bg-[#0F233C] text-white text-[20px] font-bold flex items-center gap-1 shrink-0">
            <span>Next Stop</span>
            <ChevronRight className="w-5 h-5 shrink-0" aria-hidden="true" />
          </span>
        </div>
      </div>
    </footer>
  );
}
