import styles from './GameStatus.module.css';

export function GameStatus({ gameLog = [] }) {
  return (
    <div className={styles.container}>
      <p className={styles.title}>GAME LOG:</p>
      <div className={styles.entries}>
        {gameLog.slice(-12).reverse().map((entry, index) => (
          <div key={index} className={styles.entry}>
            {entry.message}
          </div>
        ))}
      </div>
    </div>
  );
}
