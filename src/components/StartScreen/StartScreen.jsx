import { useState } from 'react';
import styles from './StartScreen.module.css';

export function StartScreen({ onStartGame }) {
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);

  const handleNameChange = (index, value) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use default names if not provided
    const names = playerNames.map((name, i) => name.trim() || `Player ${i + 1}`);
    onStartGame(names);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Terminal Velocity</h1>
        <p className={styles.subtitle}>A race through the airport</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>Enter Player Names</h2>
          {playerNames.map((name, index) => (
            <div key={index} className={styles.inputGroup}>
              <label htmlFor={`player-${index}`}>Player {index + 1}:</label>
              <input
                id={`player-${index}`}
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
                className={styles.input}
              />
            </div>
          ))}

          <button type="submit" className={styles.startButton}>
            Start Game
          </button>
        </form>

        <div className={styles.rules}>
          <h3>Quick Rules</h3>
          <ul>
            <li>Race from tile 1 to tile 36</li>
            <li>Each turn: Buy, Play, Discard, Draw</li>
            <li>Play 1-2 cards per turn (cost patience for 2nd card)</li>
            <li>Reach tile 25 by round 8 or be eliminated</li>
            <li>Don't run out of patience in the Airplane section!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
