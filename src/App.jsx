import { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { StartScreen } from './components/StartScreen/StartScreen';
import { GameBoard } from './components/GameBoard/GameBoard';
import { GameStatus } from './components/GameStatus/GameStatus';
import { FloatingHand } from './components/FloatingHand/FloatingHand';
import { initializeGame } from './utils/gameSetup';
import { getSection } from './data/cards';
import { drawCards } from './utils/deckManager';
import { DiceRollModal } from './components/DiceRollModal/DiceRollModal';
import './App.css';

function GameContent() {
  const { state, dispatch } = useGame();
  const [selectedCards, setSelectedCards] = useState([]);
  const [marketDrawCards, setMarketDrawCards] = useState([]);
  const [pendingMarketPiles, setPendingMarketPiles] = useState(null);
  const [pendingDiceRoll, setPendingDiceRoll] = useState(null);

  const handleStartGame = (playerNames) => {
    const gameState = initializeGame(playerNames);
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

      selectedCards.forEach(card => {
        switch (card.name) {
          // --- Movement cards ---
          case 'Casual Traveler': {
            const move = hasSeasonedTraveler ? 3 : 2;
            newPosition = Math.min(36, newPosition + move);
            logParts.push(`${card.name} (+${move} spaces)`);
            break;
          }
          case 'HOV Lane':
            newPosition = Math.min(36, newPosition + 3);
            logParts.push(`${card.name} (+3 spaces)`);
            break;
          case 'Express Lane':
            newPosition = Math.min(36, newPosition + 3);
            logParts.push(`${card.name} (+3 spaces)`);
            break;
          case 'TSA Precheck':
            newPosition = Math.min(36, newPosition + 4);
            logParts.push(`${card.name} (+4 spaces)`);
            break;
          case 'Hands Free Device':
            newPosition = Math.min(36, newPosition + 4);
            logParts.push(`${card.name} (+4 spaces)`);
            break;
          case 'Complimentary Upgrade':
            newPosition = Math.min(36, newPosition + 3);
            logParts.push(`${card.name} (+3 spaces)`);
            break;
          case 'Empty Row':
            newPosition = Math.min(36, newPosition + 4);
            logParts.push(`${card.name} (+4 spaces)`);
            break;
          case 'Baggage Claim':
            newPosition = Math.min(36, newPosition + 5);
            logParts.push(`${card.name} (+5 spaces)`);
            break;

          // --- Special movement cards ---
          case 'Cutting It Close':
            newPosition = Math.min(36, newPosition + 2);
            newPatience -= 1;
            logParts.push(`${card.name} (+2 spaces, -1 patience)`);
            break;
          // Dice cards are handled by handleDiceConfirm via DiceRollModal

          // --- Patience cards ---
          case 'Calm Traveling':
            newPatience += 1;
            logParts.push(`${card.name} (+1 patience)`);
            break;
          case 'Relaxing Spa':
            newPatience += 2;
            logParts.push(`${card.name} (+2 patience)`);
            break;
          case 'Smooth Flight':
            newPatience += 3;
            logParts.push(`${card.name} (+3 patience)`);
            break;

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

  const handleDiceConfirm = (rolls) => {
    const { allSelectedCards } = pendingDiceRoll;
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

    allSelectedCards.forEach(card => {
      switch (card.name) {
        case 'Casual Traveler': {
          const move = hasSeasonedTraveler ? 3 : 2;
          newPosition = Math.min(36, newPosition + move);
          logParts.push(`${card.name} (+${move} spaces)`);
          break;
        }
        case 'HOV Lane':
          newPosition = Math.min(36, newPosition + 3);
          logParts.push(`${card.name} (+3 spaces)`);
          break;
        case 'Express Lane':
          newPosition = Math.min(36, newPosition + 3);
          logParts.push(`${card.name} (+3 spaces)`);
          break;
        case 'TSA Precheck':
          newPosition = Math.min(36, newPosition + 4);
          logParts.push(`${card.name} (+4 spaces)`);
          break;
        case 'Hands Free Device':
          newPosition = Math.min(36, newPosition + 4);
          logParts.push(`${card.name} (+4 spaces)`);
          break;
        case 'Complimentary Upgrade':
          newPosition = Math.min(36, newPosition + 3);
          logParts.push(`${card.name} (+3 spaces)`);
          break;
        case 'Empty Row':
          newPosition = Math.min(36, newPosition + 4);
          logParts.push(`${card.name} (+4 spaces)`);
          break;
        case 'Baggage Claim':
          newPosition = Math.min(36, newPosition + 5);
          logParts.push(`${card.name} (+5 spaces)`);
          break;
        case 'Cutting It Close':
          newPosition = Math.min(36, newPosition + 2);
          newPatience -= 1;
          logParts.push(`${card.name} (+2 spaces, -1 patience)`);
          break;
        case 'Reckless Driver': {
          const roll = rolls[card.id];
          newPosition = Math.min(36, newPosition + roll);
          newPatience -= 1;
          logParts.push(`${card.name} (rolled ${roll}, +${roll} spaces, -1 patience)`);
          break;
        }
        case 'Annoying Traveler': {
          const roll = rolls[card.id];
          if (roll <= 3) {
            newPatience -= 1;
            logParts.push(`${card.name} (rolled ${roll}, -1 patience)`);
          } else {
            newPosition = Math.min(36, newPosition + 2);
            logParts.push(`${card.name} (rolled ${roll}, +2 spaces)`);
          }
          break;
        }
        case 'Calm Traveling':
          newPatience += 1;
          logParts.push(`${card.name} (+1 patience)`);
          break;
        case 'Relaxing Spa':
          newPatience += 2;
          logParts.push(`${card.name} (+2 patience)`);
          break;
        case 'Smooth Flight':
          newPatience += 3;
          logParts.push(`${card.name} (+3 patience)`);
          break;
        default:
          logParts.push(`${card.name} (no effect)`);
      }
    });

    const newPlayers = [...state.players];
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

  const handleEndTurn = () => {
    const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    const isEndOfRound = nextPlayerIndex === 0;

    if (isEndOfRound) {
      // End of round logic would go here
      dispatch({
        type: 'INITIALIZE_GAME',
        payload: {
          ...state,
          currentRound: state.currentRound + 1,
          currentPlayerIndex: nextPlayerIndex,
          turnPhase: 'buy',
        },
      });
      addLog(`Round ${state.currentRound} complete! Starting round ${state.currentRound + 1}`);
    } else {
      dispatch({
        type: 'INITIALIZE_GAME',
        payload: {
          ...state,
          currentPlayerIndex: nextPlayerIndex,
          turnPhase: 'buy',
        },
      });
    }
    setSelectedCards([]);
  };

  const handleBuyUpgrade = (upgrade) => {
    const currentPlayer = state.players[state.currentPlayerIndex];

    if (currentPlayer.patience < upgrade.cost) {
      addLog(`Not enough patience to buy ${upgrade.name}!`);
      return;
    }

    if (currentPlayer.upgrades.some(u => u.id === upgrade.id)) {
      addLog(`Already own ${upgrade.name}!`);
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
  };

  const handleDrawMarket = () => {
    const currentPlayer = state.players[state.currentPlayerIndex];

    if (currentPlayer.patience < 1) {
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
  };

  const handleBuyMarketCard = (chosenCard) => {
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!pendingMarketPiles) return;

    // Add chosen card to hand, discard the other(s), deduct 1 patience
    const otherCards = marketDrawCards.filter(c => c.id !== chosenCard.id);
    const newPlayers = [...state.players];
    newPlayers[state.currentPlayerIndex] = {
      ...currentPlayer,
      patience: currentPlayer.patience - 1,
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

  const addLog = (message) => {
    dispatch({
      type: 'ADD_LOG',
      payload: message,
    });
  };

  if (state.gameStatus === 'setup') {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];

  return (
    <div className="game-container">
      <GameStatus
        currentRound={state.currentRound}
        currentPlayer={currentPlayer.name}
        turnPhase={state.turnPhase}
        gameLog={state.gameLog}
      />

      <GameBoard
        players={state.players}
        eventDiscardPile={state.eventDiscardPile}
        annoyanceDiscardPile={state.annoyanceDiscardPile}
        activeEvent={state.activeEvent}
        activeAnnoyance={state.activeAnnoyance}
      />

      <FloatingHand
        player={currentPlayer}
        playerIndex={state.currentPlayerIndex}
        selectedCards={selectedCards}
        onCardClick={handleCardClick}
        isCurrentPlayer={true}
        turnPhase={state.turnPhase}
        upgradeCards={state.upgradeCards}
        onBuyUpgrade={handleBuyUpgrade}
        onDrawMarket={handleDrawMarket}
        onBuyMarketCard={handleBuyMarketCard}
        onPlayCards={handlePlayCards}
        onSkipPhase={handleSkipPhase}
        onEndTurn={handleEndTurn}
        marketDrawCards={marketDrawCards}
      />
      {pendingDiceRoll && (
        <DiceRollModal
          diceCards={pendingDiceRoll.diceCards}
          onConfirm={handleDiceConfirm}
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
