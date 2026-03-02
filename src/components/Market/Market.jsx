import { Card, CardBack } from '../Card/Card';
import styles from './Market.module.css';

export function Market({ upgradeCards, onBuyUpgrade, onDrawMarket, currentPlayer }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Market</h2>

      <div className={styles.upgrades}>
        <h3 className={styles.subtitle}>Upgrades</h3>
        <div className={styles.upgradeCards}>
          {upgradeCards.map((upgrade) => (
            <div key={upgrade.id} className={styles.upgradeItem}>
              <Card card={upgrade} size="small" onClick={() => onBuyUpgrade(upgrade)} />
              <div className={styles.cost}>Cost: {upgrade.cost} patience</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.marketDeck}>
        <h3 className={styles.subtitle}>Market Deck</h3>
        <div className={styles.deckOption} onClick={onDrawMarket}>
          <CardBack type="market" />
          <p className={styles.deckText}>Draw blindly (costs 1 patience)</p>
        </div>
      </div>
    </div>
  );
}
