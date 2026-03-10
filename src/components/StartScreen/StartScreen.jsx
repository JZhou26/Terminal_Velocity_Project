import { useState } from 'react';
import styles from './StartScreen.module.css';

const imgBackground = "https://www.figma.com/api/mcp/asset/e97e5641-5736-4119-9d52-2bcb1f8a3c7b";
const imgArrow = "https://www.figma.com/api/mcp/asset/4ab51cc8-7d98-402d-ad36-6aebd825a54d";
const imgDeparture = "https://www.figma.com/api/mcp/asset/7c96f226-5a5f-4365-ab1e-87f7cfa1f7fe";

export function StartScreen({ onStartGame }) {
  const [step, setStep] = useState('splash');
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);

  const handleNameChange = (index, value) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const names = playerNames.map((name, i) => name.trim() || `Player ${i + 1}`);
    onStartGame(names);
  };

  if (step === 'splash') {
    return (
      <div className={styles.splashContainer}>
        {/* Airport background */}
        <div className={styles.bgImage}>
          <img src={imgBackground} alt="" />
        </div>

        {/* Centered badge */}
        <div className={styles.badge}>
          <img src={imgArrow} alt="" className={styles.badgeArrow} />
          <div className={styles.badgeLines}>
            <div className={styles.badgeLine} />
            <p className={styles.badgeTitle}>TERMINAL<br />VELOCITY</p>
            <div className={styles.badgeLine} />
          </div>
        </div>

        {/* Bottom info */}
        <div className={styles.bottomInfo}>
          <p className={styles.tagline}>AN AIRPORT-BASED<br />RACING GAME</p>
          <p className={styles.meta}><strong>PLAYERS:</strong> 4&nbsp;&nbsp;<strong>GAME LENGTH:</strong> 25-30mins</p>
        </div>

        {/* Departure button */}
        <button className={styles.departureBtn} onClick={() => setStep('names')}>
          <img src={imgDeparture} alt="Start" />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.namesContainer}>
      <div className={styles.namesCard}>
        <h1 className={styles.namesTitle}>ENTER PLAYERS</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {playerNames.map((name, index) => (
            <div key={index} className={styles.inputGroup}>
              <label htmlFor={`player-${index}`} className={styles.inputLabel}>
                PLAYER {index + 1}
              </label>
              <input
                id={`player-${index}`}
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
                className={styles.input}
                autoFocus={index === 0}
              />
            </div>
          ))}
          <button type="submit" className={styles.startButton}>
            BOARD FLIGHT
          </button>
        </form>
      </div>
    </div>
  );
}
