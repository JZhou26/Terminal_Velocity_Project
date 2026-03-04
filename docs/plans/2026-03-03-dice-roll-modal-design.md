# Dice Roll Modal — Design Doc
Date: 2026-03-03

## Overview
When a player clicks PLAY CARDS and one of the selected cards requires a dice roll (Reckless Driver or Annoying Traveler), a modal overlay appears instead of resolving immediately. The player clicks a 3D CSS die to roll it, sees the result, then confirms to apply the card effect.

## Affected Cards
- **Reckless Driver** — roll 1d6, move that many spaces, lose 1 patience
- **Annoying Traveler** — roll 1d6: 1-3 lose 1 patience, 4-6 move +2 spaces

## Flow
1. Player selects dice card(s) and clicks PLAY CARDS
2. `handlePlayCards` in App.jsx detects `requiresDice` on any selected card
3. Sets `pendingDiceRoll` state: `{ cards: selectedCards, resolveRolls: fn }`
4. `DiceRollModal` renders (z-index overlay, blocks interaction)
5. Player clicks "ROLL" — 3D cube spin animation plays (~1s)
6. Animation ends, cube settles on rolled face (1–6), CONFIRM button appears
7. Player clicks CONFIRM → `resolveRolls({ cardId: roll })` called for each dice card
8. Modal closes, `handlePlayCards` resumes with known roll values, applies all effects, advances to discard phase

## Components

### `DiceRollModal` (`src/components/DiceRollModal/DiceRollModal.jsx`)
Props: `cards`, `onConfirm(rolls)`
- Shows card name(s) needing a roll
- One die per dice card (if two dice cards played simultaneously)
- Each die: ROLL button → spin animation → result face visible → CONFIRM button
- If two dice cards: both must be rolled before CONFIRM appears

### `Dice` (subcomponent inside DiceRollModal)
Props: `onRoll(result)`, `result` (null until rolled)
- CSS 3D cube: six `<div>` faces with pip dots (rendered as CSS box-shadows)
- `.rolling` class triggers `@keyframes diceRoll` — rapid multi-axis spin ~1s
- After animation ends (`onAnimationEnd`), face is set to result orientation
- Face-to-rotation map: `{ 1: rotateX(0deg), 2: rotateX(-90deg), 3: rotateY(90deg), 4: rotateY(-90deg), 5: rotateX(90deg), 6: rotateX(180deg) }`

### CSS Module (`DiceRollModal.module.css`)
- `.overlay` — fixed fullscreen, `background: rgba(0,0,0,0.75)`, z-index 500
- `.modal` — centered card, black bg, gold border (matches game aesthetic)
- `.scene` — `perspective: 300px` container for 3D cube
- `.cube` — `transform-style: preserve-3d`, 80px × 80px
- `.face` — absolute positioned, `backface-visibility: hidden`, white bg, black pips
- `@keyframes diceRoll` — multi-axis spin: `rotateX(720deg) rotateY(540deg) rotateZ(360deg)`

## App.jsx Changes
- Add `pendingDiceRoll` state: `null | { cards, cardsWithoutDice, selectedCards }`
- In `handlePlayCards`: if any selected card has `requiresDice`, set `pendingDiceRoll` and return early
- Add `handleDiceConfirm(rolls)`: receives `{ [cardId]: rollResult }`, merges into play logic with known roll values, dispatches state update
- Render `<DiceRollModal>` when `pendingDiceRoll !== null`
