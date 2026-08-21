import { SupabaseSecretManager } from "./server/services/SupabaseSecretManager.js";
import { fetchEnvSecrets } from "./server/supabaseAdmin.js";

async function main() {
  const newKey = "";
  
  await SupabaseSecretManager.rotatePlatformKey("aiwibcrafter", "GEMINI_API_KEY", newKey, "AIWebCraft Agent");
  await SupabaseSecretManager.rotatePlatformKey("command_center", "GEMINI_API_KEY", newKey, "AIWebCraft Agent");
  
  console.log("Keys rotated successfully.");
}
main();
