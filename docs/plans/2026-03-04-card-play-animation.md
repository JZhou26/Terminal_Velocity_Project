# Card Play Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When a player clicks PLAY, selected cards animate from the hand to the center of the game board, fade out, then the game state updates.

**Architecture:** Portal overlay pattern — a full-screen `position: fixed` overlay renders flying card image clones. `FloatingHand` exposes card DOM rects via `useImperativeHandle`. `GameBoard` exposes its board wrapper rect via a forwarded ref. `App.jsx` intercepts the play action, computes coordinates, sets `animatingCards` state, then fires the real game update after 600ms.

**Tech Stack:** React 18, CSS Modules, CSS transitions (no animation libraries)

---

### Task 1: Add `boardRef` to GameBoard

**Files:**
- Modify: `src/components/GameBoard/GameBoard.jsx`

**Context:** GameBoard renders a `.boardWrapper` div that wraps the board image. We need App.jsx to be able to call `.getBoundingClientRect()` on it to find the board center. We do this by accepting a `boardRef` prop and attaching it to `.boardWrapper`.

**Step 1: Modify GameBoard to accept and attach boardRef**

Open `src/components/GameBoard/GameBoard.jsx`. Change the function signature and attach the ref:

```jsx
export function GameBoard({ players, boardRef }) {
  return (
    <div className={styles.container}>
      <div className={styles.mainRow}>
        <div className={styles.boardColumn}>
          <div className={styles.boardWrapper} ref={boardRef}>
            {/* ... rest unchanged ... */}
```

**Step 2: Verify in browser**

Start dev server: `npm run dev` (in `terminal-velocity-game/`)
Open the game, open DevTools → no console errors.

**Step 3: Commit**

```bash
git add src/components/GameBoard/GameBoard.jsx
git commit -m "feat: expose boardRef on GameBoard boardWrapper"
```

---

### Task 2: Expose card rects from FloatingHand via forwardRef

**Files:**
- Modify: `src/components/FloatingHand/FloatingHand.jsx`

**Context:** App.jsx needs to know the viewport position of each selected card element at the moment PLAY is clicked. We use `forwardRef` + `useImperativeHandle` to expose a `getCardRects(cardIds)` method. Card wrappers get a ref stored in a `cardRefs` map keyed by `card.id`.

**Step 1: Add forwardRef + useImperativeHandle**

At the top of `FloatingHand.jsx`, add `forwardRef, useImperativeHandle` to the React import:

```jsx
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
```

**Step 2: Wrap the component in forwardRef**

Change:
```jsx
export function FloatingHand({
  player,
  ...
}) {
```

To:
```jsx
export const FloatingHand = forwardRef(function FloatingHand({
  player,
  playerIndex,
  selectedCards,
  onCardClick,
  isCurrentPlayer,
  turnPhase,
  upgradeCards,
  onBuyUpgrade,
  onDrawMarket,
  onBuyMarketCard,
  onPlayCards,
  onSkipPhase,
  onEndTurn,
  marketDrawCards = [],
}, ref) {
```

Close the extra `)` at the end of the function: `});`

**Step 3: Add cardRefs map and useImperativeHandle inside the function body (after the early return guard)**

Place this BEFORE the `if (!isCurrentPlayer) return null;` line — hooks must not be called conditionally:

```jsx
  const cardRefs = useRef({});

  useImperativeHandle(ref, () => ({
    getCardRects(cardIds) {
      return cardIds.map(id => {
        const el = cardRefs.current[id];
        return el ? el.getBoundingClientRect() : null;
      });
    },
  }));
```

**Step 4: Attach refs to card wrappers in the PLAYER HAND VIEW**

Find the `.cardWrapper` div in the hand cards map (around line 188):

```jsx
{player.hand.map((card, index) => (
  <div
    key={`${card.id}-${index}`}
    className={styles.cardWrapper}
    ref={el => { cardRefs.current[card.id] = el; }}
  >
```

**Step 5: Verify — no console errors, hand still renders normally**

**Step 6: Commit**

```bash
git add src/components/FloatingHand/FloatingHand.jsx
git commit -m "feat: expose getCardRects via useImperativeHandle on FloatingHand"
```

---

### Task 3: Create CardPlayAnimation component

**Files:**
- Create: `src/components/CardPlayAnimation/CardPlayAnimation.jsx`
- Create: `src/components/CardPlayAnimation/CardPlayAnimation.module.css`

**Context:** This component receives an array of `{ card, startX, startY, endX, endY }` objects. It renders each card image as a `position: fixed` element at its start position, then on mount triggers a CSS transition to fly to end position while fading and shrinking.

**Step 1: Create the CSS file**

`src/components/CardPlayAnimation/CardPlayAnimation.module.css`:

```css
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2000;
}

.flyingCard {
  position: fixed;
  width: 90px;
  pointer-events: none;
  border-radius: 4px;
  transition: transform 0.5s ease-in, opacity 0.3s ease-in 0.25s, scale 0.3s ease-in 0.25s;
}

.flyingCard.animating {
  opacity: 0;
  scale: 0.2;
}
```

**Step 2: Create the component**

`src/components/CardPlayAnimation/CardPlayAnimation.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react';
import styles from './CardPlayAnimation.module.css';

export function CardPlayAnimation({ animatingCards }) {
  // Each entry: { card, startX, startY, endX, endY }
  // startX/Y = card top-left viewport coords
  // endX/Y = board center viewport coords (we'll center the card on that point)
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    // One rAF to let the browser paint the starting position, then trigger the transition
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setTriggered(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={styles.overlay}>
      {animatingCards.map(({ card, startX, startY, endX, endY }) => {
        const cardWidth = 90;
        // translate from start position to end position (centered on board center)
        const dx = endX - startX - cardWidth / 2;
        const dy = endY - startY - cardWidth * 1.4; // approximate card height

        return (
          <img
            key={card.id}
            src={card.imagePath}
            alt={card.name}
            className={`${styles.flyingCard} ${triggered ? styles.animating : ''}`}
            style={{
              top: startY,
              left: startX,
              transform: triggered ? `translate(${dx}px, ${dy}px)` : 'translate(0, 0)',
            }}
          />
        );
      })}
    </div>
  );
}
```

**Step 3: Verify file structure**

```bash
ls src/components/CardPlayAnimation/
# CardPlayAnimation.jsx  CardPlayAnimation.module.css
```

**Step 4: Commit**

```bash
git add src/components/CardPlayAnimation/
git commit -m "feat: add CardPlayAnimation portal overlay component"
```

---

### Task 4: Wire everything together in App.jsx

**Files:**
- Modify: `src/App.jsx`

**Context:** App.jsx needs to:
1. Create `boardRef` and `handRef`
2. Pass `boardRef` to GameBoard, `handRef` (as a forwarded ref) to FloatingHand
3. Add `animatingCards` state
4. Intercept PLAY with `handlePlayCardsWithAnimation` which captures rects, sets state, waits 600ms, then calls real `handlePlayCards`
5. Render `<CardPlayAnimation>` when `animatingCards` is set

**Step 1: Add imports**

At the top of `src/App.jsx`, add to the React import:
```jsx
import { useState, useRef } from 'react';
```
And add:
```jsx
import { CardPlayAnimation } from './components/CardPlayAnimation/CardPlayAnimation';
```

**Step 2: Add refs and animatingCards state**

Inside `GameContent`, near the other state declarations:

```jsx
const boardRef = useRef(null);
const handRef = useRef(null);
const [animatingCards, setAnimatingCards] = useState(null);
```

**Step 3: Add handlePlayCardsWithAnimation**

Add this function right before the `return` statement in GameContent:

```jsx
const handlePlayCardsWithAnimation = () => {
  // Only animate during play phase with selected cards
  if (selectedCards.length === 0 || state.turnPhase !== 'play') {
    handlePlayCards();
    return;
  }

  // Get card starting positions
  const cardRects = handRef.current?.getCardRects(selectedCards.map(c => c.id)) ?? [];

  // Get board center
  const boardRect = boardRef.current?.getBoundingClientRect();
  const endX = boardRect ? boardRect.left + boardRect.width / 2 : window.innerWidth / 2;
  const endY = boardRect ? boardRect.top + boardRect.height / 2 : window.innerHeight / 2;

  const cards = selectedCards.map((card, i) => ({
    card,
    startX: cardRects[i]?.left ?? window.innerWidth / 2,
    startY: cardRects[i]?.top ?? window.innerHeight,
    endX,
    endY,
  }));

  setAnimatingCards(cards);

  setTimeout(() => {
    setAnimatingCards(null);
    handlePlayCards();
  }, 600);
};
```

**Step 4: Pass boardRef to GameBoard**

```jsx
<GameBoard
  players={state.players}
  boardRef={boardRef}
  {/* ... other props unchanged ... */}
/>
```

**Step 5: Pass handRef to FloatingHand**

```jsx
<FloatingHand
  ref={handRef}
  player={currentPlayer}
  {/* ... other props unchanged ... */}
  onPlayCards={handlePlayCardsWithAnimation}
  {/* ... rest unchanged ... */}
/>
```

**Step 6: Render CardPlayAnimation**

After the FloatingHand render, before the closing `</div>`:

```jsx
{animatingCards && (
  <CardPlayAnimation animatingCards={animatingCards} />
)}
```

**Step 7: Verify in browser**

- Start game, select a card, click PLAY
- Card image should fly from hand to board center, fade out
- After ~600ms, player position updates normally
- No console errors

**Step 8: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire card play animation into App.jsx"
```

---

### Task 5: Polish — hide selected cards in hand during animation

**Files:**
- Modify: `src/components/FloatingHand/FloatingHand.jsx`
- Modify: `src/components/FloatingHand/FloatingHand.module.css`

**Context:** During the animation, the real cards are still visible in the hand underneath the flying clones. We should hide them so it looks like the cards actually left the hand.

**Step 1: Accept an `animatingCardIds` prop in FloatingHand**

Add to the props destructuring:
```jsx
  animatingCardIds = [],
```

**Step 2: Apply a hidden class to cards being animated**

In the card wrapper map:
```jsx
<div
  key={`${card.id}-${index}`}
  className={`${styles.cardWrapper} ${animatingCardIds.includes(card.id) ? styles.cardHidden : ''}`}
  ref={el => { cardRefs.current[card.id] = el; }}
>
```

**Step 3: Add the CSS class**

In `FloatingHand.module.css`:
```css
.cardHidden {
  opacity: 0;
  pointer-events: none;
}
```

**Step 4: Pass animatingCardIds from App.jsx**

```jsx
<FloatingHand
  ref={handRef}
  {/* ... */}
  animatingCardIds={animatingCards ? animatingCards.map(a => a.card.id) : []}
  {/* ... */}
/>
```

**Step 5: Verify in browser**

- Click PLAY — selected cards disappear from hand immediately, flying clones appear and travel to board center
- After animation, hand updates with cards removed from hand array

**Step 6: Commit**

```bash
git add src/components/FloatingHand/FloatingHand.jsx src/components/FloatingHand/FloatingHand.module.css src/App.jsx
git commit -m "feat: hide animating cards in hand during play animation"
```
