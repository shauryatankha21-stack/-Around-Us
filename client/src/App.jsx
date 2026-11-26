import { useState, useCallback, useEffect } from 'react';
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
    games,
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
    deleteGame,
    createGame,
    refresh,
  } = useGames();

  // Subscribe to realtime updates
  useRealtime(refresh);

  // Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [detailsGame, setDetailsGame] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Handle booking link or QR code scan navigation
  useEffect(() => {
    if (typeof window === 'undefined' || !games || games.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const gameParam = params.get('game');
    const bookingParam = params.get('booking');

    if (gameParam || bookingParam) {
      const match = games.find((g) => {
        if (gameParam && g.id === gameParam) return true;
        if (bookingParam) {
          const cleanId = String(g.id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
          return `AU-BK-${cleanId}` === bookingParam.toUpperCase();
        }
        return false;
      });

      if (match) {
        setDetailsGame(match);
      }
    }
  }, [games]);

  // Sync active modal game with refreshed games list
  const activeDetailsGame = detailsGame
    ? games.find((g) => g.id === detailsGame.id) || detailsGame
    : null;

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
        return { success: false };
      }
      const result = await joinGame(id);
      if (result?.message) toast(result.message);
      return result;
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

  // Delete/Cancel activity (Host only)
  const handleDelete = useCallback(
    async (id) => {
      const result = await deleteGame(id);
      if (result?.message) toast(result.message);
      if (detailsGame?.id === id) setDetailsGame(null);
    },
    [deleteGame, detailsGame, toast]
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
          currentUser={currentUser}
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
          onDelete={handleDelete}
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
        isOpen={!!activeDetailsGame}
        onClose={() => setDetailsGame(null)}
        game={activeDetailsGame}
        counts={counts}
        isMine={activeDetailsGame ? myGames.has(activeDetailsGame.id) : false}
        isHost={activeDetailsGame && currentUser ? activeDetailsGame.host_id === currentUser.id : false}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onDelete={handleDelete}
        currentUser={currentUser}
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
