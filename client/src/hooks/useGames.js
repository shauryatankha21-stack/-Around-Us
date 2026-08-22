import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const STORE_KEY = 'around-us-v75';

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || { games: [], profile: null };
  } catch {
    return { games: [], profile: null };
  }
}

function writeLocal(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

// Utility to generate random participant names and genders
const NAMES = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Chris', 'Pat', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Alex', 'Sam', 'Jordan', 'Taylor'];
const GENDERS = ['M', 'F'];
function generateParticipants(count) {
  const participants = [];
  for (let i = 0; i < count; i++) {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)];
    participants.push({ name, gender });
  }
  return participants;
}

const SEED_GAMES = [
  {
    id: 'demo-basketball',
    host_id: 'demo',
    title: 'Basketball',
    icon: '🏀',
    category: 'sports',
    place: 'College Court',
    scope: 'college',
    starts_at: new Date().toISOString(),
    status: 'live',
    max_players: 12,
    note: 'Mixed level welcome.',
    players: 8,
    participants: generateParticipants(8),
    joinedByMe: false,
  },
  {
    id: 'demo-football',
    host_id: 'demo',
    title: 'Football',
    icon: '⚽',
    category: 'sports',
    place: 'Main Ground',
    scope: 'city',
    starts_at: new Date(Date.now() + 3600000).toISOString(),
    status: 'upcoming',
    max_players: 14,
    note: 'Need a few more players.',
    players: 9,
    participants: generateParticipants(9),
    joinedByMe: false,
  },
  {
    id: 'demo-uno',
    host_id: 'demo',
    title: 'UNO',
    icon: '🃏',
    category: 'games',
    place: 'Student Lounge',
    scope: 'college',
    starts_at: new Date(Date.now() + 2100000).toISOString(),
    status: 'upcoming',
    max_players: 4,
    note: 'Quick game, all levels.',
    players: 2,
    participants: generateParticipants(2),
    joinedByMe: false,
  },
];

function seedLocal() {
  const data = readLocal();
  if (!data.games.length) {
    data.games = SEED_GAMES;
    writeLocal(data);
  }
}

export function useGames() {
  const { currentUser } = useAuth();

  const [games, setGames] = useState([]);
  const [counts, setCounts] = useState(new Map());
  const [myGames, setMyGames] = useState(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters
  const [category, setCategory] = useState('all');
  const [scope, setScope] = useState('all');
  const [time, setTime] = useState('all');
  const [query, setQuery] = useState('');

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Load data
  useEffect(() => {
    if (!supabase) {
      // Local mode
      seedLocal();
      const data = readLocal();
      setGames(data.games || []);
      setCounts(new Map((data.games || []).map((g) => [g.id, g.players || 0])));
      setMyGames(new Set((data.games || []).filter((g) => g.joinedByMe).map((g) => g.id)));
      return;
    }

    // Supabase mode
    async function load() {
      const [{ data: gs, error: ge }, { data: cs, error: ce }] = await Promise.all([
        supabase.from('games').select('*').order('starts_at'),
        supabase.rpc('get_game_counts'),
      ]);

      if (ge || ce) return;

      // Ensure each game has a participants array (used for the UI)
      const gamesWithParticipants = (gs || []).map((g) => {
        if (!g.participants) {
          // Use the existing player count (or 0) to generate placeholder participants
          const count = g.players || 0;
          return { ...g, participants: generateParticipants(count) };
        }
        return g;
      });
      setGames(gamesWithParticipants);
      setCounts(new Map((cs || []).map((x) => [x.game_id, Number(x.joined_count)])));

      if (currentUser) {
        const { data } = await supabase
          .from('game_players')
          .select('game_id')
          .eq('user_id', currentUser.id);
        setMyGames(new Set((data || []).map((x) => x.game_id)));
      } else {
        setMyGames(new Set());
      }
    }

    load();
  }, [currentUser, refreshKey]);

  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      if (category !== 'all' && g.category !== category) return false;
      if (scope !== 'all' && g.scope !== scope) return false;
      if (time !== 'all' && g.status !== time) return false;
      if (query && !`${g.title} ${g.place} ${g.note}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [games, category, scope, time, query]);

  // Computed stats
  const stats = useMemo(() => {
    const liveGames = games.filter((g) => g.status === 'live').length;
    const spotsAvailable = games.reduce(
      (n, g) => n + Math.max(0, g.max_players - (counts.get(g.id) || 0)),
      0
    );
    const joined = myGames.size;
    const hosted = currentUser ? games.filter((g) => g.host_id === currentUser.id).length : 0;
    return { liveGames, spotsAvailable, joined, hosted };
  }, [games, counts, myGames, currentUser]);

  // Hero game
  const heroGame = useMemo(() => {
    return games.find((g) => g.title.toLowerCase() === 'basketball') || games[0] || null;
  }, [games]);

  // Join game
  const joinGame = useCallback(
    async (id) => {
      if (!supabase) {
        const data = readLocal();
        const g = data.games.find((x) => x.id === id);
        if (!g || g.players >= g.max_players) return 'This game is full.';
        g.players++;
        g.joinedByMe = true;
        writeLocal(data);
        refresh();
        const spots = Math.max(0, g.max_players - g.players);
        return { success: true, message: `Joined ${g.title} · ${spots} spot${spots === 1 ? '' : 's'} left` };
      }

      const { error } = await supabase.rpc('join_game', { p_game_id: id });
      if (error) return { success: false, message: error.message };

      refresh();
      const g = games.find((x) => x.id === id);
      const joined = (counts.get(id) || 0) + 1;
      const spots = Math.max(0, (g?.max_players || 0) - joined);
      return { success: true, message: `Joined ${g?.title || 'game'} · ${spots} spot${spots === 1 ? '' : 's'} left` };
    },
    [games, counts, refresh]
  );

  // Leave game
  const leaveGame = useCallback(
    async (id) => {
      if (!supabase) {
        const data = readLocal();
        const g = data.games.find((x) => x.id === id);
        if (!g) return { success: false, message: 'Game not found.' };
        g.players = Math.max(0, g.players - 1);
        g.joinedByMe = false;
        writeLocal(data);
        refresh();
        const spots = Math.max(0, g.max_players - g.players);
        return { success: true, message: `Left ${g.title} · ${spots} spot${spots === 1 ? '' : 's'} left` };
      }

      const { error } = await supabase.rpc('leave_game', { p_game_id: id });
      if (error) return { success: false, message: error.message };

      refresh();
      const g = games.find((x) => x.id === id);
      const left = Math.max(0, (counts.get(id) || 0) - 1);
      const spots = Math.max(0, (g?.max_players || 0) - left);
      return { success: true, message: `Left ${g?.title || 'game'} · ${spots} spot${spots === 1 ? '' : 's'} left` };
    },
    [games, counts, refresh]
  );

  // Create game
  const createGame = useCallback(
    async ({ title, icon, categoryValue, place, scopeValue, startsAt, maxPlayers, minAge, note }) => {
      if (!currentUser) {
        return { success: false, message: 'Must be signed in' };
      }

      if (!supabase) {
        const data = readLocal();
        const g = {
          id: 'local-' + Date.now(),
          host_id: currentUser?.id || 'local-user',
          title,
          icon,
          category: categoryValue,
          place,
          scope: scopeValue,
          starts_at: startsAt,
          status: 'upcoming',
          max_players: maxPlayers,
          note: note || 'Open to new players.',
          players: 1,
          joinedByMe: true,
        };
        data.games.push(g);
        writeLocal(data);
        refresh();
        return { success: true, message: `${title} published! You are the first player.` };
      }

      const { data, error } = await supabase
        .from('games')
        .insert({
          host_id: currentUser.id,
          title,
          icon,
          category: categoryValue,
          place,
          scope: scopeValue,
          starts_at: startsAt,
          status: 'upcoming',
          max_players: maxPlayers,
          min_age: minAge,
          note: note || 'Open to new players.',
        })
        .select()
        .single();

      if (error) return { success: false, message: error.message };

      const joinResult = await supabase.rpc('join_game', { p_game_id: data.id });
      if (joinResult.error) {
        return { success: true, message: `Published, but host could not join: ${joinResult.error.message}` };
      }

      refresh();
      return { success: true, message: `${title} published!` };
    },
    [currentUser, refresh]
  );

  return {
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
    createGame,
    refresh,
  };
}
