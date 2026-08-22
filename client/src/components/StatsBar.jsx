export default function StatsBar({ stats }) {
  return (
    <section className="stats">
      <div>
        <b id="statLive">{stats.liveGames}</b>
        <span>live games</span>
      </div>
      <div>
        <b id="statSpots">{stats.spotsAvailable}</b>
        <span>spots available</span>
      </div>
      <div>
        <b id="statJoined">{stats.joined}</b>
        <span>you joined</span>
      </div>
      <div>
        <b id="statHosted">{stats.hosted}</b>
        <span>you host</span>
      </div>
    </section>
  );
}
