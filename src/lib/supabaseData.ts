import { supabase, isSupabaseConfigured } from './supabaseClient';
import { TableSchema, getInitialSchema } from './mockDb';
import { CHALLENGES, Challenge } from './challenges';
import type { HistoryItem } from '../components/Sidebar';

const TABLES_TABLE = 'tables';
const HISTORY_TABLE = 'history';
const CHALLENGES_TABLE = 'challenges';

export interface LoadPayload {
  tables: TableSchema[];
  history: HistoryItem[];
  challenges: typeof CHALLENGES;
  notes: string;
}

export let supabaseConnectionError: string | null = null;

const mapHistoryRow = (row: any): HistoryItem => ({
  id: row.id,
  query: row.query,
  timestamp: row.executed_at ? new Date(row.executed_at) : (row.created_at ? new Date(row.created_at) : new Date()),
  status: row.status,
  result: row.result ?? undefined
});

export async function loadSupabaseData(userId: string): Promise<LoadPayload | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  const [tablesResp, historyResp, challengesResp, notesResp] = await Promise.all([
    supabase.from(TABLES_TABLE).select('*').eq('user_id', userId).order('name', { ascending: true }),
    supabase.from(HISTORY_TABLE).select('*').eq('user_id', userId).order('executed_at', { ascending: true }),
    supabase.from(CHALLENGES_TABLE).select('*').order('id', { ascending: true }),
    supabase.from('notes').select('content').eq('user_id', userId).maybeSingle()
  ]);

  if (tablesResp.error || historyResp.error || challengesResp.error || (notesResp.error && (notesResp.error as any).code !== 'PGRST116')) {
    supabaseConnectionError = tablesResp.error?.message || historyResp.error?.message || challengesResp.error?.message || notesResp.error?.message || 'Unknown error';
    console.warn('Supabase load error', tablesResp.error, historyResp.error, challengesResp.error, notesResp.error);
    return null;
  }

  supabaseConnectionError = null;

  const tables = (tablesResp.data ?? []).map((row: any) => ({
    name: row.name,
    columns: row.columns ?? [],
    data: row.data ?? []
  }));

  const history = (historyResp.data ?? []).map(mapHistoryRow);

  const challenges = (challengesResp.data ?? []).length
    ? (challengesResp.data ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      difficulty: row.difficulty,
      sql: row.sql
    }))
    : CHALLENGES;

  return {
    tables: tables.length ? tables : getInitialSchema(),
    history,
    challenges,
    notes: notesResp.data?.content ?? ''
  };
}

export async function saveUserSchema(tables: TableSchema[], userId: string) {
  if (!supabase || !isSupabaseConfigured || !userId) return;

  // 1. Prepare payload for upsert
  const payload = tables.map((table) => ({
    name: table.name,
    columns: table.columns,
    data: table.data,
    user_id: userId
  }));

  // 2. Perform upsert
  const { error: upsertError } = await supabase
    .from(TABLES_TABLE)
    .upsert(payload, { onConflict: 'name,user_id' });

  if (upsertError) {
    console.warn('Supabase tables upsert error', upsertError);
  } else {
    console.log('Supabase tables upserted successfully');
  }

  // 3. Handle deletions (DROP TABLE support)
  // Fetch existing table names from Supabase for this user
  const { data: remoteTables, error: fetchError } = await supabase
    .from(TABLES_TABLE)
    .select('name')
    .eq('user_id', userId);

  if (fetchError) {
    console.warn('Supabase fetch table names error', fetchError);
    return;
  }

  const localTableNames = new Set(tables.map(t => t.name));
  const tablesToDelete = remoteTables
    ?.filter(rt => !localTableNames.has(rt.name))
    .map(rt => rt.name);

  if (tablesToDelete && tablesToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from(TABLES_TABLE)
      .delete()
      .eq('user_id', userId)
      .in('name', tablesToDelete);

    if (deleteError) {
      console.warn('Supabase tables delete error', deleteError);
    } else {
      console.log('Supabase tables cleaned up successfully', tablesToDelete);
    }
  }
}

export async function appendSupabaseHistory(item: HistoryItem, userId: string): Promise<HistoryItem | null> {
  if (!supabase || !isSupabaseConfigured || !userId) return null;

  const payload = {
    query: item.query,
    status: item.status,
    executed_at: item.timestamp.toISOString(),
    result: item.result ?? null,
    user_id: userId
  };

  const { data, error } = await supabase.from(HISTORY_TABLE).insert(payload).select().single();
  if (error) {
    console.warn('Supabase history insert error', error);
    return null;
  }
  return mapHistoryRow(data);
}

export async function deleteSupabaseHistory(id: number | string, userId: string) {
  if (!supabase || !isSupabaseConfigured || !userId) return;

  const { error } = await supabase.from(HISTORY_TABLE).delete().eq('id', id).eq('user_id', userId);
  if (error) {
    console.warn('Supabase history delete error', error);
  }
}

export async function clearAllSupabaseHistory(userId: string) {
  if (!supabase || !isSupabaseConfigured || !userId) return;

  const { error } = await supabase.from(HISTORY_TABLE).delete().eq('user_id', userId);
  if (error) {
    console.warn('Supabase history clear error', error);
  }
}


export async function upsertSupabaseChallenges(customChallenges?: Challenge[]) {
  if (!supabase || !isSupabaseConfigured) return;

  const dataToSync = customChallenges || CHALLENGES;

  const payload = dataToSync.map((challenge) => ({
    id: challenge.id,
    title: challenge.title,
    difficulty: challenge.difficulty,
    sql: challenge.sql
  }));

  const { error } = await supabase.from(CHALLENGES_TABLE).upsert(payload, { onConflict: 'id' });
  if (error) {
    console.warn('Supabase challenges upsert error', error);
  }
}
export async function saveUserNotes(content: string, userId: string) {
  if (!supabase || !isSupabaseConfigured || !userId) return;

  const { error } = await supabase
    .from('notes')
    .upsert({ user_id: userId, content, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

  if (error) {
    console.warn('Supabase notes upsert error', error);
  }
}
