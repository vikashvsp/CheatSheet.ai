'use client';

import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { cheatSheetSchema } from '@/app/api/generate/route';
import { z } from 'zod';

type CheatSheetData = z.infer<typeof cheatSheetSchema>;

interface Props {
    data?: DeepPartial<CheatSheetData>;
}

// DeepPartial utility for streaming data (which might be incomplete)
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

export function CheatSheetGrid({ data }: Props) {
    if (!data || !data.sections) return null;

    return (
        <div className="space-y-12">
            {/* Header */}
            {data.title && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-2 mb-12"
                >
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        {data.title}
                    </h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">{data.description}</p>
                </motion.div>
            )}

            {/* Masonry-like Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.sections.map((section, idx) => (
                    <SectionCard key={idx} section={section} index={idx} />
                ))}
            </div>
        </div>
    );
}

function SectionCard({ section, index }: { section: any, index: number }) {
    if (!section) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
        >
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
                    {section.title}
                </h3>
            </div>
            <div className="p-4 space-y-3">
                {section.items?.map((item: any, i: number) => (
                    <div key={i} className="group relative bg-slate-50 dark:bg-slate-900 rounded-lg p-3 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <code className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                                {item.label}
                            </code>
                            <CopyButton text={item.value} />
                        </div>
                        <div className="text-xs text-slate-500 mb-2">{item.description}</div>
                        <pre className="text-xs bg-slate-200 dark:bg-slate-950 p-2 rounded overflow-x-auto text-slate-700 dark:text-slate-300">
                            {item.value}
                        </pre>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all"
            title="Copy snippet"
        >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
        </button>
    )
}
