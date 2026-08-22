function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])
  );
}

export default function GameCard({ game, counts, isMine, onJoin, onLeave }) {
  const joined = counts.get(game.id) || 0;
  const spotsLeft = Math.max(0, game.max_players - joined);
  const full = !isMine && spotsLeft === 0;
  const progress = Math.min(100, (joined / game.max_players) * 100);
  const isLive = game.status === 'live';

  const when = new Date(game.starts_at).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <article className="card">
      <div className="card-head">
        <span className="game-icon">{game.icon}</span>
        <span className={`badge ${isLive ? 'live' : ''}`}>
          {isLive ? '● LIVE' : 'UPCOMING'}
        </span>
      </div>

      <h3>{game.title}</h3>
      <div className="meta">⌖ {game.place}</div>
      <div className="meta">◷ {when}</div>
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

      {isMine ? (
        <button className="join leave" type="button" onClick={() => onLeave(game.id)}>
          ↩ Leave game
        </button>
      ) : (
        <button
          className="join"
          type="button"
          disabled={full}
          onClick={() => onJoin(game.id)}
        >
          {full ? 'Game full' : 'Join game'}
        </button>
      )}
    </article>
  );
}
