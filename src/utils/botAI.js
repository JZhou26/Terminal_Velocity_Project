import { getSection, SECTION_STARTS } from '../data/cards';
import { drawCards } from './deckManager';

const SECTION_ORDER = ['drive', 'security', 'airplane'];

function rollDie() {
  return Math.ceil(Math.random() * 6);
}

function isLastPlace(bot, players) {
  const active = players.filter(p => !p.isEliminated);
  return active.every(p => p.id === bot.id || p.position >= bot.position);
}

function getLeader(players, botId) {
  const active = players.filter(p => !p.isEliminated && p.id !== botId);
  if (!active.length) return null;
  return active.reduce((best, p) => {
    if (p.position > best.position) return p;
    if (p.position === best.position && p.patience > best.patience) return p;
    return best;
  }, active[0]);
}

function scoreCardForPlay(card, bot, players) {
  if (card.category === 'cancel') return -1;
  const section = getSection(bot.position);
  const hasExpertTraveler = bot.upgrades.some(u => u.id === 'expert-traveler');

  if (card.section !== 'all' && card.section !== section && !hasExpertTraveler) return -1;
  if (card.requiresLastPlace && !isLastPlace(bot, players)) return -1;

  if (card.category === 'movement') {
    return card.section !== 'all' ? 9 : 6;
  }
  if (card.name === 'Annoying Traveler') {
    return getLeader(players, bot.id) ? 8 : 3;
  }
  if (card.category === 'patience') {
    return bot.patience < 5 ? 5 : 2;
  }
  return 1;
}

// Returns 1–2 cards the bot should play this turn
export function getBotPlayCards(bot, state) {
  const scored = bot.hand
    .map(card => ({ card, score: scoreCardForPlay(card, bot, state.players) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return [];

  const best = scored[0].card;

  // Play 2 if patience allows and second card is also a high-value card
  if (bot.patience > 2 && scored.length >= 2 && scored[1].score >= 6) {
    return [best, scored[1].card];
  }

  return [best];
}

// Returns 0–2 cards to discard (stale section cards)
export function getBotDiscardCards(bot) {
  const section = getSection(bot.position);
  const sectionIdx = SECTION_ORDER.indexOf(section);

  return bot.hand.filter(card => {
    if (card.section === 'all') return false;
    const cardSectionIdx = SECTION_ORDER.indexOf(card.section);
    return cardSectionIdx >= 0 && cardSectionIdx < sectionIdx;
  }).slice(0, 2);
}

// Returns { type: 'upgrade', upgrade } | { type: 'market' } | { type: 'skip' }
export function getBotBuyDecision(bot, state) {
  const section = getSection(bot.position);

  if (bot.patience >= 4) {
    // An upgrade is unavailable if ANY player already owns it
    const takenIds = new Set(state.players.flatMap(p => p.upgrades.map(u => u.id)));
    const priorities = {
      drive: ['emergency-brake', 'seasoned-traveler', 'expert-traveler', 'captains-friend', 'tsa-precheck'],
      security: ['tsa-precheck', 'expert-traveler', 'seasoned-traveler', 'emergency-brake', 'captains-friend'],
      airplane: ['captains-friend', 'expert-traveler', 'seasoned-traveler', 'emergency-brake', 'tsa-precheck'],
    };
    const list = priorities[section] || priorities.drive;
    const target = list.map(id => state.upgradeCards.find(u => u.id === id)).find(u => u && !takenIds.has(u.id));
    if (target) return { type: 'upgrade', upgrade: target };
  }

  const movementCards = bot.hand.filter(c => c.category === 'movement');
  if (bot.patience >= 1 && movementCards.length < 2 && state.marketDrawPile.length > 0) {
    return { type: 'market' };
  }

  return { type: 'skip' };
}

// Execute card effects directly (no modals). Returns { newPlayers, newBasicDiscard, logParts }
export function executeBotCards(cardsToPlay, state, bot) {
  const hasSeasonedTraveler = bot.upgrades.some(u => u.id === 'seasoned-traveler');
  const players = [...state.players];
  const botIndex = players.findIndex(p => p.id === bot.id);

  let newPosition = bot.position;
  let newPatience = bot.patience;
  const logParts = [];

  if (cardsToPlay.length === 2) newPatience -= 1;

  const botIsLastPlace = isLastPlace(bot, state.players);

  const hasAnnoying = cardsToPlay.some(c => c.name === 'Annoying Traveler');
  const targetPlayer = hasAnnoying ? getLeader(state.players, bot.id) : null;
  const targetIdx = targetPlayer ? players.findIndex(p => p.id === targetPlayer.id) : -1;

  cardsToPlay.forEach(card => {
    switch (card.name) {
      case 'Casual Traveler': {
        const move = hasSeasonedTraveler ? 3 : 2;
        newPosition = Math.min(36, newPosition + move);
        logParts.push(`${card.name} (+${move})`);
        break;
      }
      case 'Seasoned Driver':
      case 'TSA Veteran':
      case 'Savvy Flyer':
        newPosition = Math.min(36, newPosition + 4);
        logParts.push(`${card.name} (+4)`);
        break;
      case 'HOV Lane':
      case 'Express Lane':
      case 'Empty Row':
        if (botIsLastPlace) {
          newPosition = Math.min(36, newPosition + 6);
          logParts.push(`${card.name} (+6, last place)`);
        }
        break;
      case 'Calm Traveling':
        newPatience += 2;
        logParts.push(`${card.name} (+2 patience)`);
        break;
      case 'Relaxing Spa':
        newPatience += 4;
        logParts.push(`${card.name} (+4 patience)`);
        break;
      case 'Reckless Driver':
      case 'Security Rush':
      case 'Cutting It Close': {
        const roll = rollDie();
        newPosition = Math.min(36, newPosition + roll);
        logParts.push(`${card.name} (rolled ${roll}, +${roll})`);
        break;
      }
      case 'Annoying Traveler': {
        const roll = rollDie();
        if (targetIdx >= 0) {
          const target = players[targetIdx];
          const targetSection = getSection(target.position);
          const newPos = Math.max(SECTION_STARTS[targetSection], target.position - roll);
          players[targetIdx] = { ...target, position: newPos };
          logParts.push(`${card.name} (rolled ${roll}, ${target.name} -${target.position - newPos})`);
        } else {
          logParts.push(`${card.name} (no target)`);
        }
        break;
      }
      default:
        logParts.push(card.name);
    }
  });

  players[botIndex] = {
    ...bot,
    position: newPosition,
    patience: Math.max(0, newPatience),
    hand: bot.hand.filter(c => !cardsToPlay.some(pc => pc.id === c.id)),
    cardsPlayedThisTurn: bot.cardsPlayedThisTurn + cardsToPlay.length,
  };

  return {
    newPlayers: players,
    newBasicDiscard: [...state.basicDiscardPile, ...cardsToPlay],
    logParts,
  };
}

// Score a market card for bot selection
function scoreMarketCard(card, bot) {
  const section = getSection(bot.position);
  if (card.category === 'movement') return card.section === section ? 9 : 6;
  if (card.name === 'Annoying Traveler') return 7;
  if (card.category === 'patience') return 5;
  if (card.category === 'cancel') return 2;
  return 1;
}

// Draw 2 market cards, auto-pick the best one. Returns new state fields or null if deck empty.
export function executeBotMarketBuy(state, bot) {
  const { drawnCards, newDrawPile, newDiscardPile } = drawCards(state.marketDrawPile, state.marketDiscardPile, 2);
  if (!drawnCards.length) return null;

  const scored = drawnCards
    .map(c => ({ card: c, score: scoreMarketCard(c, bot) }))
    .sort((a, b) => b.score - a.score);
  const chosenCard = scored[0].card;
  const otherCards = drawnCards.filter(c => c.id !== chosenCard.id);

  const botIndex = state.players.findIndex(p => p.id === bot.id);
  const newPlayers = [...state.players];
  newPlayers[botIndex] = {
    ...bot,
    patience: bot.patience - 1,
    hand: [...bot.hand, chosenCard],
  };

  return {
    newPlayers,
    marketDrawPile: newDrawPile,
    marketDiscardPile: [...newDiscardPile, ...otherCards],
    chosenCard,
  };
}
