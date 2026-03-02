// Annoyance cards (8 total) - Drawn at end of round if any player in Airplane section
// Only affect players in Airplane section

export const annoyanceCards = [
  {
    id: 'crying-baby-1',
    name: 'Crying Baby',
    type: 'annoyance',
    imagePath: '/assets/cards/CryingBaby.png',
    description: 'Lose 2 patience (1 with Captain\'s Friend)',
    effect: (player, annoyanceCount) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'airplane') {
        const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
        return { patienceLoss: hasCaptainsFriend ? 1 : 2 };
      }
      return null;
    },
  },
  {
    id: 'crying-baby-2',
    name: 'Crying Baby',
    type: 'annoyance',
    imagePath: '/assets/cards/CryingBaby.png',
    description: 'Lose 2 patience (1 with Captain\'s Friend)',
    effect: (player, annoyanceCount) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'airplane') {
        const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
        return { patienceLoss: hasCaptainsFriend ? 1 : 2 };
      }
      return null;
    },
  },
  {
    id: 'crying-baby-3',
    name: 'Crying Baby',
    type: 'annoyance',
    imagePath: '/assets/cards/CryingBaby.png',
    description: 'Lose 3 patience (1 with Captain\'s Friend) - Third Crying Baby',
    effect: (player, annoyanceCount) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'airplane') {
        const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
        // Third crying baby costs 3 patience instead of 2
        return { patienceLoss: hasCaptainsFriend ? 1 : 3 };
      }
      return null;
    },
    isThirdCryingBaby: true,
  },
  {
    id: 'turbulence',
    name: 'Turbulence',
    type: 'annoyance',
    imagePath: '/assets/cards/Turbulence.png',
    description: 'Lose 2 patience (1 with Captain\'s Friend)',
    effect: (player) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'airplane') {
        const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
        return { patienceLoss: hasCaptainsFriend ? 1 : 2 };
      }
      return null;
    },
  },
  {
    id: 'middle-seat',
    name: 'Middle Seat',
    type: 'annoyance',
    imagePath: '/assets/cards/MiddleSeat.png',
    description: 'Lose 2 patience (1 with Captain\'s Friend)',
    effect: (player) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'airplane') {
        const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
        return { patienceLoss: hasCaptainsFriend ? 1 : 2 };
      }
      return null;
    },
  },
  {
    id: 'lost-luggage',
    name: 'Lost Luggage',
    type: 'annoyance',
    imagePath: '/assets/cards/LostLuggage.png',
    description: 'Lose 2 patience (1 with Captain\'s Friend)',
    effect: (player) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'airplane') {
        const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
        return { patienceLoss: hasCaptainsFriend ? 1 : 2 };
      }
      return null;
    },
  },
  {
    id: 'broken-wifi',
    name: 'Broken Wi-Fi',
    type: 'annoyance',
    imagePath: '/assets/cards/BrokenWifi.png',
    description: 'Lose 2 patience (1 with Captain\'s Friend)',
    effect: (player) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'airplane') {
        const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
        return { patienceLoss: hasCaptainsFriend ? 1 : 2 };
      }
      return null;
    },
  },
  {
    id: 'stale-pretzels',
    name: 'Stale Pretzels',
    type: 'annoyance',
    imagePath: '/assets/cards/StalePretzels.png',
    description: 'Lose 2 patience (1 with Captain\'s Friend)',
    effect: (player) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'airplane') {
        const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
        return { patienceLoss: hasCaptainsFriend ? 1 : 2 };
      }
      return null;
    },
  },
];

export function createAnnoyanceDeck() {
  const deck = [...annoyanceCards];
  // Shuffle the deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
