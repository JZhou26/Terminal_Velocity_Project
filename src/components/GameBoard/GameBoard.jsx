import styles from './GameBoard.module.css';

const PLAYER_PLANES = [
  '/assets/cards/Plane1.png',
  '/assets/cards/Plane2.png',
  '/assets/cards/Plane3.png',
  '/assets/cards/Plane4.png',
];

const PLAYER_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];

export function GameBoard({ players, boardRef }) {
  return (
    <div className={styles.container}>
      <div className={styles.mainRow}>
        {/* Board + legend */}
        <div className={styles.boardColumn}>
          <div className={styles.boardWrapper} ref={boardRef}>
            <img
              src="/assets/board/OnlineGameBoard.png"
              alt="Game Board"
              className={styles.boardImage}
            />

            <div className={styles.playerTokens}>
              {(() => {
                // Count how many active players share each tile so we can offset them
                const tileSlots = {};
                players.forEach((player, index) => {
                  if (player.isEliminated) return;
                  const pos = player.position;
                  if (!tileSlots[pos]) tileSlots[pos] = [];
                  tileSlots[pos].push(index);
                });

                return players.map((player, index) => {
                  if (player.isEliminated) return null;

                  const position = player.position;
                  const { top, left } = getTilePosition(position);
                  const slotGroup = tileSlots[position];
                  const slotIndex = slotGroup.indexOf(index);
                  // Offset each token upward by 4% per slot so they stack visibly
                  const topOffset = slotIndex * -4;

                  return (
                    <img
                      key={player.id}
                      src={PLAYER_PLANES[index]}
                      alt={`${player.name} - Tile ${position}`}
                      className={styles.playerToken}
                      style={{
                        top: `${top + topOffset}%`,
                        left: `${left}%`,
                      }}
                      title={`${player.name} - Tile ${position}`}
                    />
                  );
                });
              })()}
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
      </div>
    </div>
  );
}

// Map tile positions (1-36) to coordinates on OnlineGameBoard (horizontal racetrack layout)
function getTilePosition(tile) {
  // Positions are percentages of image width/height
  // Board layout: horizontal oval - top row (Start→Drive→Security), right curve, bottom row (Airplane→Finish)
  const positions = {
    // START (tile 1) - far left, top row
    1: { top: 23, left: 5 },

    // DRIVE section (tiles 2-12) - top row, left to right
    2: { top: 23, left: 12 },
    3: { top: 23, left: 18 },
    4: { top: 23, left: 24 },
    5: { top: 23, left: 30 },
    6: { top: 23, left: 36 },
    7: { top: 23, left: 42 },
    8: { top: 23, left: 48 },
    9: { top: 23, left: 54 },
    10: { top: 23, left: 60 },
    11: { top: 23, left: 66 },
    12: { top: 23, left: 70 },

    // SECURITY section (tiles 13-24) - right curve, top to bottom
    13: { top: 17, left: 76 },
    14: { top: 14, left: 80 },
    15: { top: 13, left: 84 },
    16: { top: 15, left: 88 },
    17: { top: 21, left: 91 },
    18: { top: 29, left: 93 },
    19: { top: 38, left: 94 },
    20: { top: 47, left: 93 },
    21: { top: 55, left: 91 },
    22: { top: 63, left: 88 },
    23: { top: 69, left: 84 },
    24: { top: 73, left: 80 },

    // AIRPLANE section (tiles 25-35) - bottom row, right to left
    25: { top: 77, left: 76 },
    26: { top: 77, left: 70 },
    27: { top: 77, left: 64 },
    28: { top: 77, left: 58 },
    29: { top: 77, left: 52 },
    30: { top: 77, left: 46 },
    31: { top: 77, left: 40 },
    32: { top: 77, left: 34 },
    33: { top: 77, left: 28 },
    34: { top: 77, left: 22 },
    35: { top: 77, left: 16 },

    // FINISH (tile 36) - far left, bottom row
    36: { top: 77, left: 7 },
  };

  return positions[tile] || positions[1];
}

// Export player colors for use in other components
export { PLAYER_COLORS };
