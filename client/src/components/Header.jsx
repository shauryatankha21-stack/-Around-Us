import { useAuth } from '../context/AuthContext';

export default function Header({ onProfileClick }) {
  const { currentUser, profile } = useAuth();

  const displayName = profile?.name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Sign in';
  const avatarLetter = currentUser ? (displayName[0] || 'A').toUpperCase() : 'A';

  return (
    <header className="site-header">
      <a className="brand" href="#top">
        <span className="spark">✦</span>
        <span>Around Us</span>
      </a>

      <nav>
        <a href="#discover">Discover</a>
        <a href="#create">Create</a>
        <a href="#how">How it works</a>
      </nav>

      <button className="profile-btn" id="profileBtn" type="button" onClick={onProfileClick}>
        <span className="avatar-dot">{avatarLetter}</span>
        <span id="profileLabel">{currentUser ? displayName : 'Sign in'}</span>
      </button>
    </header>
  );
}
