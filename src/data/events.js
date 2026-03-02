// Event cards (8 total) - Drawn at end of round if leader not in Airplane section

export const eventCards = [
  {
    id: 'road-construction',
    name: 'Road Construction',
    type: 'event',
    section: 'drive',
    imagePath: '/assets/cards/RoadConstruction.png',
    description: 'All players in Drive section lose 2 patience',
    effect: (player) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'drive') {
        return { patienceLoss: 2 };
      }
      return null;
    },
  },
  {
    id: 'traffic-jam',
    name: 'Traffic Jam',
    type: 'event',
    section: 'drive',
    imagePath: '/assets/cards/TrafficJam.png',
    description: 'All players in Drive section move back 2 spaces',
    effect: (player) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'drive') {
        return { moveBack: 2 };
      }
      return null;
    },
  },
  {
    id: 'coordination-conflict',
    name: 'Coordination Conflict',
    type: 'event',
    section: 'drive',
    imagePath: '/assets/cards/CoordConflict.png',
    description: 'All players in Drive vote: majority loses 1 patience, minority gains 1 patience',
    effect: (player, voteResults) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'drive') {
        return { requiresVote: true, voteResults };
      }
      return null;
    },
    requiresVoting: true,
  },
  {
    id: 'long-security-line',
    name: 'Long Security Line',
    type: 'event',
    section: 'security',
    imagePath: '/assets/cards/LongSecurityLine.png',
    description: 'All players in Security section lose 2 patience',
    effect: (player) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'security') {
        return { patienceLoss: 2 };
      }
      return null;
    },
  },
  {
    id: 'random-search',
    name: 'Random Search',
    type: 'event',
    section: 'security',
    imagePath: '/assets/cards/RandomSearch.png',
    description: 'All players in Security section move back 2 spaces',
    effect: (player) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'security') {
        return { moveBack: 2 };
      }
      return null;
    },
  },
  {
    id: 'coordination-conflight',
    name: 'Coordination Conflight',
    type: 'event',
    section: 'security',
    imagePath: '/assets/cards/CoordConflight.png',
    description: 'All players in Security vote: majority loses 1 patience, minority gains 1 patience',
    effect: (player, voteResults) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'security') {
        return { requiresVote: true, voteResults };
      }
      return null;
    },
    requiresVoting: true,
  },
  {
    id: 'gate-change',
    name: 'Gate Change',
    type: 'event',
    section: 'airplane',
    imagePath: '/assets/cards/GateChange.png',
    description: 'All players in Airplane section lose 2 patience',
    effect: (player) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'airplane') {
        return { patienceLoss: 2 };
      }
      return null;
    },
  },
  {
    id: 'flight-delay',
    name: 'Flight Delay',
    type: 'event',
    section: 'airplane',
    imagePath: '/assets/cards/FlightDelay.png',
    description: 'All players in Airplane section move back 2 spaces',
    effect: (player) => {
      const section = player.position <= 12 ? 'drive' : player.position <= 24 ? 'security' : 'airplane';
      if (section === 'airplane') {
        return { moveBack: 2 };
      }
      return null;
    },
  },
];

export function createEventDeck() {
  const deck = [...eventCards];
  // Shuffle the deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
