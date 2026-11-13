# CalmRide — Sheffield Route S1 Seatback Companion

**CalmRide** is a single-screen, tablet-style in-shuttle seatback web application designed for older adults and first-time passengers riding a council-run autonomous driverless shuttle along **Route S1: Ecclesall Road → Sheffield City Centre**.

It focuses on calm, plain-language reassurance, high-contrast legibility, spoken audio updates, live human helper support, and **Privacy by Design** (zero personal data collected or stored).

---

## Key Features

1. **Single-Screen Seatback Layout**
   - Designed to fit cleanly within a tablet/desktop viewport (`h-screen w-screen overflow-hidden`) with a persistent top header bar, central road perspective view, optional split-screen helper panel, and bottom route progress bar.
   - High-contrast color palette (warm off-white `#FAF9F5`, deep navy `#0F233C`, soft slate blue `#3B6284`, calm emerald `#0D6E4E`, and warm amber `#D97706`) with minimum `20px` body typography (`Plus Jakarta Sans` & `Public Sans`).

2. **Anonymous Welcome & Preferences Overlay (`WelcomeOverlay.tsx`)**
   - One-tap destination selection across Route S1 stops (**Botanical Gardens**, **Royal Hallamshire Hospital**, **Moor Market**, **Sheffield City Centre**) or **Skip — just enjoy the ride**.
   - Optional **Using a Council Helper Card?** shortcut that applies calm settings (*Gentle Updates Every Turn* + *Warm Local Voice*).
   - Preference toggles for **Frequency of updates** and **Voice Style**, plus notice of 1-stop armrest vibration alerts.

3. **2.5D Driver's Perspective & Interactive Ride States (`RoadPerspectiveCanvas.tsx`)**
   - Real-time HTML5 `<canvas>` 2.5D forward-looking Sheffield street view with glowing, non-technical **"Proof It Sees"** object highlights (`Person Spotted — Giving Extra Space`, `Parked Van — Waiting Safely`, `Roadworks Ahead — Pulled Over Safely`, `Your Bus Stop — Pulling In Safely`).
   - Clicking anywhere on the road view cycles smoothly through four ride states:
     1. **Cruising Smoothly — 18 mph**
     2. **Slowing Safely** (parked delivery van ahead)
     3. **Pulled Over Safely · Replacement in 3 mins** (roadworks recovery mode)
     4. **Approaching Stop**
   - Automatically speaks plain-language explanations via the browser Web Speech API (`window.speechSynthesis`) with a **Replay Voice** button.

4. **Split-Screen Human Helper Call (`HumanHelperPanel.tsx`)**
   - Tapping **Speak to a Human Helper** opens a right-hand split-screen panel while keeping the road view visible on the left.
   - Connects anonymously (`Shuttle S1 • Seat #2 (Private)`) to **Sarah – Sheffield Control Centre** with an animated speaking waveform, live closed captions, spoken greeting, and three one-tap quick-question buttons (*"Why did we just stop?"*, *"Will I still make my stop on time?"*, *"Can you stay on the line until we move?"*).

5. **Route Countdown, Armrest Alert & Safe Arrival (`RouteCountdownBar.tsx`, `ArrivalOverlay.tsx`)**
   - Clicking anywhere on the bottom 5-stop Route S1 progress bar advances stops for easy demonstration.
   - At **1 stop away**, pulses gently with *"1 stop away — armrests vibrating gently."* and triggers `navigator.vibrate` where supported.
   - At **0 stops (Arrived)**, displays concise landmark-based exit directions, a scannable QR code so passengers can send an *"I've Arrived"* text from their own phone, a 3-face comfort check (*Anxious*, *Okay*, *Very Calm*), and a **Finish & Clear Screen Now** button with an automatic 45-second session-wipe countdown.

---

## Project Structure

```text
├── index.html
├── package.json
├── src/
│   ├── App.tsx                             # Main single-screen layout & ride state orchestrator
│   ├── index.css                           # Tailwind v4 theme, 20px body typography, animations
│   ├── main.tsx                            # React entry point
│   ├── data/
│   │   └── calmRideData.ts                 # Route S1 stops, exit directions, ride state copy
│   ├── utils/
│   │   └── audioFeedback.ts                # Web Speech API TTS, gentle Web Audio chime, haptics
│   └── components/
│       ├── WelcomeOverlay.tsx              # Anonymous welcome, Council Helper Card & preferences
│       ├── RoadPerspectiveCanvas.tsx       # 2.5D forward-looking road & Proof-It-Sees overlays
│       ├── HumanHelperPanel.tsx            # Split-screen Sarah helper call, captions & quick Qs
│       ├── RouteCountdownBar.tsx           # Persistent bottom 5-stop progress & countdown bar
│       └── ArrivalOverlay.tsx              # Exit directions, QR card, feeling check & auto-wipe
```

---

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm

### Installation & Development

```bash
# Install dependencies
npm install

# Start the development server on http://localhost:3000
npm run dev
```

### Build & Type Check

```bash
# Type-check with TypeScript
npm run lint

# Build production bundle
npm run build
```
