import Modal from './Modal';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ isOpen, onClose, toast }) {
  const { currentUser, profile, signOut } = useAuth();

  if (!currentUser) return null;

  const displayName = profile?.name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Around Us user';
  const avatarLetter = (displayName[0] || 'A').toUpperCase();

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
          <span>
            {profile?.college || 'College not set'} · {profile?.city || 'City not set'}
          </span>
        </div>
      </div>

      <p>{currentUser.email}</p>

      <button className="main" type="button" id="logoutBtn" onClick={handleSignOut}>
        Sign out
      </button>
    </Modal>
  );
}
