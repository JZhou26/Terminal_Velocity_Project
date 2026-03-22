import styles from './Card.module.css';

// ── Helpers ──────────────────────────────────────────────────

function getTheme(type) {
  if (type === 'event')     return styles['theme-event'];
  if (type === 'annoyance') return styles['theme-annoyance'];
  if (type === 'upgrade')   return styles['theme-upgrade'];
  return ''; // dark theme (basic / market)
}

function getTypeIndicator(card) {
  if (card.type === 'event')     return 'E';
  if (card.type === 'annoyance') return 'A';
  if (card.type === 'upgrade')   return String(card.cost ?? 4);
  if (card.type === 'market')    return 'M';
  return '▶'; // basic
}

function getSectionLabel(card) {
  if (card.type === 'event')     return 'EVENT';
  if (card.type === 'annoyance') return 'ANNOYANCE';
  if (card.type === 'upgrade')   return 'CARD UPGRADE';
  const s = card.section || '';
  if (s === 'all')      return 'ALL SECTIONS';
  if (s === 'drive')    return 'DRIVE SECTION';
  if (s === 'security') return 'SECURITY SECTION';
  if (s === 'airplane') return 'AIRPLANE SECTION';
  return s.toUpperCase();
}

// ── Card ─────────────────────────────────────────────────────

export function Card({ card, onClick, isSelected, isDisabled, size = 'normal', showTooltip = true }) {
  const handleClick = () => {
    if (!isDisabled && onClick) onClick(card);
  };

  const theme = getTheme(card.type);

  const className = [
    styles.card,
    styles[size],
    theme,
    isSelected    ? styles.selected    : '',
    isDisabled    ? styles.disabled    : '',
    showTooltip   ? styles.hasTooltip  : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={className} onClick={handleClick} title={card.description}>

      {/* Type indicator circle */}
      <div className={styles.typeCircle}>
        <span className={styles.typeInitial}>{getTypeIndicator(card)}</span>
      </div>

      {/* Card name */}
      <div className={styles.cardName}>{card.name.toUpperCase()}</div>

      {/* Illustration */}
      <div className={styles.cardImageBox}>
        <img
          src={card.imagePath}
          alt={card.name}
          className={styles.cardIllustration}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Description */}
      <p className={styles.cardDesc}>{card.description}</p>

      {/* Section / type bar */}
      <div className={styles.sectionBar}>
        <span className={styles.sectionLabel}>{getSectionLabel(card)}</span>
      </div>

      {/* Hover tooltip bubble */}
      {showTooltip && (
        <div className={styles.hoverBubble}>
          <p className={styles.bubbleTitle}>{card.name.toUpperCase()}</p>
          <p className={styles.bubbleDesc}>{card.description}</p>
        </div>
      )}

    </div>
  );
}

// ── CardBack ──────────────────────────────────────────────────

export function CardBack({ type = 'basic', onClick }) {
  const imagePath =
    type === 'event'     ? '/assets/cards/EventBack.png'     :
    type === 'annoyance' ? '/assets/cards/AnnoyanceBack.png' :
    type === 'upgrade'   ? '/assets/cards/UpgradeBack.png'   :
    type === 'market'    ? '/assets/cards/MarketBack.png'     :
                           '/assets/cards/MovementBack.png';

  return (
    <div className={styles.cardBack} onClick={onClick}>
      <img src={imagePath} alt={`${type} deck`} className={styles.cardImage} />
    </div>
  );
}
