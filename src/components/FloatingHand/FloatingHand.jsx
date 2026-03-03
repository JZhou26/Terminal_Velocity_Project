import { Card } from '../Card/Card';
import styles from './FloatingHand.module.css';

export function FloatingHand({
  player,
  selectedCards,
  onCardClick,
  onMarketClick,
  isCurrentPlayer
}) {
  if (!isCurrentPlayer) return null;

  // Calculate patience tokens
  const threeTokens = Math.floor(player.patience / 3);
  const oneTokens = player.patience % 3;

  return (
    <div className={styles.container}>
      <div className={styles.handPanel}>
        {/* Left side - YOUR HAND */}
        <div className={styles.handSection}>
          <h3 className={styles.sectionTitle}>YOUR HAND</h3>
          <div className={styles.cardsRow}>
            {player.hand.map((card, index) => (
              <div key={`${card.id}-${index}`} className={styles.cardWrapper}>
                <Card
                  card={card}
                  onClick={onCardClick}
                  isSelected={selectedCards.some(sc => sc.id === card.id)}
                  size="normal"
                />
              </div>
            ))}
            {/* Fill empty slots if less than 6 cards */}
            {Array(Math.max(0, 6 - player.hand.length)).fill(null).map((_, index) => (
              <div key={`empty-${index}`} className={styles.emptySlot} />
            ))}
          </div>
        </div>

        {/* Right side - PATIENCE */}
        <div className={styles.patienceSection}>
          <h3 className={styles.sectionTitle}>PATIENCE</h3>

          <div className={styles.tokensDisplay}>
            {/* Top row - 3 tokens */}
            <div className={styles.tokenRow}>
              {Array(threeTokens).fill(null).map((_, index) => (
                <div key={`three-${index}`} className={styles.token3}>
                  3
                </div>
              ))}
            </div>

            {/* Bottom row - 1 tokens */}
            <div className={styles.tokenRow}>
              {Array(oneTokens).fill(null).map((_, index) => (
                <div key={`one-${index}`} className={styles.token1}>
                  1
                </div>
              ))}
            </div>
          </div>

          <div className={styles.totalPatience}>
            TOTAL: {player.patience}
          </div>
        </div>

        {/* Market button */}
        <button className={styles.marketButton} onClick={onMarketClick}>
          MARKET
        </button>
      </div>
    </div>
  );
}
