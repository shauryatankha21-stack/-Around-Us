export default function HowItWorks() {
  return (
    <section className="realtime" id="how">
      <div>
        <div className="eyebrow">REAL-TIME SPOTS</div>
        <h2>Numbers that actually stay current.</h2>
        <p>
          Every join and leave updates the player count, spots left and progress instantly.
        </p>
      </div>

      <div className="demo-count">
        <div>
          <small>BEFORE</small>
          <b>8 / 12</b>
          <span>4 spots left</span>
        </div>
        <strong>→</strong>
        <div className="highlight">
          <small>JOINED</small>
          <b>9 / 12</b>
          <span>3 spots left</span>
        </div>
        <strong>→</strong>
        <div>
          <small>LEFT</small>
          <b>8 / 12</b>
          <span>4 spots left</span>
        </div>
      </div>
    </section>
  );
}
