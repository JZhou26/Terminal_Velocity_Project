// Card definitions for Terminal Velocity

// Helper to get section from position
export function getSection(position) {
  if (position <= 12) return 'drive';
  if (position <= 24) return 'security';
  return 'airplane';
}

// Basic Deck Cards (40 total)
export const basicCards = [
  // Casual Traveler (x12) - Move 2 spaces in Drive section
  ...Array(12).fill(null).map((_, i) => ({
    id: `casual-traveler-${i}`,
    name: 'Casual Traveler',
    type: 'basic',
    category: 'movement',
    section: 'drive',
    imagePath: '/assets/cards/CASUALTRAVELER.png',
    description: 'Move 2 spaces (3 with Seasoned Traveler)',
  })),

  // Calm Traveling (x10) - Gain 1 patience
  ...Array(10).fill(null).map((_, i) => ({
    id: `calm-traveling-${i}`,
    name: 'Calm Traveling',
    type: 'basic',
    category: 'patience',
    section: 'all',
    imagePath: '/assets/cards/CALMTRAVELING.png',
    description: 'Gain 1 patience',
  })),

  // HOV Lane (x8) - Move 3 spaces in Drive section
  ...Array(8).fill(null).map((_, i) => ({
    id: `hov-lane-${i}`,
    name: 'HOV Lane',
    type: 'basic',
    category: 'movement',
    section: 'drive',
    imagePath: '/assets/cards/HOVLANE.png',
    description: 'Move 3 spaces',
  })),

  // Reckless Driver (x5) - Roll die, move that many, lose 1 patience
  ...Array(5).fill(null).map((_, i) => ({
    id: `reckless-driver-${i}`,
    name: 'Reckless Driver',
    type: 'basic',
    category: 'special',
    section: 'drive',
    imagePath: '/assets/cards/RecklessDriver.png',
    description: 'Roll die, move that many spaces, lose 1 patience',
    requiresDice: true,
  })),

  // Annoying Traveler (x5) - Roll die: 1-3 lose 1 patience, 4-6 move 2 spaces
  ...Array(5).fill(null).map((_, i) => ({
    id: `annoying-traveler-${i}`,
    name: 'Annoying Traveler',
    type: 'basic',
    category: 'special',
    section: 'all',
    imagePath: '/assets/cards/AnnoyingTraveler.png',
    description: 'Roll die: 1-3 lose 1 patience, 4-6 move 2 spaces',
    requiresDice: true,
  })),
];

// Market Deck Cards (31 total)
export const marketCards = [
  // Express Lane (x5) - Move 3 spaces in Security section
  ...Array(5).fill(null).map((_, i) => ({
    id: `express-lane-${i}`,
    name: 'Express Lane',
    type: 'market',
    category: 'movement',
    section: 'security',
    imagePath: '/assets/cards/Express Lane.png',
    description: 'Move 3 spaces',
  })),

  // Relaxing Spa (x4) - Gain 2 patience
  ...Array(4).fill(null).map((_, i) => ({
    id: `relaxing-spa-${i}`,
    name: 'Relaxing Spa',
    type: 'market',
    category: 'patience',
    section: 'all',
    imagePath: '/assets/cards/RelaxingSpa.png',
    description: 'Gain 2 patience',
  })),

  // TSA Precheck (x3) - Move 4 spaces in Security section
  ...Array(3).fill(null).map((_, i) => ({
    id: `tsa-precheck-${i}`,
    name: 'TSA Precheck',
    type: 'market',
    category: 'movement',
    section: 'security',
    imagePath: '/assets/cards/TSAPrecheck.png',
    description: 'Move 4 spaces',
  })),

  // Hands Free Device (x3) - Move 4 spaces in Drive section
  ...Array(3).fill(null).map((_, i) => ({
    id: `hands-free-device-${i}`,
    name: 'Hands Free Device',
    type: 'market',
    category: 'movement',
    section: 'drive',
    imagePath: '/assets/cards/HandsFreeDevice.png',
    description: 'Move 4 spaces',
  })),

  // Complimentary Upgrade (x3) - Move 3 spaces in Airplane section
  ...Array(3).fill(null).map((_, i) => ({
    id: `complimentary-upgrade-${i}`,
    name: 'Complimentary Upgrade',
    type: 'market',
    category: 'movement',
    section: 'airplane',
    imagePath: '/assets/cards/ComplimentaryUpgrade.png',
    description: 'Move 3 spaces',
  })),

  // Empty Row (x3) - Move 4 spaces in Airplane section
  ...Array(3).fill(null).map((_, i) => ({
    id: `empty-row-${i}`,
    name: 'Empty Row',
    type: 'market',
    category: 'movement',
    section: 'airplane',
    imagePath: '/assets/cards/EmptyRow.png',
    description: 'Move 4 spaces',
  })),

  // Cutting It Close (x3) - Move 2 spaces, lose 1 patience
  ...Array(3).fill(null).map((_, i) => ({
    id: `cutting-it-close-${i}`,
    name: 'Cutting It Close',
    type: 'market',
    category: 'special',
    section: 'all',
    imagePath: '/assets/cards/CuttingitClose.png',
    description: 'Move 2 spaces, lose 1 patience',
  })),

  // Baggage Claim (x2) - Move 5 spaces in Airplane section
  ...Array(2).fill(null).map((_, i) => ({
    id: `baggage-claim-${i}`,
    name: 'Baggage Claim',
    type: 'market',
    category: 'movement',
    section: 'airplane',
    imagePath: '/assets/cards/BaggageClaim.png',
    description: 'Move 5 spaces',
  })),

  // Smooth Flight (x2) - Gain 3 patience
  ...Array(2).fill(null).map((_, i) => ({
    id: `smooth-flight-${i}`,
    name: 'Smooth Flight',
    type: 'market',
    category: 'patience',
    section: 'all',
    imagePath: '/assets/cards/SmoothFlight.png',
    description: 'Gain 3 patience',
  })),

  // Cancel Card (x3) - Cancel an Event or Annoyance card
  ...Array(3).fill(null).map((_, i) => ({
    id: `cancel-${i}`,
    name: 'Cancel',
    type: 'market',
    category: 'cancel',
    section: 'all',
    imagePath: '/assets/cards/Cancel.png',
    description: 'Cancel an Event or Annoyance card',
    isReactive: true,
  })),
];

// Upgrade Cards (5 total - always visible in market)
export const upgradeCards = [
  {
    id: 'expert-traveler',
    name: 'Expert Traveler',
    type: 'upgrade',
    category: 'special',
    section: 'all',
    imagePath: '/assets/cards/ExpertTraveler.png',
    description: 'Remove section restrictions on movement cards',
    cost: 3,
    isPermanent: true,
  },
  {
    id: 'seasoned-traveler',
    name: 'Seasoned Traveler',
    type: 'upgrade',
    category: 'special',
    section: 'all',
    imagePath: '/assets/cards/SeasonedTraveler.png',
    description: 'Casual Traveler moves 3 spaces instead of 2',
    cost: 2,
    isPermanent: true,
  },
  {
    id: 'emergency-brake',
    name: 'Emergency Brake',
    type: 'upgrade',
    category: 'special',
    section: 'drive',
    imagePath: '/assets/cards/EmergencyBrake.png',
    description: 'Immune to Events while in Drive section',
    cost: 2,
    isPermanent: true,
  },
  {
    id: 'tsa-precheck-upgrade',
    name: 'TSA Precheck',
    type: 'upgrade',
    category: 'special',
    section: 'security',
    imagePath: '/assets/cards/TSAPrecheck.png',
    description: 'Immune to Events while in Security section',
    cost: 2,
    isPermanent: true,
  },
  {
    id: 'captains-friend',
    name: "Captain's Friend",
    type: 'upgrade',
    category: 'special',
    section: 'airplane',
    imagePath: '/assets/cards/CapitainsFriend.png',
    description: 'Annoyance cards only cost 1 patience',
    cost: 3,
    isPermanent: true,
  },
];

// Combine all cards for easy access
export const allCards = {
  basic: basicCards,
  market: marketCards,
  upgrades: upgradeCards,
};

// Helper function to create a shuffled deck
export function createShuffledDeck(cards) {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
