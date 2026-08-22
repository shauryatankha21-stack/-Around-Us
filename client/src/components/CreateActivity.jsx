import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const ACTIVITIES = [
  { label: '🏀 Basketball', title: 'Basketball', icon: '🏀', category: 'sports' },
  { label: '⚽ Football', title: 'Football', icon: '⚽', category: 'sports' },
  { label: '🏸 Badminton', title: 'Badminton', icon: '🏸', category: 'sports' },
  { label: '🏐 Volleyball', title: 'Volleyball', icon: '🏐', category: 'sports' },
  { label: '🎾 Tennis', title: 'Tennis', icon: '🎾', category: 'sports' },
  { label: '🃏 UNO', title: 'UNO', icon: '🃏', category: 'games' },
  { label: '♟️ Chess', title: 'Chess', icon: '♟️', category: 'games' },
  { label: '🎮 Gaming', title: 'Gaming', icon: '🎮', category: 'games' },
];

export default function CreateActivity({ onCreateGame, onNeedAuth, toast }) {
  const { isAuthenticated } = useAuth();
  const formRef = useRef(null);

  const [activityIdx, setActivityIdx] = useState(0);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [area, setArea] = useState('college');
  const [limit, setLimit] = useState(8);
  const [minAge, setMinAge] = useState(16);
  const [experience, setExperience] = useState('Any');
  const [genderPreference, setGenderPreference] = useState('Any');
  const [note, setNote] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!date || !time || !place || limit < 2) {
      toast('Fill in all required fields.');
      return;
    }

    if (!isAuthenticated) {
      onNeedAuth();
      return;
    }

    const activity = ACTIVITIES[activityIdx];
    const result = await onCreateGame({
      title: activity.title,
      icon: activity.icon,
      categoryValue: activity.category,
      place,
      scopeValue: area,
      startsAt: new Date(`${date}T${time}`).toISOString(),
      maxPlayers: limit,
      minAge,
      experienceLevel: experience,
      genderPreference,
      note,
    });

    if (result.success) {
      toast(result.message);
      formRef.current?.reset();
      setDate('');
      setTime('');
      setPlace('');
      setNote('');
      setLimit(8);
      setMinAge(16);
      setExperience('Any');
      setGenderPreference('Any');
      setActivityIdx(0);
      setArea('college');
      // Scroll to discover
      document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      toast(result.message);
    }
  }

  return (
    <section className="create" id="create">
      <div className="create-copy">
        <div className="eyebrow">HOST SOMETHING</div>
        <h2>Turn "who's playing?" into "let's play."</h2>
        <p>Post an activity with a player limit. People nearby can discover it and join.</p>
        <div className="checks">
          <span>✓ Set the exact player limit</span>
          <span>✓ Choose college or city</span>
          <span>✓ Update your game anytime</span>
        </div>
      </div>

      <form id="createForm" ref={formRef} onSubmit={handleSubmit}>
        <div className="form-title">
          <span className="form-icon">✦</span>
          <div>
            <h3>Create an activity</h3>
            <p>It takes less than a minute.</p>
          </div>
        </div>

        <label>
          Activity
          <select
            id="activity"
            value={activityIdx}
            onChange={(e) => setActivityIdx(Number(e.target.value))}
          >
            {ACTIVITIES.map((a, i) => (
              <option key={a.title} value={i}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <div className="two">
          <label>
            Date
            <input
              id="date"
              type="date"
              min={todayStr}
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Time
            <input
              id="timeInput"
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
        </div>

        <label>
          Place
          <input
            id="place"
            placeholder="College court, park, cafe..."
            required
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </label>

        <div className="two">
          <label>
            Area
            <select id="area" value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="college">College</option>
              <option value="city">City</option>
            </select>
          </label>
          <label>
            Player limit
            <input
              id="limit"
              type="number"
              min="2"
              max="50"
              required
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="two">
          <label>
            Experience Level
            <select id="experience" value={experience} onChange={(e) => setExperience(e.target.value)}>
              <option value="Any">Any</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Pro">Pro</option>
            </select>
          </label>
          <label>
            Gender Preference
            <select id="genderPreference" value={genderPreference} onChange={(e) => setGenderPreference(e.target.value)}>
              <option value="Any">Any</option>
              <option value="Male">Male only</option>
              <option value="Female">Female only</option>
            </select>
          </label>
        </div>

        <div className="two">
          <label>
            Minimum Age
            <input
              id="minAge"
              type="number"
              min="16"
              max="99"
              required
              value={minAge}
              onChange={(e) => setMinAge(Number(e.target.value))}
            />
          </label>
          <div style={{ visibility: 'hidden' }}></div>
        </div>

        <label className="full">
          Note
          <textarea
            id="note"
            rows="2"
            placeholder="Beginner friendly, bring your own ball..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>
        </label>

        <button className="btn dark full" id="publishBtn" type="submit" style={{ marginTop: '15px' }}>
          Publish activity <span>→</span>
        </button>
      </form>
    </section>
  );
}
