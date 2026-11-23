import Modal from './Modal';

export default function GameDetailsModal({ isOpen, onClose, game, counts, isMine, isHost, onJoin, onLeave, onDelete }) {
  if (!game) return null;

  const joined = counts.get(game.id) || 0;
  const spotsLeft = Math.max(0, game.max_players - joined);
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

  function handleJoin() {
    onClose();
    onJoin(game.id);
  }

  function handleLeave() {
    onClose();
    onLeave(game.id);
  }

  function handleDelete() {
    if (window.confirm(`Are you sure you want to cancel "${game.title}"?`)) {
      onClose();
      onDelete(game.id);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="eyebrow" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{isLive ? '● LIVE NOW' : 'UPCOMING'}</span>
        {isHost && <span style={{ color: '#f59e0b', fontWeight: 900 }}>👑 HOST</span>}
      </div>
      <h2>
        {game.icon} {game.title}
      </h2>
      <p>
        ⌖ {game.place} ({game.scope === 'city' ? 'City' : 'College'})
        <br />
        ◷ {when}
        <br />
        ✦ {game.experience_level || 'Any'} level
        <br />
        🎂 Min Age: {game.min_age || 16}+
        <br />
        ⚥ Gender: {(game.gender_preference || 'Any') === 'Any' ? 'Co-ed / Any' : `${game.gender_preference} only`}
        <br />
        👥 <b>{joined}/{game.max_players}</b> · {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left
      </p>
      <p>{game.note || 'Open to new players.'}</p>

      {/* Participants list */}
      {game.participants && game.participants.length > 0 ? (
        <div className="participants">
          <h4>Joined Players ({game.participants.length})</h4>
          <ul>
            {game.participants.map((p, i) => (
              <li key={i}>{p.name} {p.gender ? `(${p.gender})` : ''}</li>
            ))}
          </ul>
        </div>
      ) : joined > 0 ? (
        <div className="participants">
          <h4>Joined Players ({joined})</h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
            {joined} player{joined === 1 ? ' has' : 's have'} joined this game.
          </p>
        </div>
      ) : null}

      <div style={{ marginTop: '16px' }}>
        {isHost ? (
          <button
            className="main"
            type="button"
            id="detailDelete"
            style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)' }}
            onClick={handleDelete}
          >
            ✕ Cancel activity
          </button>
        ) : isMine ? (
          <button className="main" type="button" id="detailLeave" onClick={handleLeave}>
            ↩ Leave game
          </button>
        ) : (
          <button
            className="main"
            type="button"
            id="detailJoin"
            disabled={spotsLeft === 0}
            onClick={handleJoin}
          >
            {spotsLeft === 0 ? 'Game full' : `Join game · ${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
          </button>
        )}
      </div>
    </Modal>
  );
}
