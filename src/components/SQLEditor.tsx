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
      
      <div className="flex-1 overflow-auto relative font-mono text-sm bg-white cursor-text" onClick={() => {
          // Focus hack if needed, but the editor usually handles it
      }}>
        <Editor
          value={query}
          onValueChange={onChange}
          highlight={(code) => highlight(code, languages.sql, 'sql')}
          padding={16}
          className="font-mono min-h-full"
          style={{
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: 14,
            minHeight: '100%',
          }}
          textareaClassName="focus:outline-none"
        />
      </div>
    </div>
  );
}
