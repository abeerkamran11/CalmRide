import { VoiceStyle } from '../data/calmRideData';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => undefined);
  }
  return sharedAudioCtx;
}

export function playGentleChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);
      gain.gain.setValueAtTime(0.001, now + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.16, now + idx * 0.16 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 0.48);
    });
  } catch {
    // Graceful no-op
  }
}

export function triggerHaptic(
  pattern: number | number[] = [80, 50, 80],
): boolean {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  ) {
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }
  return false;
}

export function speakPlainText(
  text: string,
  options?: {
    voiceStyle?: VoiceStyle;
    onStart?: () => void;
    onEnd?: () => void;
  },
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onEnd?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const isWarm = options?.voiceStyle !== 'calm-standard';
    utterance.rate = isWarm ? 0.88 : 0.94;
    utterance.pitch = isWarm ? 1.05 : 0.96;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferred = isWarm
      ? voices.find((v) => v.lang.startsWith('en-GB')) ||
        voices.find((v) => v.lang.startsWith('en'))
      : voices.find((v) => v.lang.startsWith('en'));

    if (preferred) {
      utterance.voice = preferred;
    }

    utterance.onstart = () => options?.onStart?.();
    utterance.onend = () => options?.onEnd?.();
    utterance.onerror = () => options?.onEnd?.();

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    options?.onEnd?.();
    return false;
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}
