import { useState } from 'react';
import { Database, Table, Columns, ChevronRight, ChevronDown, History, CheckCircle, AlertCircle, Lightbulb, ArrowRight, Trash2 } from 'lucide-react';
import { TableSchema, QueryResult } from '../lib/mockDb';
import { Challenge, Difficulty } from '../lib/challenges';
import { cn } from '../utils/cn';

export interface HistoryItem {
  id?: number | string;
  query: string;
  timestamp: Date;
  status: 'success' | 'error';
  result?: QueryResult;
}

interface SidebarProps {
  onSelectTable: (tableName: string) => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onSelectChallenge: (challenge: Challenge) => void;
  onClearHistory: () => void;
  onRemoveHistoryItem: (id: number | string) => void;
  className?: string;
  tables: TableSchema[];
  challenges: Challenge[];
}

type Tab = 'tables' | 'history' | 'challenges';

export function Sidebar({
  onSelectTable,
  history,
  onSelectHistory,
  onSelectChallenge,
  onClearHistory,
  onRemoveHistoryItem,
  className,
  tables,
  challenges
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('tables');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    customers: true,
    departments: false,
    products: false,
    orders: false
  });

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Hard': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-slate-50 border-r border-slate-200 w-64", className)}>
      <div className="flex border-b border-slate-200">
        <button
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative",
            activeTab === 'tables' ? "text-indigo-600 bg-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          )}
          onClick={() => setActiveTab('tables')}
        >
          <Database className="w-4 h-4" />
          <span className="hidden sm:inline">Explorer</span>
          <span className="sm:hidden">Exp</span>
          {activeTab === 'tables' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative",
            activeTab === 'history' ? "text-indigo-600 bg-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          )}
          onClick={() => setActiveTab('history')}
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
          <span className="sm:hidden">His</span>
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative",
            activeTab === 'challenges' ? "text-indigo-600 bg-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          )}
          onClick={() => setActiveTab('challenges')}
        >
          <Lightbulb className="w-4 h-4" />
          <span className="hidden sm:inline">Learn</span>
          <span className="sm:hidden">Edu</span>
          {activeTab === 'challenges' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {activeTab === 'tables' && (
          <>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-2">
              Tables
            </div>

            <div className="space-y-1">
              {tables.map(table => (
                <div key={table.name} className="select-none">
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-200 rounded-md cursor-pointer group"
                    onClick={() => toggleTable(table.name)}
                  >
                    {expandedTables[table.name] ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    )}
                    <Table className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">{table.name}</span>

                    <button
                      className="ml-auto text-xs text-indigo-600 opacity-0 group-hover:opacity-100 hover:underline px-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTable(table.name);
                      }}
                    >
                      Select
                    </button>
                  </div>

                  {expandedTables[table.name] && (
                    <div className="ml-8 mt-1 space-y-0.5 border-l border-slate-300 pl-2">
                      {table.columns.map(col => (
                        <div key={col.name} className="flex items-center gap-2 py-1 text-slate-600 text-xs">
                          <Columns className="w-3 h-3 text-slate-400" />
                          <span className="font-medium">{col.name}</span>
                          <span className="text-slate-400 ml-auto mr-2 text-[10px]">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {tables.length === 0 && (
                <div className="text-xs text-slate-400 italic px-4 py-2">No tables found. Create one!</div>
              )}
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <>
            <div className="flex items-center justify-between mb-2 mt-2 px-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Query History
              </div>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[10px] text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="text-center p-4 text-slate-400 text-sm italic mt-4">
                No queries executed yet.
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {history.slice().reverse().map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex flex-col gap-1 p-2 rounded-md hover:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                    onClick={() => onSelectHistory(item)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {item.status === 'success' ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.timestamp.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.id) onRemoveHistoryItem(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-xs font-mono text-slate-700 truncate font-medium pl-5" title={item.query}>
                      {item.query}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'challenges' && (
          <>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-2">
              Practice Challenges
            </div>
            <div className="space-y-3 mt-2 px-1">
              {challenges.map((challenge: Challenge) => (
                <div
                  key={challenge.id}
                  className="group relative bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer"
                  onClick={() => onSelectChallenge(challenge)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-wide",
                      getDifficultyColor(challenge.difficulty)
                    )}>
                      {challenge.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-400">#{challenge.id}</span>
                  </div>
                  <h4 className="text-sm font-medium text-slate-800 leading-snug pr-4">
                    {challenge.title}
                  </h4>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-indigo-500" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
