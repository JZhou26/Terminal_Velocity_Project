import styles from './EventRevealModal.module.css';

export function EventRevealModal({ drawnEvent, drawnAnnoyance, onConfirm }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>END OF ROUND</h2>

        {drawnEvent && (
          <div className={styles.cardSection}>
            <p className={styles.sectionLabel}>EVENT DRAWN</p>
            <div className={styles.cardReveal}>
              <img
                src={drawnEvent.imagePath}
                alt={drawnEvent.name}
                className={styles.cardImage}
              />
              <div className={styles.cardInfo}>
                <div className={styles.cardName}>{drawnEvent.name}</div>
                <div className={styles.cardDesc}>{drawnEvent.description}</div>
              </div>
            </div>
          </div>
        )}

        {drawnAnnoyance && (
          <div className={styles.cardSection}>
            <p className={styles.sectionLabelRed}>ANNOYANCE DRAWN</p>
            <div className={styles.cardReveal}>
              <img
                src={drawnAnnoyance.imagePath}
                alt={drawnAnnoyance.name}
                className={styles.cardImage}
              />
              <div className={styles.cardInfo}>
                <div className={styles.cardNameRed}>{drawnAnnoyance.name}</div>
                <div className={styles.cardDesc}>{drawnAnnoyance.description}</div>
              </div>
            </div>
          </div>
        )}

        {!drawnEvent && !drawnAnnoyance && (
          <p className={styles.noCards}>No event or annoyance this round.</p>
        )}

        <button className={styles.confirmButton} onClick={onConfirm}>
          CONTINUE
        </button>
      </div>
    </div>
  );
}
