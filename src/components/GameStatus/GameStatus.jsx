import styles from './GameStatus.module.css';

export function GameStatus({ currentRound, currentPlayer, turnPhase, gameLog = [] }) {
  const phaseNames = {
    buy: 'Buy Phase',
    play: 'Play Phase',
    discard: 'Discard Phase',
    draw: 'Draw Phase',
    endRound: 'End of Round',
  };

  return (
    <div className={styles.container}>
      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          <span className={styles.label}>Round:</span>
          <span className={styles.value}>{currentRound}/8</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.label}>Current Player:</span>
          <span className={styles.value}>{currentPlayer}</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.label}>Phase:</span>
          <span className={`${styles.value} ${styles.phase}`}>
            {phaseNames[turnPhase] || turnPhase}
          </span>
        </div>
      </div>

      {gameLog.length > 0 && (
        <div className={styles.log}>
          <h3 className={styles.logTitle}>Recent Actions</h3>
          <div className={styles.logMessages}>
            {gameLog.slice(-5).reverse().map((entry, index) => (
              <div key={index} className={styles.logEntry}>
                {entry.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
