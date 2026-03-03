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

  return (
    <div className={styles.container}>
      <div className={styles.handWrapper}>
        <img
          src="/assets/cards/Hand.png"
          alt="Player Hand"
          className={styles.handBackground}
        />

        <div className={styles.handContent}>
          <div className={styles.playerInfo}>
            <span className={styles.playerName}>{player.name}</span>
            <div className={styles.stats}>
              <span className={styles.stat}>
                Tile: <strong>{player.position}</strong>/36
              </span>
              <span className={`${styles.stat} ${player.patience <= 2 ? styles.lowPatience : ''}`}>
                Patience: <strong>{player.patience}</strong>
              </span>
            </div>
          </div>

          <div className={styles.cards}>
            {player.hand.map((card, index) => (
              <Card
                key={`${card.id}-${index}`}
                card={card}
                onClick={onCardClick}
                isSelected={selectedCards.some(sc => sc.id === card.id)}
                size="normal"
              />
            ))}
          </div>

          <button className={styles.marketButton} onClick={onMarketClick}>
            <span className={styles.marketIcon}>🛒</span>
            Market
          </button>
        </div>
      </div>
    </div>
  );
}
