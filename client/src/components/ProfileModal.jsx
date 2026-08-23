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
  const { currentUser, profile, signOut } = useAuth();

  if (!currentUser) return null;

  const displayName = profile?.name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Around Us user';
  const avatarLetter = (displayName[0] || 'A').toUpperCase();
  const dob = profile?.date_of_birth || currentUser?.user_metadata?.date_of_birth;
  const age = calculateAge(dob);
  const college = profile?.college || currentUser?.user_metadata?.college;
  const city = profile?.city || currentUser?.user_metadata?.city;
  const gender = profile?.gender || currentUser?.user_metadata?.gender;

  async function handleSignOut() {
    await signOut();
    onClose();
    toast('Signed out.');
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="eyebrow">YOUR PROFILE</div>

      <div className="profile-card">
        <div className="profile-avatar">{avatarLetter}</div>
        <div>
          <strong>{displayName}</strong>
          <span>{college ? `${college}` : 'Around Us Member'}</span>
        </div>
      </div>

      <div className="profile-details-list" style={{ display: 'grid', gap: '10px', margin: '20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>📧 Email</span>
          <strong style={{ fontSize: '13px', wordBreak: 'break-all' }}>{currentUser.email}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>🎂 Age</span>
          <strong style={{ fontSize: '13px' }}>
            {age ? `${age} years old` : '16+'} {dob ? `(${dob})` : ''}
          </strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>⚥ Gender</span>
          <strong style={{ fontSize: '13px' }}>
            {gender && gender !== 'Any' ? gender : 'Any / Not specified'}
          </strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>🎓 College</span>
          <strong style={{ fontSize: '13px' }}>{college || 'Not set'}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>📍 City</span>
          <strong style={{ fontSize: '13px' }}>{city || 'Not set'}</strong>
        </div>
      </div>

      <button className="main" type="button" id="logoutBtn" onClick={handleSignOut}>
        Sign out
      </button>
    </Modal>
  );
}
