export async function safeFetchJson(res: Response): Promise<any> {
  const rawText = await res.text();
  if (!rawText || !rawText.trim()) {
    return { success: false, error: "استجابة الخادم فارغة (Empty Response)" };
  }

  try {
    return JSON.parse(rawText);
  } catch (err) {
    const isHtml = rawText.trim().startsWith("<") || rawText.includes("HTML") || rawText.toLowerCase().includes("server error");
    
    let userFriendlyError = `حدث خطأ في استجابة الخادم (${res.status}).`;
    if (isHtml) {
      userFriendlyError = `🔴 تعذر قراءة الاستجابة كـ JSON. الخادم أرجع صفحة HTML متضمنة خطأ (كـ Vercel 500 Server Error).\n\nسبب المحتمل: عدم تهيئة المتغيرات البيئية (Env Vars) على منصة Vercel أو فشل الاتصال بقاعدة بيانات Supabase.`;
    }

    return {
      success: false,
      error: userFriendlyError,
      details: rawText.slice(0, 250),
      isHtmlError: true,
      status: res.status,
    };
  }
}
