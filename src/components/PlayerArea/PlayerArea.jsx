import { Card } from '../Card/Card';
import styles from './PlayerArea.module.css';

export function PlayerArea({ player, isCurrentPlayer, onCardClick, selectedCards = [] }) {
  return (
    <div className={`${styles.container} ${isCurrentPlayer ? styles.active : ''}`}>
      <div className={styles.header}>
        <h2 className={styles.playerName}>
          {player.name}
          {isCurrentPlayer && <span className={styles.badge}>Current Turn</span>}
        </h2>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Position:</span>
            <span className={styles.statValue}>Tile {player.position}/36</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Patience:</span>
            <span className={`${styles.statValue} ${player.patience <= 2 ? styles.lowPatience : ''}`}>
              {player.patience}
            </span>
          </div>
        </div>
      </div>

      {player.upgrades.length > 0 && (
        <div className={styles.upgrades}>
          <h3 className={styles.sectionTitle}>Upgrades</h3>
          <div className={styles.upgradeList}>
            {player.upgrades.map((upgrade) => (
              <div key={upgrade.id} className={styles.upgradeCard} title={upgrade.description}>
                <img src={upgrade.imagePath} alt={upgrade.name} className={styles.upgradeImage} />
                <span className={styles.upgradeName}>{upgrade.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.hand}>
        <h3 className={styles.sectionTitle}>
          Hand ({player.hand.length} cards)
        </h3>
        <div className={styles.cards}>
          {player.hand.map((card, index) => (
            <Card
              key={`${card.id}-${index}`}
              card={card}
              onClick={isCurrentPlayer ? onCardClick : undefined}
              isSelected={selectedCards.some(sc => sc.id === card.id)}
              isDisabled={!isCurrentPlayer}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
