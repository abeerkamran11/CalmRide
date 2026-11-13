export type UpdateLevel = 'important' | 'every-turn';
export type VoiceStyle = 'warm-local' | 'calm-standard';
export type RideState = 'cruising' | 'slowdown' | 'safe-failure' | 'arriving';

export interface RouteStop {
  id: string;
  name: string;
  shortName: string;
  isDestinationOption: boolean;
  exitDirections: string;
}

export const ROUTE_S1_STOPS: RouteStop[] = [
  {
    id: 'ecclesall-road',
    name: 'Ecclesall Road',
    shortName: 'Ecclesall Rd',
    isDestinationOption: false,
    exitDirections:
      'Before you step off: The corner chemist and wooden bus shelter are right beside the front doors.',
  },
  {
    id: 'botanical-gardens',
    name: 'Botanical Gardens',
    shortName: 'Botanical Gardens',
    isDestinationOption: true,
    exitDirections:
      'Before you step off: The stone Botanical Gardens gate is 25 yards to your right along the flat paved footpath.',
  },
  {
    id: 'hallamshire-hospital',
    name: 'Royal Hallamshire Hospital',
    shortName: 'Hallamshire Hospital',
    isDestinationOption: true,
    exitDirections:
      'Before you step off: Outpatients automatic glass doors are 30 yards straight ahead under the covered walkway.',
  },
  {
    id: 'moor-market',
    name: 'Moor Market',
    shortName: 'Moor Market',
    isDestinationOption: true,
    exitDirections:
      'Before you step off: Moor Market entrance is 40 yards to your left, past the zebra crossing.',
  },
  {
    id: 'sheffield-centre',
    name: 'Sheffield City Centre',
    shortName: 'City Centre',
    isDestinationOption: true,
    exitDirections:
      'Before you step off: Town Hall steps and Peace Gardens benches are 35 yards ahead past the clock tower.',
  },
];

export const SARAH_HELPER = {
  name: 'Sarah – Sheffield Control Centre',
  connectionBadge: 'Connected: Shuttle S1 • Seat #2 (Identity Private)',
  photoUrl: '/src/assets/images/steward_portrait_1794573002152.jpg',
  greetingCaption:
    "Hello! I'm Sarah at the Sheffield control centre. I can see Shuttle S1 and Seat 2—no personal details are shared. You're completely safe. How can I help?",
};

export const RIDE_STATE_COPY: Record<
  RideState,
  {
    badge: string;
    message: string;
    spokenText: string;
  }
> = {
  cruising: {
    badge: 'Cruising Smoothly — 18 mph',
    message: 'Clear road along Ecclesall Road. Everything is running smoothly.',
    spokenText: 'Road ahead is clear. Cruising smoothly at 18 miles per hour.',
  },
  slowdown: {
    badge: 'Slowing Down Safely',
    message:
      "Slowing down safely — I've spotted a delivery van parked ahead and am waiting for space to pass.",
    spokenText:
      "Slowing down safely. I've spotted a delivery van parked ahead and am waiting for space to pass.",
  },
  'safe-failure': {
    badge: 'Pulled Over Safely · Replacement On Way',
    message:
      "We've safely pulled over due to roadworks ahead. Sarah at Control Centre has already dispatched a replacement shuttle 3 minutes away—you don't need to do a thing.",
    spokenText:
      "We've safely pulled over due to roadworks ahead. Sarah at Control Centre has already dispatched a replacement shuttle 3 minutes away. You don't need to do a thing.",
  },
  arriving: {
    badge: 'Approaching Your Stop',
    message:
      'Approaching your destination — slowing smoothly toward the step-free curb.',
    spokenText:
      'Approaching your stop now. Slowing smoothly to pull right up to the pavement.',
  },
};
