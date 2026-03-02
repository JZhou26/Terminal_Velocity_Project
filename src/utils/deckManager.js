// Deck management utilities for shuffling, drawing, and discarding cards

export function shuffle(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCards(drawPile, discardPile, count) {
  const drawn = [];
  let newDrawPile = [...drawPile];
  let newDiscardPile = [...discardPile];

  for (let i = 0; i < count; i++) {
    // If draw pile is empty, reshuffle discard pile
    if (newDrawPile.length === 0) {
      if (newDiscardPile.length === 0) {
        // No cards left to draw
        break;
      }
      newDrawPile = shuffle(newDiscardPile);
      newDiscardPile = [];
    }

    // Draw top card
    const card = newDrawPile.pop();
    if (card) {
      drawn.push(card);
    }
  }

  return {
    drawnCards: drawn,
    newDrawPile,
    newDiscardPile,
  };
}

export function discardCards(cards, discardPile) {
  return [...discardPile, ...cards];
}

export function drawFromTop(drawPile, discardPile) {
  const result = drawCards(drawPile, discardPile, 1);
  return {
    card: result.drawnCards[0] || null,
    newDrawPile: result.newDrawPile,
    newDiscardPile: result.newDiscardPile,
  };
}

export function reshuffle(discardPile) {
  return {
    drawPile: shuffle(discardPile),
    discardPile: [],
  };
}
