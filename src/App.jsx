import { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { StartScreen } from './components/StartScreen/StartScreen';
import { GameBoard } from './components/GameBoard/GameBoard';
import { GameStatus } from './components/GameStatus/GameStatus';
import { FloatingHand } from './components/FloatingHand/FloatingHand';
import { initializeGame } from './utils/gameSetup';
import { getSection } from './data/cards';
import { drawCards } from './utils/deckManager';
import './App.css';

function GameContent() {
  const { state, dispatch } = useGame();
  const [selectedCards, setSelectedCards] = useState([]);
  const [marketDrawCards, setMarketDrawCards] = useState([]);

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
      // Play cards logic
      let newPosition = currentPlayer.position;
      let newPatience = currentPlayer.patience;

      // Cost patience for 2nd card
      if (selectedCards.length === 2) {
        newPatience -= 1;
      }

      // Execute card effects (simplified for now)
      selectedCards.forEach(card => {
        const section = getSection(currentPlayer.position);
        const hasExpertTraveler = currentPlayer.upgrades.some(u => u.id === 'expert-traveler');

        // Check if card can be played in current section
        if (card.section !== 'all' && card.section !== section && !hasExpertTraveler) {
          addLog(`Cannot play ${card.name} in ${section} section!`);
          return;
        }

        // Apply card effects
        if (card.category === 'movement') {
          let movement = 0;
          switch (card.name) {
            case 'Casual Traveler':
              const hasSeasonedTraveler = currentPlayer.upgrades.some(u => u.id === 'seasoned-traveler');
              movement = hasSeasonedTraveler ? 3 : 2;
              break;
            case 'HOV Lane':
              movement = 3;
              break;
            case 'Express Lane':
              movement = 3;
              break;
            case 'TSA Precheck':
              movement = 4;
              break;
            case 'Hands Free Device':
              movement = 4;
              break;
            case 'Complimentary Upgrade':
              movement = 3;
              break;
            case 'Empty Row':
              movement = 4;
              break;
            case 'Baggage Claim':
              movement = 5;
              break;
            case 'Cutting It Close':
              movement = 2;
              newPatience -= 1;
              break;
          }
          newPosition = Math.min(36, newPosition + movement);
        } else if (card.category === 'patience') {
          switch (card.name) {
            case 'Calm Traveling':
              newPatience += 1;
              break;
            case 'Relaxing Spa':
              newPatience += 2;
              break;
            case 'Smooth Flight':
              newPatience += 3;
              break;
          }
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

      // Move cards to discard
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

      addLog(`${currentPlayer.name} played ${selectedCards.length} card(s)`);
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

      addLog(`${currentPlayer.name} discarded ${selectedCards.length} card(s)`);
      setSelectedCards([]);
      handleDrawPhase(newPlayers);
    }
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

    addLog(`${currentPlayer.name} bought ${upgrade.name} for ${upgrade.cost} patience`);
  };

  const handleDrawMarket = () => {
    const currentPlayer = state.players[state.currentPlayerIndex];

    if (currentPlayer.patience < 1) {
      addLog('Not enough patience to draw from market!');
      return;
    }

    // Draw 2 cards from market deck
    const result = drawCards(state.marketDrawPile, state.marketDiscardPile, 2);
    if (result.drawnCards.length === 0) {
      addLog('Market deck is empty!');
      return;
    }

    // Store the 2 cards to display
    setMarketDrawCards(result.drawnCards);

    // Don't add to hand yet - player will choose one
    dispatch({
      type: 'INITIALIZE_GAME',
      payload: {
        ...state,
        marketDrawPile: result.newDrawPile,
        marketDiscardPile: result.newDiscardPile,
      },
    });
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

      <GameBoard players={state.players} />

      <FloatingHand
        player={currentPlayer}
        selectedCards={selectedCards}
        onCardClick={handleCardClick}
        isCurrentPlayer={true}
        turnPhase={state.turnPhase}
        upgradeCards={state.upgradeCards}
        onBuyUpgrade={handleBuyUpgrade}
        onDrawMarket={handleDrawMarket}
        onPlayCards={handlePlayCards}
        onSkipPhase={handleSkipPhase}
        onEndTurn={handleEndTurn}
        marketDrawCards={marketDrawCards}
      />
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
