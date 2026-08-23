import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';

function calculateAge(dobString) {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return isNaN(age) ? null : age;
}

export default function ProfileModal({ isOpen, onClose, toast }) {
  const { currentUser, profile, signOut, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [city, setCity] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Any');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync profile details into form inputs
  useEffect(() => {
    if (profile || currentUser) {
      setName(profile?.name || currentUser?.user_metadata?.name || '');
      setCollege(profile?.college || currentUser?.user_metadata?.college || '');
      setCity(profile?.city || currentUser?.user_metadata?.city || '');
      setDob(profile?.date_of_birth || currentUser?.user_metadata?.date_of_birth || '');
      setGender(profile?.gender || currentUser?.user_metadata?.gender || 'Any');
      setPassword('');
    }
  }, [profile, currentUser, isOpen, isEditing]);

  if (!currentUser) return null;

  const displayName = profile?.name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Around Us user';
  const avatarLetter = (displayName[0] || 'A').toUpperCase();
  const currentDob = profile?.date_of_birth || currentUser?.user_metadata?.date_of_birth;
  const currentAge = calculateAge(currentDob);
  const currentCollege = profile?.college || currentUser?.user_metadata?.college;
  const currentCity = profile?.city || currentUser?.user_metadata?.city;
  const currentGender = profile?.gender || currentUser?.user_metadata?.gender;

  async function handleSignOut() {
    await signOut();
    onClose();
    toast('Signed out.');
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!name.trim()) {
      toast('Please enter your name.');
      return;
    }

    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 16) {
        toast('You must be at least 16 years old.');
        return;
      }
    }

    if (password && password.trim().length < 6) {
      toast('New password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile({
        name: name.trim(),
        college: college.trim(),
        city: city.trim(),
        date_of_birth: dob || null,
        gender: gender || 'Any',
        password: password.trim() || undefined,
      });

      if (result?.error) {
        toast(result.error);
      } else {
        toast('Profile updated successfully!');
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => { setIsEditing(false); onClose(); }}>
      <div className="eyebrow">{isEditing ? 'EDIT CREDENTIALS' : 'YOUR PROFILE'}</div>
      <h2>{isEditing ? 'Update profile' : 'Profile overview'}</h2>

      <div className="profile-card">
        <div className="profile-avatar">{avatarLetter}</div>
        <div>
          <strong>{displayName}</strong>
          <span>{currentCollege ? `${currentCollege}` : 'Around Us Member'}</span>
        </div>
      </div>

      {!isEditing ? (
        <>
          <div className="profile-details-list" style={{ display: 'grid', gap: '10px', margin: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>📧 Email</span>
              <strong style={{ fontSize: '13px', wordBreak: 'break-all' }}>{currentUser.email}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>🎂 Age</span>
              <strong style={{ fontSize: '13px' }}>
                {currentAge ? `${currentAge} years old` : '16+'} {currentDob ? `(${currentDob})` : ''}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>⚥ Gender</span>
              <strong style={{ fontSize: '13px' }}>
                {currentGender && currentGender !== 'Any' ? currentGender : 'Any / Not specified'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>🎓 College</span>
              <strong style={{ fontSize: '13px' }}>{currentCollege || 'Not set'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>📍 City</span>
              <strong style={{ fontSize: '13px' }}>{currentCity || 'Not set'}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              className="btn light"
              type="button"
              id="editProfileBtn"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit details
            </button>
            <button
              className="main"
              type="button"
              id="logoutBtn"
              style={{ width: '100%', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </>
      ) : (
        <form id="editProfileForm" className="auth-form" onSubmit={handleSave} style={{ marginTop: '15px' }}>
          <label>
            Name
            <input
              id="editName"
              required
              value={name}
              placeholder="Your full name"
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label>
            College
            <input
              id="editCollege"
              value={college}
              placeholder="College / University"
              onChange={(e) => setCollege(e.target.value)}
            />
          </label>

          <label>
            City
            <input
              id="editCity"
              value={city}
              placeholder="Your City"
              onChange={(e) => setCity(e.target.value)}
            />
          </label>

          <label>
            Date of Birth
            <input
              id="editDob"
              type="date"
              value={dob}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
              onChange={(e) => setDob(e.target.value)}
            />
          </label>

          <label>
            Gender
            <select
              id="editGender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="Any">Any / Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>

          <label>
            New Password (Optional)
            <input
              id="editPassword"
              type="password"
              minLength="6"
              placeholder="Leave empty to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
            <button
              className="btn light"
              type="button"
              disabled={saving}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              className="main"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
