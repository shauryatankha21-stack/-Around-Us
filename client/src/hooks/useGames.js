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

export function getGameStatus(game) {
  if (!game) return 'upcoming';
  if (game.status === 'live') return 'live';
  if (!game.starts_at) return game.status || 'upcoming';
  const start = new Date(game.starts_at).getTime();
  const now = Date.now();
  // If started in the last 2 hours or starts within 5 mins
  if (start <= now && now - start < 2 * 60 * 60 * 1000) {
    return 'live';
  }
  return 'upcoming';
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
      const localGames = (data.games || []).map((g) => ({
        ...g,
        status: getGameStatus(g),
        participants: g.participants || generateParticipants(g.players || 0),
      }));
      setGames(localGames);
      setCounts(new Map(localGames.map((g) => [g.id, g.players || 0])));
      setMyGames(new Set(localGames.filter((g) => g.joinedByMe).map((g) => g.id)));
      return;
    }

    // Supabase mode
    async function load() {
      const [{ data: gs, error: ge }, { data: cs, error: ce }] = await Promise.all([
        supabase.from('games').select('*').order('starts_at'),
        supabase.rpc('get_game_counts'),
      ]);

      if (ge || ce) {
        console.error('Error loading games/counts:', ge || ce);
        return;
      }

      const countMap = new Map((cs || []).map((x) => [x.game_id, Number(x.joined_count)]));

      // Attempt to load real participants if permitted
      let realParticipantsByGame = new Map();
      try {
        const { data: playersData } = await supabase
          .from('game_players')
          .select('game_id, user_id, profiles(name, gender)');
        if (playersData) {
          playersData.forEach((p) => {
            if (!realParticipantsByGame.has(p.game_id)) realParticipantsByGame.set(p.game_id, []);
            realParticipantsByGame.get(p.game_id).push({
              name: p.profiles?.name || 'Player',
              gender: p.profiles?.gender === 'Male' ? 'M' : p.profiles?.gender === 'Female' ? 'F' : 'Co-ed',
            });
          });
        }
      } catch (err) {
        // Fallback to placeholder participants
      }

      // Ensure each game has a participants array
      const gamesWithParticipants = (gs || []).map((g) => {
        const count = countMap.get(g.id) || g.players || 0;
        const realPlayers = realParticipantsByGame.get(g.id);
        const effectiveStatus = getGameStatus(g);
        return {
          ...g,
          status: effectiveStatus,
          players: count,
          participants: realPlayers && realPlayers.length > 0 ? realPlayers : generateParticipants(count),
        };
      });

      setGames(gamesWithParticipants);
      setCounts(countMap);

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
      const effectiveStatus = getGameStatus(g);
      if (time !== 'all' && effectiveStatus !== time) return false;
      if (query) {
        const searchPool = [g.title, g.place, g.college, g.note, g.category, g.experience_level].filter(Boolean).join(' ').toLowerCase();
        if (!searchPool.includes(query.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [games, category, scope, time, query]);

  // Computed stats
  const stats = useMemo(() => {
    const liveGames = games.filter((g) => getGameStatus(g) === 'live').length;
    const spotsAvailable = games.reduce(
      (n, g) => n + Math.max(0, g.max_players - (counts.get(g.id) || 0)),
      0
    );
    const joined = myGames.size;
    const hosted = currentUser ? games.filter((g) => g.host_id === currentUser.id).length : 0;
    return { liveGames, spotsAvailable, joined, hosted };
  }, [games, counts, myGames, currentUser]);

  // Hero game — prioritize live games, then basketball, then first game
  const heroGame = useMemo(() => {
    if (!games.length) return null;
    return (
      games.find((g) => getGameStatus(g) === 'live') ||
      games.find((g) => g.title?.toLowerCase() === 'basketball') ||
      games[0]
    );
  }, [games]);

  // Join game
  const joinGame = useCallback(
    async (id) => {
      if (!supabase) {
        const data = readLocal();
        const g = data.games.find((x) => x.id === id);
        if (!g || g.players >= g.max_players) {
          return { success: false, message: 'This game is full.' };
        }
        g.players = (g.players || 0) + 1;
        g.joinedByMe = true;
        if (!g.participants) g.participants = [];
        g.participants.push({
          name: currentUser?.user_metadata?.name || 'You',
          gender: currentUser?.user_metadata?.gender === 'Male' ? 'M' : currentUser?.user_metadata?.gender === 'Female' ? 'F' : 'Co-ed',
        });
        writeLocal(data);
        refresh();
        const spots = Math.max(0, g.max_players - g.players);
        return { success: true, message: `Joined ${g.title} · ${spots} spot${spots === 1 ? '' : 's'} left` };
      }

      const { error } = await supabase.rpc('join_game', { p_game_id: id });
      if (error) return { success: false, message: error.message };

      // Optimistic update
      setMyGames((prev) => new Set([...prev, id]));
      setCounts((prev) => {
        const next = new Map(prev);
        next.set(id, (next.get(id) || 0) + 1);
        return next;
      });

      refresh();
      const g = games.find((x) => x.id === id);
      const joined = (counts.get(id) || 0) + 1;
      const spots = Math.max(0, (g?.max_players || 0) - joined);
      return { success: true, message: `Joined ${g?.title || 'game'} · ${spots} spot${spots === 1 ? '' : 's'} left` };
    },
    [currentUser, games, counts, refresh]
  );

  // Leave game
  const leaveGame = useCallback(
    async (id) => {
      if (!supabase) {
        const data = readLocal();
        const g = data.games.find((x) => x.id === id);
        if (!g) return { success: false, message: 'Game not found.' };
        g.players = Math.max(0, (g.players || 1) - 1);
        g.joinedByMe = false;
        if (g.participants && g.participants.length > 0) {
          g.participants.pop();
        }
        writeLocal(data);
        refresh();
        const spots = Math.max(0, g.max_players - g.players);
        return { success: true, message: `Left ${g.title} · ${spots} spot${spots === 1 ? '' : 's'} left` };
      }

      const { error } = await supabase.rpc('leave_game', { p_game_id: id });
      if (error) return { success: false, message: error.message };

      // Optimistic update
      setMyGames((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setCounts((prev) => {
        const next = new Map(prev);
        next.set(id, Math.max(0, (next.get(id) || 0) - 1));
        return next;
      });

      refresh();
      const g = games.find((x) => x.id === id);
      const left = Math.max(0, (counts.get(id) || 0) - 1);
      const spots = Math.max(0, (g?.max_players || 0) - left);
      return { success: true, message: `Left ${g?.title || 'game'} · ${spots} spot${spots === 1 ? '' : 's'} left` };
    },
    [games, counts, refresh]
  );

  // Delete / Cancel game (Host only)
  const deleteGame = useCallback(
    async (id) => {
      if (!currentUser) return { success: false, message: 'Must be signed in.' };

      if (!supabase) {
        const data = readLocal();
        data.games = (data.games || []).filter((x) => x.id !== id);
        writeLocal(data);
        refresh();
        return { success: true, message: 'Activity cancelled.' };
      }

      const { error } = await supabase.from('games').delete().eq('id', id);
      if (error) return { success: false, message: error.message };

      // Optimistic delete
      setGames((prev) => prev.filter((g) => g.id !== id));
      setMyGames((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      refresh();
      return { success: true, message: 'Activity cancelled.' };
    },
    [currentUser, refresh]
  );

  // Create game
  const createGame = useCallback(
    async ({ title, icon, categoryValue, place, scopeValue, college, startsAt, maxPlayers, minAge, experienceLevel, genderPreference, note }) => {
      if (!currentUser) {
        return { success: false, message: 'Must be signed in' };
      }

      const collegeValue = scopeValue === 'college' ? (college?.trim() || null) : null;

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
          college: collegeValue,
          starts_at: startsAt,
          status: getGameStatus({ starts_at: startsAt }),
          max_players: maxPlayers,
          min_age: minAge,
          experience_level: experienceLevel || 'Any',
          gender_preference: genderPreference || 'Any',
          note: note || 'Open to new players.',
          players: 1,
          joinedByMe: true,
          participants: [{
            name: currentUser?.user_metadata?.name || 'You (Host)',
            gender: currentUser?.user_metadata?.gender === 'Male' ? 'M' : currentUser?.user_metadata?.gender === 'Female' ? 'F' : 'Co-ed',
          }],
        };
        data.games.push(g);
        writeLocal(data);
        refresh();
        return { success: true, message: `${title} published! You are the first player.` };
      }

      const payload = {
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
        experience_level: experienceLevel || 'Any',
        gender_preference: genderPreference || 'Any',
        note: note || 'Open to new players.',
      };

      if (collegeValue) {
        payload.college = collegeValue;
      }

      let { data, error } = await supabase
        .from('games')
        .insert(payload)
        .select()
        .single();

      // Graceful fallback if database column 'college' does not exist yet
      if (error && (error.code === '42703' || error.message?.includes('college'))) {
        console.warn('games.college column not found in database yet, falling back to insert without it.');
        const fallbackPayload = { ...payload };
        delete fallbackPayload.college;
        const retry = await supabase.from('games').insert(fallbackPayload).select().single();
        data = retry.data;
        error = retry.error;
      }

      if (error) return { success: false, message: error.message };

      const joinResult = await supabase.rpc('join_game', { p_game_id: data.id });
      if (joinResult.error) {
        refresh();
        return { success: true, message: `Published! (Host could not auto-join: ${joinResult.error.message})` };
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
    deleteGame,
    createGame,
    refresh,
  };
}
