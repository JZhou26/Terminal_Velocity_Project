// Card definitions for Terminal Velocity

// Helper to get section from position
export function getSection(position) {
  if (position <= 12) return 'drive';
  if (position <= 24) return 'security';
  return 'airplane';
}

// First tile of each section — used to clamp backwards movement
export const SECTION_STARTS = { drive: 1, security: 13, airplane: 25 };

// Basic Deck Cards (40 total per rulebook)
export const basicCards = [
  // Casual Traveler (x14) - Move 2 spaces. All Sections.
  ...Array(14).fill(null).map((_, i) => ({
    id: `casual-traveler-${i}`,
    name: 'Casual Traveler',
    type: 'basic',
    category: 'movement',
    section: 'all',
    imagePath: '/assets/cards/CASUALTRAVELER.png',
    description: 'Move forward 2 spaces. (All Sections)',
  })),

  // Calm Traveling (x8) - Gain 2 patience. All Sections.
  ...Array(8).fill(null).map((_, i) => ({
    id: `calm-traveling-${i}`,
    name: 'Calm Traveling',
    type: 'basic',
    category: 'patience',
    section: 'all',
    imagePath: '/assets/cards/CALMTRAVELING.png',
    description: 'Gain 2 patience. (All Sections)',
  })),

  // Seasoned Driver (x4) - Move 4 spaces. Drive Section.
  ...Array(4).fill(null).map((_, i) => ({
    id: `seasoned-driver-${i}`,
    name: 'Seasoned Driver',
    type: 'basic',
    category: 'movement',
    section: 'drive',
    imagePath: '/assets/cards/SeasonedDriver.png',
    description: 'Move forward 4 spaces. (Drive Section)',
  })),

  // Reckless Driver (x2) - Roll a dice, move forward that many spaces. Drive Section.
  ...Array(2).fill(null).map((_, i) => ({
    id: `reckless-driver-${i}`,
    name: 'Reckless Driver',
    type: 'basic',
    category: 'special',
    section: 'drive',
    imagePath: '/assets/cards/RecklessDriver.png',
    description: 'Roll a dice, move forward that many spaces. (Drive Section)',
    requiresDice: true,
  })),

  // TSA Veteran (x4) - Move 4 spaces. Security Section.
  ...Array(4).fill(null).map((_, i) => ({
    id: `tsa-veteran-${i}`,
    name: 'TSA Veteran',
    type: 'basic',
    category: 'movement',
    section: 'security',
    imagePath: '/assets/cards/TSAVeteran.png',
    description: 'Move forward 4 spaces. (Security Section)',
  })),

  // Security Rush (x2) - Roll a dice, move forward that many spaces. Security Section.
  ...Array(2).fill(null).map((_, i) => ({
    id: `security-rush-${i}`,
    name: 'Security Rush',
    type: 'basic',
    category: 'special',
    section: 'security',
    imagePath: '/assets/cards/SecurityRush.png',
    description: 'Roll a dice, move forward that many spaces. (Security Section)',
    requiresDice: true,
  })),

  // Savvy Flyer (x4) - Move 4 spaces. Airplane Section.
  ...Array(4).fill(null).map((_, i) => ({
    id: `savvy-flyer-${i}`,
    name: 'Savvy Flyer',
    type: 'basic',
    category: 'movement',
    section: 'airplane',
    imagePath: '/assets/cards/SavvyFlyer.png',
    description: 'Move forward 4 spaces. (Airplane Section)',
  })),

  // Cutting It Close (x2) - Roll a dice, move forward that many spaces. Airplane Section.
  ...Array(2).fill(null).map((_, i) => ({
    id: `cutting-it-close-${i}`,
    name: 'Cutting It Close',
    type: 'basic',
    category: 'special',
    section: 'airplane',
    imagePath: '/assets/cards/CuttingitClose.png',
    description: 'Roll a dice, move forward that many spaces. (Airplane Section)',
    requiresDice: true,
  })),
];

// Market Deck Cards (31 total per rulebook)
export const marketCards = [
  // Annoying Traveler (x8) - Choose a player, roll dice, move them back that many spaces. All Sections.
  ...Array(8).fill(null).map((_, i) => ({
    id: `annoying-traveler-${i}`,
    name: 'Annoying Traveler',
    type: 'market',
    category: 'special',
    section: 'all',
    imagePath: '/assets/cards/AnnoyingTraveler.png',
    description: 'Choose a player. Roll a dice and move them back that many spaces. (All Sections)',
    requiresDice: true,
    targetsOtherPlayer: true,
  })),

  // Relaxing Spa (x8) - Gain 4 patience. All Sections.
  ...Array(8).fill(null).map((_, i) => ({
    id: `relaxing-spa-${i}`,
    name: 'Relaxing Spa',
    type: 'market',
    category: 'patience',
    section: 'all',
    imagePath: '/assets/cards/RelaxingSpa.png',
    description: 'Gain 4 patience. (All Sections)',
  })),

  // HOV Lane (x1) - If in last place, move forward 6 spaces. Drive Section.
  ...Array(1).fill(null).map((_, i) => ({
    id: `hov-lane-${i}`,
    name: 'HOV Lane',
    type: 'market',
    category: 'movement',
    section: 'drive',
    imagePath: '/assets/cards/HOVLANE.png',
    description: 'If in last place, move forward 6 spaces. (Drive Section)',
    requiresLastPlace: true,
  })),

  // Express Lane (x1) - If in last place, move forward 6 spaces. Security Section.
  ...Array(1).fill(null).map((_, i) => ({
    id: `express-lane-${i}`,
    name: 'Express Lane',
    type: 'market',
    category: 'movement',
    section: 'security',
    imagePath: '/assets/cards/Express Lane.png',
    description: 'If in last place, move forward 6 spaces. (Security Section)',
    requiresLastPlace: true,
  })),

  // Empty Row (x1) - If in last place, move forward 6 spaces. Airplane Section.
  ...Array(1).fill(null).map((_, i) => ({
    id: `empty-row-${i}`,
    name: 'Empty Row',
    type: 'market',
    category: 'movement',
    section: 'airplane',
    imagePath: '/assets/cards/EmptyRow.png',
    description: 'If in last place, move forward 6 spaces. (Airplane Section)',
    requiresLastPlace: true,
  })),

  // Hands Free Device (x4) - Cancel an event for you in the Drive Section. Played reactively.
  ...Array(4).fill(null).map((_, i) => ({
    id: `hands-free-device-${i}`,
    name: 'Hands Free Device',
    type: 'market',
    category: 'cancel',
    section: 'drive',
    imagePath: '/assets/cards/HandsFreeDevice.png',
    description: 'Cancel an event for you in the Drive Section. Played reactively.',
    isReactive: true,
  })),

  // Security Escort (x4) - Cancel an event for you in the Security Section. Played reactively.
  ...Array(4).fill(null).map((_, i) => ({
    id: `security-escort-${i}`,
    name: 'Security Escort',
    type: 'market',
    category: 'cancel',
    section: 'security',
    imagePath: '/assets/cards/SecurityEscort.png',
    description: 'Cancel an event for you in the Security Section. Played reactively.',
    isReactive: true,
  })),

  // Complimentary Upgrade (x4) - Cancel an event for you in the Airplane Section. Played reactively.
  ...Array(4).fill(null).map((_, i) => ({
    id: `complimentary-upgrade-${i}`,
    name: 'Complimentary Upgrade',
    type: 'market',
    category: 'cancel',
    section: 'airplane',
    imagePath: '/assets/cards/ComplimentaryUpgrade.png',
    description: 'Cancel an event for you in the Airplane Section. Played reactively.',
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
    imagePath: '/assets/illustrations/expert-traveler.png',
    description: 'Section-specific movement cards are now applicable for all sections.',
    cost: 4,
    isPermanent: true,
  },
  {
    id: 'seasoned-traveler',
    name: 'Seasoned Traveler',
    type: 'upgrade',
    category: 'special',
    section: 'all',
    imagePath: '/assets/illustrations/seasoned-traveler.png',
    description: 'All Casual Traveler cards now move forward 3 instead of 2.',
    cost: 4,
    isPermanent: true,
  },
  {
    id: 'emergency-brake',
    name: 'Emergency Brake',
    type: 'upgrade',
    category: 'special',
    section: 'all',
    imagePath: '/assets/illustrations/emergency-brake.png',
    description: 'Ignore all events in the Drive Section.',
    cost: 4,
    isPermanent: true,
  },
  {
    id: 'tsa-precheck',
    name: 'TSA Precheck',
    type: 'upgrade',
    category: 'special',
    section: 'all',
    imagePath: '/assets/illustrations/tsa-precheck.png',
    description: 'Ignore all events in the Security Section.',
    cost: 5,
    isPermanent: true,
  },
  {
    id: 'captains-friend',
    name: "Captain's Friend",
    type: 'upgrade',
    category: 'special',
    section: 'all',
    imagePath: '/assets/illustrations/captains-friend.png',
    description: 'All Annoyance events will be reduced to only losing 1 patience.',
    cost: 4,
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
