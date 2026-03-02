import { basicCards, marketCards, upgradeCards } from '../data/cards';
import { eventCards } from '../data/events';
import { annoyanceCards } from '../data/annoyances';
import { shuffle, drawCards } from './deckManager';

export function initializeGame(playerNames) {
  // Create and shuffle decks
  const basicDrawPile = shuffle(basicCards);
  const marketDrawPile = shuffle(marketCards);
  const eventDeck = shuffle(eventCards);
  const annoyanceDeck = shuffle(annoyanceCards);

  // Initialize players
  const players = playerNames.map((name, index) => ({
    id: index,
    name: name || `Player ${index + 1}`,
    position: 1,
    patience: 10,
    hand: [],
    upgrades: [],
    isEliminated: false,
    cardsPlayedThisTurn: 0,
  }));

  // Deal initial hands (6 cards from basic deck)
  let currentDrawPile = [...basicDrawPile];
  let currentDiscardPile = [];

  players.forEach(player => {
    const result = drawCards(currentDrawPile, currentDiscardPile, 6);
    player.hand = result.drawnCards;
    currentDrawPile = result.newDrawPile;
    currentDiscardPile = result.newDiscardPile;
  });

  return {
    currentRound: 1,
    currentPlayerIndex: 0,
    turnPhase: 'buy',
    gameStatus: 'playing',
    annoyanceCount: 0,
    players,
    basicDrawPile: currentDrawPile,
    basicDiscardPile: currentDiscardPile,
    marketDrawPile,
    marketDiscardPile: [],
    eventDeck,
    eventDiscardPile: [],
    annoyanceDeck,
    annoyanceDiscardPile: [],
    upgradeCards: [...upgradeCards],
    activeEvent: null,
    activeAnnoyance: null,
    selectedCards: [],
    gameLog: [
      { message: 'Game started! Each player has 10 patience and 6 cards.', timestamp: Date.now() },
    ],
  };
}
