import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { z } from 'zod';
import { ApifyClient } from 'apify-client';

// Define the schema for the Cheat Sheet
import { cheatSheetSchema } from '@/lib/schemas';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { message, prompt } = await req.json();
        const query = message || prompt;

        if (!query) {
            throw new Error("No query provided");
        }

        if (!process.env.APIFY_TOKEN) {
            throw new Error('APIFY_TOKEN is missing');
        }

        const client = new ApifyClient({
            token: process.env.APIFY_TOKEN,
        });

        // 1. Search for documentation
        console.log(`Searching for: ${query}`);
        const searchRun = await client.actor('eager_cornet/deep-knowledge-mcp-server').start({
            mcp_server: false,
            action: 'search',
            query: query,
            max_results: 1
        }, { memory: 4096 });

        await client.run(searchRun.id).waitForFinish();

        const { items: searchResults } = await client.dataset(searchRun.defaultDatasetId).listItems();
        console.log('Search Results:', JSON.stringify(searchResults, null, 2));

        if (!searchResults || searchResults.length === 0) {
            throw new Error("No search results found");
        }

        // @ts-ignore
        const resultString = searchResults[0]?.result;
        if (!resultString) {
            throw new Error("Empty result string from actor");
        }

        let firstResult;
        try {
            firstResult = JSON.parse(resultString)[0];
        } catch (e) {
            throw new Error(`Failed to parse actor result: ${resultString}`);
        }

        if (!firstResult) {
            return new Response(JSON.stringify({ error: 'No documentation found' }), { status: 404 });
        }

        const targetUrl = String(firstResult.url);
        console.log(`Found URL: ${targetUrl}. Fetching content...`);

        // 2. Fetch content using Puppeteer Scraper
        const fetchRun = await client.actor('apify/puppeteer-scraper').start({
            startUrls: [{ url: targetUrl }],
            pageFunction: `async function pageFunction(context) {
                const { page, request } = context;
                const title = await page.title();
                const content = await page.content();
                const cleanText = await page.evaluate(() => document.body.innerText);
                return { url: request.url, title, content: cleanText };
            }`,
        }, { memory: 4096 });

        await client.run(fetchRun.id).waitForFinish();

        const { items: fetchResults } = await client.dataset(fetchRun.defaultDatasetId).listItems();

        // Puppeteer Scraper return structure
        const content = (fetchResults[0]?.content as string) || "";

        if (!content) {
            throw new Error("Failed to fetch page content");
        }

        if (content.includes("Access Denied") || content.includes("403 Forbidden")) {
            throw new Error("Failed to access page (403 Forbidden). Try a different topic.");
        }

        // 3. Generate Webpage using LLM
        console.log('Generating webpage...');

        const result = await streamText({
            model: google('gemini-2.5-flash'),
            system: `You are an expert web developer and designer. 
            Your task is to create a SINGLE-FILE, self-contained HTML webpage based on the provided documentation.
            
            Requirements:
            1.  **Design**: Use Tailwind CSS (via CDN) for modern, clean, and "premium" styling.
            2.  **Structure**: Include a proper header, main content area, and clear sections.
            3.  **Content**: summarizing the key concepts, commands, and usage from the documentation.
            4.  **Format**: Return ONLY the raw HTML code. Do not include markdown code blocks (\`\`\`html).
            5.  **Interactive**: Add hover effects and smooth transitions using standard CSS/Tailwind.
            6.  **Clean UI**: Do NOT include a top navigation bar, header menu, sidebar, or Table of Contents.
            7.  **No Internal Links**: Do NOT generate any internal anchor links (href="#section"). The content should be a simple, continuous scrollable page.
            8.  **External Links**: ALL external links (http/https) MUST have target="_blank" rel="noopener noreferrer".
            
            The output must be a valid, renderable HTML file.`,
            prompt: `Topic: ${query}\n\nDocumentation Content:\n${content.substring(0, 30000)}`,
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
