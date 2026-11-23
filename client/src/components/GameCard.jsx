export default function GameCard({ game, counts, isMine, isHost, onJoin, onLeave, onDelete, onShowDetails }) {
  const joined = counts.get(game.id) || 0;
  const spotsLeft = Math.max(0, game.max_players - joined);
  const full = !isMine && spotsLeft === 0;
  const progress = Math.min(100, (joined / game.max_players) * 100);
  const isLive = game.status === 'live';

  let when = 'Time TBD';
  if (game.starts_at) {
    try {
      const d = new Date(game.starts_at);
      if (!isNaN(d.getTime())) {
        when = d.toLocaleString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      }
    } catch {
      // fallback
    }
  }

  function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to cancel "${game.title}"?`)) {
      onDelete(game.id);
    }
  }

  return (
    <article className="card" onClick={() => onShowDetails && onShowDetails(game)} style={{ cursor: onShowDetails ? 'pointer' : 'default' }}>

      <div className="card-head">
        <span className="game-icon">{game.icon}</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {isHost && <span className="badge host">👑 HOST</span>}
          <span className={`badge ${isLive ? 'live' : ''}`}>
            {isLive ? '● LIVE' : 'UPCOMING'}
          </span>
        </div>
      </div>

      <h3>{game.title}</h3>
      <div className="meta">⌖ {game.place}</div>
      <div className="meta">◷ {when}</div>
      <div className="meta">✦ {game.experience_level || 'Any'} level</div>
      <div className="meta">🎂 Min Age: {game.min_age || 16}+</div>
      <div className="meta">⚥ Gender: {(game.gender_preference || 'Any') === 'Any' ? 'Co-ed / Any' : `${game.gender_preference} only`}</div>
      <div className="meta">♧ {game.note || 'Open to new players.'}</div>

      <div className="spots">
        <span>{full ? 'Full' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}</span>
        <b>
          {joined}/{game.max_players}
        </b>
      </div>

      <div className="bar">
        <i style={{ width: `${progress}%` }}></i>
      </div>

      {isHost ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button className="join leave danger" type="button" onClick={handleDelete} title="Cancel this activity">
            ✕ Cancel
          </button>
          <button className="join" type="button" onClick={(e) => { e.stopPropagation(); onShowDetails(game); }}>
            View details
          </button>
        </div>
      ) : isMine ? (
        <button className="join leave" type="button" onClick={(e) => { e.stopPropagation(); onLeave(game.id); }}>
          ↩ Leave game
        </button>
      ) : (
        <button
          className="join"
          type="button"
          disabled={full}
          onClick={(e) => { e.stopPropagation(); onJoin(game.id); }}>
          {full ? 'Game full' : 'Join game'}
        </button>
      )}
    </article>
  );
}
