import { useState, useRef } from 'react';
import styles from './DiceRollModal.module.css';

// Maps a roll result 1-6 to the CSS class that orients the cube to show that face
const FACE_CLASSES = {
  1: styles.face1,
  2: styles.face2,
  3: styles.face3,
  4: styles.face4,
  5: styles.face5,
  6: styles.face6,
};

// Pip dot layout per face (grid-area names a-f)
const PIP_LAYOUTS = {
  1: ['c'],
  2: ['a', 'b'],
  3: ['a', 'c', 'b'],
  4: ['a', 'b', 'c', 'd'],
  5: ['a', 'b', 'c', 'd', 'e'],
  6: ['a', 'b', 'c', 'd', 'e', 'f'],
};

const PIP_GRID_AREAS = {
  1: '"a . ." ". c ." ". . b"',
  2: '"a . ." ". . ." ". . b"',
  3: '"a . ." ". c ." ". . b"',
  4: '"a . b" ". . ." "c . d"',
  5: '"a . b" ". c ." "d . e"',
  6: '"a . b" "c . d" "e . f"',
};

function DieFace({ faceClass, rollResult }) {
  const displayValue = rollResult ?? 1;
  const areas = PIP_GRID_AREAS[displayValue];
  const pips = PIP_LAYOUTS[displayValue];

  return (
    <div className={`${styles.face} ${faceClass}`}>
      <div
        className={styles.pips}
        style={{ gridTemplateAreas: areas }}
      >
        {pips.map((area) => (
          <div
            key={area}
            className={styles.pip}
            style={{ gridArea: area }}
          />
        ))}
      </div>
    </div>
  );
}

function SingleDie({ cardName, onRoll, rollResult }) {
  const [rolling, setRolling] = useState(false);
  const pendingResult = useRef(null);

  const handleRoll = () => {
    if (rolling || rollResult !== null) return;
    const result = Math.ceil(Math.random() * 6);
    pendingResult.current = result;
    setRolling(true);
  };

  const handleAnimationEnd = () => {
    setRolling(false);
    onRoll(pendingResult.current);
  };

  const faceClass = rollResult ? FACE_CLASSES[rollResult] : styles.face1;

  return (
    <div className={styles.dieContainer}>
      {cardName && <div className={styles.dieName}>{cardName}</div>}
      <div className={styles.scene}>
        <div
          className={`${styles.cube} ${rolling ? styles.rolling : ''} ${!rolling ? faceClass : ''}`}
          onAnimationEnd={handleAnimationEnd}
        >
          <DieFace faceClass={styles.faceFront}  rollResult={rollResult} />
          <DieFace faceClass={styles.faceBack}   rollResult={rollResult} />
          <DieFace faceClass={styles.faceLeft}   rollResult={rollResult} />
          <DieFace faceClass={styles.faceRight}  rollResult={rollResult} />
          <DieFace faceClass={styles.faceTop}    rollResult={rollResult} />
          <DieFace faceClass={styles.faceBottom} rollResult={rollResult} />
        </div>
      </div>
      <button
        className={styles.rollButton}
        onClick={handleRoll}
        disabled={rolling || rollResult !== null}
      >
        {rollResult !== null ? `Rolled ${rollResult}` : rolling ? '...' : 'ROLL'}
      </button>
    </div>
  );
}

export function DiceRollModal({ diceCards, onConfirm }) {
  // rolls: { [cardId]: number | null }
  const [rolls, setRolls] = useState(() =>
    Object.fromEntries(diceCards.map(c => [c.id, null]))
  );

  const handleRoll = (cardId, result) => {
    setRolls(prev => ({ ...prev, [cardId]: result }));
  };

  const allRolled = diceCards.every(c => rolls[c.id] !== null);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Roll the Die</h2>

        <div className={styles.diceRow}>
          {diceCards.map(card => (
            <SingleDie
              key={card.id}
              cardName={diceCards.length > 1 ? card.name : null}
              rollResult={rolls[card.id]}
              onRoll={(result) => handleRoll(card.id, result)}
            />
          ))}
        </div>

        {allRolled && (
          <div className={styles.resultText}>
            {diceCards.map(card => {
              const r = rolls[card.id];
              if (card.name === 'Reckless Driver') return `Move +${r}, -1 patience`;
              if (card.name === 'Annoying Traveler') return r <= 3 ? `-1 patience` : `+2 spaces`;
              return `Rolled ${r}`;
            }).join(' · ')}
          </div>
        )}

        <button
          className={styles.confirmButton}
          onClick={() => onConfirm(rolls)}
          disabled={!allRolled}
          style={{ visibility: allRolled ? 'visible' : 'hidden' }}
        >
          CONFIRM
        </button>
      </div>
    </div>
  );
}
