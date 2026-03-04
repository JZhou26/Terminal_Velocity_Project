# Target Player Selection Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When Annoying Traveler is played, show a modal to select a target player before the dice roll modal appears, then move that player back by the rolled amount.

**Architecture:** A new `TargetPlayerModal` component renders first when any selected card has `targetsOtherPlayer`. After the player picks a target, `pendingDiceRoll` is set with `targetPlayerIndex` included. `handleDiceConfirm` already reads `pendingDiceRoll` and can apply the roll to the target player's position instead of the current player's.

**Tech Stack:** React, CSS Modules (no new dependencies)

---

### Task 1: Create TargetPlayerModal component

**Files:**
- Create: `src/components/TargetPlayerModal/TargetPlayerModal.jsx`
- Create: `src/components/TargetPlayerModal/TargetPlayerModal.module.css`

**Step 1: Create the CSS module**

Create `src/components/TargetPlayerModal/TargetPlayerModal.module.css`:

```css
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

.playerList {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.playerButton {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
  color: #000000;
  border: 2px solid #000000;
  border-radius: 0.5rem;
  font-weight: 900;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.6);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.playerButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.8);
}

.playerName {
  font-size: 1rem;
  font-weight: 900;
}

.playerStats {
  font-size: 0.7rem;
  font-weight: 700;
  opacity: 0.7;
  letter-spacing: 0.5px;
}
```

**Step 2: Create the JSX component**

Create `src/components/TargetPlayerModal/TargetPlayerModal.jsx`:

```jsx
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
              key={index}
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
```

**Step 3: Verify files exist**

```bash
ls /Users/joshuazhou/Downloads/TerminalVelocity/terminal-velocity-game/src/components/TargetPlayerModal/
```
Expected: `TargetPlayerModal.jsx  TargetPlayerModal.module.css`

---

### Task 2: Wire TargetPlayerModal into App.jsx

**Files:**
- Modify: `src/App.jsx`

**Step 1: Add import at the top of App.jsx**

After the DiceRollModal import, add:
```js
import { TargetPlayerModal } from './components/TargetPlayerModal/TargetPlayerModal';
```

**Step 2: Add `pendingTargetSelection` state inside `GameContent`**

After `const [pendingDiceRoll, setPendingDiceRoll] = useState(null);`, add:
```js
const [pendingTargetSelection, setPendingTargetSelection] = useState(null);
```

**Step 3: Add target-player detection in `handlePlayCards`**

In `handlePlayCards`, inside `if (state.turnPhase === 'play')`, after the section/cancel validation loop and BEFORE the `requiresDice` check, insert:

```js
      // If any selected card targets another player, show target selection modal first
      const targetCards = selectedCards.filter(c => c.targetsOtherPlayer);
      if (targetCards.length > 0) {
        setPendingTargetSelection({ targetCard: targetCards[0], allSelectedCards: selectedCards });
        return;
      }
```

**Step 4: Add `handleTargetConfirm` function**

After `handlePlayCards` closing `};` and before `handleDiceConfirm`, add:

```js
  const handleTargetConfirm = (targetPlayerIndex) => {
    const { targetCard, allSelectedCards } = pendingTargetSelection;
    setPendingTargetSelection(null);
    const diceCards = allSelectedCards.filter(c => c.requiresDice);
    setPendingDiceRoll({ diceCards, allSelectedCards, targetPlayerIndex });
  };
```

**Step 5: Handle Annoying Traveler in `handleDiceConfirm`**

In `handleDiceConfirm`, read `targetPlayerIndex` from `pendingDiceRoll`. Change the destructure at the top:

Replace:
```js
    const { allSelectedCards } = pendingDiceRoll;
```
With:
```js
    const { allSelectedCards, targetPlayerIndex } = pendingDiceRoll;
```

Then in the `allSelectedCards.forEach` switch, add a case for Annoying Traveler. The Annoying Traveler case must:
1. Get the roll from `rolls[card.id]`
2. Get the target player from `state.players[targetPlayerIndex]`
3. Compute section start for the target (1 for drive, 13 for security, 25 for airplane) using `getSection`
4. Move the target back by roll, clamped to section start
5. Update `newPlayers[targetPlayerIndex]` with the new position
6. Push to logParts with target name

Add this case inside the `allSelectedCards.forEach` switch in `handleDiceConfirm`, after the `Cutting It Close` case and before `default`:

```js
        case 'Annoying Traveler': {
          const roll = rolls[card.id];
          const target = state.players[targetPlayerIndex];
          const targetSection = getSection(target.position);
          const sectionStart = targetSection === 'drive' ? 1 : targetSection === 'security' ? 13 : 25;
          const newTargetPosition = Math.max(sectionStart, target.position - roll);
          newPlayers[targetPlayerIndex] = {
            ...target,
            position: newTargetPosition,
          };
          logParts.push(`${card.name} (rolled ${roll}, ${target.name} moves back ${target.position - newTargetPosition} spaces)`);
          break;
        }
```

Note: `newPlayers` is declared just below `handleDiceConfirm`'s forEach — you need to ensure the Annoying Traveler case's `newPlayers[targetPlayerIndex]` assignment happens AFTER `newPlayers` is initialized. Currently `newPlayers` is declared after the forEach. Move the `newPlayers` declaration to BEFORE the forEach:

```js
    // Declare newPlayers before forEach so Annoying Traveler can mutate target player
    const newPlayers = [...state.players];
```

And remove the duplicate `const newPlayers` declaration that comes after the forEach.

**Step 6: Render TargetPlayerModal in JSX**

In the `return (...)` of `GameContent`, after the DiceRollModal block and before the closing `</div>`, add:

```jsx
      {pendingTargetSelection && (
        <TargetPlayerModal
          players={state.players}
          currentPlayerIndex={state.currentPlayerIndex}
          onConfirm={handleTargetConfirm}
        />
      )}
```

**Step 7: Verify build succeeds**

```bash
cd /Users/joshuazhou/Downloads/TerminalVelocity/terminal-velocity-game && npm run build
```
Expected: `✓ built in ~400ms` with no errors.

---

### Task 3: Manual integration test

Open the game in the browser (`npm run dev`) and verify:

1. Draw/acquire an Annoying Traveler card (it's in the market deck — use blind draw)
2. Select it and click PLAY CARDS
3. **TargetPlayerModal** appears — should show 3 player buttons (not the current player), each with name, tile, patience
4. Click a player button — TargetPlayerModal closes, DiceRollModal opens
5. Roll the die — result shows "Target moves back N spaces"
6. Click CONFIRM — DiceRollModal closes
7. Target player's token on the board moves back by the rolled amount
8. Game log shows e.g. "Player A played Annoying Traveler (rolled 4, Player B moves back 4 spaces)"
9. Target cannot be moved below their section start tile

---

### Task 4: Commit

```bash
cd /Users/joshuazhou/Downloads/TerminalVelocity/terminal-velocity-game
git add src/components/TargetPlayerModal/ src/App.jsx docs/plans/
git commit -m "feat: add target player selection modal for Annoying Traveler"
```
