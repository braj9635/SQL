import { Clock, AlertCircle, Copy, Download, FileSpreadsheet, Check } from 'lucide-react';
import { QueryResult } from '../lib/mockDb';
import { cn } from '../utils/cn';
import { useState } from 'react';

interface ResultsTableProps {
  result: QueryResult | null;
  className?: string;
}

export function ResultsTable({ result, className }: ResultsTableProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result || result.rows.length === 0) return;

    const headers = result.columns.join('\t');
    const rows = result.rows.map(row =>
      result.columns.map(col => row[col] === null ? 'NULL' : String(row[col])).join('\t')
    ).join('\n');

    const content = `${headers}\n${rows}`;
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadCSV = () => {
    if (!result || result.rows.length === 0) return;

    const headers = result.columns.map(col => `"${col.replace(/"/g, '""')}"`).join(',');
    const rows = result.rows.map(row =>
      result.columns.map(col => {
        const val = row[col] === null ? '' : String(row[col]);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `query_results_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
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
      <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex justify-between items-center min-h-[40px]">
        <div className="flex items-center gap-4 text-xs">
          <span className="font-semibold text-slate-700">{result.rows.length} rows returned</span>
          {result.executionTime !== undefined && (
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{result.executionTime.toFixed(2)}ms</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Copy to clipboard (TSV)"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy All'}
          </button>
          <div className="w-px h-3 bg-slate-300 mx-1" />
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Download as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Download results"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
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
                    {row[col] === null || row[col] === undefined ? <span className="text-slate-400 italic">NULL</span> : String(row[col])}
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
