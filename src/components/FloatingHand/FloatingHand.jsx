import { Card } from '../Card/Card';
import { PatienceTokens } from '../PatienceTokens/PatienceTokens';
import styles from './FloatingHand.module.css';

export function FloatingHand({
  player,
  selectedCards,
  onCardClick,
  onMarketClick,
  isCurrentPlayer
}) {
  if (!isCurrentPlayer) return null;

  return (
    <div className={styles.container}>
      <div className={styles.handWrapper}>
        {/* Hand.png background */}
        <img
          src="/assets/cards/Hand.png"
          alt="Player Hand"
          className={styles.handBackground}
        />

        {/* Overlaid content */}
        <div className={styles.handContent}>
          {/* Player name at top */}
          <div className={styles.playerName}>{player.name}</div>

          {/* Actual cards overlaying the mock cards in hand.png */}
          <div className={styles.cardsArea}>
            {player.hand.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className={styles.cardSlot}
                style={{
                  '--card-index': index,
                  '--total-cards': player.hand.length
                }}
              >
                <Card
                  card={card}
                  onClick={onCardClick}
                  isSelected={selectedCards.some(sc => sc.id === card.id)}
                  size="normal"
                />
              </div>
            ))}
          </div>

          {/* Patience tokens positioned where tokens appear in hand.png */}
          <div className={styles.tokensArea}>
            <PatienceTokens totalPatience={player.patience} />
          </div>

          {/* Market button */}
          <button className={styles.marketButton} onClick={onMarketClick}>
            <span className={styles.marketIcon}>🛒</span>
            Market
          </button>
        </div>
      </div>
    </div>
  );
}
