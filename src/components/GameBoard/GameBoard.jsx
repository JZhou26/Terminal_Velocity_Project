import styles from './GameBoard.module.css';

// Board assets — saved locally in /public/assets/board/
const B = {
  image7:   '/assets/board/image7.png',
  vector17: '/assets/board/vector17.svg',
  vector15: '/assets/board/vector15.svg',
  vector36: '/assets/board/vector36.svg',
  group86:  '/assets/board/group86.svg',
  group85:  '/assets/board/group85.svg',
  group83:  '/assets/board/group83.svg',
  group84:  '/assets/board/group84.svg',
  group90:  '/assets/board/group90.svg',
  vector31: '/assets/board/vector31.svg',
  vector32: '/assets/board/vector32.svg',
  vector33: '/assets/board/vector33.svg',
  vector34: '/assets/board/vector34.svg',
  vector35: '/assets/board/vector35.svg',
  vector30: '/assets/board/vector30.svg',
  group77:  '/assets/board/group77.svg',
  line31:   '/assets/board/line31.svg',
  group79:  '/assets/board/group79.svg',
  vector16: '/assets/board/vector16.svg',
  group80:  '/assets/board/group80.svg',
  vector28: '/assets/board/vector28.svg',
  vector29: '/assets/board/vector29.svg',
  group89:  '/assets/board/group89.svg',
  group88:  '/assets/board/group88.svg',
  group87:  '/assets/board/group87.svg',
  group82:  '/assets/board/group82.svg',
  vector39: '/assets/board/vector39.svg',
  vector2:  '/assets/board/vector2.svg',
  vector3:  '/assets/board/vector3.svg',
};

// All positions from Figma node 52:1398 — board is 576×636px, all values in px
// ── Event cards (left side, gold border) ──
// width=59.667px, height=84px, border-radius=3.333px
const EVENT_CARDS = [
  { label: 'EVENT 8', left: 66.33, top: 25.67,  bg: 'rgba(0,0,0,0.70)', border: 'rgba(255,217,0,0.80)' },
  { label: 'EVENT 7', left: 36,    top: 89.67,  bg: 'rgba(0,0,0,0.65)', border: 'rgba(255,217,0,0.75)' },
  { label: 'EVENT 6', left: 66.33, top: 155.33, bg: 'rgba(0,0,0,0.60)', border: 'rgba(255,217,0,0.70)' },
  { label: 'EVENT 5', left: 36,    top: 219.33, bg: 'rgba(0,0,0,0.55)', border: 'rgba(255,217,0,0.65)' },
  { label: 'EVENT 4', left: 66.33, top: 285,    bg: 'rgba(0,0,0,0.60)', border: 'rgba(255,217,0,0.70)' },
  { label: 'EVENT 3', left: 36,    top: 352.33, bg: 'rgba(0,0,0,0.50)', border: 'rgba(255,217,0,0.60)' },
  { label: 'EVENT 2', left: 66.33, top: 418,    bg: 'rgba(0,0,0,0.40)', border: 'rgba(255,217,0,0.50)' },
  { label: 'EVENT 1', left: 36,    top: 482,    bg: 'rgba(0,0,0,0.35)', border: 'rgba(255,217,0,0.45)' },
];

// ── Annoyance cards (right side, red border) ──
const ANNOYANCE_CARDS = [
  { label: 'ANNOYANCE\n6+', left: 497.67, top: 158.67, bg: 'rgba(0,0,0,0.40)', border: 'rgba(255,0,0,0.50)' },
  { label: 'ANNOYANCE\n5',  left: 470.33, top: 219.33, bg: 'rgba(0,0,0,0.55)', border: 'rgba(255,0,0,0.65)' },
  { label: 'ANNOYANCE\n4',  left: 500.67, top: 285,    bg: 'rgba(0,0,0,0.60)', border: 'rgba(255,0,0,0.70)' },
  { label: 'ANNOYANCE\n3',  left: 470.33, top: 352.33, bg: 'rgba(0,0,0,0.50)', border: 'rgba(255,0,0,0.60)' },
  { label: 'ANNOYANCE\n2',  left: 500.67, top: 418,    bg: 'rgba(0,0,0,0.40)', border: 'rgba(255,0,0,0.50)' },
  { label: 'ANNOYANCE\n1',  left: 470.33, top: 482,    bg: 'rgba(0,0,0,0.35)', border: 'rgba(255,0,0,0.30)' },
];

// ── Drive slots: left=153.33, w=74.667, h=30.667, step=29px, top starts 228 ──
const DRIVE_SLOTS_TOP = [228, 257, 286, 315, 344, 373, 402, 431, 460, 489, 518, 547];
// ── Airplane slots: left=371.33, w=74.667, h=30.667, step=29px, top starts 226.67 ──
const AIRPLANE_SLOTS_TOP = [226.67, 255.67, 284.67, 313.67, 342.67, 371.67, 400.67, 429.67, 459, 488, 517, 546];

// Security tile fill/stroke — matches group80.svg Figma design
const SEC_FILL   = 'rgba(220,152,4,0.1)';
const SEC_STROKE = 'rgba(220,152,4,0.5)';

export const PLAYER_COLORS = ['#0044ff', '#0fba00', '#ff0000', '#FFD900'];

// Inline SVG plane silhouette — consistent across all players, filled via CSS
function PlaneSvg({ color }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block', transform: 'rotate(-45deg)' }}
    >
      <path
        fill={color}
        d="M21 16v-2l-8-5V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
      />
    </svg>
  );
}

export function GameBoard({ players, boardRef, eventDiscardPile = [], annoyanceDiscardPile = [] }) {
  return (
    <div className={styles.outer}>
      <div className={styles.board} ref={boardRef}>

        {/* ── Background image (rotated, very large, opacity 0.2) ── */}
        <div className={styles.bgImage}>
          <img src={B.image7} alt="" className={styles.bgImageInner} />
        </div>

        {/* ── Top planes banner ── */}
        <img src={B.group77} alt="" className={styles.planesTop} />

        {/* ── Road decor (bottom-left curve) ── */}
        <img src={B.vector39} alt="" className={styles.roadDecor} />

        {/* ── Security track (arch tiles) — inline SVG from group80.svg, each tile individually shaped ── */}
        <svg className={styles.securityTrack} viewBox="0 0 292.5 179.5" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
          {/* Tile 13 — bottom-left rectangle */}
          <rect transform="matrix(-1 0 0 1 74.6667 148.833)" width="74.6667" height="30.6667" rx="3.33333" fill={SEC_FILL} />
          <rect transform="matrix(-1 0 0 1 73.0001 148.833)" x="-0.833333" y="0.833333" width="73" height="29" rx="2.5" stroke={SEC_STROKE} strokeWidth="1.66667" />
          {/* Tile 14 */}
          <path d="M72.6626 148.538C71.5937 148.004 73.5533 136.857 74.6667 131.35C51.5076 127.067 5.05564 118.5 4.5212 118.5C1.71538 123.039 1.2366 140.417 1.34795 148.538C25.5649 148.761 73.7315 149.072 72.6626 148.538Z" fill={SEC_FILL} stroke={SEC_STROKE} strokeWidth="1.66667" />
          {/* Tile 15 */}
          <path d="M80.656 114.333C79.8579 114.2 76.2219 125.722 74.5037 131.5L4.66675 118.667C5.99698 105.2 12.3156 88.2778 15.3086 81.5C37.4236 92.5 81.4542 114.467 80.656 114.333Z" fill={SEC_FILL} stroke={SEC_STROKE} strokeWidth="1.66667" />
          {/* Tile 16 */}
          <path d="M96.3334 92.5C91.1442 97.5667 83.9703 109.056 81.032 114.167L16.3334 80.6667C18.7284 71.2 35.5157 51.9444 43.6099 43.5L96.3334 92.5Z" fill={SEC_FILL} stroke={SEC_STROKE} strokeWidth="1.66667" />
          {/* Tile 17 */}
          <path d="M122 75.8591C114.667 76.2625 101.833 87.3433 96.3334 92.8333L44.0001 43.4233C54.4001 30.6506 78.5556 17.4858 89.3334 12.5L122 75.8591Z" fill={SEC_FILL} stroke={SEC_STROKE} strokeWidth="1.66667" />
          {/* Tile 18 */}
          <path d="M146.667 70.3335C137.333 69.9336 126 72.9445 121.5 74.5L88.6667 13.0032C109.2 3.00369 135.222 0.72603 145.667 0.837135L146.667 70.3335Z" fill={SEC_FILL} stroke={SEC_STROKE} strokeWidth="1.66667" />
          {/* Tile 19 */}
          <path d="M145 70.3372C154.333 69.9372 165.667 72.9483 170.167 74.5038L203 13.0038C182.467 3.0038 156.445 0.726024 146 0.837135L145 70.3372Z" fill={SEC_FILL} stroke={SEC_STROKE} strokeWidth="1.66667" />
          {/* Tile 20 */}
          <path d="M170.333 75.8591C177.667 76.2625 190.5 87.3433 196 92.8333L248.333 43.4233C237.933 30.6506 213.778 17.4858 203 12.5L170.333 75.8591Z" fill={SEC_FILL} stroke={SEC_STROKE} strokeWidth="1.66667" />
          {/* Tile 21 */}
          <path d="M195.333 92.8333C200.533 97.9 207.722 109.389 210.667 114.5L275.5 81C273.1 71.5333 256.278 52.2778 248.167 43.8333L195.333 92.8333Z" fill={SEC_FILL} stroke={SEC_STROKE} strokeWidth="1.66667" />
          {/* Tile 22 */}
          <path d="M210.344 114.333C211.144 114.2 214.789 125.722 216.511 131.5L286.511 118.667C285.177 105.2 278.844 88.2778 275.844 81.5C253.677 92.5 209.544 114.467 210.344 114.333Z" fill={SEC_FILL} stroke={SEC_STROKE} strokeWidth="1.66667" />
          {/* Tile 23 */}
          <path d="M218.689 148.538C219.768 148.004 217.79 136.857 216.667 131.35C240.036 127.067 286.911 118.5 287.45 118.5C290.281 123.039 290.764 140.417 290.652 148.538C266.215 148.761 217.611 149.072 218.689 148.538Z" fill={SEC_FILL} stroke={SEC_STROKE} strokeWidth="1.66667" />
          {/* Tile 24 — bottom-right rectangle */}
          <rect x="217.833" y="147.837" width="74.6667" height="30.6667" rx="3.33333" fill={SEC_FILL} />
          <rect x="218.667" y="148.67" width="73" height="29" rx="2.5" stroke={SEC_STROKE} strokeWidth="1.66667" />
        </svg>

        {/* ── Arch outer shell ── */}
        <img src={B.vector29} alt="" className={styles.archOuter} />

        {/* ── Arch inner frame ornament ── */}
        <img src={B.vector17} alt="" className={styles.archFrameOrn} />

        {/* ── Center window scene ── */}
        <img src={B.vector16} alt="" className={styles.centerWindow} />

        {/* ── Arch inner arch ── */}
        <img src={B.vector28} alt="" className={styles.archInner} />

        {/* ── Drive track (left green strip) ── */}
        <img src={B.group82} alt="" className={styles.driveTrackImg} />

        {/* ── Airplane track (right red strip) ── */}
        <img src={B.group79} alt="" className={styles.airplaneTrackImg} />

        {/* ── Event cards (left side) ── */}
        {EVENT_CARDS.map((ev, i) => {
          // EVENT_CARDS[0] = EVENT 8 (top), EVENT_CARDS[7] = EVENT 1 (bottom)
          // eventDiscardPile[0] = first drawn (EVENT 1), so slot index = 7 - i
          const slotIndex = EVENT_CARDS.length - 1 - i;
          const drawnCard = eventDiscardPile[slotIndex];
          return (
            <div key={i} className={styles.eventCard}
              style={{
                left: `${ev.left}px`,
                top: `${ev.top}px`,
                background: drawnCard ? 'rgba(0,0,0,0.85)' : ev.bg,
                borderColor: ev.border,
              }}>
              {drawnCard ? (
                <div className={styles.boardCardContent}>
                  <img src={drawnCard.imagePath} alt={drawnCard.name} className={styles.boardCardImg} />
                  <span className={styles.boardCardName}>{drawnCard.name}</span>
                </div>
              ) : (
                <span className={styles.cardLabel}>{ev.label}</span>
              )}
            </div>
          );
        })}

        {/* ── Annoyance cards (right side) ── */}
        {ANNOYANCE_CARDS.map((an, i) => {
          // ANNOYANCE_CARDS[0] = ANNOYANCE 6+ (top), ANNOYANCE_CARDS[5] = ANNOYANCE 1 (bottom)
          // annoyanceDiscardPile[0] = first drawn (ANNOYANCE 1), so slot index = 5 - i
          const slotIndex = ANNOYANCE_CARDS.length - 1 - i;
          const drawnCard = annoyanceDiscardPile[slotIndex];
          return (
            <div key={i} className={styles.annoyanceCard}
              style={{
                left: `${an.left}px`,
                top: `${an.top}px`,
                background: drawnCard ? 'rgba(0,0,0,0.85)' : an.bg,
                borderColor: an.border,
              }}>
              {drawnCard ? (
                <div className={styles.boardCardContent}>
                  <img src={drawnCard.imagePath} alt={drawnCard.name} className={styles.boardCardImg} />
                  <span className={styles.boardCardName}>{drawnCard.name}</span>
                </div>
              ) : (
                <span className={styles.cardLabel}>{an.label}</span>
              )}
            </div>
          );
        })}

        {/* ── START / FINISH boxes ── */}
        <div className={styles.startBox}>
          <span className={styles.boxLabel}>START</span>
        </div>
        <div className={styles.finishBox}>
          <span className={styles.boxLabel}>FINISH</span>
        </div>

        {/* ── Section labels ── */}
        <span className={styles.securityLabel}>SECURITY</span>
        <span className={styles.driveLabel}>DRIVE</span>
        <span className={styles.airplaneLabel}>AIRPLANE</span>

        {/* ── TERMINAL VELOCITY logo badge (node 45:1372) ── */}
        <div className={styles.logoShape}>
          <div className={styles.logoShapeInner}>
            <img src={B.vector2} alt="" className={styles.logoShapeImg} />
          </div>
        </div>
        <div className={styles.logoPlane}>
          <div className={styles.logoPlaneInner}>
            <img src={B.vector3} alt="" className={styles.logoPlaneImg} />
          </div>
        </div>
        {/* White bars — flex containers with ::after pseudo-elements */}
        <div className={styles.logoBar1} />
        <div className={styles.logoBar2} />
        <div className={styles.logoBar3} />
        <div className={styles.logoBar4} />
        {/* Text */}
        <p className={styles.logoText}>TERMINAL<br />VELOCITY</p>

        {/* ── Decorative shadow boxes (arch base pillars) ── */}
        <div className={styles.pillarBoxDark1} />
        <div className={styles.pillarBox1} />
        <div className={styles.pillarBoxDark2} />
        <div className={styles.pillarBox2} />

        {/* ── Small decorative plane icons (in arch top area) ── */}
        <img src={B.vector31} alt="" className={styles.deco31} />
        <img src={B.vector32} alt="" className={styles.deco32} />
        <img src={B.vector33} alt="" className={styles.deco33} />
        <img src={B.vector34} alt="" className={styles.deco34} />
        <img src={B.vector35} alt="" className={styles.deco35} />
        <img src={B.vector30} alt="" className={styles.deco30} />

        {/* ── Planes on drive track ── */}
        <div className={styles.group86wrap}>
          <img src={B.group86} alt="" className={styles.groupPlane} />
        </div>
        <div className={styles.group85wrap}>
          <img src={B.group85} alt="" className={styles.groupPlane} />
        </div>
        <img src={B.group83} alt="" className={styles.group83} />
        <img src={B.group84} alt="" className={styles.group84} />
        <div className={styles.group90wrap}>
          <img src={B.group90} alt="" className={styles.groupPlane} />
        </div>

        {/* ── Rotated planes (lower area) ── */}
        <div className={styles.group89wrap}>
          <img src={B.group89} alt="" className={styles.groupPlane} />
        </div>
        <div className={styles.group88wrap}>
          <img src={B.group88} alt="" className={styles.groupPlane} />
        </div>
        <div className={styles.group87wrap}>
          <img src={B.group87} alt="" className={styles.groupPlane} />
        </div>

        {/* ── Large rotated plane decorations ── */}
        <div className={styles.vector15wrap}>
          <img src={B.vector15} alt="" className={styles.largeDecoPlaneFull} />
        </div>
        <div className={styles.vector36wrap}>
          <img src={B.vector36} alt="" className={styles.largeDecoPlaneFull} />
        </div>

        {/* ── Road dashes ── */}
        <div className={styles.roadDash1} />
        <div className={styles.roadDash2} />
        <div className={styles.roadDash3} />
        <div className={styles.roadDash4} />
        <div className={styles.roadDash5} />
        <div className={styles.roadDash6} />
        <div className={styles.roadDash7} />

        {/* ── Track slots — in isolated top layer so nothing can cover them ── */}
        <div className={styles.slotsLayer}>
          {DRIVE_SLOTS_TOP.map((top, i) => (
            <div key={i} className={styles.driveSlot}
              style={{ left: '153.33px', top: `${top}px` }} />
          ))}
          {AIRPLANE_SLOTS_TOP.map((top, i) => (
            <div key={i} className={styles.airplaneSlot}
              style={{ left: '371.33px', top: `${top}px` }} />
          ))}
        </div>

        {/* ── Player tokens ── */}
        <div className={styles.playerTokens}>
          {(() => {
            const tileSlots = {};
            players.forEach((player, index) => {
              if (player.isEliminated) return;
              const pos = player.position;
              if (!tileSlots[pos]) tileSlots[pos] = [];
              tileSlots[pos].push(index);
            });
            return players.map((player, index) => {
              if (player.isEliminated) return null;
              const position = player.position;
              const { top, left } = getTilePosition(position);
              const slotGroup = tileSlots[position];
              const slotIndex = slotGroup.indexOf(index);
              const count = slotGroup.length;
              // Spread multiple tokens horizontally so they don't stack on top of each other
              const xOffsets = count === 1 ? [0]
                : count === 2 ? [-2, 2]
                : count === 3 ? [-2.5, 0, 2.5]
                : [-3, -1, 1, 3];
              const leftOffset = xOffsets[slotIndex];
              return (
                <div
                  key={player.id}
                  className={styles.playerToken}
                  style={{ top: `${top}%`, left: `${left + leftOffset}%` }}
                  title={`${player.name} — Tile ${position}`}
                >
                  <PlaneSvg color={PLAYER_COLORS[index]} />
                </div>
              );
            });
          })()}
        </div>

      </div>
    </div>
  );
}

// Tile positions as % of 576×636px board.
// Drive: tiles 1-12 bottom→top; Airplane: tiles 25-36 top→bottom.
// Positions computed from the exact slot top values — slot center = slotTop + 30.667/2.
// Drive center x = 153.33 + 74.667/2 = 190.663px (33.10% of 576)
// Airplane center x = 371.33 + 74.667/2 = 408.663px (70.95% of 576)
// Security: centers derived from group80.svg path centroids + SVG offset (left=152, top=49).
function getTilePosition(tile) {
  // Drive section: tile 1 = bottom slot (DRIVE_SLOTS_TOP[11]), tile 12 = top slot ([0])
  if (tile >= 1 && tile <= 12) {
    const slotTop = DRIVE_SLOTS_TOP[12 - tile];
    return {
      top: ((slotTop + 15.333) / 636) * 100,
      left: 33.10,
    };
  }
  // Security section: tile centers computed from SVG path centroids + board offset
  const secTiles = {
    13: { top: 33.5,  left: 32.9 },
    14: { top: 29.2,  left: 33.0 },
    15: { top: 25.2,  left: 34.0 },
    16: { top: 20.7,  left: 36.7 },
    17: { top: 16.5,  left: 41.6 },
    18: { top: 13.9,  left: 48.2 },
    19: { top: 13.9,  left: 55.2 },
    20: { top: 16.5,  left: 61.9 },
    21: { top: 20.8,  left: 66.7 },
    22: { top: 25.2,  left: 69.3 },
    23: { top: 29.2,  left: 70.4 },
    24: { top: 33.4,  left: 70.7 },
  };
  if (secTiles[tile]) return secTiles[tile];
  // Airplane section: tile 25 = top slot (AIRPLANE_SLOTS_TOP[0]), tile 36 = bottom slot ([11])
  if (tile >= 25 && tile <= 36) {
    const slotTop = AIRPLANE_SLOTS_TOP[tile - 25];
    return {
      top: ((slotTop + 15.333) / 636) * 100,
      left: 70.95,
    };
  }
  return { top: 50, left: 50 };
}
