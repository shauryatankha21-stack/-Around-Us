import { useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Subscribes to Supabase realtime changes on `games` and `game_players` tables.
 * Calls `onUpdate` whenever a change is detected so the caller can refresh data.
 */
export function useRealtime(onUpdate) {
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('around-us-games')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, (payload) => {
        console.log('Realtime event on games:', payload);
        onUpdate();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players' }, (payload) => {
        console.log('Realtime event on game_players:', payload);
        onUpdate();
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
