import { fetchEnvSecrets, upsertEnvSecret, recordAIAction } from "../supabaseAdmin.js";
import { EnvVariable, EnvPlatform, PlatformName } from "../../src/types.js";

/**
 * Platform Name Normalizer
 * Unifies naming variations across the ecosystem:
 * - "aiwebcraft" | "aiwibcrafter" -> "aiwibcrafter"
 * - "AutoBot WA" | "aiegent" | "whatsapp" -> "AutoBot WA"
 * - "command_center" | "command-center" | "shared" -> "command_center"
 */
export function normalizePlatformName(platform: string): EnvPlatform {
  const p = (platform || "").toLowerCase().trim();
  if (p === "aiwebcraft" || p === "aiwibcrafter" || p === "aiwebcraft6@gmail.com") {
    return "aiwibcrafter";
  }
  if (p === "autobot wa" || p === "autobot_wa" || p === "aiegent" || p === "whatsapp") {
    return "AutoBot WA";
  }
  return "command_center";
}

export interface KeyValidationResult {
  valid: boolean;
  keyName: string;
  platform: EnvPlatform;
  status: "valid" | "expired" | "missing" | "invalid_format";
  message: string;
  checkedAt: string;
}

export interface RotationResult {
  success: boolean;
  secret?: EnvVariable;
  validation: KeyValidationResult;
  message: string;
}

export class SupabaseSecretManagerService {
  private static instance: SupabaseSecretManagerService;

  private constructor() {
    console.log("[SupabaseSecretManager] Service initialized as centralized source of truth for platform keys.");
  }

  public static getInstance(): SupabaseSecretManagerService {
    if (!SupabaseSecretManagerService.instance) {
      SupabaseSecretManagerService.instance = new SupabaseSecretManagerService();
    }
    return SupabaseSecretManagerService.instance;
  }

  /**
   * Centralized helper to get key for any platform.
   * Checks Supabase `app_secrets` table first, then falls back to `command_center` secrets, then `process.env`.
   */
  public async getPlatformKey(platformName: string, keyName?: string): Promise<string | null> {
    const platform = normalizePlatformName(platformName);
    const secrets = await fetchEnvSecrets();

    // Determine target key name if not specified
    let targetKeyName = keyName;
    if (!targetKeyName) {
      if (platform === "aiwibcrafter") targetKeyName = "GEMINI_API_KEY";
      else if (platform === "AutoBot WA") targetKeyName = "AUTOBOT_WA_API_TOKEN";
      else targetKeyName = "SUPABASE_SERVICE_ROLE_KEY";
    }

    const searchKey = targetKeyName.toUpperCase().trim();

    // 1. Direct match for platform
    const platformSecret = secrets.find(
      (s) => normalizePlatformName(s.platform) === platform && s.key_name.toUpperCase().trim() === searchKey
    );
    if (platformSecret && platformSecret.key_value.trim()) {
      return platformSecret.key_value.trim();
    }

    // 2. Fallback to command_center (shared)
    const sharedSecret = secrets.find(
      (s) => normalizePlatformName(s.platform) === "command_center" && s.key_name.toUpperCase().trim() === searchKey
    );
    if (sharedSecret && sharedSecret.key_value.trim()) {
      return sharedSecret.key_value.trim();
    }

    // 3. Fallback to process.env
    const envVal = process.env[searchKey] || process.env[targetKeyName];
    if (envVal && envVal.trim()) {
      return envVal.trim();
    }

    return null;
  }

  /**
   * Retrieves ordered pool of Gemini API keys configured for the platform.
   * Checks keys GEMINI_API_KEY_1 through GEMINI_API_KEY_5, GEMINI_API_KEY, GEMINI_PRO_KEY, GEMINI_KEY, and process.env.
   */
  public async getGeminiKeysPool(): Promise<string[]> {
    const secrets = await fetchEnvSecrets().catch(() => []);
    const keys: string[] = [];

    const addKey = (val: string | undefined | null) => {
      if (val && typeof val === "string") {
        const cleaned = val.trim().replace(/^["']|["']$/g, "").trim();
        if (
          cleaned.length >= 10 &&
          !cleaned.includes("YOUR_") &&
          !cleaned.includes("PLACEHOLDER") &&
          !cleaned.includes(" ") &&
          !keys.includes(cleaned)
        ) {
          keys.push(cleaned);
        }
      }
    };

    // 1. Check GEMINI_API_KEY_1 through GEMINI_API_KEY_5
    for (let i = 1; i <= 5; i++) {
      const keyName = `GEMINI_API_KEY_${i}`;
      const dbSec = secrets.find(
        (s) => s.key_name.toUpperCase().trim() === keyName
      );
      if (dbSec && dbSec.key_value) addKey(dbSec.key_value);
      if (process.env[keyName]) addKey(process.env[keyName]);
    }

    // 2. Check fallback legacy names: GEMINI_API_KEY, GEMINI_PRO_KEY, GEMINI_KEY
    const legacyNames = ["GEMINI_API_KEY", "GEMINI_PRO_KEY", "GEMINI_KEY"];
    for (const name of legacyNames) {
      const dbSec = secrets.find(
        (s) => s.key_name.toUpperCase().trim() === name
      );
      if (dbSec && dbSec.key_value) addKey(dbSec.key_value);
      if (process.env[name]) addKey(process.env[name]);
    }

    return keys;
  }

  /**
   * Fetch all secrets registered for a given platform name.
   */
  public async getPlatformSecrets(platformName: string): Promise<EnvVariable[]> {
    const platform = normalizePlatformName(platformName);
    const secrets = await fetchEnvSecrets();
    return secrets.filter((s) => normalizePlatformName(s.platform) === platform);
  }

  /**
   * Return a key-value dictionary of all environment variables for a given platform.
   */
  public async getPlatformKeyMap(platformName: string): Promise<Record<string, string>> {
    const platform = normalizePlatformName(platformName);
    const secrets = await fetchEnvSecrets();

    const keyMap: Record<string, string> = {};

    // First load command_center defaults
    secrets
      .filter((s) => normalizePlatformName(s.platform) === "command_center")
      .forEach((s) => {
        keyMap[s.key_name] = s.key_value;
      });

    // Override with platform-specific secrets
    secrets
      .filter((s) => normalizePlatformName(s.platform) === platform)
      .forEach((s) => {
        keyMap[s.key_name] = s.key_value;
      });

    return keyMap;
  }

  /**
   * Rotate or update a platform key atomically.
   * Validates key format, updates Supabase app_secrets, syncs process.env, and logs AIAction.
   */
  public async rotatePlatformKey(
    platformName: string,
    keyName: string,
    newKeyValue: string,
    updatedBy: string = "SupabaseSecretManager Bot",
    comment?: string
  ): Promise<RotationResult> {
    const platform = normalizePlatformName(platformName);
    const trimmedKey = keyName.trim();
    const trimmedVal = newKeyValue.trim();

    // 1. Validate the new key
    const validation = await this.validatePlatformKey(platform, trimmedKey, trimmedVal);

    if (!validation.valid && validation.status === "invalid_format") {
      return {
        success: false,
        validation,
        message: `Key rotation rejected: ${validation.message}`,
      };
    }

    // 2. Upsert into Supabase app_secrets table
    const secret = await upsertEnvSecret({
      platform,
      key_name: trimmedKey,
      key_value: trimmedVal,
      comment: comment || `Rotated by ${updatedBy} at ${new Date().toISOString()}`,
    });

    // 3. Sync to process.env
    process.env[trimmedKey] = trimmedVal;

    // 4. Log audit action in Supabase
    try {
      const appPlatform: PlatformName = platform === "aiwibcrafter" ? "aiwibcrafter" : platform === "AutoBot WA" ? "AutoBot WA" : "command-center";
      await recordAIAction({
        platform: appPlatform,
        action_type: "triage_analysis",
        target_ref: `app_secrets:${platform}:${trimmedKey}`,
        description: `🔑 Key rotated for ${platform} [${trimmedKey}]. Status: ${validation.status}.`,
        status: "success",
        executed_by: updatedBy,
      });
    } catch (e: any) {
      console.warn("[SupabaseSecretManager] Failed to record rotation audit action:", e.message);
    }

    return {
      success: true,
      secret,
      validation,
      message: `Successfully rotated key '${trimmedKey}' for platform '${platform}'.`,
    };
  }

  /**
   * Validate a specific platform key for format, presence, and expiration indicators.
   */
  public async validatePlatformKey(
    platformName: string,
    keyName: string,
    keyValueOverride?: string
  ): Promise<KeyValidationResult> {
    const platform = normalizePlatformName(platformName);
    const key = keyName.trim().toUpperCase();

    let value = keyValueOverride;
    if (value === undefined) {
      value = (await this.getPlatformKey(platform, key)) || "";
    }

    const checkedAt = new Date().toISOString();

    if (!value || value.trim() === "") {
      return {
        valid: false,
        keyName: key,
        platform,
        status: "missing",
        message: `Key '${key}' is missing or empty for platform '${platform}'.`,
        checkedAt,
      };
    }

    const val = value.trim();

    // Specific Rule Validations
    if (key === "GEMINI_API_KEY" || key === "GEMINI_PRO_KEY" || key.startsWith("GEMINI_API_KEY_")) {
      if (val.length < 15) {
        return {
          valid: false,
          keyName: key,
          platform,
          status: "invalid_format",
          message: "Gemini API key is too short (< 15 chars). Expected valid Google AI Studio key.",
          checkedAt,
        };
      }
    } else if (key === "AUTOBOT_WA_API_TOKEN" || key === "WHATSAPP_TOKEN") {
      if (val.length < 20 || val.includes(" ")) {
        return {
          valid: false,
          keyName: key,
          platform,
          status: "invalid_format",
          message: "WhatsApp API Token must be a valid Meta access token without whitespace (at least 20 chars).",
          checkedAt,
        };
      }
    } else if (key === "SUPABASE_URL") {
      if (!val.startsWith("http://") && !val.startsWith("https://")) {
        return {
          valid: false,
          keyName: key,
          platform,
          status: "invalid_format",
          message: "SUPABASE_URL must be a valid URL starting with https://",
          checkedAt,
        };
      }
    } else if (key === "SUPABASE_SERVICE_ROLE_KEY" || key === "SUPABASE_ANON_KEY") {
      if (!val.includes(".") || val.split(".").length < 3) {
        return {
          valid: false,
          keyName: key,
          platform,
          status: "invalid_format",
          message: "Supabase key must be a valid 3-part JWT token.",
          checkedAt,
        };
      }
    } else if (key === "GITHUB_PAT_TOKEN" || key === "GITHUB_TOKEN") {
      if (val.length < 15) {
        return {
          valid: false,
          keyName: key,
          platform,
          status: "invalid_format",
          message: "GitHub Personal Access Token is too short.",
          checkedAt,
        };
      }
    }

    return {
      valid: true,
      keyName: key,
      platform,
      status: "valid",
      message: `Key '${key}' is valid and active for platform '${platform}'.`,
      checkedAt,
    };
  }

  /**
   * Validate all keys across one or all platforms and return a complete diagnostic report.
   */
  public async validateAllPlatformKeys(platformName?: string): Promise<{
    total: number;
    validCount: number;
    invalidCount: number;
    results: KeyValidationResult[];
  }> {
    const secrets = await fetchEnvSecrets();

    let targetSecrets = secrets;
    if (platformName) {
      const norm = normalizePlatformName(platformName);
      targetSecrets = secrets.filter((s) => normalizePlatformName(s.platform) === norm);
    }

    const results: KeyValidationResult[] = [];
    for (const secret of targetSecrets) {
      const res = await this.validatePlatformKey(secret.platform, secret.key_name, secret.key_value);
      results.push(res);
    }

    const validCount = results.filter((r) => r.valid).length;

    return {
      total: results.length,
      validCount,
      invalidCount: results.length - validCount,
      results,
    };
  }
}

export const SupabaseSecretManager = SupabaseSecretManagerService.getInstance();
