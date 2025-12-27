
async function test() {
    console.log("🚀 Testing http://localhost:3000/api/generate...");
    try {
        const response = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            body: JSON.stringify({ message: 'Rust Ownership' }),
        });

        if (!response.ok) {
            console.error(`❌ API Error: ${response.status} ${response.statusText}`);
            console.error(await response.text());
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let text = '';
        console.log("📥 Receiving Stream:\n");

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunk = decoder.decode(value, { stream: true });
            text += chunk;
            process.stdout.write(chunk);
        }
        console.log(`\n\n✅ Stream Complete. Length: ${text.length} chars.`);
        if (text.includes("<!DOCTYPE html>")) console.log("✅ Valid HTML detected.");
    } catch (e) {
        console.error("❌ Request Failed:", e);
    }
}
test();
