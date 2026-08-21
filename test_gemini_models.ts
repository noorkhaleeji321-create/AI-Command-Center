import { getGeminiClient } from "./server/gemini.js";

async function main() {
  const client = await getGeminiClient();
  const models = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash-lite'];
  
  for (const m of models) {
    console.log(`Testing ${m}...`);
    try {
      const chat = client.chats.create({ model: m });
      const response = await chat.sendMessage({ message: "hello" });
      console.log(`SUCCESS: ${m} -> ${response.text?.slice(0, 30)}`);
    } catch (err: any) {
      console.log(`ERROR: ${m} -> ${err.message?.split('\n')[0]}`);
    }
  }
}
main();
