import { getSection } from '../../data/cards';
import { Card } from '../Card/Card';
import { PLAYER_COLORS } from '../GameBoard/GameBoard';
import styles from './PlayerPanel.module.css';

function AvatarPlane({ color }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block', transform: 'rotate(-45deg)' }}>
      <path fill={color} d="M21 16v-2l-8-5V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
    </svg>
  );
}

export function PlayerPanel({ player, playerIndex, isCurrentPlayer }) {
  const section = getSection(player.position);
  const color = PLAYER_COLORS[playerIndex];

  return (
    <div className={`${styles.panel} ${isCurrentPlayer ? styles.active : ''}`} style={{ borderColor: color }}>
      <span className={styles.playerName}>{player.name.toUpperCase()}</span>
      <span className={styles.upgradesTitle}>OWNED UPGRADES</span>

      <div className={styles.avatar} style={{ borderColor: color }}>
        <AvatarPlane color="#000" />
      </div>

      <span className={styles.positionLine}>POSITION: {player.position}</span>
      <span className={styles.sectionLine}>SECTION: {section.toUpperCase()}</span>

      <div className={styles.upgradeSlots}>
        {player.upgrades && player.upgrades.length > 0 ? (
          player.upgrades.map(u => (
            <div key={u.id} className={styles.upgradeCardWrap}>
              <Card card={u} size="tiny" />
            </div>
          ))
        ) : (
          <div className={styles.upgradeSlot}>
            <span className={styles.noneText}>NONE</span>
          </div>
        )}
      </div>
    </div>
  );
}
