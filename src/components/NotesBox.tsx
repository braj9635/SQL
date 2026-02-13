import React, { useState, useEffect, useRef } from 'react';
import { StickyNote, Save, Check, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface NotesBoxProps {
    initialValue: string;
    onSave: (content: string) => Promise<void>;
    className?: string;
}

export function NotesBox({ initialValue, onSave, className }: NotesBoxProps) {
    const [notes, setNotes] = useState(initialValue);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setNotes(initialValue);
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setNotes(newValue);

        // Debounced autosave
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(async () => {
            setIsSaving(true);
            await onSave(newValue);
            setIsSaving(false);
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2000);
        }, 1000);
    };

    return (
        <div className={cn("flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden", className)}>
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <StickyNote className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-bold text-xs text-slate-500 uppercase tracking-wide">Rough Notes</span>
                </div>

                <div className="flex items-center gap-2">
                    {isSaving ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 animate-pulse font-medium">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving...
                        </div>
                    ) : showSaved ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium animate-in fade-in slide-in-from-right-2 duration-300">
                            <Check className="w-3 h-3" />
                            Saved
                        </div>
                    ) : (
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                            <Save className="w-3 h-3" />
                            Auto-saving
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <textarea
                    value={notes}
                    onChange={handleChange}
                    placeholder="Write your rough notes, TODOs, or scratchpad SQL here..."
                    className="w-full h-full p-4 text-sm text-slate-700 bg-transparent resize-none focus:outline-none placeholder:text-slate-300 placeholder:italic leading-relaxed"
                    spellCheck={false}
                />
            </div>
        </div>
    );
}
