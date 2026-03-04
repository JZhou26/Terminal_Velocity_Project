# Card Play Animation Design

**Goal:** When a player plays cards, each selected card animates from its position in the hand to the center of the game board, fades out, then the game state updates.

**Architecture:** Portal overlay (Option A) — a full-screen `position: fixed` overlay renders flying card clones. Real game state updates only after the animation completes.

---

## Components

### New: `CardPlayAnimation`
- `src/components/CardPlayAnimation/CardPlayAnimation.jsx`
- `src/components/CardPlayAnimation/CardPlayAnimation.module.css`
- Props: `animatingCards` — array of `{ card, startX, startY, endX, endY }`
- Renders each card as a `position: fixed` image at its starting viewport coordinates
- On mount, triggers CSS transition to fly to `endX/endY` (board center)
- Fade-out begins at 300ms, animation ends at 600ms
- Parent clears `animatingCards` after 600ms and runs real `handlePlayCards`

### Modified: `FloatingHand`
- Add `cardRefs` — a `useRef({})` map of `card.id → DOM element`
- Attach `ref` callback on each `.cardWrapper` div
- Expose via `getCardRects(selectedCardIds)` using `useImperativeHandle` + `forwardRef`

### Modified: `GameBoard`
- Accept a `boardRef` prop, attach it to `.boardWrapper` div

### Modified: `App.jsx`
- Add `boardRef = useRef(null)`, pass to GameBoard
- Add `handRef = useRef(null)`, pass to FloatingHand (forwardRef)
- Add `animatingCards` state (null when idle)
- Replace direct `onPlayCards={handlePlayCards}` with `onPlayCards={handlePlayCardsWithAnimation}`
- `handlePlayCardsWithAnimation`:
  1. Call `handRef.current.getCardRects(selectedCards.map(c => c.id))`
  2. Call `boardRef.current.getBoundingClientRect()` → compute center
  3. Set `animatingCards` with start/end coords for each card
  4. After 600ms timeout, clear `animatingCards`, call real `handlePlayCards`

---

## Animation Timeline

| Time | What happens |
|------|-------------|
| 0ms | Card clone appears at card's viewport position |
| 0–500ms | CSS transform flies card to board center |
| 300–600ms | Opacity fades 1 → 0, scale shrinks |
| 600ms | Overlay unmounts, game state updates |

---

## CSS

```css
.flyingCard {
  position: fixed;
  width: 90px;
  pointer-events: none;
  z-index: 2000;
  transition: transform 0.5s ease-in, opacity 0.3s ease-in 0.3s, scale 0.3s ease-in 0.3s;
}

.flyingCard.animating {
  opacity: 0;
  scale: 0.3;
}
```
