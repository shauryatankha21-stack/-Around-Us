import GameCard from './GameCard';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'sports', label: 'Sports' },
  { value: 'games', label: 'Games' },
  { value: 'other', label: 'Other' },
];

export default function Discover({
  filteredGames,
  counts,
  myGames,
  category,
  setCategory,
  scope,
  setScope,
  time,
  setTime,
  query,
  setQuery,
  onJoin,
  onLeave,
  onCreateClick,
}) {
  return (
    <section className="discover" id="discover">
      <div className="heading-row">
        <div>
          <div className="eyebrow">DISCOVER</div>
          <h2>What's happening?</h2>
        </div>
        <span id="resultCount">{filteredGames.length} activities</span>
      </div>

      <div className="toolbar">
        <label className="search">
          <span className="mag"></span>
          <input
            id="search"
            placeholder="Search games, places, activities"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select id="scope" value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="all">Everywhere</option>
          <option value="college">College</option>
          <option value="city">Around the city</option>
        </select>
        <select id="time" value={time} onChange={(e) => setTime(e.target.value)}>
          <option value="all">All times</option>
          <option value="live">Live now</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </div>

      <div className="category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            className={category === cat.value ? 'selected' : ''}
            data-cat={cat.value}
            onClick={() => setCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div id="cards" className="grid">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              counts={counts}
              isMine={myGames.has(game.id)}
              onJoin={onJoin}
              onLeave={onLeave}
            />
          ))
        ) : (
          <div className="empty">
            <div>✦</div>
            <h3>No activities found</h3>
            <p>Try another filter or create the first one.</p>
            <button className="btn dark" type="button" onClick={onCreateClick}>
              Create activity
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
