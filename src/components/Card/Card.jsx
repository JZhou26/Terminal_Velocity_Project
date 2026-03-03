import styles from './Card.module.css';

export function Card({ card, onClick, isSelected, isDisabled, size = 'normal' }) {
  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick(card);
    }
  };

  const classNames = [
    styles.card,
    styles[size],
    isSelected ? styles.selected : '',
    isDisabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} onClick={handleClick} title={card.description}>
      <img
        src={card.imagePath}
        alt={card.name}
        className={styles.cardImage}
      />
    </div>
  );
}

export function CardBack({ type = 'basic', onClick }) {
  const imagePath =
    type === 'event'
      ? '/assets/backgrounds/EventBack.png'
      : type === 'annoyance'
      ? '/assets/backgrounds/AnnoyanceBack.png'
      : '/assets/backgrounds/MarketBack.png';

  return (
    <div className={styles.card} onClick={onClick}>
      <img src={imagePath} alt={`${type} deck`} className={styles.cardImage} />
    </div>
  );
}
