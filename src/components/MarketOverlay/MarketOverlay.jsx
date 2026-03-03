import { Card, CardBack } from '../Card/Card';
import styles from './MarketOverlay.module.css';

export function MarketOverlay({
  isOpen,
  onClose,
  upgradeCards,
  onBuyUpgrade,
  onDrawMarket,
  currentPlayer
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <h2 className={styles.title}>Market</h2>

        <div className={styles.section}>
          <h3 className={styles.subtitle}>Upgrade Cards</h3>
          <div className={styles.upgradeGrid}>
            {upgradeCards.map((upgrade) => {
              const owned = currentPlayer.upgrades.some(u => u.id === upgrade.id);
              return (
                <div key={upgrade.id} className={styles.upgradeItem}>
                  <Card
                    card={upgrade}
                    size="normal"
                    onClick={() => !owned && onBuyUpgrade(upgrade)}
                    isDisabled={owned || currentPlayer.patience < upgrade.cost}
                  />
                  <div className={styles.upgradeCost}>
                    {owned ? 'OWNED' : `${upgrade.cost} Patience`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.subtitle}>Market Deck</h3>
          <div className={styles.marketDeck}>
            <div
              className={styles.deckOption}
              onClick={() => {
                if (currentPlayer.patience >= 1) {
                  onDrawMarket();
                }
              }}
            >
              <CardBack type="market" />
              <p className={styles.deckText}>
                Draw Random Card<br />
                <span className={styles.cost}>1 Patience</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
