import { useState, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { useGames } from './hooks/useGames';
import { useRealtime } from './hooks/useRealtime';
import { useToast } from './components/Toast';

import Header from './components/Header';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import Discover from './components/Discover';
import HowItWorks from './components/HowItWorks';
import CreateActivity from './components/CreateActivity';
import Footer from './components/Footer';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import GameDetailsModal from './components/GameDetailsModal';
import ProfileModal from './components/ProfileModal';

export default function App() {
  const { currentUser, isAuthenticated } = useAuth();
  const toast = useToast();

  const {
    filteredGames,
    counts,
    myGames,
    stats,
    heroGame,
    category,
    setCategory,
    scope,
    setScope,
    time,
    setTime,
    query,
    setQuery,
    joinGame,
    leaveGame,
    createGame,
    refresh,
  } = useGames();

  // Subscribe to realtime updates
  useRealtime(refresh);

  // Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [detailsGame, setDetailsGame] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Profile button handler
  const handleProfileClick = useCallback(() => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    } else {
      setProfileModalOpen(true);
    }
  }, [isAuthenticated]);

  // Create button handler — scrolls to create section
  const handleCreateClick = useCallback(() => {
    document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Hero details button handler
  const handleHeroDetails = useCallback(() => {
    if (heroGame) setDetailsGame(heroGame);
  }, [heroGame]);

  // Join with auth check
  const handleJoin = useCallback(
    async (id) => {
      if (!isAuthenticated) {
        setAuthModalOpen(true);
        toast('Create your account to join a game.');
        return;
      }
      const result = await joinGame(id);
      if (result?.message) toast(result.message);
    },
    [isAuthenticated, joinGame, toast]
  );

  // Leave with auth check
  const handleLeave = useCallback(
    async (id) => {
      if (!isAuthenticated) {
        setAuthModalOpen(true);
        toast('Create your account to leave a game.');
        return;
      }
      const result = await leaveGame(id);
      if (result?.message) toast(result.message);
    },
    [isAuthenticated, leaveGame, toast]
  );

  // Create game handler
  const handleCreateGame = useCallback(
    async (data) => {
      return createGame(data);
    },
    [createGame]
  );

  return (
    <>
      <Header onProfileClick={handleProfileClick} />

      <main id="top">
        <Hero
          heroGame={heroGame}
          counts={counts}
          onCreateClick={handleCreateClick}
          onDetailsClick={handleHeroDetails}
        />

        <StatsBar stats={stats} />

        <Discover
          filteredGames={filteredGames}
          counts={counts}
          myGames={myGames}
          category={category}
          setCategory={setCategory}
          scope={scope}
          setScope={setScope}
          time={time}
          setTime={setTime}
          query={query}
          setQuery={setQuery}
          onJoin={handleJoin}
          onLeave={handleLeave}
          onCreateClick={handleCreateClick}
          onShowDetails={setDetailsGame}
        />

        <HowItWorks />

        <CreateActivity
          onCreateGame={handleCreateGame}
          onNeedAuth={() => setAuthModalOpen(true)}
          toast={toast}
        />
      </main>

      <Footer />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        toast={toast}
      />

      <GameDetailsModal
        isOpen={!!detailsGame}
        onClose={() => setDetailsGame(null)}
        game={detailsGame}
        counts={counts}
        isMine={detailsGame ? myGames.has(detailsGame.id) : false}
        onJoin={handleJoin}
        onLeave={handleLeave}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        toast={toast}
      />

      <Toast />
    </>
  );
}
