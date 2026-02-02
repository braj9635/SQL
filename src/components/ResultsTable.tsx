import { Clock, AlertCircle } from 'lucide-react';
import { QueryResult } from '../lib/mockDb';
import { cn } from '../utils/cn';

interface ResultsTableProps {
  result: QueryResult | null;
  className?: string;
}

export function ResultsTable({ result, className }: ResultsTableProps) {
  if (!result) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full text-slate-400 bg-white", className)}>
        <p>Run a query to see results</p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className={cn("p-4 bg-red-50 text-red-800 border-l-4 border-red-500 rounded-r h-full", className)}>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-bold">Error executing query</h3>
        </div>
        <p className="font-mono text-sm">{result.error}</p>
      </div>
    );
  }

  if (result.message) {
     return (
      <div className={cn("p-4 bg-green-50 text-green-800 border-l-4 border-green-500 rounded-r h-full", className)}>
        <div className="flex items-center gap-2 mb-2">
           <h3 className="font-bold">Success</h3>
        </div>
        <p className="font-mono text-sm">{result.message}</p>
        {result.executionTime !== undefined && (
          <div className="mt-4 flex items-center gap-1 text-xs text-green-700 opacity-75">
            <Clock className="w-3 h-3" />
            <span>{result.executionTime.toFixed(2)}ms</span>
          </div>
        )}
      </div>
    );
  }

  if (result.rows.length === 0) {
    return (
      <div className={cn("flex flex-col h-full bg-white", className)}>
        <div className="p-2 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
           <span>0 rows returned</span>
           {result.executionTime !== undefined && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{result.executionTime.toFixed(2)}ms</span>
            </div>
           )}
        </div>
        <div className="flex items-center justify-center flex-1 text-slate-400">
          <p>No data returned</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-white overflow-hidden", className)}>
       <div className="p-2 border-b border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
           <span className="font-medium text-slate-700">{result.rows.length} rows returned</span>
           {result.executionTime !== undefined && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{result.executionTime.toFixed(2)}ms</span>
            </div>
           )}
        </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
            <tr>
              {result.columns.map((col, idx) => (
                <th key={idx} className="px-4 py-2 font-medium text-slate-600 border-b border-r border-slate-200 last:border-r-0 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {result.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50">
                {result.columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-2 text-slate-700 border-r border-slate-100 last:border-r-0 whitespace-nowrap font-mono text-xs">
                    {row[col] === null ? <span className="text-slate-400 italic">NULL</span> : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
