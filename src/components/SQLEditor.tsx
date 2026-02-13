import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-sql';
import { Play, Eraser } from 'lucide-react';
import { cn } from '../utils/cn';

// Basic light theme for prism
import 'prismjs/themes/prism.css';

interface SQLEditorProps {
  query: string;
  onChange: (query: string) => void;
  onRun: () => void;
  className?: string;
}

export function SQLEditor({ query, onChange, onRun, className }: SQLEditorProps) {
  return (
    <div className={cn("flex flex-col h-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">SQL Query</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange('')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
            title="Clear"
          >
            <Eraser className="w-3.5 h-3.5" />
            Clear
          </button>
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors active:translate-y-px"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative font-mono text-sm bg-white cursor-text flex">
        {/* Line Numbers Column */}
        <div
          className="bg-slate-50 border-r border-slate-200 text-slate-400 text-right select-none min-w-[3rem] py-4 pr-3 tabular-nums"
          aria-hidden="true"
          style={{
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: 14,
            lineHeight: '1.5',
          }}
        >
          {query.split('\n').map((_, i) => (
            <div key={i} className="h-[21px] whitespace-pre">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-w-0">
          <Editor
            value={query}
            onValueChange={onChange}
            highlight={(code) => highlight(code, languages.sql, 'sql')}
            padding={16}
            textareaId="sql-editor-textarea"
            className="font-mono min-h-full"
            textareaClassName="focus:outline-none"
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: 14,
              minHeight: '100%',
              lineHeight: '1.5',
            }}
          />
        </div>
      </div>

      {/* Mobile-friendly Symbol Toolbar */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 px-4 bg-slate-50 border-t border-slate-200 no-scrollbar">
        {['*', '=', '!=', '(', ')', ',', ';', "'", 'AND', 'OR', 'SELECT', 'FROM', 'WHERE', 'ORDER BY'].map((symbol) => (
          <button
            key={symbol}
            onClick={() => {
              const textarea = document.getElementById('sql-editor-textarea') as HTMLTextAreaElement;
              if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newQuery = query.substring(0, start) + symbol + query.substring(end);
                onChange(newQuery);
                setTimeout(() => {
                  textarea.focus();
                  textarea.setSelectionRange(start + symbol.length, start + symbol.length);
                }, 0);
              } else {
                onChange(query + symbol);
              }
            }}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded shadow-sm active:bg-slate-100 active:scale-95 transition-all whitespace-nowrap"
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
