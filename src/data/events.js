// Event cards — 8 total
// Yellow background, dark border, "EVENT" section bar

export const eventCards = [
  // Travel Delays ×3
  {
    id: 'travel-delays-1',
    name: 'Travel Delays',
    type: 'event',
    imagePath: '/assets/cards/TravelDelays.png',
    description: 'All players in your section, including yourself, move back 3 spaces.',
    effect: () => ({ moveBack: 3 }),
  },
  {
    id: 'travel-delays-2',
    name: 'Travel Delays',
    type: 'event',
    imagePath: '/assets/cards/TravelDelays.png',
    description: 'All players in your section, including yourself, move back 3 spaces.',
    effect: () => ({ moveBack: 3 }),
  },
  {
    id: 'travel-delays-3',
    name: 'Travel Delays',
    type: 'event',
    imagePath: '/assets/cards/TravelDelays.png',
    description: 'All players in your section, including yourself, move back 3 spaces.',
    effect: () => ({ moveBack: 3 }),
  },
  // Migraine ×1
  {
    id: 'migraine-1',
    name: 'Migraine',
    type: 'event',
    imagePath: '/assets/cards/Migraine.png',
    description: 'All players lose one patience.',
    effect: () => ({ patienceLoss: 1 }),
    affectsAll: true,
  },
  // Lost Luggage ×1
  {
    id: 'lost-luggage-1',
    name: 'Lost Luggage',
    type: 'event',
    imagePath: '/assets/cards/LostLuggage.png',
    description: 'All players in your section, including yourself, must discard all section specific cards of the section you are in. Then redraw up to six cards at the end of their next turn.',
    effect: () => ({ discardSectionCards: true }),
  },
  // Coordination Conflict ×3
  {
    id: 'coordination-conflict-1',
    name: 'Coordination Conflict',
    type: 'event',
    imagePath: '/assets/cards/CoordConflict.png',
    description: 'All players vote. Player with most votes must roll a dice and will choose to lose half of the dice roll in either Patience or Movement (Rounding up). In the event of a tie, player further forward is chosen.',
    effect: () => ({ patienceLoss: 1 }),
    requiresVoting: true,
  },
  {
    id: 'coordination-conflict-2',
    name: 'Coordination Conflict',
    type: 'event',
    imagePath: '/assets/cards/CoordConflict.png',
    description: 'All players vote. Player with most votes must roll a dice and will choose to lose half of the dice roll in either Patience or Movement (Rounding up). In the event of a tie, player further forward is chosen.',
    effect: () => ({ patienceLoss: 1 }),
    requiresVoting: true,
  },
  {
    id: 'coordination-conflict-3',
    name: 'Coordination Conflict',
    type: 'event',
    imagePath: '/assets/cards/CoordConflict.png',
    description: 'All players vote. Player with most votes must roll a dice and will choose to lose half of the dice roll in either Patience or Movement (Rounding up). In the event of a tie, player further forward is chosen.',
    effect: () => ({ patienceLoss: 1 }),
    requiresVoting: true,
  },
];

export function createEventDeck() {
  const deck = [...eventCards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
