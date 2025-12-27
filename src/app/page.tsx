'use client';

import { useState, useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Search, Loader2, Sparkles, AlertCircle, Download } from 'lucide-react';
// import { useCompletion } from '@ai-sdk/react';
// import { cheatSheetSchema } from '@/lib/schemas';
// import { CheatSheetGrid } from '@/components/CheatSheetGrid';

export default function Home() {
    const [query, setQuery] = useState('');
    const [hasStarted, setHasStarted] = useState(false);
    const [completion, setCompletion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // const { completion, complete, isLoading, error } = useCompletion({
    //     api: '/api/generate',
    // });

    const handleDownload = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.focus();
            iframeRef.current.contentWindow.print();
        }
    };

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
            <div className={`transition-all duration-700 ease-in-out ${hasStarted ? 'py-4 border-b border-slate-200 dark:border-slate-800' : 'py-32'} px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10 sticky top-0`}>
                <div className={`mx-auto w-full relative ${hasStarted ? 'max-w-7xl' : 'max-w-4xl'}`}>

                    <div className={`flex items-center ${hasStarted ? 'justify-center gap-8' : 'flex-col text-center gap-10 mb-8'}`}>
                        {(!hasStarted || hasStarted) && (
                            <motion.div
                                initial={hasStarted ? { opacity: 0 } : { opacity: 1 }}
                                animate={{ opacity: 1 }}
                                className={hasStarted ? "shrink-0" : ""}
                            >
                                <h1 className={`font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 ${hasStarted ? 'text-2xl' : 'text-5xl mb-4'}`}>
                                    CheatSheet.ai
                                </h1>
                                {!hasStarted && (
                                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                                        Turn any technical documentation into a beautiful, visual cheat sheet in seconds.
                                    </p>
                                )}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className={`relative group ${hasStarted ? 'flex-1 max-w-xl' : 'w-full max-w-xl'}`}>
                            <div className=" absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center p-2">
                                <Search className="ml-3 text-slate-400 w-5 h-5 " />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="e.g. 'Python Regex' or 'Next.js Routing'"
                                    className="flex-1 bg-transparent border-none 
             focus:outline-none focus:ring-0 
             text-slate-900 dark:text-white 
             placeholder-slate-400 px-4 py-2"
                                    disabled={isLoading}
                                />

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                </button>
                            </div>
                        </form>

                        {/* Download Button (Only visible when hasStarted) */}
                        {hasStarted && !isLoading && completion.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleDownload}
                                className="ml-4 flex items-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-3 rounded-xl font-medium transition-colors"
                                title="Download as PDF"
                            >
                                <Download className="w-5 h-5" />
                                <span className="hidden sm:inline">PDF</span>
                            </motion.button>
                        )}
                    </div>

                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 w-full bg-transparent relative">

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 pointer-events-auto mx-4">
                            <AlertCircle className="w-6 h-6" />
                            <div>
                                <p className="font-semibold">Generation Failed</p>
                                <p className="text-sm opacity-90">{error.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Initial State Placeholder */}
                {!hasStarted && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <Sparkles className="w-96 h-96" />
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
                            ref={iframeRef}
                            srcDoc={completion}
                            className="w-full h-full border-0"
                            title="Generated Cheat Sheet"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-modals allow-popups-to-escape-sandbox"
                        />
                    </div>
                )}
            </div>

        </main>
    );
}
