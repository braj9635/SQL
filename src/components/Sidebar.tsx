import { useState } from 'react';
import { Database, Table, Columns, ChevronRight, ChevronDown } from 'lucide-react';
import { SCHEMA } from '../lib/mockDb';
import { cn } from '../utils/cn';

interface SidebarProps {
  onSelectTable: (tableName: string) => void;
  className?: string;
}

export function Sidebar({ onSelectTable, className }: SidebarProps) {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    users: true,
    products: false,
    orders: false
  });

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  return (
    <div className={cn("flex flex-col h-full bg-slate-50 border-r border-slate-200 w-64", className)}>
      <div className="p-4 border-b border-slate-200 flex items-center gap-2">
        <Database className="w-5 h-5 text-indigo-600" />
        <h2 className="font-semibold text-slate-800">Explorer</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-2">
          Tables
        </div>
        
        <div className="space-y-1">
          {SCHEMA.map(table => (
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
        </div>
      </div>
    </div>
  );
}
