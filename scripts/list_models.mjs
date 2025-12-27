
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("Error: GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_API_KEY not found in environment.");
    process.exit(1);
}

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
        }
        const data = await response.json();
        const models = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => ({
                name: m.name,
                displayName: m.displayName,
                version: m.version
            }));

        console.log("Available Models:");
        models.forEach(m => console.log(m.name.replace('models/', '')));

    } catch (error) {
        console.error("Error fetching models:", error.message);
    }
}

listModels();
