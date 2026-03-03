import styles from './GameBoard.module.css';

const PLAYER_PLANES = [
  '/assets/cards/Plane1.png',
  '/assets/cards/Plane2.png',
  '/assets/cards/Plane3.png',
  '/assets/cards/Plane4.png',
];

const PLAYER_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];

export function GameBoard({ players }) {
  return (
    <div className={styles.container}>
      <div className={styles.boardWrapper}>
        <img
          src="/assets/board/GameBoardSmall.png"
          alt="Game Board"
          className={styles.boardImage}
        />

        <div className={styles.playerTokens}>
          {players.map((player, index) => {
            if (player.isEliminated) return null;

            const position = player.position;
            const { top, left } = getTilePosition(position);

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

// Map tile positions (1-36) to coordinates on GameBoardSmall
function getTilePosition(tile) {
  // Positions are approximate percentages based on GameBoardSmall layout
  const positions = {
    // START (tile 1)
    1: { top: 93, left: 36 },

    // DRIVE section (tiles 2-12) - left side going up
    2: { top: 90, left: 20 },
    3: { top: 85, left: 13 },
    4: { top: 78, left: 10 },
    5: { top: 71, left: 10 },
    6: { top: 64, left: 10 },
    7: { top: 57, left: 10 },
    8: { top: 50, left: 10 },
    9: { top: 43, left: 10 },
    10: { top: 36, left: 10 },
    11: { top: 29, left: 13 },
    12: { top: 22, left: 20 },

    // SECURITY section (tiles 13-24) - top center curved
    13: { top: 17, left: 28 },
    14: { top: 14, left: 36 },
    15: { top: 13, left: 44 },
    16: { top: 14, left: 52 },
    17: { top: 17, left: 60 },
    18: { top: 22, left: 68 },
    19: { top: 29, left: 75 },
    20: { top: 36, left: 78 },
    21: { top: 43, left: 78 },
    22: { top: 50, left: 78 },
    23: { top: 57, left: 78 },
    24: { top: 64, left: 78 },

    // AIRPLANE section (tiles 25-36) - right side going down
    25: { top: 71, left: 78 },
    26: { top: 78, left: 78 },
    27: { top: 82, left: 75 },
    28: { top: 85, left: 70 },
    29: { top: 87, left: 65 },
    30: { top: 89, left: 60 },
    31: { top: 90, left: 55 },
    32: { top: 90, left: 50 },
    33: { top: 89, left: 45 },
    34: { top: 87, left: 42 },
    35: { top: 84, left: 48 },

    // FINISH (tile 36)
    36: { top: 93, left: 64 },
  };

  return positions[tile] || positions[1];
}

// Export player colors for use in other components
export { PLAYER_COLORS };
