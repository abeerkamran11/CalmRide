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
    exitDirections: 'Bus shelter and chemist are right outside.',
  },
  {
    id: 'botanical-gardens',
    name: 'Botanical Gardens',
    shortName: 'Botanical Gardens',
    isDestinationOption: true,
    exitDirections: 'Gardens gate is 25 yards to your right.',
  },
  {
    id: 'hallamshire-hospital',
    name: 'Royal Hallamshire Hospital',
    shortName: 'Hallamshire Hospital',
    isDestinationOption: true,
    exitDirections: 'Outpatients doors are 30 yards straight ahead.',
  },
  {
    id: 'moor-market',
    name: 'Moor Market',
    shortName: 'Moor Market',
    isDestinationOption: true,
    exitDirections: 'Moor Market entrance is 40 yards left, past the crossing.',
  },
  {
    id: 'sheffield-centre',
    name: 'Sheffield City Centre',
    shortName: 'City Centre',
    isDestinationOption: true,
    exitDirections: 'Town Hall and Peace Gardens are 35 yards ahead.',
  },
];

export const SARAH_HELPER = {
  name: 'Sarah – Sheffield Control Centre',
  connectionBadge: 'Shuttle S1 • Seat #2 (Private)',
  greetingCaption:
    "Hello! I'm Sarah at Sheffield Control Centre. I can see Shuttle S1—you're completely safe. How can I help?",
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
    message: 'Clear road ahead.',
    spokenText: 'Road ahead is clear. Cruising smoothly at 18 miles per hour.',
  },
  slowdown: {
    badge: 'Slowing Safely',
    message: 'Slowing safely — delivery van parked ahead.',
    spokenText: 'Slowing down safely. There is a delivery van parked ahead.',
  },
  'safe-failure': {
    badge: 'Pulled Over Safely · Replacement in 3 mins',
    message:
      'Pulled over for roadworks. A replacement shuttle arrives in 3 mins.',
    spokenText:
      'Pulled over safely for roadworks. A replacement shuttle arrives in 3 minutes.',
  },
  arriving: {
    badge: 'Approaching Stop',
    message: 'Approaching your stop — pulling in smoothly.',
    spokenText: 'Approaching your stop now. Pulling in smoothly.',
  },
};
