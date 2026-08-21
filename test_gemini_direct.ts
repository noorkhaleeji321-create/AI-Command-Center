import { getGeminiClient } from "./server/gemini.js";

async function main() {
  try {
    const client = await getGeminiClient();
    const chat = client.chats.create({ model: "gemini-3.6-flash" });
    const response = await chat.sendMessage({ message: "hello" });
    console.log("Response:", response.text);
  } catch (err: any) {
    console.error("Fatal direct error:");
    console.error("Message:", err.message);
    console.error("Status:", err.status);
    console.error("Full error:", err);
  }
}
main();
