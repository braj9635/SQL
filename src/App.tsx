import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';

import { Sidebar, HistoryItem } from './components/Sidebar';
import { SQLEditor } from './components/SQLEditor';
import { ResultsTable } from './components/ResultsTable';
import { executeMockQuery, QueryResult, getSchema, TableSchema, setSchema } from './lib/mockDb';
import { Challenge } from './lib/challenges';
import { cn } from './utils/cn';
import { InstallPrompt } from './components/InstallPrompt';
import { loadSupabaseData, appendSupabaseHistory, saveUserSchema, deleteSupabaseHistory, clearAllSupabaseHistory, saveUserNotes } from './lib/supabaseData';
import { NotesBox } from './components/NotesBox';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';


export function App() {
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState<string>("SELECT * FROM customers");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tables, setTables] = useState<TableSchema[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [notes, setNotes] = useState<string>("");


  useEffect(() => {
    const loadData = async () => {

      if (!user) {
        setTables(getSchema());
        setHistory([]);
        return;
      }

      const payload = await loadSupabaseData(user.id);

      if (payload) {
        setSchema(payload.tables);
        setTables(payload.tables);
        setHistory(payload.history);
        setChallenges(payload.challenges);
        setNotes(payload.notes);
      } else {
        setTables(getSchema());
      }
    };

    loadData();
  }, [user]);


  const handleRunQuery = async () => {
    const res = executeMockQuery(query);
    setResult(res);

    const updatedTables = getSchema();
    setTables(updatedTables);

    const newItem: HistoryItem = {
      query: query,
      timestamp: new Date(),
      status: res.error ? 'error' : 'success',
      result: res
    };

    setHistory(prev => [...prev, newItem]);

    // Async sync to Supabase
    if (user) {
      Promise.all([
        appendSupabaseHistory(newItem, user.id).then(savedItem => {
          if (savedItem && savedItem.id) {
            setHistory(prev =>
              prev.map(item =>
                item.query === newItem.query && item.timestamp === newItem.timestamp
                  ? { ...item, id: savedItem.id }
                  : item
              )
            );
          }
        }),
        saveUserSchema(updatedTables, user.id)
      ]);
    }
  };


  const handleClearHistory = async () => {
    setHistory([]);
    if (user) await clearAllSupabaseHistory(user.id);
  };

  const handleRemoveHistoryItem = async (id: number | string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (user) await deleteSupabaseHistory(id, user.id);
  };


  const handleSelectTable = (tableName: string) => {
    const newQuery = `SELECT * FROM ${tableName}`;
    setQuery(newQuery);
    setIsSidebarOpen(false); // Close sidebar on mobile when selection made
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setQuery(item.query);
    setResult(item.result || null);
    setIsSidebarOpen(false);
  };

  const handleSelectChallenge = (challenge: Challenge) => {
    setQuery(`-- Challenge: ${challenge.title}\n${challenge.sql}`);
    setResult(null);
    setIsSidebarOpen(false);
  };

  const handleOpenAuth = (view: 'signin' | 'signup') => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans overflow-hidden">
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authView}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Mobile Sidebar Overlay */}

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <Sidebar
        tables={tables}
        challenges={challenges}
        onSelectTable={handleSelectTable}
        history={history}
        onSelectHistory={handleSelectHistory}
        onSelectChallenge={handleSelectChallenge}
        onClearHistory={handleClearHistory}
        onRemoveHistoryItem={handleRemoveHistoryItem}
        className={cn(
          "shrink-0 transition-transform duration-200 ease-in-out md:translate-x-0 md:relative md:inset-auto md:h-full md:shadow-none",
          // Mobile styles
          "fixed inset-y-0 left-0 z-50 h-full w-64 shadow-xl transform",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 h-full relative">
        <header className="h-14 border-b border-slate-200 bg-white flex items-center px-4 md:px-6 justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1 -ml-1 text-slate-500 hover:bg-slate-100 rounded-md"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 rounded p-1">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h1 className="font-bold text-lg text-slate-800 tracking-tight hidden sm:block">SQL Playground</h1>
              <h1 className="font-bold text-lg text-slate-800 tracking-tight sm:hidden">SQL</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <InstallPrompt />
              <div className="h-4 w-px bg-slate-200 mx-1" />
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-1 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200"
                >
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-xs font-bold text-slate-900">{user.email?.split('@')[0]}</span>
                    <span className="text-[10px] text-slate-500">Free Account</span>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm uppercase shadow-sm">
                    {user.email?.[0]}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in duration-150 origin-top-right">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Free Plan</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsSettingsModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors text-left"
                        >
                          <UserIcon className="w-4 h-4" />
                          Account Settings
                        </button>
                      </div>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            signOut();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAuth('signin')}
                  className="text-sm font-bold text-slate-600 hover:text-indigo-600 px-3 py-1.5 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleOpenAuth('signup')}
                  className="text-sm font-bold bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </header>


        <div className="flex-1 p-2 md:p-4 flex flex-col gap-4 overflow-y-auto md:overflow-hidden">
          <div className="min-h-[250px] md:h-1/2 md:min-h-[200px] flex-shrink-0">
            <SQLEditor
              query={query}
              onChange={setQuery}
              onRun={handleRunQuery}
              className="h-full shadow-sm"
            />
          </div>

          <div className="flex-1 min-h-[300px] md:h-1/2 md:min-h-[200px] flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-500 uppercase tracking-wide shrink-0 font-mono text-center">
                Query Results
              </div>
              <div className="flex-1 overflow-hidden relative min-h-0">
                <ResultsTable result={result} />
              </div>
            </div>

            <NotesBox
              initialValue={notes}
              onSave={async (content) => {
                setNotes(content);
                if (user) await saveUserNotes(content, user.id);
              }}
              className="h-48 shrink-0"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
