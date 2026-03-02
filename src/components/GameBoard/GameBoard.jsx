import styles from './GameBoard.module.css';

const PLAYER_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];

export function GameBoard({ players }) {
  return (
    <div className={styles.container}>
      <div className={styles.boardWrapper}>
        <img
          src="/assets/board/GameBoardFull.png"
          alt="Game Board"
          className={styles.boardImage}
        />

        <div className={styles.playerTokens}>
          {players.map((player, index) => {
            if (player.isEliminated) return null;

            // Calculate position on board (tiles 1-36)
            const position = player.position;
            // Position tokens in a grid-like layout over the board
            const { top, left } = getTilePosition(position, index);

            return (
              <div
                key={player.id}
                className={styles.playerToken}
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  backgroundColor: PLAYER_COLORS[index],
                }}
                title={`${player.name} - Tile ${position}`}
              >
                <span className={styles.tokenText}>
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.legend}>
        {players.map((player, index) => (
          <div key={player.id} className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: PLAYER_COLORS[index] }}
            />
            <span className={player.isEliminated ? styles.eliminated : ''}>
              {player.name} - Tile {player.position}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Calculate approximate position for each tile (rough layout)
function getTilePosition(tile, playerIndex) {
  // Offset slightly based on player index to prevent overlap
  const offset = playerIndex * 1.5;

  // Drive section (tiles 1-12) - top area
  if (tile <= 12) {
    const progress = (tile - 1) / 11;
    return {
      top: 15 + offset,
      left: 10 + (progress * 70),
    };
  }

  // Security section (tiles 13-24) - middle area
  if (tile <= 24) {
    const progress = (tile - 13) / 11;
    return {
      top: 42 + offset,
      left: 10 + (progress * 70),
    };
  }

  // Airplane section (tiles 25-36) - bottom area
  const progress = (tile - 25) / 11;
  return {
    top: 69 + offset,
    left: 10 + (progress * 70),
  };
}
