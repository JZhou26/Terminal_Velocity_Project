import styles from './TurnActions.module.css';

export function TurnActions({
  turnPhase,
  selectedCards,
  currentPlayer,
  onPlayCards,
  onSkipPhase,
  onEndTurn
}) {
  const renderPhaseActions = () => {
    switch (turnPhase) {
      case 'buy':
        return (
          <div className={styles.actions}>
            <p className={styles.instruction}>
              Buy an upgrade or draw from the market deck (optional)
            </p>
            <button onClick={onSkipPhase} className={styles.button}>
              Skip Buy Phase
            </button>
          </div>
        );

      case 'play':
        return (
          <div className={styles.actions}>
            <p className={styles.instruction}>
              Select and play 1 or 2 cards from your hand
              {selectedCards.length === 2 && (
                <span className={styles.warning}> (2nd card costs 1 patience)</span>
              )}
            </p>
            <button
              onClick={onPlayCards}
              disabled={selectedCards.length === 0}
              className={styles.button}
            >
              Play {selectedCards.length} Card{selectedCards.length !== 1 ? 's' : ''}
            </button>
            <button onClick={onSkipPhase} className={styles.buttonSecondary}>
              Skip Play Phase
            </button>
          </div>
        );

      case 'discard':
        return (
          <div className={styles.actions}>
            <p className={styles.instruction}>
              Optionally discard up to 2 cards
            </p>
            <button
              onClick={onPlayCards}
              disabled={selectedCards.length === 0 || selectedCards.length > 2}
              className={styles.button}
            >
              Discard {selectedCards.length} Card{selectedCards.length !== 1 ? 's' : ''}
            </button>
            <button onClick={onSkipPhase} className={styles.buttonSecondary}>
              Skip Discard
            </button>
          </div>
        );

      case 'draw':
        return (
          <div className={styles.actions}>
            <p className={styles.instruction}>
              Drawing back to 6 cards...
            </p>
            <button onClick={onEndTurn} className={styles.button}>
              End Turn
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Turn Actions - {currentPlayer.name}</h3>
      {renderPhaseActions()}
    </div>
  );
}
