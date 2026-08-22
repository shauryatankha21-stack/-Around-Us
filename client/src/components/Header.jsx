import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

export default function Header({ onProfileClick }) {
  const { currentUser, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const displayName = profile?.name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Sign in';
  const avatarLetter = currentUser ? (displayName[0] || 'A').toUpperCase() : 'A';

  return (
    <header className="site-header">
      <a className="brand" href="#top">
        <div className="brand-logo" aria-hidden="true"></div>
        <span>Around Us</span>
      </a>

      <nav>
        <a href="#discover">Discover</a>
        <a href="#create">Create</a>
        <a href="#how">How it works</a>
      </nav>

      <div className="header-right">
        <button
          className="theme-toggle"
          id="themeToggle"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button className="profile-btn" id="profileBtn" type="button" onClick={onProfileClick}>
          <span className="avatar-dot">{avatarLetter}</span>
          <span id="profileLabel">{currentUser ? displayName : 'Sign in'}</span>
        </button>
      </div>
    </header>
  );
}
