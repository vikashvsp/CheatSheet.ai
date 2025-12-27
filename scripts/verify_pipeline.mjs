import { ApifyClient } from 'apify-client';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const message = "Python Dictionary Methods"; // Test Query

async function runTest() {
    console.log("🚀 Starting Pipeline Verification...");

    if (!process.env.APIFY_TOKEN) {
        throw new Error('APIFY_TOKEN is missing');
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.warn("GOOGLE_GENERATIVE_AI_API_KEY is missing, check .env.local");
    }

    const client = new ApifyClient({
        token: process.env.APIFY_TOKEN,
    });

    try {
        // 1. Search for documentation
        console.log(`\n🔍 1. Searching Apify for: "${message}"`);
        const searchRun = await client.actor('eager_cornet/deep-knowledge-mcp-server').start({
            mcp_server: false,
            action: 'search',
            query: message,
            max_results: 1
        }, { memory: 4096 });

        await client.run(searchRun.id).waitForFinish();

        const { items: searchResults } = await client.dataset(searchRun.defaultDatasetId).listItems();

        if (!searchResults || searchResults.length === 0) {
            throw new Error("No search results found");
        }

        const firstResultRaw = searchResults[0]?.result;
        console.log("✅ Search Raw Output (Snippet):", firstResultRaw.substring(0, 200) + "...");

        let firstResult;
        try {
            firstResult = JSON.parse(firstResultRaw)[0];
        } catch (e) {
            console.log("Raw result might not be a JSON array string, trying direct usage...");
            // If it's not a stringified JSON, maybe it's just the object? 
            // Based on route.ts logic: JSON.parse(resultString)[0]
        }

        if (!firstResult) {
            throw new Error("Could not parse search result");
        }

        const targetUrl = String(firstResult.url);
        console.log(`\n🔗 Found URL: ${targetUrl}`);

        // 2. Fetch content from URL
        console.log(`\n📥 2. Fetching content from URL (using apify/puppeteer-scraper)...`);
        const fetchRun = await client.actor('apify/puppeteer-scraper').start({
            startUrls: [{ url: targetUrl }],
            pageFunction: `async function pageFunction(context) {
                const { page, request } = context;
                const title = await page.title();
                const cleanText = await page.evaluate(() => document.body.innerText);
                return { url: request.url, title, content: cleanText };
            }`,
        }, { memory: 4096 });

        await client.run(fetchRun.id).waitForFinish();

        const { items: fetchResults } = await client.dataset(fetchRun.defaultDatasetId).listItems();
        console.log("🐛 Fetch Results:", JSON.stringify(fetchResults, null, 2));

        const content = fetchResults[0]?.content || "";

        if (!content) {
            throw new Error("Failed to fetch page content");
        }

        // Remove error checks as new crawler shouldn't return platform errors as content
        console.log(`✅ Content Fetched (${content.length} chars). Snippet:`);
        console.log(content.substring(0, 500) + "...\n");

        // 3. Generate Webpage
        console.log(`\n🤖 3. Generating Webpage with Gemini 2.5 Flash...`);
        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            system: `You are an expert web developer. Create a simple HTML page for the content. Return ONLY HTML.`,
            prompt: `Topic: ${message}\n\nDocumentation Content:\n${content.substring(0, 10000)}`,
        });

        console.log("\n✨ Generation Complete! Output Snippet:");
        console.log(text.substring(0, 500));

        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
            console.log("\n✅ SUCCESS: Valid HTML detected.");
        } else {
            console.error("\n❌ WARNING: Output does not look like HTML.");
        }

    } catch (error) {
        console.error("\n❌ Pipeline Failed:", error);
    }
}

runTest();
