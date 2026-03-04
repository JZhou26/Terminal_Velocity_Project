# Dice Roll Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When a player clicks PLAY CARDS with Reckless Driver or Annoying Traveler selected, show a modal with a 3D CSS spinning die the player clicks to roll, then confirm the result before the card effect resolves.

**Architecture:** A new `DiceRollModal` component renders as a fixed overlay when `pendingDiceRoll` state is set in `App.jsx`. `handlePlayCards` detects `requiresDice` cards and sets that state instead of resolving inline. On confirm, a `handleDiceConfirm(rolls)` callback receives the roll results and runs the effect logic with known values.

**Tech Stack:** React, CSS Modules, CSS 3D transforms + keyframe animations (no libraries)

---

### Task 1: Create DiceRollModal component files

**Files:**
- Create: `src/components/DiceRollModal/DiceRollModal.jsx`
- Create: `src/components/DiceRollModal/DiceRollModal.module.css`

**Step 1: Create the CSS module**

Create `src/components/DiceRollModal/DiceRollModal.module.css` with this exact content:

```css
/* Overlay */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
}

.modal {
  background: #000000;
  border: 3px solid #FFD700;
  border-radius: 0.5rem;
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  box-shadow:
    0 0 40px rgba(255, 215, 0, 0.5),
    0 8px 32px rgba(0, 0, 0, 0.6);
  min-width: 320px;
}

.title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 900;
  color: #FFD700;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-align: center;
}

.cardName {
  margin: 0;
  font-size: 0.8rem;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
}

/* Multiple dice row */
.diceRow {
  display: flex;
  gap: 2rem;
  align-items: flex-end;
}

/* Individual die */
.dieContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.dieName {
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 3D scene */
.scene {
  width: 80px;
  height: 80px;
  perspective: 300px;
}

.cube {
  width: 80px;
  height: 80px;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(0deg) rotateY(0deg);
  transition: transform 0.1s;
}

.cube.rolling {
  animation: diceRoll 1s ease-out forwards;
}

/* Show face 1 by default */
.cube.face1 { transform: rotateX(0deg) rotateY(0deg); }
.cube.face2 { transform: rotateX(-90deg) rotateY(0deg); }
.cube.face3 { transform: rotateX(0deg) rotateY(90deg); }
.cube.face4 { transform: rotateX(0deg) rotateY(-90deg); }
.cube.face5 { transform: rotateX(90deg) rotateY(0deg); }
.cube.face6 { transform: rotateX(180deg) rotateY(0deg); }

@keyframes diceRoll {
  0%   { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
  25%  { transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg); }
  50%  { transform: rotateX(540deg) rotateY(360deg) rotateZ(180deg); }
  75%  { transform: rotateX(630deg) rotateY(450deg) rotateZ(270deg); }
  100% { transform: rotateX(720deg) rotateY(540deg) rotateZ(360deg); }
}

.face {
  position: absolute;
  width: 80px;
  height: 80px;
  background: #ffffff;
  border: 2px solid #1a1a1a;
  display: grid;
  padding: 10px;
  box-sizing: border-box;
}

/* Face positions */
.faceFront  { transform: translateZ(40px); }
.faceBack   { transform: rotateY(180deg) translateZ(40px); }
.faceLeft   { transform: rotateY(-90deg) translateZ(40px); }
.faceRight  { transform: rotateY(90deg) translateZ(40px); }
.faceTop    { transform: rotateX(90deg) translateZ(40px); }
.faceBottom { transform: rotateX(-90deg) translateZ(40px); }

/* Pip grid layouts */
.face1 .pips { grid-template-areas: ". . ." ". c ." ". . ."; }
.face2 .pips { grid-template-areas: "a . ." ". . ." ". . b"; }
.face3 .pips { grid-template-areas: "a . ." ". c ." ". . b"; }
.face4 .pips { grid-template-areas: "a . b" ". . ." "c . d"; }
.face5 .pips { grid-template-areas: "a . b" ". c ." "d . e"; }
.face6 .pips { grid-template-areas: "a . b" "c . d" "e . f"; }

.pips {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}

.pip {
  width: 12px;
  height: 12px;
  background: #1a1a1a;
  border-radius: 50%;
  align-self: center;
  justify-self: center;
}

/* pip grid-area assignments — each face div gets data-face and we use nth/class selectors */

/* Buttons */
.rollButton {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
  color: #000000;
  border: 2px solid #000000;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 2px;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.6);
  transition: transform 0.2s, box-shadow 0.2s;
}

.rollButton:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.8);
}

.rollButton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.resultText {
  font-size: 1rem;
  font-weight: 900;
  color: #FFD700;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
  min-height: 1.5rem;
}

.confirmButton {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
  color: #000000;
  border: 2px solid #000000;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 2px;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.6);
  transition: transform 0.2s, box-shadow 0.2s;
}

.confirmButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.8);
}
```

**Step 2: Create the JSX component**

Create `src/components/DiceRollModal/DiceRollModal.jsx` with this exact content:

```jsx
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
  const displayValue = rollResult || 1;
  const areas = PIP_GRID_AREAS[displayValue];
  const pips = PIP_LAYOUTS[displayValue];

  return (
    <div className={`${styles.face} ${faceClass}`}>
      <div
        className={styles.pips}
        style={{ gridTemplateAreas: areas }}
      >
        {pips.map((area, i) => (
          <div
            key={i}
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
```

**Step 3: Verify files exist**

```bash
ls src/components/DiceRollModal/
```
Expected: `DiceRollModal.jsx  DiceRollModal.module.css`

---

### Task 2: Wire DiceRollModal into App.jsx

**Files:**
- Modify: `src/App.jsx`

**Step 1: Add import at top of App.jsx**

After the existing imports, add:
```js
import { DiceRollModal } from './components/DiceRollModal/DiceRollModal';
```

**Step 2: Add `pendingDiceRoll` state inside `GameContent`**

After the existing `useState` declarations (after `setPendingMarketPiles`), add:
```js
const [pendingDiceRoll, setPendingDiceRoll] = useState(null);
```

**Step 3: Replace the dice-card handling in `handlePlayCards`**

Find this block in `handlePlayCards` (inside the `if (state.turnPhase === 'play')` branch), right before `let newPosition`:

```js
      // Validate section restrictions before playing — don't consume unplayable cards
      for (const card of selectedCards) {
        if (card.section !== 'all' && card.section !== section && !hasExpertTraveler) {
          addLog(`${currentPlayer.name} cannot play ${card.name} in the ${section} section!`);
          return;
        }
        if (card.category === 'cancel') {
          addLog(`Cancel cards can only be played reactively when an Event or Annoyance is drawn.`);
          return;
        }
      }
```

Replace it with:

```js
      // Validate section restrictions before playing — don't consume unplayable cards
      for (const card of selectedCards) {
        if (card.section !== 'all' && card.section !== section && !hasExpertTraveler) {
          addLog(`${currentPlayer.name} cannot play ${card.name} in the ${section} section!`);
          return;
        }
        if (card.category === 'cancel') {
          addLog(`Cancel cards can only be played reactively when an Event or Annoyance is drawn.`);
          return;
        }
      }

      // If any selected card requires a dice roll, open the modal instead of resolving inline
      const diceCards = selectedCards.filter(c => c.requiresDice);
      if (diceCards.length > 0) {
        setPendingDiceRoll({ diceCards, allSelectedCards: selectedCards });
        return;
      }
```

**Step 4: Add `handleDiceConfirm` function after `handlePlayCards`**

After the closing `};` of `handlePlayCards`, add this new function:

```js
  const handleDiceConfirm = (rolls) => {
    const { diceCards, allSelectedCards } = pendingDiceRoll;
    setPendingDiceRoll(null);

    const currentPlayer = state.players[state.currentPlayerIndex];
    const section = getSection(currentPlayer.position);
    const hasExpertTraveler = currentPlayer.upgrades.some(u => u.id === 'expert-traveler');
    const hasSeasonedTraveler = currentPlayer.upgrades.some(u => u.id === 'seasoned-traveler');

    let newPosition = currentPlayer.position;
    let newPatience = currentPlayer.patience;
    const logParts = [];

    if (allSelectedCards.length === 2) {
      newPatience -= 1;
    }

    allSelectedCards.forEach(card => {
      switch (card.name) {
        case 'Casual Traveler': {
          const move = hasSeasonedTraveler ? 3 : 2;
          newPosition = Math.min(36, newPosition + move);
          logParts.push(`${card.name} (+${move} spaces)`);
          break;
        }
        case 'HOV Lane':
          newPosition = Math.min(36, newPosition + 3);
          logParts.push(`${card.name} (+3 spaces)`);
          break;
        case 'Express Lane':
          newPosition = Math.min(36, newPosition + 3);
          logParts.push(`${card.name} (+3 spaces)`);
          break;
        case 'TSA Precheck':
          newPosition = Math.min(36, newPosition + 4);
          logParts.push(`${card.name} (+4 spaces)`);
          break;
        case 'Hands Free Device':
          newPosition = Math.min(36, newPosition + 4);
          logParts.push(`${card.name} (+4 spaces)`);
          break;
        case 'Complimentary Upgrade':
          newPosition = Math.min(36, newPosition + 3);
          logParts.push(`${card.name} (+3 spaces)`);
          break;
        case 'Empty Row':
          newPosition = Math.min(36, newPosition + 4);
          logParts.push(`${card.name} (+4 spaces)`);
          break;
        case 'Baggage Claim':
          newPosition = Math.min(36, newPosition + 5);
          logParts.push(`${card.name} (+5 spaces)`);
          break;
        case 'Cutting It Close':
          newPosition = Math.min(36, newPosition + 2);
          newPatience -= 1;
          logParts.push(`${card.name} (+2 spaces, -1 patience)`);
          break;
        case 'Reckless Driver': {
          const roll = rolls[card.id];
          newPosition = Math.min(36, newPosition + roll);
          newPatience -= 1;
          logParts.push(`${card.name} (rolled ${roll}, +${roll} spaces, -1 patience)`);
          break;
        }
        case 'Annoying Traveler': {
          const roll = rolls[card.id];
          if (roll <= 3) {
            newPatience -= 1;
            logParts.push(`${card.name} (rolled ${roll}, -1 patience)`);
          } else {
            newPosition = Math.min(36, newPosition + 2);
            logParts.push(`${card.name} (rolled ${roll}, +2 spaces)`);
          }
          break;
        }
        case 'Calm Traveling':
          newPatience += 1;
          logParts.push(`${card.name} (+1 patience)`);
          break;
        case 'Relaxing Spa':
          newPatience += 2;
          logParts.push(`${card.name} (+2 patience)`);
          break;
        case 'Smooth Flight':
          newPatience += 3;
          logParts.push(`${card.name} (+3 patience)`);
          break;
        default:
          logParts.push(`${card.name} (no effect)`);
      }
    });

    const newPlayers = [...state.players];
    newPlayers[state.currentPlayerIndex] = {
      ...currentPlayer,
      position: newPosition,
      patience: Math.max(0, newPatience),
      hand: currentPlayer.hand.filter(c => !allSelectedCards.some(sc => sc.id === c.id)),
      cardsPlayedThisTurn: currentPlayer.cardsPlayedThisTurn + allSelectedCards.length,
    };

    const newBasicDiscard = [...state.basicDiscardPile, ...allSelectedCards];

    dispatch({
      type: 'INITIALIZE_GAME',
      payload: {
        ...state,
        players: newPlayers,
        basicDiscardPile: newBasicDiscard,
        turnPhase: 'discard',
      },
    });

    addLog(`${currentPlayer.name} played: ${logParts.join(', ')}`);
    setSelectedCards([]);
  };
```

**Step 5: Remove the inline dice roll cases from `handlePlayCards`**

In `handlePlayCards`, inside the `selectedCards.forEach` switch statement, find and remove these two cases (they are now handled by `handleDiceConfirm`):

```js
        case 'Reckless Driver': {
          const roll = Math.ceil(Math.random() * 6);
          newPosition = Math.min(36, newPosition + roll);
          newPatience -= 1;
          logParts.push(`${card.name} (rolled ${roll}, +${roll} spaces, -1 patience)`);
          break;
        }
        case 'Annoying Traveler': {
          const roll = Math.ceil(Math.random() * 6);
          if (roll <= 3) {
            newPatience -= 1;
            logParts.push(`${card.name} (rolled ${roll}, -1 patience)`);
          } else {
            newPosition = Math.min(36, newPosition + 2);
            logParts.push(`${card.name} (rolled ${roll}, +2 spaces)`);
          }
          break;
        }
```

Replace them with just a default fallback comment (they'll never be reached now, but keep a default):
```js
        // Dice cards are handled by handleDiceConfirm via DiceRollModal
```

**Step 6: Render the modal in JSX**

In the `return (...)` of `GameContent`, after `<FloatingHand ... />` and before `</div>`, add:

```jsx
      {pendingDiceRoll && (
        <DiceRollModal
          diceCards={pendingDiceRoll.diceCards}
          onConfirm={handleDiceConfirm}
        />
      )}
```

**Step 7: Verify the app starts without errors**

```bash
npm run dev
```
Expected: No console errors, game loads normally.

---

### Task 3: Manual integration test

Open the game in the browser and run through these scenarios:

1. Start a game, wait until a player gets a **Reckless Driver** in hand
2. Select it and click PLAY — modal should appear
3. Click ROLL — cube animates for ~1s, lands on a face showing pips
4. Result text shows e.g. "Move +4, -1 patience"
5. Click CONFIRM — modal closes, player position updates, log shows the roll result
6. Repeat with **Annoying Traveler** — verify 1-3 gives patience loss, 4-6 gives movement
7. Select one dice card + one non-dice card — both should trigger modal (modal handles the dice card, non-dice card resolves as part of `handleDiceConfirm`)

---

### Task 4: Commit

```bash
cd /Users/joshuazhou/Downloads/TerminalVelocity/terminal-velocity-game
git add src/components/DiceRollModal/ src/App.jsx docs/plans/
git commit -m "feat: add 3D dice roll modal for Reckless Driver and Annoying Traveler"
```
