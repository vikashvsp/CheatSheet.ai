import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function cleanRuns() {
    if (!process.env.APIFY_TOKEN) {
        console.error('APIFY_TOKEN is missing');
        return;
    }

    const client = new ApifyClient({
        token: process.env.APIFY_TOKEN,
    });

    console.log("🔍 Checking recent Actors (last 10)...");
    const { items: runs } = await client.runs().list({ limit: 10, desc: true });

    console.log(`Found ${runs.length} running actors.`);

    for (const run of runs) {
        console.log(`- Run ${run.id}: ${run.actorId} (Memory: ${run.usage?.memoryMbytes || 'N/A'} MB)`);
        console.log(`  Attempting to abort...`);
        try {
            await client.run(run.id).abort();
            console.log(`  ✅ Aborted.`);
        } catch (e) {
            console.error(`  ❌ Failed to abort: ${e.message}`);
        }
    }
}

cleanRuns();
