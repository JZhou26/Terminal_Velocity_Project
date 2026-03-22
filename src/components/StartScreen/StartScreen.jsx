import { useState } from 'react';
import styles from './StartScreen.module.css';

const imgBackground = "/assets/startscreen/background.png";
const imgDeparture = "/assets/startscreen/departure.png";

export function StartScreen({ onStartGame }) {
  const [step, setStep] = useState('splash');
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = playerName.trim() || 'Player 1';
    onStartGame([name, 'Bot 1', 'Bot 2', 'Bot 3'], [1, 2, 3]);
  };

  if (step === 'splash') {
    return (
      <div className={styles.splashContainer}>
        {/* Airport background */}
        <div className={styles.bgImage}>
          <img src={imgBackground} alt="" />
        </div>

        {/* Badge — click to advance */}
        <div className={styles.centerGroup}>
          <button className={styles.badgeWrapper} onClick={() => setStep('names')}>
            {/* Badge shape (octagon with yellow border) */}
            <svg className={styles.badgeShape} preserveAspectRatio="none" viewBox="0 0 458.404 276.007" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M455.904 216.05L455.162 216.783L398.537 272.785L397.807 273.508H52.8379L52.0908 272.653L3.11816 216.651L2.5 215.944V63.2119L3.0752 62.5176L52.0469 3.40527L52.7969 2.5H397.847L398.585 3.27051L455.209 62.3838L455.904 63.1084V216.05Z" fill="black" stroke="#FFD900" strokeWidth="5"/>
            </svg>
            {/* Gold arrow */}
            <svg className={styles.badgeArrow} preserveAspectRatio="none" viewBox="0 0 178.624 213.361" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M178.624 106.681L0 213.361L54.3637 106.681L0 0L178.624 106.681Z" fill="#FFD900" fillOpacity="0.5"/>
            </svg>
            <div className={styles.line45} />
            <div className={styles.line46} />
            <div className={styles.line47} />
            <div className={styles.line48} />
            <p className={styles.badgeTitle}>TERMINAL<br />VELOCITY</p>
          </button>
        </div>

        {/* Bottom info */}
        <div className={styles.bottomInfo}>
          <p className={styles.tagline}>AN AIRPORT-BASED<br />RACING GAME</p>
          <p className={styles.meta}><strong>PLAYERS:</strong> 4&nbsp;&nbsp;<strong>GAME LENGTH:</strong> 25-30mins</p>
        </div>

        {/* Departure icon — decorative only */}
        <div className={styles.departureIcon}>
          <img src={imgDeparture} alt="" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.namesContainer}>
      <div className={styles.namesCard}>
        <h1 className={styles.namesTitle}>ENTER YOUR NAME</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="player-0" className={styles.inputLabel}>YOUR NAME</label>
            <input
              id="player-0"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Player 1"
              className={styles.input}
              autoFocus
            />
          </div>
          <p className={styles.inputLabel} style={{ textAlign: 'center', opacity: 0.5 }}>
            vs Bot 1 · Bot 2 · Bot 3
          </p>
          <button type="submit" className={styles.startButton}>
            BOARD FLIGHT
          </button>
        </form>
      </div>
    </div>
  );
}
