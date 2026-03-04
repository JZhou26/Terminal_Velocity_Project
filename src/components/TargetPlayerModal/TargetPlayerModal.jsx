import styles from './TargetPlayerModal.module.css';

export function TargetPlayerModal({ players, currentPlayerIndex, onConfirm }) {
  const targets = players
    .map((player, index) => ({ player, index }))
    .filter(({ player, index }) => index !== currentPlayerIndex && !player.isEliminated);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Choose Your Target</h2>
        <div className={styles.playerList}>
          {targets.map(({ player, index }) => (
            <button
              key={player.id}
              type="button"
              className={styles.playerButton}
              onClick={() => onConfirm(index)}
            >
              <span className={styles.playerName}>{player.name}</span>
              <span className={styles.playerStats}>
                Tile {player.position} · {player.patience} patience
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
