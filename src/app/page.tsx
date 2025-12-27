'use client';

import { useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';
// import { useCompletion } from '@ai-sdk/react';
// import { cheatSheetSchema } from '@/lib/schemas';
// import { CheatSheetGrid } from '@/components/CheatSheetGrid';

export default function Home() {
    const [query, setQuery] = useState('');
    const [hasStarted, setHasStarted] = useState(false);
    const [completion, setCompletion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // const { completion, complete, isLoading, error } = useCompletion({
    //     api: '/api/generate',
    // });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setHasStarted(true);
        setIsLoading(true);
        setCompletion('');
        setError(null);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: query }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });
                setCompletion((prev) => prev + chunkValue);
            }
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 flex flex-col">

            {/* Header / Search Section */}
            <div className={`transition-all duration-700 ease-in-out ${hasStarted ? 'py-4 border-b border-slate-200 dark:border-slate-800' : 'py-32'} px-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10 sticky top-0`}>
                <div className="max-w-4xl mx-auto text-center space-y-6">

                    {!hasStarted && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 inline-block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                CheatSheet.ai
                            </h1>
                            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                Turn any technical documentation into a beautiful, visual cheat sheet in seconds.
                            </p>
                        </motion.div>
                    )}

                    {/* Search Bar */}
                    <div className="flex items-center justify-center gap-4">
                        {hasStarted && (
                            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent hidden md:block">
                                CheatSheet.ai
                            </h1>
                        )}
                        <motion.form
                            onSubmit={handleSubmit}
                            className={`relative w-full group ${hasStarted ? 'max-w-2xl' : 'max-w-xl mx-auto'}`}
                            initial={false}
                            animate={{ scale: hasStarted ? 1 : 1 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g. 'Python Regex' or 'Next.js Routing'"
                                className="relative w-full px-6 py-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-lg placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="absolute right-3 top-3 p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            </button>
                        </motion.form>
                    </div>

                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 w-full bg-transparent relative">

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className="max-w-md mx-auto p-4 bg-red-50 dark:bg-red-900/90 backdrop-blur text-red-600 dark:text-red-200 rounded-xl flex items-center gap-3 shadow-2xl pointer-events-auto">
                            <AlertCircle className="w-5 h-5" />
                            <p>Something went wrong: {error.message}. Try again.</p>
                        </div>
                    </div>
                )}

                {/* Loading State Overlay */}
                {isLoading && !completion && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                        <div className="flex justify-center gap-2 mb-4">
                            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">Generating your custom webpage...</p>
                    </div>
                )}

                {/* Iframe Preview */}
                {hasStarted && (
                    <div className="w-full h-full">
                        <iframe
                            srcDoc={completion}
                            className="w-full h-full border-0"
                            title="Generated Cheat Sheet"
                            sandbox="allow-scripts allow-same-origin"
                        />
                    </div>
                )}
            </div>

        </main>
    );
}
