# Target Player Selection Modal — Design Doc
Date: 2026-03-03

## Overview
When a player plays Annoying Traveler (market card: roll a die, move the target back that many spaces), a target selection modal appears first. The active player picks one of the other players from a list. After selecting, the existing DiceRollModal appears. On confirm, the **target player's** position is moved back by the roll result (clamped to their section start tile).

## Affected Cards
- **Annoying Traveler** — Choose one player. Roll a die. Move them back that many spaces. (All Sections, Market deck)

## Flow
1. Player selects Annoying Traveler and clicks PLAY CARDS
2. `handlePlayCards` detects `targetsOtherPlayer` on the card — sets `pendingTargetSelection: { card, allSelectedCards }`, returns early
3. `TargetPlayerModal` renders as fixed overlay (same z-index/style as DiceRollModal)
4. Player clicks one of the other player buttons → `handleTargetConfirm(targetPlayerIndex)` is called
5. `pendingTargetSelection` is cleared; `pendingDiceRoll` is set: `{ diceCards, allSelectedCards, targetPlayerIndex }`
6. DiceRollModal appears as normal — player clicks ROLL, then CONFIRM
7. `handleDiceConfirm` reads `targetPlayerIndex` from `pendingDiceRoll`; for Annoying Traveler, moves the target player's position back by the roll amount
8. Position is clamped: cannot go below the start of the target's current section (tile 1 for drive, 13 for security, 25 for airplane)
9. Log: "[CurrentPlayer] played Annoying Traveler — [TargetPlayer] moves back [N] spaces (tile X → Y)"

## Components

### `TargetPlayerModal` (`src/components/TargetPlayerModal/TargetPlayerModal.jsx`)
Props: `players`, `currentPlayerIndex`, `onConfirm(targetIndex)`
- Fixed fullscreen overlay, same aesthetic as DiceRollModal (black bg, gold border)
- Title: "CHOOSE YOUR TARGET"
- One button per other active player (skips current player and eliminated players)
- Each button shows: player name, current tile, current patience
- Clicking a button immediately calls `onConfirm(playerIndex)` — no separate confirm step
- CSS Module: same overlay/modal/button styles as DiceRollModal

### App.jsx changes
- Add `pendingTargetSelection` state: `null | { card, allSelectedCards }`
- In `handlePlayCards`: before the `requiresDice` check, filter for `targetsOtherPlayer` cards; if found, set `pendingTargetSelection` and return
- Add `handleTargetConfirm(targetIndex)`: clears `pendingTargetSelection`, then sets `pendingDiceRoll` with `targetPlayerIndex` included
- In `handleDiceConfirm`: for Annoying Traveler, read `pendingDiceRoll.targetPlayerIndex`, compute new position for target (clamped to section start), update that player's position in `newPlayers`

## Section Start Tiles (for clamping)
- Drive: min tile 1
- Security: min tile 13
- Airplane: min tile 25

## CSS (`TargetPlayerModal.module.css`)
- `.overlay`: same as DiceRollModal — fixed, inset 0, rgba(0,0,0,0.8), z-index 500
- `.modal`: same — black bg, 3px gold border, border-radius, centered flex column
- `.title`: gold, uppercase, letter-spacing
- `.playerButton`: full-width, gold gradient, black text — same as rollButton/confirmButton style
- `.playerInfo`: name bold, tile + patience as smaller subtext
