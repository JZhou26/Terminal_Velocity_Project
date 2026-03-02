export const initialState = {
  // Game meta
  currentRound: 1,
  currentPlayerIndex: 0,
  turnPhase: 'buy', // 'buy' | 'play' | 'discard' | 'draw' | 'endRound'
  gameStatus: 'setup', // 'setup' | 'playing' | 'finished'
  annoyanceCount: 0,

  // Players (array of 4)
  players: [],

  // Decks
  basicDrawPile: [],
  basicDiscardPile: [],
  marketDrawPile: [],
  marketDiscardPile: [],
  eventDeck: [],
  eventDiscardPile: [],
  annoyanceDeck: [],
  annoyanceDiscardPile: [],

  // Market
  upgradeCards: [],

  // Current events
  activeEvent: null,
  activeAnnoyance: null,

  // UI state
  selectedCards: [],
  gameLog: [],
};

export function gameReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE_GAME':
      return {
        ...state,
        ...action.payload,
        gameStatus: 'playing',
      };

    case 'PLAY_CARD':
      return handlePlayCard(state, action.payload);

    case 'BUY_UPGRADE':
      return handleBuyUpgrade(state, action.payload);

    case 'BUY_MARKET_CARD':
      return handleBuyMarketCard(state, action.payload);

    case 'DISCARD_CARDS':
      return handleDiscardCards(state, action.payload);

    case 'DRAW_CARDS':
      return handleDrawCards(state, action.payload);

    case 'NEXT_PHASE':
      return handleNextPhase(state);

    case 'DRAW_EVENT':
      return handleDrawEvent(state);

    case 'DRAW_ANNOYANCE':
      return handleDrawAnnoyance(state);

    case 'APPLY_EVENT':
      return handleApplyEvent(state, action.payload);

    case 'APPLY_ANNOYANCE':
      return handleApplyAnnoyance(state, action.payload);

    case 'SELECT_CARD':
      return {
        ...state,
        selectedCards: action.payload,
      };

    case 'END_ROUND':
      return handleEndRound(state);

    case 'END_GAME':
      return {
        ...state,
        gameStatus: 'finished',
        winner: action.payload,
      };

    case 'ADD_LOG':
      return {
        ...state,
        gameLog: [...state.gameLog, {
          message: action.payload,
          timestamp: Date.now()
        }].slice(-20), // Keep last 20 messages
      };

    default:
      return state;
  }
}

// Placeholder handlers - will implement these with card effects
function handlePlayCard(state, payload) {
  // TODO: Implement in Phase 6
  return state;
}

function handleBuyUpgrade(state, payload) {
  // TODO: Implement in Phase 5
  return state;
}

function handleBuyMarketCard(state, payload) {
  // TODO: Implement in Phase 5
  return state;
}

function handleDiscardCards(state, payload) {
  // TODO: Implement in Phase 5
  return state;
}

function handleDrawCards(state, payload) {
  // TODO: Implement in Phase 5
  return state;
}

function handleNextPhase(state) {
  // TODO: Implement in Phase 5
  return state;
}

function handleDrawEvent(state) {
  // TODO: Implement in Phase 7
  return state;
}

function handleDrawAnnoyance(state) {
  // TODO: Implement in Phase 7
  return state;
}

function handleApplyEvent(state, payload) {
  // TODO: Implement in Phase 7
  return state;
}

function handleApplyAnnoyance(state, payload) {
  // TODO: Implement in Phase 7
  return state;
}

function handleEndRound(state) {
  // TODO: Implement in Phase 7
  return state;
}
