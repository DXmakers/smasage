import readline from "readline";

const SYSTEM_PROMPT = `You are Smasage, an intelligent financial assistant.
You help users read balances and project financial goals on the Stellar network.`;

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set in your .env file.");
  process.exit(1);
}

async function chat(userMessage, history = []) {
  const contents = history.map(h => ({
    role: h.role === "assistant" ? "model" : "user",
    parts: [{ text: h.content }]
  }));
  contents.push({ role: "user", parts: [{ text: userMessage }] });

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents,
      generationConfig: {
        maxOutputTokens: 1024
      }
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function main() {
  console.log("Smasage agent started. Type your message or 'exit' to quit.\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const history = [];

  const ask = () => {
    rl.question("You: ", async (input) => {
      const trimmed = input.trim();
      if (!trimmed || trimmed.toLowerCase() === "exit") {
        console.log("Goodbye!");
        rl.close();
        return;
      }

      try {
        const reply = await chat(trimmed, history);
        history.push({ role: "user", content: trimmed });
        history.push({ role: "assistant", content: reply });
        console.log(`\nSmasage: ${reply}\n`);
      } catch (err) {
        console.error("Error:", err.message);
      }

      ask();
    });
  };

  ask();
}

main();
