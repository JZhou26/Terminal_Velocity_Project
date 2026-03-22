import { useState, useRef, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { StartScreen } from './components/StartScreen/StartScreen';
import { GameBoard } from './components/GameBoard/GameBoard';
import { GameStatus } from './components/GameStatus/GameStatus';
import { PlayerPanel } from './components/PlayerPanel/PlayerPanel';
import { Card } from './components/Card/Card';
import { initializeGame } from './utils/gameSetup';
import { getSection, SECTION_STARTS, upgradeCards } from './data/cards';
import { drawCards } from './utils/deckManager';
import { getBotBuyDecision, getBotPlayCards, getBotDiscardCards, executeBotCards, executeBotMarketBuy } from './utils/botAI';
import { DiceRollModal } from './components/DiceRollModal/DiceRollModal';
import { TargetPlayerModal } from './components/TargetPlayerModal/TargetPlayerModal';
import { EventRevealModal } from './components/EventRevealModal/EventRevealModal';
import './App.css';

function GameContent() {
  const { state, dispatch } = useGame();
  const [selectedCards, setSelectedCards] = useState([]);
  const [marketDrawCards, setMarketDrawCards] = useState([]);
  const [pendingMarketPiles, setPendingMarketPiles] = useState(null);
  // 'market' = player clicked market this turn; 'upgrade' = player bought upgrade this turn
  const [turnBuyChoice, setTurnBuyChoice] = useState(null);
  const [pendingDiceRoll, setPendingDiceRoll] = useState(null);
  const [pendingTargetSelection, setPendingTargetSelection] = useState(null);
  const [pendingEndOfRound, setPendingEndOfRound] = useState(null);
  const boardRef = useRef(null);

  // Always keep a ref to the latest state so bot timeouts get fresh data
  const stateRef = useRef(state);
  stateRef.current = state;

  const handleStartGame = (playerNames, botIndices = []) => {
    const gameState = initializeGame(playerNames, botIndices);
    dispatch({ type: 'INITIALIZE_GAME', payload: gameState });
  };

  const handleCardClick = (card) => {
    // Toggle card selection
    const isSelected = selectedCards.some(sc => sc.id === card.id);
    if (isSelected) {
      setSelectedCards(selectedCards.filter(sc => sc.id !== card.id));
    } else {
      // Limit based on phase
      const maxCards = state.turnPhase === 'discard' ? 2 : state.turnPhase === 'play' ? 2 : 1;
      if (selectedCards.length < maxCards) {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };

  const handlePlayCards = () => {
    if (selectedCards.length === 0) return;

    const currentPlayer = state.players[state.currentPlayerIndex];

    if (state.turnPhase === 'play') {
      const section = getSection(currentPlayer.position);
      const hasExpertTraveler = currentPlayer.upgrades.some(u => u.id === 'expert-traveler');
      const hasSeasonedTraveler = currentPlayer.upgrades.some(u => u.id === 'seasoned-traveler');

      // Validate section restrictions before playing — don't consume unplayable cards
      for (const card of selectedCards) {
        if (card.section !== 'all' && card.section !== section && !hasExpertTraveler) {
          addLog(`${currentPlayer.name} cannot play ${card.name} in the ${section} section!`);
          return;
        }
        if (card.category === 'cancel') {
          addLog(`Cancel cards can only be played reactively when an Event or Annoyance is drawn.`);
          return;
        }
      }

      // If any selected card targets another player, show target selection modal first
      const targetCards = selectedCards.filter(c => c.targetsOtherPlayer);
      if (targetCards.length > 0) {
        setPendingTargetSelection({ allSelectedCards: selectedCards });
        return;
      }

      // If any selected card requires a dice roll, open the modal instead of resolving inline
      const diceCards = selectedCards.filter(c => c.requiresDice);
      if (diceCards.length > 0) {
        setPendingDiceRoll({ diceCards, allSelectedCards: selectedCards });
        return;
      }

      let newPosition = currentPlayer.position;
      let newPatience = currentPlayer.patience;
      const logParts = [];

      // Cost patience for playing 2 cards in one turn
      if (selectedCards.length === 2) {
        newPatience -= 1;
      }

      const activePlayers = state.players.filter(p => !p.isEliminated);
      const lastPlace = activePlayers.reduce((last, p) =>
        p.position < last.position ? p : last, activePlayers[0]);
      const currentIsLastPlace = lastPlace.playerIndex === state.currentPlayerIndex ||
        (lastPlace.position === currentPlayer.position);

      selectedCards.forEach(card => {
        switch (card.name) {
          // --- Movement cards ---
          case 'Casual Traveler': {
            const move = hasSeasonedTraveler ? 3 : 2;
            newPosition = Math.min(36, newPosition + move);
            logParts.push(`${card.name} (+${move} spaces)`);
            break;
          }
          case 'Seasoned Driver':
            newPosition = Math.min(36, newPosition + 4);
            logParts.push(`${card.name} (+4 spaces)`);
            break;
          case 'TSA Veteran':
            newPosition = Math.min(36, newPosition + 4);
            logParts.push(`${card.name} (+4 spaces)`);
            break;
          case 'Savvy Flyer':
            newPosition = Math.min(36, newPosition + 4);
            logParts.push(`${card.name} (+4 spaces)`);
            break;

          // --- Last-place movement cards ---
          case 'HOV Lane':
          case 'Express Lane':
          case 'Empty Row':
            if (currentIsLastPlace) {
              newPosition = Math.min(36, newPosition + 6);
              logParts.push(`${card.name} (+6 spaces, last place bonus)`);
            } else {
              logParts.push(`${card.name} (no effect — not in last place)`);
            }
            break;

          // --- Patience cards ---
          case 'Calm Traveling':
            newPatience += 2;
            logParts.push(`${card.name} (+2 patience)`);
            break;
          case 'Relaxing Spa':
            newPatience += 4;
            logParts.push(`${card.name} (+4 patience)`);
            break;

          // Dice cards are handled by handleDiceConfirm via DiceRollModal
          // Cancel/reactive cards cannot be played proactively
          default:
            logParts.push(`${card.name} (no effect)`);
        }
      });

      // Update player state
      const newPlayers = [...state.players];
      newPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        position: newPosition,
        patience: Math.max(0, newPatience),
        hand: currentPlayer.hand.filter(c => !selectedCards.some(sc => sc.id === c.id)),
        cardsPlayedThisTurn: currentPlayer.cardsPlayedThisTurn + selectedCards.length,
      };

      const newBasicDiscard = [...state.basicDiscardPile, ...selectedCards];

      dispatch({
        type: 'INITIALIZE_GAME',
        payload: {
          ...state,
          players: newPlayers,
          basicDiscardPile: newBasicDiscard,
          turnPhase: 'discard',
        },
      });

      addLog(`${currentPlayer.name} played: ${logParts.join(', ')}`);
      setSelectedCards([]);
    } else if (state.turnPhase === 'discard') {
      // Discard cards
      const currentPlayer = state.players[state.currentPlayerIndex];
      const newPlayers = [...state.players];
      newPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        hand: currentPlayer.hand.filter(c => !selectedCards.some(sc => sc.id === c.id)),
      };

      const newBasicDiscard = [...state.basicDiscardPile, ...selectedCards];

      dispatch({
        type: 'INITIALIZE_GAME',
        payload: {
          ...state,
          players: newPlayers,
          basicDiscardPile: newBasicDiscard,
        },
      });

      const discardNames = selectedCards.map(c => c.name).join(' + ');
      addLog(`${currentPlayer.name} discarded: ${discardNames}`);
      setSelectedCards([]);
      handleDrawPhase(newPlayers);
    }
  };

  const handleTargetConfirm = (targetPlayerIndex) => {
    const { allSelectedCards } = pendingTargetSelection;
    setPendingTargetSelection(null);
    const diceCards = allSelectedCards.filter(c => c.requiresDice);
    if (diceCards.length > 0) {
      setPendingDiceRoll({ diceCards, allSelectedCards, targetPlayerIndex });
    }
  };

  const handleDiceConfirm = (rolls) => {
    const { allSelectedCards, targetPlayerIndex } = pendingDiceRoll;
    setPendingDiceRoll(null);

    const currentPlayer = state.players[state.currentPlayerIndex];
    const hasSeasonedTraveler = currentPlayer.upgrades.some(u => u.id === 'seasoned-traveler');

    let newPosition = currentPlayer.position;
    let newPatience = currentPlayer.patience;
    const logParts = [];

    // 2-card penalty: handlePlayCards returned early (before applying this cost) when dice cards detected
    if (allSelectedCards.length === 2) {
      newPatience -= 1;
    }

    const activePlayers = state.players.filter(p => !p.isEliminated);
    const lastPlace = activePlayers.reduce((last, p) =>
      p.position < last.position ? p : last, activePlayers[0]);
    const currentIsLastPlace = lastPlace.playerIndex === state.currentPlayerIndex ||
      (lastPlace.position === currentPlayer.position);

    const newPlayers = [...state.players];

    allSelectedCards.forEach(card => {
      switch (card.name) {
        case 'Casual Traveler': {
          const move = hasSeasonedTraveler ? 3 : 2;
          newPosition = Math.min(36, newPosition + move);
          logParts.push(`${card.name} (+${move} spaces)`);
          break;
        }
        case 'Seasoned Driver':
          newPosition = Math.min(36, newPosition + 4);
          logParts.push(`${card.name} (+4 spaces)`);
          break;
        case 'TSA Veteran':
          newPosition = Math.min(36, newPosition + 4);
          logParts.push(`${card.name} (+4 spaces)`);
          break;
        case 'Savvy Flyer':
          newPosition = Math.min(36, newPosition + 4);
          logParts.push(`${card.name} (+4 spaces)`);
          break;
        case 'HOV Lane':
        case 'Express Lane':
        case 'Empty Row':
          if (currentIsLastPlace) {
            newPosition = Math.min(36, newPosition + 6);
            logParts.push(`${card.name} (+6 spaces, last place bonus)`);
          } else {
            logParts.push(`${card.name} (no effect — not in last place)`);
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
        case 'Reckless Driver': {
          const roll = rolls[card.id];
          newPosition = Math.min(36, newPosition + roll);
          logParts.push(`${card.name} (rolled ${roll}, +${roll} spaces)`);
          break;
        }
        case 'Security Rush': {
          const roll = rolls[card.id];
          newPosition = Math.min(36, newPosition + roll);
          logParts.push(`${card.name} (rolled ${roll}, +${roll} spaces)`);
          break;
        }
        case 'Cutting It Close': {
          const roll = rolls[card.id];
          newPosition = Math.min(36, newPosition + roll);
          logParts.push(`${card.name} (rolled ${roll}, +${roll} spaces)`);
          break;
        }
        case 'Annoying Traveler': {
          const roll = rolls[card.id];
          const target = state.players[targetPlayerIndex];
          const targetSection = getSection(target.position);
          const newTargetPosition = Math.max(SECTION_STARTS[targetSection], target.position - roll);
          newPlayers[targetPlayerIndex] = { ...target, position: newTargetPosition };
          logParts.push(`${card.name} (rolled ${roll}, ${target.name} moves back ${target.position - newTargetPosition} spaces)`);
          break;
        }
        default:
          logParts.push(`${card.name} (no effect)`);
      }
    });

    newPlayers[state.currentPlayerIndex] = {
      ...currentPlayer,
      position: newPosition,
      patience: Math.max(0, newPatience),
      hand: currentPlayer.hand.filter(c => !allSelectedCards.some(sc => sc.id === c.id)),
      cardsPlayedThisTurn: currentPlayer.cardsPlayedThisTurn + allSelectedCards.length,
    };

    const newBasicDiscard = [...state.basicDiscardPile, ...allSelectedCards];

    dispatch({
      type: 'INITIALIZE_GAME',
      payload: {
        ...state,
        players: newPlayers,
        basicDiscardPile: newBasicDiscard,
        turnPhase: 'discard',
      },
    });

    addLog(`${currentPlayer.name} played: ${logParts.join(', ')}`);
    setSelectedCards([]);
  };

  const handleDrawPhase = (players = state.players) => {
    // Draw back to 6 cards
    const currentPlayer = players[state.currentPlayerIndex];
    const cardsToDraw = Math.max(0, 6 - currentPlayer.hand.length);

    if (cardsToDraw > 0) {
      const result = drawCards(state.basicDrawPile, state.basicDiscardPile, cardsToDraw);

      const newPlayers = [...players];
      newPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        hand: [...currentPlayer.hand, ...result.drawnCards],
      };

      dispatch({
        type: 'INITIALIZE_GAME',
        payload: {
          ...state,
          players: newPlayers,
          basicDrawPile: result.newDrawPile,
          basicDiscardPile: result.newDiscardPile,
          turnPhase: 'draw',
        },
      });

      addLog(`${currentPlayer.name} drew ${result.drawnCards.length} card(s)`);
    } else {
      dispatch({
        type: 'INITIALIZE_GAME',
        payload: {
          ...state,
          players,
          turnPhase: 'draw',
        },
      });
    }
  };

  const handleSkipPhase = () => {
    if (state.turnPhase === 'buy') {
      dispatch({
        type: 'INITIALIZE_GAME',
        payload: { ...state, turnPhase: 'play' },
      });
      setSelectedCards([]);
    } else if (state.turnPhase === 'play') {
      dispatch({
        type: 'INITIALIZE_GAME',
        payload: { ...state, turnPhase: 'discard' },
      });
      setSelectedCards([]);
    } else if (state.turnPhase === 'discard') {
      handleDrawPhase();
      setSelectedCards([]);
    }
  };

  const handleEndTurn = (stateOverride = null) => {
    const gs = stateOverride ?? state;
    const nextPlayerIndex = (gs.currentPlayerIndex + 1) % gs.players.length;
    const isEndOfRound = nextPlayerIndex === 0;
    setTurnBuyChoice(null);

    if (!isEndOfRound) {
      dispatch({
        type: 'INITIALIZE_GAME',
        payload: {
          ...gs,
          currentPlayerIndex: nextPlayerIndex,
          turnPhase: 'buy',
        },
      });
      setSelectedCards([]);
      return;
    }

    // === END OF ROUND ===
    const activePlayers = gs.players.filter(p => !p.isEliminated);

    const anyoneInAirplane = activePlayers.some(p => getSection(p.position) === 'airplane');
    // Non-airplane players still need event cards drawn against them
    const nonAirplanePlayers = activePlayers.filter(p => getSection(p.position) !== 'airplane');
    const anyoneNotInAirplane = nonAirplanePlayers.length > 0;
    // Section of the frontmost non-airplane player determines which section the event targets
    const nonAirplaneLeader = anyoneNotInAirplane
      ? nonAirplanePlayers.reduce((best, p) => {
          if (p.position > best.position) return p;
          if (p.position === best.position && p.patience > best.patience) return p;
          return best;
        }, nonAirplanePlayers[0])
      : null;
    const eventTargetSection = nonAirplaneLeader ? getSection(nonAirplaneLeader.position) : null;

    let newEventDeck = [...gs.eventDeck];
    let newEventDiscard = [...gs.eventDiscardPile];
    let drawnEvent = null;

    // Draw an event (yellow) card whenever anyone is still in drive/security
    if (anyoneNotInAirplane && newEventDeck.length > 0) {
      drawnEvent = newEventDeck[0];
      newEventDeck = newEventDeck.slice(1);
      newEventDiscard = [...newEventDiscard, drawnEvent];
    }

    let newAnnoyanceDeck = [...gs.annoyanceDeck];
    let newAnnoyanceDiscard = [...gs.annoyanceDiscardPile];
    let drawnAnnoyance = null;

    // Draw an annoyance card only when at least one player is in the airplane section
    if (anyoneInAirplane && newAnnoyanceDeck.length > 0) {
      drawnAnnoyance = newAnnoyanceDeck[0];
      newAnnoyanceDeck = newAnnoyanceDeck.slice(1);
      newAnnoyanceDiscard = [...newAnnoyanceDiscard, drawnAnnoyance];
    }

    let newPlayers = [...gs.players];
    if (drawnEvent) {
      newPlayers = newPlayers.map(player => {
        if (player.isEliminated) return player;
        const playerSection = getSection(player.position);
        const isAffected = drawnEvent.affectsAll ||
          (playerSection === eventTargetSection && playerSection !== 'airplane');
        if (!isAffected) return player;
        const hasEmergencyBrake = player.upgrades.some(u => u.id === 'emergency-brake');
        const hasTSAPrecheck = player.upgrades.some(u => u.id === 'tsa-precheck');
        if (eventTargetSection === 'drive' && hasEmergencyBrake && !drawnEvent.affectsAll) return player;
        if (eventTargetSection === 'security' && hasTSAPrecheck && !drawnEvent.affectsAll) return player;
        const effect = drawnEvent.effect ? drawnEvent.effect(player) : null;
        if (!effect) return player;
        let newPos = player.position;
        let newPat = player.patience;
        if (effect.moveBack) newPos = Math.max(1, player.position - effect.moveBack);
        if (effect.patienceLoss) newPat = Math.max(0, player.patience - effect.patienceLoss);
        return { ...player, position: newPos, patience: newPat };
      });
    }

    if (drawnAnnoyance) {
      newPlayers = newPlayers.map(player => {
        if (player.isEliminated) return player;
        const playerSection = getSection(player.position);
        if (playerSection !== 'airplane') return player;
        const effect = drawnAnnoyance.effect ? drawnAnnoyance.effect(player) : null;
        if (!effect) return player;
        let newPos = player.position;
        let newPat = player.patience;
        if (effect.moveBack) newPos = Math.max(25, player.position - effect.moveBack);
        if (effect.patienceLoss) newPat = Math.max(0, player.patience - effect.patienceLoss);
        return { ...player, position: newPos, patience: newPat };
      });
    }

    const nextState = {
      ...gs,
      players: newPlayers,
      currentRound: gs.currentRound + 1,
      currentPlayerIndex: 0,
      turnPhase: 'buy',
      eventDeck: newEventDeck,
      eventDiscardPile: newEventDiscard,
      annoyanceDeck: newAnnoyanceDeck,
      annoyanceDiscardPile: newAnnoyanceDiscard,
      activeEvent: drawnEvent,
      activeAnnoyance: drawnAnnoyance,
    };

    setPendingEndOfRound({ drawnEvent, drawnAnnoyance, nextState });
    addLog(`Round ${gs.currentRound} complete!${drawnEvent ? ` Event: ${drawnEvent.name}.` : ''}${drawnAnnoyance ? ` Annoyance: ${drawnAnnoyance.name}.` : ''}`);
    setSelectedCards([]);
  };

  const handleEndOfRoundConfirm = () => {
    const { nextState } = pendingEndOfRound;
    setPendingEndOfRound(null);
    dispatch({
      type: 'INITIALIZE_GAME',
      payload: nextState,
    });
    addLog(`Starting round ${nextState.currentRound}`);
  };

  const handleBuyUpgrade = (upgrade) => {
    const currentPlayer = state.players[state.currentPlayerIndex];

    if (currentPlayer.patience < upgrade.cost) {
      addLog(`Not enough patience to buy ${upgrade.name}!`);
      return;
    }

    if (state.players.some(p => p.upgrades.some(u => u.id === upgrade.id))) {
      addLog(`${upgrade.name} is already taken!`);
      return;
    }

    const newPlayers = [...state.players];
    newPlayers[state.currentPlayerIndex] = {
      ...currentPlayer,
      patience: currentPlayer.patience - upgrade.cost,
      upgrades: [...currentPlayer.upgrades, upgrade],
    };

    dispatch({
      type: 'INITIALIZE_GAME',
      payload: {
        ...state,
        players: newPlayers,
        turnPhase: 'play',
      },
    });

    addLog(`${currentPlayer.name} bought upgrade: ${upgrade.name} (cost ${upgrade.cost} patience)`);
    setTurnBuyChoice('upgrade');
  };

  const handleDrawMarket = () => {
    if (state.turnPhase !== 'buy') return;
    const currentPlayer = state.players[state.currentPlayerIndex];

    if (currentPlayer.patience < 2) {
      addLog('Not enough patience to draw from market!');
      return;
    }

    // Draw 2 cards from market deck (only marketCards, no upgrades)
    const result = drawCards(state.marketDrawPile, state.marketDiscardPile, 2);
    if (result.drawnCards.length === 0) {
      addLog('Market deck is empty!');
      return;
    }

    // Store drawn cards for display — save the new pile state for when player chooses
    setMarketDrawCards(result.drawnCards);
    setPendingMarketPiles({ drawPile: result.newDrawPile, discardPile: result.newDiscardPile });
    setTurnBuyChoice('market');
  };

  const handleBuyMarketCard = (chosenCard) => {
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!pendingMarketPiles) return;

    // Add chosen card to hand, discard the other(s), deduct 2 patience
    const otherCards = marketDrawCards.filter(c => c.id !== chosenCard.id);
    const newPlayers = [...state.players];
    newPlayers[state.currentPlayerIndex] = {
      ...currentPlayer,
      patience: currentPlayer.patience - 2,
      hand: [...currentPlayer.hand, chosenCard],
    };

    dispatch({
      type: 'INITIALIZE_GAME',
      payload: {
        ...state,
        players: newPlayers,
        marketDrawPile: pendingMarketPiles.drawPile,
        marketDiscardPile: [...pendingMarketPiles.discardPile, ...otherCards],
        turnPhase: 'play',
      },
    });

    addLog(`${currentPlayer.name} bought from market: ${chosenCard.name}`);
    setMarketDrawCards([]);
    setPendingMarketPiles(null);
  };

  const handleCancelMarket = () => {
    if (pendingMarketPiles) {
      // Return drawn cards to market discard pile so deck isn't depleted
      dispatch({
        type: 'INITIALIZE_GAME',
        payload: {
          ...state,
          marketDrawPile: pendingMarketPiles.drawPile,
          marketDiscardPile: [...pendingMarketPiles.discardPile, ...marketDrawCards],
        },
      });
    }
    setMarketDrawCards([]);
    setPendingMarketPiles(null);
    setTurnBuyChoice(null);
  };

  const addLog = (message) => {
    dispatch({
      type: 'ADD_LOG',
      payload: message,
    });
  };

  // Execute one phase of a bot's turn using explicit gameState (no stale closure risk)
  const executeBotPhase = (gs, bot) => {
    switch (gs.turnPhase) {
      case 'buy': {
        const decision = getBotBuyDecision(bot, gs);
        if (decision.type === 'upgrade') {
          const newPlayers = [...gs.players];
          const idx = newPlayers.findIndex(p => p.id === bot.id);
          newPlayers[idx] = {
            ...bot,
            patience: bot.patience - decision.upgrade.cost,
            upgrades: [...bot.upgrades, decision.upgrade],
          };
          dispatch({ type: 'INITIALIZE_GAME', payload: { ...gs, players: newPlayers, turnPhase: 'play' } });
          addLog(`${bot.name} bought upgrade: ${decision.upgrade.name}`);
        } else if (decision.type === 'market') {
          const result = executeBotMarketBuy(gs, bot);
          if (result) {
            dispatch({
              type: 'INITIALIZE_GAME',
              payload: {
                ...gs,
                players: result.newPlayers,
                marketDrawPile: result.marketDrawPile,
                marketDiscardPile: result.marketDiscardPile,
                turnPhase: 'play',
              },
            });
            addLog(`${bot.name} bought from market: ${result.chosenCard.name}`);
          } else {
            dispatch({ type: 'INITIALIZE_GAME', payload: { ...gs, turnPhase: 'play' } });
          }
        } else {
          dispatch({ type: 'INITIALIZE_GAME', payload: { ...gs, turnPhase: 'play' } });
        }
        break;
      }

      case 'play': {
        const cardsToPlay = getBotPlayCards(bot, gs);
        if (cardsToPlay.length === 0) {
          dispatch({ type: 'INITIALIZE_GAME', payload: { ...gs, turnPhase: 'discard' } });
          addLog(`${bot.name} skips play phase`);
        } else {
          const { newPlayers, newBasicDiscard, logParts } = executeBotCards(cardsToPlay, gs, bot);
          dispatch({
            type: 'INITIALIZE_GAME',
            payload: { ...gs, players: newPlayers, basicDiscardPile: newBasicDiscard, turnPhase: 'discard' },
          });
          addLog(`${bot.name} played: ${logParts.join(', ')}`);
        }
        break;
      }

      case 'discard': {
        const toDiscard = getBotDiscardCards(bot);
        const newPlayers = [...gs.players];
        const botIdx = newPlayers.findIndex(p => p.id === bot.id);
        let updatedBot = bot;
        if (toDiscard.length > 0) {
          updatedBot = { ...bot, hand: bot.hand.filter(c => !toDiscard.some(d => d.id === c.id)) };
          newPlayers[botIdx] = updatedBot;
          addLog(`${bot.name} discarded: ${toDiscard.map(c => c.name).join(', ')}`);
        }

        // Draw inline to avoid closure issues with handleDrawPhase
        const cardsToDraw = Math.max(0, 6 - updatedBot.hand.length);
        let drawPile = [...gs.basicDrawPile];
        let discardPile = [...gs.basicDiscardPile, ...toDiscard];

        if (cardsToDraw > 0) {
          const result = drawCards(drawPile, discardPile, cardsToDraw);
          newPlayers[botIdx] = { ...updatedBot, hand: [...updatedBot.hand, ...result.drawnCards] };
          drawPile = result.newDrawPile;
          discardPile = result.newDiscardPile;
        }

        dispatch({
          type: 'INITIALIZE_GAME',
          payload: { ...gs, players: newPlayers, basicDrawPile: drawPile, basicDiscardPile: discardPile, turnPhase: 'draw' },
        });
        break;
      }

      case 'draw': {
        handleEndTurn(gs);
        break;
      }

      default:
        break;
    }
  };

  // Bot auto-play: fire whenever it's a bot's turn and the phase changes
  useEffect(() => {
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer?.isBot || state.gameStatus !== 'playing') return;
    if (pendingDiceRoll || pendingTargetSelection || pendingEndOfRound) return;

    const timer = setTimeout(() => {
      const latestState = stateRef.current;
      const latestBot = latestState.players[latestState.currentPlayerIndex];
      if (!latestBot?.isBot) return;
      executeBotPhase(latestState, latestBot);
    }, 300);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentPlayerIndex, state.turnPhase, state.gameStatus]);

  if (state.gameStatus === 'setup') {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  const threeTokens = Math.floor(currentPlayer.patience / 3);
  const oneTokens   = currentPlayer.patience % 3;

  return (
    <div className="game-layout">

      {/* ── Main play area ── */}
      <div className="play-area">

        {/* Left: Game Board (within fixed 820px area, 244px left offset) */}
        <div className="board-area">
          <GameBoard
            players={state.players}
            boardRef={boardRef}
            eventDiscardPile={state.eventDiscardPile}
            annoyanceDiscardPile={state.annoyanceDiscardPile}
          />
        </div>

        {/* Right: Info panels */}
        <div className="right-column">

          {/* Round indicator bar */}
          <div className="round-bar-wrapper">
            <div className="round-bar-pin round-bar-pin--left">
              <img src="/assets/board/vector42.svg" alt="" />
            </div>
            <div className="round-bar-pin round-bar-pin--right">
              <img src="/assets/board/vector42.svg" alt="" />
            </div>
            <div className="round-bar">
              <div className="round-icon-box">
                <img src="/assets/board/round-plane-left.png" alt="" />
              </div>
              <span className="round-text">Round: {state.currentRound}</span>
              <div className="round-icon-box">
                <img src="/assets/board/round-plane-right.png" alt="" />
              </div>
            </div>
          </div>

          {/* Player panels + Game log/Upgrades */}
          <div className="right-content">

            {/* Left sub-column: 4 player panels */}
            <div className="players-column">
              {state.players.map((player, i) => (
                <PlayerPanel
                  key={player.id}
                  player={player}
                  playerIndex={i}
                  isCurrentPlayer={i === state.currentPlayerIndex}
                />
              ))}
            </div>

            {/* Right sub-column: game log + upgrades */}
            <div className="log-upgrades-column">
              <GameStatus
                gameLog={state.gameLog}
              />
              <div className="upgrades-panel">
                <p className="upgrades-title">UPGRADES</p>
                {upgradeCards.map((upgrade) => {
                  const takenByPlayer = state.players.find(p => p.upgrades.some(u => u.id === upgrade.id));
                  const taken = !!takenByPlayer;
                  const ownedByMe = currentPlayer.upgrades.some(u => u.id === upgrade.id);
                  const canAfford = currentPlayer.patience >= upgrade.cost;
                  const boughtThisTurn = turnBuyChoice !== null;
                  const canBuy = state.turnPhase === 'buy' && !taken && canAfford && !boughtThisTurn && !currentPlayer.isBot;
                  const isBlocked = !taken && boughtThisTurn;
                  const slotClass = [
                    'upgrade-card-slot',
                    taken ? 'upgrade-owned' : '',
                    !taken && !canAfford && !boughtThisTurn ? 'upgrade-unaffordable' : '',
                    canBuy ? 'upgrade-buyable' : '',
                    isBlocked ? 'upgrade-market-blocked' : '',
                  ].filter(Boolean).join(' ');
                  return (
                    <div
                      key={upgrade.id}
                      className={slotClass}
                      onClick={canBuy ? () => handleBuyUpgrade(upgrade) : undefined}
                    >
                      <Card card={upgrade} size="tiny" showTooltip />
                      {taken && <div className="upgrade-owned-badge">{ownedByMe ? '✓' : takenByPlayer.name.split(' ')[0]}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="bottom-row">

        {/* YOUR HAND */}
        <div className="hand-panel">
          <div className="hand-panel-header">
            <p className="panel-label">
              {currentPlayer.isBot
                ? `${currentPlayer.name.toUpperCase()} IS PLAYING...`
                : `YOUR HAND — ${state.turnPhase.toUpperCase()} PHASE`}
            </p>
            {!currentPlayer.isBot && (
              <div className="hand-action-buttons">
                {state.turnPhase === 'buy' && (
                  <button className="hand-action-btn" onClick={handleSkipPhase}>SKIP BUY</button>
                )}
                {state.turnPhase === 'play' && (
                  <>
                    <button
                      className="hand-action-btn hand-action-btn--primary"
                      onClick={handlePlayCards}
                      disabled={selectedCards.length === 0}
                    >
                      PLAY {selectedCards.length > 0 ? `(${selectedCards.length})` : ''}
                    </button>
                    <button className="hand-action-btn" onClick={handleSkipPhase}>SKIP</button>
                  </>
                )}
                {state.turnPhase === 'discard' && (
                  <>
                    {selectedCards.length > 0 && (
                      <button className="hand-action-btn hand-action-btn--primary" onClick={handlePlayCards}>
                        DISCARD ({selectedCards.length})
                      </button>
                    )}
                    <button className="hand-action-btn" onClick={handleSkipPhase}>KEEP ALL</button>
                  </>
                )}
                {state.turnPhase === 'draw' && (
                  <button className="hand-action-btn hand-action-btn--primary" onClick={() => handleEndTurn()}>
                    END TURN
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="hand-cards">
            {currentPlayer.hand.map((card, i) => {
              const isSelected = selectedCards.some(sc => sc.id === card.id);
              const isInteractive = !currentPlayer.isBot &&
                (state.turnPhase === 'play' || state.turnPhase === 'discard');
              return (
                <div
                  key={`${card.id}-${i}`}
                  className={`hand-card-wrap${isSelected ? ' hand-card-selected' : ''}${isInteractive ? ' hand-card-interactive' : ''}`}
                  onClick={isInteractive ? () => handleCardClick(card) : undefined}
                >
                  <img
                    src={card.imagePath}
                    alt={card.name}
                    className="hand-card-img"
                    onError={(e) => { e.target.style.opacity = '0'; }}
                  />
                  <div className="hand-card-bubble">
                    <p className="hand-card-bubble-text market-bubble-name">{card.name.toUpperCase()}</p>
                    <p className="hand-card-bubble-text market-bubble-desc">{card.description}</p>
                  </div>
                </div>
              );
            })}
            {Array(Math.max(0, 7 - currentPlayer.hand.length)).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="hand-empty-slot" />
            ))}
          </div>
        </div>

        {/* YOUR PATIENCE */}
        <div className="patience-panel">
          <p className="panel-label">YOUR PATIENCE</p>
          <div className="patience-tokens">
            <div className="token-row">
              {Array(threeTokens).fill(null).map((_, i) => (
                <div key={i} className="token token-3">3</div>
              ))}
            </div>
            <div className="token-row">
              {Array(oneTokens).fill(null).map((_, i) => (
                <div key={i} className="token token-1">1</div>
              ))}
            </div>
          </div>
          <p className="patience-total">TOTAL: {currentPlayer.patience}</p>
        </div>

        {/* BUY MARKET CARD */}
        <div className="market-panel">
          <p className="panel-label">BUY MARKET CARD: 1 PATIENCE COST</p>
          {marketDrawCards.length > 0 ? (
            <>
              <div className="market-drawn-cards">
                {marketDrawCards.map(card => (
                  <div key={card.id} className="market-card-wrap" onClick={() => handleBuyMarketCard(card)}>
                    <img
                      src={card.imagePath}
                      alt={card.name}
                      className="market-drawn-card"
                    />
                    <div className="hand-card-bubble market-card-bubble">
                      <p className="hand-card-bubble-text market-bubble-name">{card.name.toUpperCase()}</p>
                      <p className="hand-card-bubble-text market-bubble-desc">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="market-cancel-btn" onClick={handleCancelMarket}>✕</button>
            </>
          ) : (
            <img
              src="/assets/cards/MarketBack.png"
              alt="Market"
              className={`market-card-img${turnBuyChoice !== null ? ' market-card-blocked' : ''}`}
              onClick={turnBuyChoice !== null ? undefined : handleDrawMarket}
            />
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {pendingDiceRoll && (
        <DiceRollModal
          diceCards={pendingDiceRoll.diceCards}
          onConfirm={handleDiceConfirm}
        />
      )}
      {pendingTargetSelection && (
        <TargetPlayerModal
          players={state.players}
          currentPlayerIndex={state.currentPlayerIndex}
          onConfirm={handleTargetConfirm}
        />
      )}
      {pendingEndOfRound && (
        <EventRevealModal
          drawnEvent={pendingEndOfRound.drawnEvent}
          drawnAnnoyance={pendingEndOfRound.drawnAnnoyance}
          onConfirm={handleEndOfRoundConfirm}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
