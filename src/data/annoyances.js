// Annoyance cards — 8 total
// Red background, white border, "ANNOYANCE" section bar

export const annoyanceCards = [
  // Crying Baby ×3 — progressive patience loss based on annoyanceCount
  // effect(player, annoyanceCount): annoyanceCount is 0-indexed (0 = 1st annoyance this game)
  {
    id: 'crying-baby-1',
    name: 'Crying Baby',
    type: 'annoyance',
    imagePath: '/assets/cards/CryingBaby.png',
    description: 'Lose progressively more patience based on how many Annoyance events have happened. 1st Annoyance — Lose 1 patience. 2nd Annoyance — Lose 2 patience. 3rd+ Annoyance — Lose 3 patience.',
    effect: (player, annoyanceCount) => {
      const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
      const base = annoyanceCount <= 0 ? 1 : annoyanceCount === 1 ? 2 : 3;
      return { patienceLoss: hasCaptainsFriend ? 1 : base };
    },
  },
  {
    id: 'crying-baby-2',
    name: 'Crying Baby',
    type: 'annoyance',
    imagePath: '/assets/cards/CryingBaby.png',
    description: 'Lose progressively more patience based on how many Annoyance events have happened. 1st Annoyance — Lose 1 patience. 2nd Annoyance — Lose 2 patience. 3rd+ Annoyance — Lose 3 patience.',
    effect: (player, annoyanceCount) => {
      const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
      const base = annoyanceCount <= 0 ? 1 : annoyanceCount === 1 ? 2 : 3;
      return { patienceLoss: hasCaptainsFriend ? 1 : base };
    },
  },
  {
    id: 'crying-baby-3',
    name: 'Crying Baby',
    type: 'annoyance',
    imagePath: '/assets/cards/CryingBaby.png',
    description: 'Lose progressively more patience based on how many Annoyance events have happened. 1st Annoyance — Lose 1 patience. 2nd Annoyance — Lose 2 patience. 3rd+ Annoyance — Lose 3 patience.',
    effect: (player, annoyanceCount) => {
      const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
      const base = annoyanceCount <= 0 ? 1 : annoyanceCount === 1 ? 2 : 3;
      return { patienceLoss: hasCaptainsFriend ? 1 : base };
    },
  },
  // Middle Seat ×2
  {
    id: 'middle-seat-1',
    name: 'Middle Seat',
    type: 'annoyance',
    imagePath: '/assets/cards/MiddleSeat.png',
    description: 'All players lose two patience.',
    effect: (player) => {
      const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
      return { patienceLoss: hasCaptainsFriend ? 1 : 2 };
    },
  },
  {
    id: 'middle-seat-2',
    name: 'Middle Seat',
    type: 'annoyance',
    imagePath: '/assets/cards/MiddleSeat.png',
    description: 'All players lose two patience.',
    effect: (player) => {
      const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
      return { patienceLoss: hasCaptainsFriend ? 1 : 2 };
    },
  },
  // Baggage Claim Issues ×2
  {
    id: 'baggage-claim-1',
    name: 'Baggage Claim Issues',
    type: 'annoyance',
    imagePath: '/assets/cards/BaggageClaim.png',
    description: 'All players must discard any cards in their hand that give patience. Player with Captain\'s Friend can keep up to 1 card that would have been discarded.',
    // discardPatienceCards: true — handler must remove patience cards from each player's hand
    effect: (player) => {
      const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
      return { discardPatienceCards: true, captainsFriendKeep: hasCaptainsFriend ? 1 : 0 };
    },
  },
  {
    id: 'baggage-claim-2',
    name: 'Baggage Claim Issues',
    type: 'annoyance',
    imagePath: '/assets/cards/BaggageClaim.png',
    description: 'All players must discard any cards in their hand that give patience. Player with Captain\'s Friend can keep up to 1 card that would have been discarded.',
    effect: (player) => {
      const hasCaptainsFriend = player.upgrades.some(u => u.id === 'captains-friend');
      return { discardPatienceCards: true, captainsFriendKeep: hasCaptainsFriend ? 1 : 0 };
    },
  },
  // Coordination Conflict ×1
  {
    id: 'annoyance-conflict-1',
    name: 'Coordination Conflict',
    type: 'annoyance',
    imagePath: '/assets/cards/CoordConflict.png',
    description: 'All players vote. Player with most votes must roll a dice and will lose half of the dice roll in Patience (Rounding up). In the event of a tie, player further forward is chosen.',
    effect: () => ({ patienceLoss: 1 }),
    requiresVoting: true,
  },
];

export function createAnnoyanceDeck() {
  const deck = [...annoyanceCards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
