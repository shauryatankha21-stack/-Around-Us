import Modal from './Modal';

export default function GameDetailsModal({ isOpen, onClose, game, counts, isMine, onJoin, onLeave }) {
  if (!game) return null;

  const joined = counts.get(game.id) || 0;
  const spotsLeft = Math.max(0, game.max_players - joined);
  const isLive = game.status === 'live';

  function handleJoin() {
    onClose();
    onJoin(game.id);
  }

  function handleLeave() {
    onClose();
    onLeave(game.id);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="eyebrow">{isLive ? '● LIVE NOW' : 'UPCOMING'}</div>
      <h2>
        {game.icon} {game.title}
      </h2>
      <p>
        ⌖ {game.place}
        <br />
        ◷ {new Date(game.starts_at).toLocaleString()}
        <br />
        👥 <b>{joined}/{game.max_players}</b> · {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left
      </p>
      <p>{game.note || 'Open to new players.'}</p>

      {isMine ? (
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
    </Modal>
  );
}
