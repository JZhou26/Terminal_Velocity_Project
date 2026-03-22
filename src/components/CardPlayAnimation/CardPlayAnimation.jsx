import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './CardPlayAnimation.module.css';

export function CardPlayAnimation({ animatingCards }) {
  // Each entry: { card, startX, startY, endX, endY }
  // startX/Y = card top-left viewport coords
  // endX/Y = board center viewport coords (we'll center the card on that point)
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    // One rAF to let the browser paint the starting position, then trigger the transition
    let outer, inner;
    outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setTriggered(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  return createPortal(
    <div className={styles.overlay}>
      {animatingCards.map(({ card, startX, startY, endX, endY }) => {
        const cardWidth = 65;
        // translate from start position to end position (centered on board center)
        const cardHeight = cardWidth * 1.4;
        const dx = endX - startX - cardWidth / 2;
        const dy = endY - startY - cardHeight / 2;

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
    </div>,
    document.body
  );
}
