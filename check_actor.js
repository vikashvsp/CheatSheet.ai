require('dotenv').config({ path: '.env.local' });
const { ApifyClient } = require('apify-client');

async function main() {
    const client = new ApifyClient({
        token: process.env.APIFY_TOKEN,
    });

    try {
        const { items } = await client.actors().list();
        console.log('Available Actors:');
        items.forEach(actor => {
            console.log(`- ${actor.username}/${actor.name} (ID: ${actor.id})`);
        });

        const me = await client.user().get();
        console.log(`\nCurrent User: ${me.username} (${me.id})`);

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
