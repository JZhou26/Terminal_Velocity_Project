import styles from './PatienceTokens.module.css';

export function PatienceTokens({ totalPatience }) {
  // Calculate number of 3-tokens and 1-tokens
  const threeTokens = Math.floor(totalPatience / 3);
  const oneTokens = totalPatience % 3;

  return (
    <div className={styles.container}>
      {/* Render 3-tokens */}
      {Array(threeTokens).fill(null).map((_, index) => (
        <div key={`three-${index}`} className={`${styles.token} ${styles.threeToken}`}>
          <span className={styles.tokenValue}>3</span>
        </div>
      ))}

      {/* Render 1-tokens */}
      {Array(oneTokens).fill(null).map((_, index) => (
        <div key={`one-${index}`} className={`${styles.token} ${styles.oneToken}`}>
          <span className={styles.tokenValue}>1</span>
        </div>
      ))}
    </div>
  );
}
