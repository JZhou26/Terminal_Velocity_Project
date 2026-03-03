import styles from './GameBoard.module.css';

const PLAYER_PLANES = [
  '/assets/cards/Plane1.png',
  '/assets/cards/Plane2.png',
  '/assets/cards/Plane3.png',
  '/assets/cards/Plane4.png',
];

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
              <img
                key={player.id}
                src={PLAYER_PLANES[index]}
                alt={`${player.name} - Tile ${position}`}
                className={styles.playerToken}
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                }}
                title={`${player.name} - Tile ${position}`}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.legend}>
        {players.map((player, index) => (
          <div key={player.id} className={styles.legendItem}>
            <img
              src={PLAYER_PLANES[index]}
              alt={player.name}
              className={styles.legendPlane}
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
