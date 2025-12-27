import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';
import { ApifyClient } from 'apify-client';

// Define the schema for the Cheat Sheet
export const cheatSheetSchema = z.object({
    title: z.string().describe('The title of the cheat sheet, e.g., "Python Regex"'),
    description: z.string().describe('A brief description of the topic'),
    sections: z.array(z.object({
        title: z.string().describe('Section title, e.g., "Basic Syntax"'),
        items: z.array(z.object({
            label: z.string().describe('The command or key concept, e.g., "re.search()"'),
            value: z.string().describe('The code snippet or explanation'),
            description: z.string().optional().describe('Short context if needed')
        }))
    }))
});

export const maxDuration = 60;

export async function POST(req: Request) {
    const { message } = await req.json();

    if (!process.env.APIFY_TOKEN) {
        throw new Error('APIFY_TOKEN is missing');
    }

    const client = new ApifyClient({
        token: process.env.APIFY_TOKEN,
    });

    // 1. Search for documentation
    console.log(`Searching for: ${message}`);
    // Using the Actor we just deployed. 
    // IMPORTANT: Ensure "deep-knowledge-mcp-server-v2" is the correct name in your Apify Console.
    const searchRun = await client.actor('vikashvsp/deep-knowledge-mcp-server-v2').call({
        action: 'search',
        query: message,
        max_results: 1
    });

    const { items: searchResults } = await client.dataset(searchRun.defaultDatasetId).listItems();

    // @ts-ignore
    const firstResult = searchResults[0]?.result ? JSON.parse(searchResults[0].result)[0] : null;

    if (!firstResult) {
        return new Response('No documentation found', { status: 404 });
    }

    const targetUrl = firstResult.url;
    console.log(`Found URL: ${targetUrl}. Fetching content...`);

    // 2. Fetch content
    const fetchRun = await client.actor('vikashvsp/deep-knowledge-mcp-server-v2').call({
        action: 'fetch',
        url: targetUrl
    });

    const { items: fetchResults } = await client.dataset(fetchRun.defaultDatasetId).listItems();
    const content = (fetchResults[0] as any)?.result || "";

    // 3. Generate Cheat Sheet using LLM
    console.log('Generating cheat sheet...');

    const result = await streamObject({
        model: google('gemini-1.5-pro-latest'),
        schema: cheatSheetSchema,
        system: `You are an expert technical writer. You will be given documentation content. 
    Your task is to extract the MOST IMPORTANT commands, syntax, and concepts into a concise "Cheat Sheet".
    Ignore marketing fluff. Focus on code patterns, CLI commands, and key API methods.
    Limit to 6-8 sections max.`,
        prompt: `Topic: ${message}\n\nDocumentation Content:\n${content.substring(0, 30000)}`, // Gemini has larger context window
    });

    return result.toTextStreamResponse();
}
