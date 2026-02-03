import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar, HistoryItem } from './components/Sidebar';
import { SQLEditor } from './components/SQLEditor';
import { ResultsTable } from './components/ResultsTable';
import { executeMockQuery, QueryResult } from './lib/mockDb';
import { Challenge } from './lib/challenges';
import { cn } from './utils/cn';
import { InstallPrompt } from './components/InstallPrompt';

export function App() {
  const [query, setQuery] = useState<string>("SELECT * FROM customers");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleRunQuery = () => {
    const res = executeMockQuery(query);
    setResult(res);
    
    // Add to history
    const newItem: HistoryItem = {
      query: query,
      timestamp: new Date(),
      status: res.error ? 'error' : 'success',
      result: res
    };
    
    setHistory(prev => [...prev, newItem]);
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

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <Sidebar 
        onSelectTable={handleSelectTable} 
        history={history}
        onSelectHistory={handleSelectHistory}
        onSelectChallenge={handleSelectChallenge}
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
          <div className="flex items-center gap-2">
             <InstallPrompt />
             <div className="text-xs text-slate-500 hidden sm:block">
                Mock In-Memory Database
             </div>
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
          
          <div className="flex-1 min-h-[300px] md:h-1/2 md:min-h-[200px] flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
             <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-500 uppercase tracking-wide shrink-0">
               Query Results
             </div>
             <div className="flex-1 overflow-hidden relative min-h-0">
               <ResultsTable result={result} />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
