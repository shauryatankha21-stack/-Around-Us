export default function Hero({ heroGame, counts, onCreateClick, onDetailsClick }) {
  const joined = heroGame ? (counts.get(heroGame.id) || 0) : 8;
  const maxPlayers = heroGame?.max_players || 12;
  const spotsLeft = Math.max(0, maxPlayers - joined);
  const progress = Math.min(100, (joined / maxPlayers) * 100);

  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="pulse"></span> PLAY LOCAL · MEET PEOPLE
        </div>
        <h1>
          Find your people.
          <br />
          <em>Find your game.</em>
        </h1>
        <p>
          Discover live and upcoming games around your college and city. Join in seconds or create
          something yourself.
        </p>
        <div className="hero-actions">
          <a href="#discover" className="btn dark">
            Find a game <b>→</b>
          </a>
          <button className="btn light" type="button" id="heroCreateBtn" onClick={onCreateClick}>
            Create a game
          </button>
        </div>
        <div className="trust">
          <span>● Live spots</span>
          <span>•</span>
          <span>Instant join / leave</span>
          <span>•</span>
          <span>College + city</span>
        </div>
      </div>

      <div className="hero-art">
        <div className="ring r1"></div>
        <div className="ring r2"></div>
        <div className="float f1">🏀</div>
        <div className="float f2">⚽</div>
        <div className="float f3">🃏</div>

        <div className="spotlight">
          <div className="spot-top">
            <span className="live-tag">● LIVE</span>
            <span>2.1 km</span>
          </div>
          <div className="big-icon">🏀</div>
          <h3>Basketball</h3>
          <p>College Court · Starting now</p>
          <div className="numbers">
            <strong id="heroPlayers">
              {joined}/{maxPlayers}
            </strong>
            <b id="heroLeft">
              {spotsLeft ? `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left` : 'Full'}
            </b>
          </div>
          <div className="track">
            <i id="heroProgress" style={{ width: `${progress}%` }}></i>
          </div>
          <button type="button" id="heroDetailsBtn" onClick={onDetailsClick}>
            See activity <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
