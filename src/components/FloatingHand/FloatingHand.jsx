import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Card } from '../Card/Card';
import { PLAYER_COLORS } from '../GameBoard/GameBoard';
import styles from './FloatingHand.module.css';

export const FloatingHand = forwardRef(function FloatingHand({
  player,
  playerIndex,
  selectedCards,
  onCardClick,
  isCurrentPlayer,
  turnPhase,
  upgradeCards,
  onBuyUpgrade,
  onDrawMarket,
  onBuyMarketCard,
  onPlayCards,
  onSkipPhase,
  onEndTurn,
  marketDrawCards = [],
  animatingCardIds = [],
}, ref) {
  const cardRefs = useRef({});

  useImperativeHandle(ref, () => ({
    getCardRects(cardIds) {
      return cardIds.map(id => {
        const el = cardRefs.current[id];
        return el ? el.getBoundingClientRect() : null;
      });
    },
  }));

  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const [marketDrawRevealed, setMarketDrawRevealed] = useState(false);
  const [showHandInMarket, setShowHandInMarket] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      if (current < lastScrollY.current) {
        setVisible(true);  // scrolling up
      } else if (current > lastScrollY.current) {
        setVisible(false); // scrolling down
      }
      lastScrollY.current = current;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!isCurrentPlayer) return null;

  const playerColor = PLAYER_COLORS[playerIndex] || '#FFD700';

  // Calculate patience tokens
  const threeTokens = Math.floor(player.patience / 3);
  const oneTokens = player.patience % 3;

  const handleMarketDrawClick = () => {
    if (!marketDrawRevealed && player.patience >= 1) {
      setMarketDrawRevealed(true);
      onDrawMarket();
    }
  };

  const handleBuyUpgrade = (upgrade) => {
    onBuyUpgrade(upgrade);
    setMarketDrawRevealed(false);
  };

  const handleSelectMarketCard = (card) => {
    setMarketDrawRevealed(false);
    onBuyMarketCard(card);
  };

  const handleSkipMarket = () => {
    setMarketDrawRevealed(false);
    onSkipPhase(); // Skip buy phase
  };

  // MARKET VIEW (Buy Phase)
  if (turnPhase === 'buy') {
    return (
      <div className={`${styles.container} ${visible ? '' : styles.hidden}`}>
        <div className={styles.handPanel} style={{ borderColor: playerColor }}>
          {/* Left side - Upgrades */}
          <div className={styles.marketSection}>
            <h3 className={styles.sectionTitle}>Upgrades</h3>
            <div className={styles.upgradesRow}>
              {upgradeCards.map((upgrade) => {
                const owned = player.upgrades.some(u => u.id === upgrade.id);
                const canAfford = player.patience >= upgrade.cost;
                const canBuy = !owned && canAfford;

                return (
                  <div
                    key={upgrade.id}
                    className={styles.upgradeWrapper}
                    style={{ opacity: canBuy ? 1 : 0.3 }}
                  >
                    <Card
                      card={upgrade}
                      onClick={() => canBuy && handleBuyUpgrade(upgrade)}
                      isDisabled={!canBuy}
                      size="normal"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Middle - Market Draw */}
          <div className={styles.marketDrawSection}>
            <h3 className={styles.sectionTitle}>MARKET DRAW</h3>
            <div className={styles.marketDrawRow}>
              {/* Market Back Card */}
              {!marketDrawRevealed ? (
                <>
                  <div
                    className={styles.cardWrapper}
                    onClick={handleMarketDrawClick}
                  >
                    <div className={styles.marketBackCard}>
                      <img src="/assets/cards/MarketBack.png" alt="Market Deck" />
                    </div>
                  </div>
                  <div className={styles.marketButtons}>
                    <button className={styles.marketActionButton} onClick={handleSkipMarket}>
                      SKIP
                    </button>
                    <button
                      className={styles.marketActionButton}
                      onClick={() => setShowHandInMarket(!showHandInMarket)}
                    >
                      {showHandInMarket ? 'HIDE HAND' : 'SHOW HAND'}
                    </button>
                  </div>
                </>
              ) : (
                /* Revealed cards — click one to add to hand */
                <>
                  {marketDrawCards.map((card, index) => (
                    <div
                      key={`market-${index}`}
                      className={styles.cardWrapper}
                      onClick={() => handleSelectMarketCard(card)}
                      title={`Pick ${card.name}`}
                    >
                      <Card card={card} size="normal" />
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Show hand if requested */}
            {showHandInMarket && (
              <div className={styles.handPreview}>
                <h4 className={styles.previewTitle}>Your Hand</h4>
                <div className={styles.previewCards}>
                  {player.hand.map((card, index) => (
                    <div key={`preview-${card.id}-${index}`} className={styles.previewCard}>
                      <Card card={card} size="small" isDisabled={true} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Patience display */}
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
        </div>
      </div>
    );
  }

  // PLAYER HAND VIEW (Play, Discard, Draw phases)
  return (
    <div className={`${styles.container} ${visible ? '' : styles.hidden}`}>
      <div className={styles.handPanel} style={{ borderColor: playerColor }}>
        {/* Left side - YOUR HAND */}
        <div className={styles.handSection}>
          <h3 className={styles.sectionTitle}>YOUR HAND</h3>
          <div className={styles.cardsRow}>
            {player.hand.map((card, index) => (
              <div key={`${card.id}-${index}`} className={`${styles.cardWrapper} ${animatingCardIds.includes(card.id) ? styles.cardHidden : ''}`} ref={el => { cardRefs.current[card.id] = el; }}>
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

        {/* Middle - Turn Actions */}
        <div className={styles.actionsSection}>
          <h3 className={styles.sectionTitle}>ACTIONS</h3>

          {turnPhase === 'play' && (
            <>
              <button
                className={styles.actionButton}
                onClick={onPlayCards}
                disabled={selectedCards.length === 0}
              >
                PLAY {selectedCards.length} CARD{selectedCards.length !== 1 ? 'S' : ''}
              </button>
              <button className={styles.secondaryButton} onClick={onSkipPhase}>
                SKIP PLAY
              </button>
            </>
          )}

          {turnPhase === 'discard' && (
            <>
              <button
                className={styles.actionButton}
                onClick={onPlayCards}
                disabled={selectedCards.length === 0 || selectedCards.length > 2}
              >
                DISCARD {selectedCards.length}
              </button>
              <button className={styles.secondaryButton} onClick={onSkipPhase}>
                SKIP DISCARD
              </button>
            </>
          )}

          {turnPhase === 'draw' && (
            <button className={styles.actionButton} onClick={onEndTurn}>
              END TURN
            </button>
          )}
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
      </div>
    </div>
  );
});
