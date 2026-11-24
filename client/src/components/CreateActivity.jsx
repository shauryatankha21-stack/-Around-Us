import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CollegeInput from './CollegeInput';

const ACTIVITIES = [
  { label: '🏀 Basketball', title: 'Basketball', icon: '🏀', category: 'sports' },
  { label: '⚽ Football', title: 'Football', icon: '⚽', category: 'sports' },
  { label: '🏏 Cricket', title: 'Cricket', icon: '🏏', category: 'sports' },
  { label: '🏸 Badminton', title: 'Badminton', icon: '🏸', category: 'sports' },
  { label: '🏓 Table Tennis', title: 'Table Tennis', icon: '🏓', category: 'sports' },
  { label: '🎾 Tennis', title: 'Tennis', icon: '🎾', category: 'sports' },
  { label: '🎾 Pickle Ball', title: 'Pickle Ball', icon: '🎾', category: 'sports' },
  { label: '🏐 Volleyball', title: 'Volleyball', icon: '🏐', category: 'sports' },
  { label: '🃏 UNO', title: 'UNO', icon: '🃏', category: 'games' },
  { label: '♟️ Chess', title: 'Chess', icon: '♟️', category: 'games' },
  { label: '🎮 Gaming', title: 'Gaming', icon: '🎮', category: 'games' },
  { label: '✨ Others', title: 'Others', icon: '✨', category: 'other' },
];

export default function CreateActivity({ onCreateGame, onNeedAuth, toast }) {
  const { isAuthenticated, profile } = useAuth();
  const formRef = useRef(null);

  const [activityIdx, setActivityIdx] = useState(0);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [area, setArea] = useState('college');
  const [college, setCollege] = useState('');
  const [limit, setLimit] = useState(8);
  const [minAge, setMinAge] = useState(16);
  const [experience, setExperience] = useState('Any');
  const [genderPreference, setGenderPreference] = useState('Any');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill host's college from their profile if available
  useEffect(() => {
    if (profile?.college && !college) {
      setCollege(profile.college);
    }
  }, [profile?.college]);

  const now = new Date();
  const localYear = now.getFullYear();
  const localMonth = String(now.getMonth() + 1).padStart(2, '0');
  const localDay = String(now.getDate()).padStart(2, '0');
  const todayStr = `${localYear}-${localMonth}-${localDay}`;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!date || !time || !place.trim()) {
      toast('Fill in all required fields.');
      return;
    }

    if (area === 'college' && !college.trim()) {
      toast('Please choose or enter a college.');
      return;
    }

    if (limit < 2 || limit > 50) {
      toast('Player limit must be between 2 and 50.');
      return;
    }

    if (minAge < 16) {
      toast('Minimum age must be at least 16.');
      return;
    }

    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledDate = new Date(year, month - 1, day, hours, minutes);
    if (isNaN(scheduledDate.getTime())) {
      toast('Please enter a valid date and time.');
      return;
    }

    if (scheduledDate.getTime() < Date.now() - 30 * 60 * 1000) {
      toast('Activity start time cannot be in the past.');
      return;
    }

    if (!isAuthenticated) {
      onNeedAuth();
      return;
    }

    setSubmitting(true);
    try {
      const activity = ACTIVITIES[activityIdx];
      const result = await onCreateGame({
        title: activity.title,
        icon: activity.icon,
        categoryValue: activity.category,
        place: place.trim(),
        scopeValue: area,
        college: area === 'college' ? college.trim() : null,
        startsAt: scheduledDate.toISOString(),
        maxPlayers: limit,
        minAge,
        experienceLevel: experience,
        genderPreference,
        note: note.trim(),
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
        setCollege(profile?.college || '');
        // Scroll to discover
        document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        toast(result.message);
      }
    } finally {
      setSubmitting(false);
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
            <div className="input-icon-wrap">
              <input
                id="date"
                type="date"
                min={todayStr}
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <span className="field-icon" aria-hidden="true">📅</span>
            </div>
          </label>
          <label>
            Time
            <div className="input-icon-wrap">
              <input
                id="timeInput"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <span className="field-icon" aria-hidden="true">🕐</span>
            </div>
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

        {area === 'college' && (
          <label>
            College / Campus
            <CollegeInput
              id="createCollege"
              value={college}
              onChange={setCollege}
              placeholder="Type to search college (e.g. Manipal, IIT, BITS)..."
              required={area === 'college'}
            />
          </label>
        )}

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

        <button className="btn dark full" id="publishBtn" type="submit" disabled={submitting} style={{ marginTop: '15px' }}>
          {submitting ? 'Publishing...' : 'Publish activity'} <span>→</span>
        </button>
      </form>
    </section>
  );
}
