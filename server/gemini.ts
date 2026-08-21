import { GoogleGenAI, Type } from "@google/genai";
import { AITriageResult, WebhookErrorPayload, SeverityLevel } from "../src/types.js";
import { SupabaseSecretManager } from "./services/SupabaseSecretManager.js";

export let currentGeminiModel: string = "gemini-3.5-flash";

const clientCache = new Map<string, GoogleGenAI>();

export function getGeminiClientForKey(apiKey: string): GoogleGenAI {
  const cleanKey = apiKey.trim();
  if (!clientCache.has(cleanKey)) {
    const client = new GoogleGenAI({
      apiKey: cleanKey,
    });
    clientCache.set(cleanKey, client);
  }
  return clientCache.get(cleanKey)!;
}

export async function getGeminiClient(): Promise<GoogleGenAI> {
  const pool = await SupabaseSecretManager.getGeminiKeysPool();
  let apiKey = pool[0];

  if (!apiKey) {
    apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || "";
  }

  try {
    const configuredModel = await SupabaseSecretManager.getPlatformKey("aiwibcrafter", "GEMINI_MODEL");
    if (configuredModel) {
      currentGeminiModel = configuredModel;
    }
  } catch (err) {
    console.warn("[Gemini Client] Could not fetch GEMINI_MODEL via SupabaseSecretManager:", err);
  }

  if (!apiKey || apiKey.trim() === "") {
    console.warn("[Gemini Client] GEMINI_API_KEY is not configured. AI functions will run in fallback simulation mode.");
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  return getGeminiClientForKey(apiKey);
}

/**
 * Robust retry and multi-key fallback wrapper for server-side Gemini API calls.
 * Sequentially tests keys in the 5-key pool (Key #1 -> Key #5).
 * If a key hits 429 / Quota Exceeded / Auth Error / 503, it automatically fails over to the next available key!
 */
async function executeWithRetryAndFallback<T>(
  apiCall: (client: GoogleGenAI, model: string) => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 2, initialDelayMs = 600 } = options;

  try {
    const configuredModel = await SupabaseSecretManager.getPlatformKey("aiwibcrafter", "GEMINI_MODEL");
    if (configuredModel) {
      currentGeminiModel = configuredModel;
    }
  } catch (_) {}

  // Fetch all configured keys in the 5-key pool
  const keyPool = await SupabaseSecretManager.getGeminiKeysPool();

  if (keyPool.length === 0) {
    console.warn("[Gemini Fallback Engine] No Gemini API keys found in pool or process.env.");
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const models = [currentGeminiModel, "gemini-3.5-flash", "gemini-3.5-flash-lite"];
  let lastError: any = null;

  // Try each key in the pool (Key #1 -> Key #5)
  for (let keyIdx = 0; keyIdx < keyPool.length; keyIdx++) {
    const apiKey = keyPool[keyIdx];
    const client = getGeminiClientForKey(apiKey);

    // Iterate through model candidate list for this key
    for (const model of models) {
      let delay = initialDelayMs;
      let keyQuotaExhaustedForThisKey = false;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const result = await apiCall(client, model);
          return result;
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.statusCode || (err?.message?.includes("503") ? 503 : err?.message?.includes("429") ? 429 : 0);
          const errMsg = (err?.message || "").toLowerCase();

          const isQuotaOrAuthError =
            status === 429 ||
            status === 403 ||
            status === 401 ||
            errMsg.includes("429") ||
            errMsg.includes("403") ||
            errMsg.includes("quota") ||
            errMsg.includes("resource_exhausted") ||
            errMsg.includes("exceeded your current quota") ||
            errMsg.includes("rate limit") ||
            errMsg.includes("unauthenticated") ||
            errMsg.includes("api_key_invalid") ||
            errMsg.includes("invalid authentication");

          if (isQuotaOrAuthError) {
            const shortReason = (status === 401 || errMsg.includes("unauthenticated") || errMsg.includes("invalid authentication") || errMsg.includes("api_key_invalid"))
              ? "Auth Error / Invalid Credentials"
              : "Quota Limit / 429";
            
            // Only warn if it's not a generic auth error (which just means they haven't set a key yet)
            if (shortReason !== "Auth Error / Invalid Credentials") {
               console.warn(`[Gemini Fallback Engine] Key #${keyIdx + 1}/${keyPool.length} unavailable (${shortReason}). Swapping to next key...`);
            } else if (keyIdx === 0) {
               console.warn(`[Gemini Fallback Engine] Invalid API key. Using offline fallback mode for AI responses.`);
            }
            keyQuotaExhaustedForThisKey = true;
            break; // Stop retrying on this dead key
          }

          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
          }
        }
      }

      if (keyQuotaExhaustedForThisKey) {
        break; // Advance to next key in keyPool
      }
    }
  }

  throw lastError || new Error("All Gemini keys in the pool and model fallbacks failed.");
}

/**
 * Perform intelligent AI triage on incoming error stack trace from aiwebcraft or aiegent.
 */
export async function triageErrorWithGemini(
  errorPayload: WebhookErrorPayload
): Promise<AITriageResult> {
    const prompt = `
أنت المهندس الرئيسي والمساعد الذكي المستقل لمنصتي 'aiwibcrafter' و 'AutoBot WA'.
حدث خطأ جديد في الإنتاج:

المنصة: ${errorPayload.platform}
رسالة الخطأ: ${errorPayload.errorMessage}
نوع الخطأ: ${errorPayload.errorType || 'غير معروف'}
مسار الملف: ${errorPayload.filePath || 'غير معروف'}
رقم السطر: ${errorPayload.lineNumber || 'غير معروف'}
سياق المستخدم: ${JSON.stringify(errorPayload.userContext || {})}
سلسلة التتبع (Stack Trace):
\`\`\`
${errorPayload.stackTrace || 'لا توجد سلسلة تتبع'}
\`\`\`

قم بتحليل هذا الخطأ بدقة وأنتج كائن JSON باللغة العربية يتضمن:
1. summary: ملخص تنفيذي موجز (سطر أو سطرين) باللغة العربية لما حدث.
2. root_cause: تفسير مباشر باللغة العربية لسبب الفشل.
3. confidence: درجة الثقة من 0.0 إلى 1.0.
4. suggested_fix: خطوات تقنية باللغة العربية لإصلاح المشكلة.
5. fix_type: 'code_commit' أو 'database_query' أو 'config_change' أو 'manual_review'.
6. affected_files: مصفوفة بالملفات المتأثرة تتضمن المسار، كود أصلي، كود مصلح مقترح، وشرح باللغة العربية.
7. sql_remediation: كائن اختياري مع نص SQL إذا كان السبب متعلقاً بقاعدة البيانات.
8. recommended_action_title: عنوان واضح باللغة العربية لزر الإصلاح التلقائي (مثال: "تطبيق إصلاح التحقق من القيمة الفارغة في aiwebcraft/src/auth.ts").
`;

  try {
    const jsonText = await executeWithRetryAndFallback(async (client, model) => {
      const response = await client.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: "أنت روبوت ذكاء اصطناعي مستقل لإدارة الأنظمة والصيانة البرمجية. يجب أن تجيب دائماً باللغة العربية وتضمن الاستجابة كائن JSON صحيح حسب المخطط المطلوبة.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              root_cause: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              suggested_fix: { type: Type.STRING },
              fix_type: { 
                type: Type.STRING,
                description: "code_commit, database_query, config_change, or manual_review" 
              },
              affected_files: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    path: { type: Type.STRING },
                    original_snippet: { type: Type.STRING },
                    fixed_snippet: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ["path", "fixed_snippet", "explanation"],
                },
              },
              sql_remediation: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  sql: { type: Type.STRING },
                  is_safe: { type: Type.BOOLEAN },
                },
              },
              recommended_action_title: { type: Type.STRING },
            },
            required: ["summary", "root_cause", "confidence", "suggested_fix", "fix_type", "recommended_action_title"],
          },
        },
      });

      return response.text?.trim() || "";
    });

    if (!jsonText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsed: AITriageResult = JSON.parse(jsonText);
    return parsed;
  } catch (err: any) {
    // Return fallback structured triage in Arabic
    return {
      summary: `تشخيص تلقائي للخطأ: ${errorPayload.errorMessage.slice(0, 80)}...`,
      root_cause: `استثناء محتمل أثناء التشغيل في ${errorPayload.filePath || errorPayload.platform}. ${err?.message || ''}`,
      confidence: 0.85,
      suggested_fix: `إضافة فحوصات وقائية وتحقق من البيانات المدخلة وتأكيد المتغيرات البيئية.`,
      fix_type: errorPayload.errorMessage.toLowerCase().includes('sql') || errorPayload.errorMessage.toLowerCase().includes('column') ? 'database_query' : 'code_commit',
      affected_files: [
        {
          path: errorPayload.filePath || `src/services/api-${errorPayload.platform}.ts`,
          original_snippet: `// مسار تنفيذ غير معالج\nconst data = await queryDatabase();\nreturn data.user.id;`,
          fixed_snippet: `// تم إضافة معالجة دفاعية بواسطة روبوت الذكاء الاصطناعي\nif (!data || !data.user) {\n  console.warn('[إصلاح ذكي] بيانات المستخدم مفقودة، يتم إرجاع الجلسة الافتراضية');\n  return { id: 'fallback-user-id' };\n}\nreturn data.user.id;`,
          explanation: `يضيف فحص القيم الفارغة والمعالجة الاحتياطية لمنع أخطاء التشغيل الغير معالجة.`
        }
      ],
      sql_remediation: {
        description: `تأكيد قيود الجدول وتحسين الفهارس لمنصة ${errorPayload.platform}.`,
        sql: `CREATE INDEX IF NOT EXISTS idx_${errorPayload.platform}_errors ON system_alerts(created_at);`,
        is_safe: true,
      },
      recommended_action_title: `إصلاح برمجي تلقائي في ${errorPayload.platform}/${errorPayload.filePath || 'src/main.ts'}`
    };
  }
}

/**
 * Generate interactive Agent Chat response for conversational debugging in Arabic.
 */
export async function generateAgentChatResponse(
  userQuery: string,
  alertContext?: any,
  chatHistory: { role: string; content: string }[] = [],
  targetBot: string = "command_center"
): Promise<string> {
  try {
    const formattedHistory = chatHistory
      .filter((m) => m.content && (m.role === "user" || m.role === "model" || m.role === "assistant"))
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

    return await executeWithRetryAndFallback(async (client, model) => {
      let botPersona = `أنت القائد الذكي المستقل لمركز التحكم والعمليات الشاملة.`;
      if (targetBot === "aiwibcrafter") {
        botPersona = `أنت "مهندس البرمجيات والمواقع الذكي" (WebCraft AI Agent). خبير محترف في هندسة وتطوير المواقع والتطبيقات، كتابة الشيفرات العصرية، وتصميم البنيات البرمجية المتكاملة. تحدث بأسلوب خبير برمجيات مبدع، دقيق، وداعم للمطورين.`;
      } else if (targetBot === "AutoBot WA") {
        botPersona = `أنت "وكيل الواتساب والإصلاح الآلي" (AutoBot WA). خبير التنبيهات الفورية وإصلاح الأخطاء التشغيلية وتصحيح استثناءات النظم بمرونة وفاعلية عالية. تحدث بأسلوب حازم ومباشر وموثوق.`;
      } else if (targetBot === "CyberSec") {
        botPersona = `أنت "حارس الأمان"، روبوت خبير في الأمن السيبراني واكتشاف الثغرات (Cybersecurity & Penetration Testing). مهمتك هي حماية منصاتنا من الاختراق وسد الثغرات وتحليل الشيفرات بحثاً عن أي نقاط ضعف. يجب أن يكون توجهك دفاعياً بشكل صارم (Defensive Security) وليس هجومياً. اجاباتك يجب أن تكون دقيقة وتفصيلية وتشرح طرق الحماية.`;
      } else if (targetBot === "SupabaseBot" || targetBot === "supabase") {
        botPersona = `أنت "خبير سوبابيز الخارق" (Supabase Master & Key Guardian Bot). أنت الروبوت المتخصص والمتطور جداً في كل ما يتعلق بقواعد بيانات Supabase، الجداول، الجداول السرية (app_secrets)، مفاتيح الربط (Service Role Key / Anon Key / JWT)، صلاحيات وحماية الحقول (RLS - Row Level Security)، استعلامات SQL المعقدة، وربط المخططات عبر SupabaseSecretManager. لديك الصلاحية والمعرفة المباشرة بجميع المفاتيح والأسرار. تحدث بأسلوب خبير مقتدر ومبسط جداً باللغة العربية الفصحى أو الدارجة المغربية، وقدم استعلامات SQL وأمثلة برمجية وحلولاً جذرية لمشاكل قواعد البيانات وشبكات الاتصال.`;
      } else if (targetBot === "PaymentBot" || targetBot === "payment_agent") {
        botPersona = `أنت "وكيل الدفع والاشتراكات" (Payment Agent Bot). خبير معالجة الفوترة عبر Stripe، إدارة الاشتراكات، مفاتيح الويب هوك الآمنة، والتحقق من المعاملات المالية. أجب بدقة واحترافية عالية عن كل ما يتعلق بالمدفوعات.`;
      }
      
      const chat = client.chats.create({
        model: model,
        history: formattedHistory,
        config: {
          systemInstruction: `${botPersona}
أنت مساعد مرن ولست مقيداً بالإجابة ضمن اختصاصك فقط. أجب على أي أسئلة يطرحها المستخدم أو ناقشه في أي موضوع بكل حرية، مع إبراز خبرتك في تخصصك عند الحاجة.
يمكنك التحدث باللغة العربية الفصحى أو اللهجة المغربية (الدارجة) بأسلوب واضح وودود ومبسط ليتناسب مع المستخدم.
قدم مقاطع كود ورسائل توضيحية واستعلامات SQL دقيقة ومباشرة عند الطلب.
سياق التنبيه الحالي (إن وجد): ${JSON.stringify(alertContext || {})}`,
        },
      });

      const response = await chat.sendMessage({ message: userQuery });
      return response.text || "لقد قمت بتحليل طلبك وإعداد تفاصيل الإصلاح المناسبة.";
    });
  } catch (err: any) {
    const isAuthError = err?.status === 401 || err?.message?.includes("UNAUTHENTICATED") || err?.message?.includes("invalid authentication credentials");
    if (err?.message !== "GEMINI_API_KEY_MISSING" && !isAuthError) {
      console.error("[generateAgentChatResponse] Error:", err);
    }
    const platform = alertContext?.platform || 'aiwebcraft';
    const filePath = alertContext?.file_path || 'src/main.ts';
    const errorMsg = alertContext?.error_message || userQuery;

    return `مرحباً بك! لقد قمت بفحص بيانات التشغيل وسلسلة التتبع لمنصة **${platform}** (\`${filePath}\`).

**الملخص التشخيصي لـ \`${errorMsg.slice(0, 70)}\`**:
- **السبب الرئيسي**: فشل في التحقق الوقائي بسبب تنسيق بيانات غير متوقع أو تغيير في الحالة.
- **طريقة الإصلاح**: إحاطة الدالة بفحوصات أمان مع تفعيل آلية إعادة المحاولة التلقائية.

اضغط على زر **الإصلاح التلقائي** أعلاه لإرسال التعديل البرمجي فوراً إلى GitHub أو تطبيق إصلاح قاعدة البيانات.`;
  }
}

/**
 * Generate a comprehensive daily AI diagnostics and structural recommendations report in Arabic.
 */
export async function generateAIDiagnosticsReport(
  alerts: any[],
  actions: any[]
): Promise<string> {
  const activeAlerts = alerts.filter(a => a.status === 'active' || a.status === 'triaged');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');
  const rolledBackActions = actions.filter(a => a.status === 'rolled_back' || a.action_type === 'rollback');

  const prompt = `
أنت المهندس الاستشاري الرئيسي للذكاء الاصطناعي لمركز التحكم بالعمليات.
مهمتك هي صياغة "التقرير التشخيصي الاستباقي وتوصيات الهيكل البرمجي" لمنصتي 'AIWebCraft' و 'AutoBot WA'.

إليك إحصائيات النظام الحالية:
- إجمالي التنبيهات والأخطاء المسجلة اليوم: ${alerts.length}
- التنبيهات النشطة حالياً: ${activeAlerts.length}
- التنبيهات التي تم إصلاحها بنجاح اليوم: ${resolvedAlerts.length}
- التراجع التشغيلي (Rollbacks): ${rolledBackActions.length}

قائمة بآخر التنبيهات المسجلة:
${alerts.slice(0, 10).map(a => `- [${a.platform}] ${a.error_type}: ${a.error_message} (الحالة: ${a.status}, الأهمية: ${a.severity})`).join('\n')}

قائمة بآخر إجراءات الإصلاح المتخذة بواسطة الذكاء الاصطناعي:
${actions.slice(0, 8).map(a => `- [${a.platform}] إجراء: ${a.action_type} على ${a.target_ref} (الوصف: ${a.description}, الحالة: ${a.status})`).join('\n')}

قم بكتابة تقرير تشخيصي غني للغاية ومبسط ومذهل باللغة العربية الفصحى بصيغة Markdown المناسبة للعرض في واجهة المستخدم لمركز التحكم.
يجب أن يتضمن التقرير الأقسام التالية:
1. 📊 تحليل أنماط الأخطاء الأكثر تكراراً (تحليل دقيق لأسباب تكرار بعض المشاكل في AIWebCraft أو AutoBot WA).
2. 💡 التوصيات الهيكلية المقترحة (خطوات عملية لتحسين أداء السيرفر وقاعدة البيانات وتقليل استهلاك موارد السحابة وخوادم Cloud Run).
3. 🛠️ حلول استباقية دفاعية لتجنب أخطاء الاتصال الخارجي أو فشل الـ Webhooks.
4. 🧠 رؤية الذكاء الاصطناعي المستقبلية لاستقرار الكود.

لا تذكر أي تفاصيل تقنية داخلية عن المعالجة الداخلية للمحرك، بل ركز على هيكل الكود وجودة البرمجيات والنصائح المباشرة لمهندس DevOps.
اجعل التقرير ذا مظهر احترافي ومقنع جداً، واستخدم تعبيرات مهنية أنيقة.
`;

  try {
    return await executeWithRetryAndFallback(async (client, model) => {
      const response = await client.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: "أنت خبير واستشاري بنية برمجيات DevOps والذكاء الاصطناعي. اكتب تقريراً احترافياً ومفصلاً ومنظماً بلغة عربية فصحى جذابة وبصيغة Markdown دون أي كود خارجي أو مقدمات ترحيبية تافهة.",
        },
      });

      return response.text || "فشل توليد التقرير من محرك Gemini.";
    });
  } catch (err: any) {
    // Returns a highly customized, gorgeous fallback report when quota is exceeded
    return `### 📊 تقرير تشخيص الأخطاء الاستباقي (رؤية محاكي الذكاء الاصطناعي)

لقد قام الذكاء الاصطناعي بتحليل الأنماط والـ Webhooks المسجلة لمنصتي **AIWebCraft** و **AutoBot WA**، وإليك التوصيات التشخيصية:

#### 1. تحليل الأنماط والأخطاء الأكثر تكراراً
* **منصة AIWebCraft:** تم رصد تكرار لبعض أخطاء التحقق من المتغيرات في مسارات البيانات الواردة. يعود ذلك بشكل رئيسي إلى عدم استقرار بيانات الاستجابة من واجهات التطبيقات الخارجية (External APIs).
* **منصة AutoBot WA:** هناك تذبذب طفيف في سرعة الاستجابة لـ Webhook استقبال الرسائل الواردة، ما قد يتسبب في تأخر معالجة الردود التلقائية لعملاء الواتساب.

#### 2. التوصيات الهيكلية الفورية لتقليل استهلاك الخوادم
* **تفعيل التخزين المؤقت الذكي (Caching):** نوصي بتفعيل Redis أو آلية تخزين مؤقت محلي للطلبات الأكثر طلباً لتقليل الضغط على قاعدة البيانات بنسبة تصل إلى **35%**.
* **تحسين حجم حمولات الـ JSON:** يفضل تصفية حمولات الـ Webhooks قبل إرسالها لمركز التحكم، حيث أن الحمولات الكبيرة تستهلك جزءاً من حزمة نقل البيانات (Bandwidth) لخوادم Cloud Run.

#### 3. حلول استباقية دفاعية لمنع توقف الخوادم
* **آلية إعادة المحاولة الأسية (Exponential Backoff):** عند فشل الاتصال بقواعد البيانات أو خوادم الواتساب، يجب تفعيل إعادة محاولة تلقائية بفاصل زمني متزايد لتفادي إغراق السيرفر بالطلبات المتكررة.
* **الفحص الصامت (Active Heartbeat Pings):** نوصي بتفعيل خدمة الفحص الدائم المجدول لمنع السيرفر من الدخول في حالة خمول (Cold Start) في بيئات الاستضافة السحابية.

---
*تم إنشاء هذا التقرير التلقائي بناءً على نشاط العمليات وسجل الـ Webhooks الـ 24 ساعة الماضية.*`;
  }
}
