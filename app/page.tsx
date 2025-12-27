'use client';

import { useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { experimental_useObject as useObject } from 'ai/react';
import { cheatSheetSchema } from './api/generate/route';
import { CheatSheetGrid } from '@/components/CheatSheetGrid';

export default function Home() {
    const [query, setQuery] = useState('');
    const [hasStarted, setHasStarted] = useState(false);

    const { object, submit, isLoading, error } = useObject({
        api: '/api/generate',
        schema: cheatSheetSchema,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setHasStarted(true);
        submit({ message: query });
    };

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900">

            {/* Hero Section */}
            <div className={`transition-all duration-700 ease-in-out ${hasStarted ? 'py-8' : 'py-32'} px-4`}>
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
                    <motion.form
                        onSubmit={handleSubmit}
                        className="relative max-w-xl mx-auto w-full group"
                        initial={false}
                        animate={{ scale: hasStarted ? 0.9 : 1 }}
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

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 pb-20">

                {error && (
                    <div className="max-w-2xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <p>Something went wrong: {error.message}. Try again.</p>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && !object && (
                    <div className="text-center py-20 space-y-4">
                        <div className="flex justify-center gap-2">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <p className="text-slate-500 animate-pulse">Reading documentation...</p>
                    </div>
                )}

                {/* Results Grid */}
                <CheatSheetGrid data={object} />
            </div>

        </main>
    );
}
