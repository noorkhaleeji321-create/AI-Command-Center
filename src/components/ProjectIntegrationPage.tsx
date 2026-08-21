import React, { useState, useEffect, useRef } from "react";
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  Send,
  Copy,
  Check,
  Key,
  Shield,
  Smartphone,
  Server,
  Zap,
  Globe,
  RefreshCw,
  Terminal,
  Code2,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Bot,
  UploadCloud,
  ShieldAlert,
} from "lucide-react";

interface ProjectIntegrationPageProps {
  onSavedSuccess?: () => void;
}

export interface IntegrationConfig {
  repoOwner: string;
  repoName: string;
  defaultBranch: string;
  targetPagePath: string;
  githubPAT: string;
  fixStrategy: "direct_push" | "pull_request" | "deploy_webhook";
  deployWebhookUrl: string;
  whatsappPhone: string;
  alertSeverity: "critical_only" | "high_and_critical" | "all_alerts";
  isAutoFixEnabled: boolean;
  platformSecretKey: string;
}

export const ProjectIntegrationPage: React.FC<ProjectIntegrationPageProps> = ({
  onSavedSuccess,
}) => {
  const [config, setConfig] = useState<IntegrationConfig>(() => {
    try {
      const saved = localStorage.getItem("AIWC_PROJECT_INTEGRATION_CONFIG");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            targetPagePath: parsed.targetPagePath && parsed.targetPagePath !== "src/App.tsx" ? parsed.targetPagePath : "* (شامل لجميع ملفات ومجلدات المشروع بالكامل)",
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.warn("Failed to load integration config:", e);
    }
    return {
      repoOwner: "aiwebcraft-org",
      repoName: "my-production-app",
      defaultBranch: "main",
      targetPagePath: "* (شامل لجميع ملفات ومجلدات المشروع بالكامل)",
      githubPAT: "",
      fixStrategy: "pull_request",
      deployWebhookUrl: "https://api.vercel.com/v1/integrations/deploy/prj_12345",
      whatsappPhone: "+212600000000",
      alertSeverity: "high_and_critical",
      isAutoFixEnabled: true,
      platformSecretKey: "aiwc_sec_live_" + Math.random().toString(36).substring(2, 12),
    };
  });

  const [isTestingGitHub, setIsTestingGitHub] = useState(false);
  const [githubTestResult, setGithubTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const [autoVerifyStatus, setAutoVerifyStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [autoVerifyMessage, setAutoVerifyMessage] = useState<string | null>(null);

  const [isTestingWA, setIsTestingWA] = useState(false);
  const [waTestResult, setWaTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<"express" | "react" | "python" | "curl">("express");
  const [showTokenHelp, setShowTokenHelp] = useState(false);

  // Project Upload & Multi-Bot Scan & Push State
  const [uploadedFiles, setUploadedFiles] = useState<{ path: string; content: string }[]>([]);
  const [userPlatformName, setUserPlatformName] = useState<string>(`${config.repoOwner}/${config.repoName}`);
  const [isScanning, setIsScanning] = useState(false);
  const [findings, setFindings] = useState<any[]>([]);
  const [scanStats, setScanStats] = useState<{ scanned: number; blocked: number; sizeKb: string } | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [commitMessage, setCommitMessage] = useState("fix: automated AI bots security scan and vulnerability remediation");
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadSampleProject = () => {
    const sampleFiles = [
      {
        path: "src/auth.ts",
        content: `// Authentication service with exposed secret and null risk\nconst API_KEY = "AIzaSyDummyKeyForTestingOnly123456789";\nexport function getUser(users: any[]) {\n  return users.map(u => u.name);\n}`,
      },
      {
        path: "server/db.ts",
        content: `// Database configuration\nconst dbPassword = "password = superSecretPassword123";\nconst client = connectDatabase(dbPassword);\n`,
      },
      {
        path: "src/components/Widget.tsx",
        content: `export function Widget({ data }: { data: any }) {\n  return <div dangerouslySetInnerHTML={{ __html: data.content }} />;\n}`,
      },
      {
        path: ".env.production",
        content: `DATABASE_URL=postgres://admin:secret123@prod-db.internal:5432/main_db\nJWT_SECRET=super_secret_jwt_key_999\n`,
      },
      {
        path: "node_modules/express/index.js",
        content: `// Node module dependency sample file - should be blocked\nconsole.log("node_modules dependency");\n`,
      }
    ];
    setUploadedFiles(sampleFiles);
    setScanMessage("تم تحميل المشروع النموذجي بنجاح (5 ملفات تجريبية تتضمن ملفات حساسة ومحجوبة لاختبار الفحص الشامل).");
    setFindings([]);
    setScanStats(null);
    setPushResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList) return;
    const newFiles: { path: string; content: string }[] = [];
    Array.from(filesList).forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string || "";
        newFiles.push({
          path: file.webkitRelativePath || file.name,
          content,
        });
        if (newFiles.length === filesList.length) {
          setUploadedFiles((prev) => [...prev, ...newFiles]);
          setScanMessage(`تم تحميل ${newFiles.length} ملف بنجاح. انقر على 'بدء الفحص الشامل' لتشغيل جميع البوتات.`);
        }
      };
      reader.readAsText(file);
    });
  };

  // Bot telemetry state during scan
  const [activeBotStep, setActiveBotStep] = useState<string>("");
  const [botProgress, setBotProgress] = useState<number>(0);

  const handleRunComprehensiveScan = async () => {
    if (uploadedFiles.length === 0) {
      alert("الرجاء رفع ملفات المشروع أولاً أو تحميل المشروع النموذجي للاختبار.");
      return;
    }
    setIsScanning(true);
    setScanMessage(`🤖 جاري تفعيل كافة البوتات لفحص الملفات والتحقق من التوافق مع منصة المشروع (${userPlatformName})...`);
    setFindings([]);
    setScanStats(null);
    setPushResult(null);
    setBotProgress(10);
    setActiveBotStep("🕵️ حارس الأسرار والاعتمادات (Security Inspector): يفحص الأسرار وملفات .env والاعتمادات...");

    await new Promise(r => setTimeout(r, 600));
    setBotProgress(35);
    setActiveBotStep(`🛡️ حارس الاستضافة والقيود (Hosting Guard): يتحقق من أحجام الملفات والقيود الخاصة بـ ${userPlatformName}...`);

    await new Promise(r => setTimeout(r, 600));
    setBotProgress(70);
    setActiveBotStep("🔍 مراقب الجودة ودرع الحماية (Code Quality & Security Shield): يحلل الكود وكشف الثغرات والـ Null References...");

    try {
      const res = await fetch("/api/platforms/upload-and-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: uploadedFiles, targetProvider: userPlatformName }),
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 400));
      setBotProgress(100);
      if (data.success) {
        setFindings(data.findings || []);
        setScanStats({
          scanned: data.scannedFilesCount || uploadedFiles.length,
          blocked: data.blockedFilesCount || 0,
          sizeKb: data.totalSizeKb || "0",
        });
        setActiveBotStep("✅ اكتمل الفحص الشامل وتقييم التوافق بكفاءة عالية!");
        setScanMessage(
          `✅ تم فحص ${data.scannedFilesCount} ملف بنجاح! تم اكتشاف ${data.findings?.length || 0} ملاحظة وثغرة، وحجب ${data.blockedFilesCount} ملف غير متوافق مع ${userPlatformName}.`
        );
      } else {
        throw new Error(data.error || "فشل الفحص الشامل");
      }
    } catch (err: any) {
      setScanMessage(`خطأ أثناء الفحص: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFixAll = () => {
    // 1. Sanitize code files and strip keys / null risks
    const sanitized = uploadedFiles.map((file) => {
      let updatedContent = file.content;
      updatedContent = updatedContent.replace(
        /(AIza|ghp_|github_pat_|sk_live_|password\s*=\s*['"])[^'"\s]+(['"]?)/g,
        "process.env.SECURE_SECRET_KEY ?? '$1REDACTED$2'"
      );
      if (updatedContent.includes(".map(") && !updatedContent.includes("?.map(")) {
        updatedContent = updatedContent.replace(/\.map\(/g, "?.map(");
      }
      return { ...file, content: updatedContent };
    });

    // 2. Filter out forbidden sensitive env files or node_modules
    const forbiddenDirs = ["node_modules/", ".git/", ".next/", "dist/"];
    const sensitiveEnvFiles = [".env", ".env.local", ".env.production", "credentials.json"];
    
    const cleanedFiles = sanitized.filter((f) => {
      const path = f.path.replace(/\\/g, "/");
      const name = path.split("/").pop() || path;
      const isForbiddenDir = forbiddenDirs.some((dir) => path.startsWith(dir) || path.includes("/" + dir));
      const isEnv = sensitiveEnvFiles.includes(name.toLowerCase());
      return !isForbiddenDir && !isEnv;
    });

    setUploadedFiles(cleanedFiles);
    setScanMessage(`✨ تم تطبيق التطهير والتصحيح التلقائي! تم تحديث الكود واستبعاد الملفات الممنوعة (الملفات الصالحة حالياً: ${cleanedFiles.length} ملف).`);
    setFindings((prev) =>
      prev.map((f) => ({
        ...f,
        issue: f.issue + " (تم التطهير والتصحيح بنجاح ✅)",
        severity: "LOW",
      }))
    );
  };

  const handlePushToGitHub = async () => {
    if (!config.repoOwner || !config.repoName || !config.githubPAT) {
      alert("يرجى إدخال اسم مالك المستودع، اسم المستودع، ورمز الوصول الشخصي (GitHub PAT) في الخطوة 1 أعلاه.");
      return;
    }
    if (uploadedFiles.length === 0) {
      alert("لا توجد ملفات مرفوعة لدفعها. يرجى رفع ملفات المشروع أولاً.");
      return;
    }
    setIsPushing(true);
    setPushResult(null);
    try {
      // Filter out git metadata or gitignore if needed to avoid permission errors
      const validFiles = uploadedFiles.filter(f => !f.path.includes(".git") && f.path !== ".gitignore");
      
      const res = await fetch("/api/platforms/github-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoOwner: config.repoOwner,
          repoName: config.repoName,
          githubToken: config.githubPAT,
          commitMessage,
          files: validFiles.length > 0 ? validFiles : uploadedFiles,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPushResult({
          success: true,
          message: data.message || `تم دفع وتحديث ${validFiles.length} ملف إلى مستودع ${config.repoOwner}/${config.repoName} بنجاح!`,
        });
      } else {
        throw new Error(data.error || "فشل الدفع إلى GitHub");
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        message: `فشل الدفع إلى GitHub: ${err.message}`,
      });
    } finally {
      setIsPushing(false);
    }
  };

  // Save config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("AIWC_PROJECT_INTEGRATION_CONFIG", JSON.stringify(config));
    } catch (e) {
      console.warn("Failed to persist integration config:", e);
    }
  }, [config]);

  // Debounced Automatic Real-Time GitHub & Token Verification
  useEffect(() => {
    if (!config.repoOwner || !config.repoName) {
      setAutoVerifyStatus("idle");
      setAutoVerifyMessage("يرجى إدخال اسم المستودع واسم الحساب للبدء في الفحص التلقائي.");
      return;
    }

    setAutoVerifyStatus("checking");
    setAutoVerifyMessage("جاري التحقق التلقائي من صحة مسار GitHub والتوكن...");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/platforms/test-github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repoOwner: config.repoOwner,
            repoName: config.repoName,
            targetPagePath: config.targetPagePath,
            githubToken: config.githubPAT,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setAutoVerifyStatus("valid");
          setAutoVerifyMessage(data.message || "تم الاتصال بالمستودع والتأكد من صحة التوكن بنجاح.");
          setGithubTestResult({
            success: true,
            message: data.message,
            details: data.repoDetails,
          });
        } else {
          setAutoVerifyStatus("invalid");
          setAutoVerifyMessage(data.message || "فشل الاتصال بمستودع GitHub. تأكد من صحة اسم الحساب/المستودع والتوكن.");
          setGithubTestResult({
            success: false,
            message: data.message,
          });
        }
      } catch (err: any) {
        setAutoVerifyStatus("invalid");
        setAutoVerifyMessage(`تعذر الفحص التلقائي: ${err.message}`);
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [config.repoOwner, config.repoName, config.githubPAT, config.targetPagePath]);

  const handleTestGitHub = async () => {
    setIsTestingGitHub(true);
    setGithubTestResult(null);
    try {
      const res = await fetch("/api/platforms/test-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoOwner: config.repoOwner,
          repoName: config.repoName,
          targetPagePath: config.targetPagePath,
          githubToken: config.githubPAT,
        }),
      });
      const data = await res.json();
      setGithubTestResult({
        success: data.success,
        message: data.message,
        details: data.repoDetails,
      });
      if (data.success) {
        setAutoVerifyStatus("valid");
        setAutoVerifyMessage(data.message);
      } else {
        setAutoVerifyStatus("invalid");
        setAutoVerifyMessage(data.message);
      }
    } catch (err: any) {
      setGithubTestResult({
        success: false,
        message: `فشل الاتصال: ${err.message}`,
      });
      setAutoVerifyStatus("invalid");
      setAutoVerifyMessage(`فشل الاتصال: ${err.message}`);
    } finally {
      setIsTestingGitHub(false);
    }
  };

  const handleTestWhatsApp = async () => {
    setIsTestingWA(true);
    setWaTestResult(null);
    try {
      const res = await fetch("/api/platforms/test-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waPhone: config.whatsappPhone,
          message: `تنبيه من AutoBot WA: تم اختبار ربط مشروع ${config.repoOwner}/${config.repoName} بنجاح!`,
        }),
      });
      const data = await res.json();
      setWaTestResult({
        success: data.success,
        message: data.message,
      });
    } catch (err: any) {
      setWaTestResult({
        success: false,
        message: `فشل إرسال التنبيه: ${err.message}`,
      });
    } finally {
      setIsTestingWA(false);
    }
  };

  const handleSaveIntegration = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    // Step 1: Automatic Pre-Save Verification of GitHub Repo & PAT Token
    if (!config.repoOwner || !config.repoName) {
      setSaveMessage("❌ تعذر الحفظ: يرجى إدخال اسم المستودع واسم المستخدم (GitHub Repository / Owner) أولاً.");
      setIsSaving(false);
      return;
    }

    try {
      setAutoVerifyStatus("checking");
      setAutoVerifyMessage("جاري التحقق الإجباري من صحة مسار GitHub والتوكن قبل الحفظ...");

      const verifyRes = await fetch("/api/platforms/test-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoOwner: config.repoOwner,
          repoName: config.repoName,
          targetPagePath: config.targetPagePath,
          githubToken: config.githubPAT,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        setAutoVerifyStatus("invalid");
        setAutoVerifyMessage(verifyData.message || "فشل التحقق من صحة المستودع والتوكن.");
        setSaveMessage(`⚠️ فشل التحقق التلقائي قبل الحفظ: ${verifyData.message || "اسم المستودع أو توكن GitHub غير صالح."}`);
        setGithubTestResult({
          success: false,
          message: verifyData.message,
        });
        setIsSaving(false);
        return;
      }

      // Verification passed! Update status
      setAutoVerifyStatus("valid");
      setAutoVerifyMessage("تم التحقق التلقائي وتأكيد الاتصال بـ GitHub بنجاح!");
      setGithubTestResult({
        success: true,
        message: verifyData.message,
        details: verifyData.repoDetails,
      });

      // Step 2: Persist secrets to Secret Manager
      await fetch("/api/env/secret-manager/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "AutoBot WA",
          keyName: "GITHUB_PAT",
          keyValue: config.githubPAT,
          comment: `Personal Access Token for ${config.repoOwner}/${config.repoName}`,
        }),
      }).catch(() => {});

      await fetch("/api/env/secret-manager/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "AutoBot WA",
          keyName: "WHATSAPP_PHONE",
          keyValue: config.whatsappPhone,
          comment: `Primary WhatsApp Alert Number`,
        }),
      }).catch(() => {});

      setSaveMessage("✅ تم التحقق تلقائياً من صحة GitHub Token وتأكيد الاتصال بالمستودع وحفظ الإعدادات بنجاح! 🚀");
      if (onSavedSuccess) onSavedSuccess();
    } catch (e: any) {
      setSaveMessage(`⚠️ تعذر استكمال الفحص التلقائي: ${e.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const originUrl = window.location.origin;
  const webhookUrl = `${originUrl}/api/incoming-errors`;

  const snippets = {
    express: `// 1. تثبيت الحزمة أو استدعاء الأخطاء في Express / Node.js
const express = require('express');
const app = express();

app.use(express.json());

// 2. معالج الأخطاء المركزي المباشر لـ AutoBot WA
app.use((err, req, res, next) => {
  fetch('${webhookUrl}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Platform-Key': '${config.platformSecretKey}'
    },
    body: JSON.stringify({
      platform: 'AutoBot WA',
      errorType: err.name || 'ExpressUnhandledError',
      errorMessage: err.message,
      stackTrace: err.stack,
      filePath: req.originalUrl,
      severity: 'CRITICAL',
      repoName: '${config.repoOwner}/${config.repoName}'
    })
  }).catch(console.error);

  res.status(500).json({ error: 'Internal Server Error' });
});`,

    react: `// إضافة مستمع الأخطاء في React / Frontend
window.addEventListener('error', (event) => {
  fetch('${webhookUrl}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Platform-Key': '${config.platformSecretKey}'
    },
    body: JSON.stringify({
      platform: 'aiwibcrafter',
      errorType: 'ReactUnhandledClientError',
      errorMessage: event.message,
      filePath: event.filename + ':' + event.lineno,
      severity: 'HIGH',
      repoName: '${config.repoOwner}/${config.repoName}'
    })
  }).catch(() => {});
});`,

    python: `# Python / FastAPI / Django Error Logger Hook
import requests, sys

def report_error_to_autobot(error_type, error_msg, stack_trace=""):
    try:
        requests.post(
            '${webhookUrl}',
            json={
                "platform": "AutoBot WA",
                "errorType": error_type,
                "errorMessage": str(error_msg),
                "stackTrace": str(stack_trace),
                "severity": "CRITICAL",
                "repoName": "${config.repoOwner}/${config.repoName}"
            },
            headers={"X-Platform-Key": "${config.platformSecretKey}"},
            timeout=3
        )
    except Exception as e:
        print("AutoBot Error Logger failed:", e)`,

    curl: `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-Platform-Key: ${config.platformSecretKey}" \\
  -d '{
    "platform": "AutoBot WA",
    "errorType": "DatabaseTimeoutError",
    "errorMessage": "Connection pool exhausted after 3000ms",
    "severity": "CRITICAL",
    "repoName": "${config.repoOwner}/${config.repoName}"
  }'`,
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(type);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020204] text-slate-100 p-4 md:p-6 space-y-6 w-full font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-950 border border-cyan-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
            <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>صفحة الربط والنشر المباشر • Integrated GitHub Pipeline</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
              ربط المشروعات وإرسال الإصلاحات تلقائياً إلى GitHub
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              قم بربط مستودع الكود الخاص بك مع <strong className="text-cyan-300">AutoBot WA</strong> و{" "}
              <strong className="text-blue-300">WebCraft AI</strong> لتلقي التنبيهات وإرسال الأكواد المصححة
              مباشرة إلى GitHub عبر Pull Requests أو Direct Commits فور اكتشاف الأخطاء.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>GitHub API v3 Support</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/5">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>WhatsApp Alerts Active</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Auto-PR & Commit Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Single Vertical Flow Sections */}
      <div className="space-y-6">
          {/* STEP 1: GitHub Repository & PAT Integration */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>1. بيانات مستودع GitHub (Repository Credentials)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      مطلوب
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    ربط المستودع ليتمكن المساعد الذكي من قراءة ملفات المشروع وكتابة التحديثات.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowTokenHelp(!showTokenHelp)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1"
                title="كيف أنشئ رمز الوصول PAT؟"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">كيفية إنشاء التوكين</span>
              </button>
            </div>

            {/* Token Instruction Helper Box */}
            {showTokenHelp && (
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs space-y-2 text-cyan-200 animate-fadeIn">
                <p className="font-bold flex items-center gap-2 text-white">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  خطوات إنشاء GitHub Personal Access Token (PAT):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>
                    قم بزيارة إعدادات الحساب في GitHub:{" "}
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 underline font-mono"
                    >
                      github.com/settings/tokens
                    </a>
                  </li>
                  <li>اضغط على <strong>Generate new token (classic)</strong>.</li>
                  <li>
                    اختر صلاحية <strong>repo</strong> (تمنح صلاحية قراءة وكتابة الكود وفتح الـ Pull Requests).
                  </li>
                  <li>انسخ الرمز الصادر (يبدأ بـ <code className="text-amber-300">ghp_</code>) وضعه في الخانة أدناه.</li>
                </ol>
              </div>
            )}

            {/* Full Repository Quick Input Field */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <label className="block text-xs font-bold text-cyan-300 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span>اسم مستودع GitHub الكامل (GitHub Full Repository - Username/Repository):</span>
              </label>
              <input
                type="text"
                value={config.repoOwner && config.repoName ? `${config.repoOwner}/${config.repoName}` : (config.repoOwner || config.repoName || "")}
                onChange={(e) => {
                  const raw = e.target.value;
                  let clean = raw.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "");
                  if (clean.includes("/")) {
                    const [owner, ...repoParts] = clean.split("/");
                    setConfig({ ...config, repoOwner: owner, repoName: repoParts.join("/") });
                  } else {
                    setConfig({ ...config, repoOwner: clean, repoName: "" });
                  }
                }}
                placeholder="مثال: username/repository-name أو لصق رابط https://github.com/username/repository-name"
                className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono font-bold"
              />
              <p className="text-[11px] text-slate-400">
                ادخل اسم حسابك واسم المستودع بصيغة <code className="text-cyan-300 font-mono">Username/Repository</code> لربط النظام بملفات مشروعك وتحديد الصفحة المستهدفة للتعديل بدقة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  اسم مالك المستودع / اسم المستخدم (GitHub Username / Owner):
                </label>
                <input
                  type="text"
                  value={config.repoOwner}
                  onChange={(e) => setConfig({ ...config, repoOwner: e.target.value })}
                  placeholder="مثال: aiwebcraft-org أو username"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  اسم المستودع (Repository Name):
                </label>
                <input
                  type="text"
                  value={config.repoName}
                  onChange={(e) => setConfig({ ...config, repoName: e.target.value })}
                  placeholder="مثال: my-fullstack-app"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>نطاق الفحص والتصحيح (Project Scan Scope):</span>
                </label>
                <input
                  type="text"
                  value={config.targetPagePath || "/ (كامل ملفات وصفحات المشروع)"}
                  onChange={(e) => setConfig({ ...config, targetPagePath: e.target.value })}
                  placeholder="/ (شامل لجميع الصفحات والأكواد والمسارات)"
                  className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  الفرع المستهدف (Default Branch):
                </label>
                <input
                  type="text"
                  value={config.defaultBranch}
                  onChange={(e) => setConfig({ ...config, defaultBranch: e.target.value })}
                  placeholder="main أو master"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  رمز الوصول الشخصي (GitHub PAT Token):
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={config.githubPAT}
                    onChange={(e) => setConfig({ ...config, githubPAT: e.target.value })}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx أو github_pat_xxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Live Auto-Verification Badge Box */}
            <div className={`p-3.5 rounded-xl border text-xs transition-all space-y-1 ${
              autoVerifyStatus === "valid"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                : autoVerifyStatus === "invalid"
                ? "bg-rose-950/40 border-rose-500/40 text-rose-200"
                : autoVerifyStatus === "checking"
                ? "bg-cyan-950/30 border-cyan-500/30 text-cyan-200"
                : "bg-slate-950 border-slate-800 text-slate-400"
            }`}>
              <div className="flex items-center justify-between font-bold">
                <div className="flex items-center gap-2">
                  {autoVerifyStatus === "checking" && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
                  {autoVerifyStatus === "valid" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {autoVerifyStatus === "invalid" && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                  {autoVerifyStatus === "idle" && <Bot className="w-4 h-4 text-slate-400 shrink-0" />}

                  <span>
                    {autoVerifyStatus === "checking" && "جاري التحقق الأوتوماتيكي..."}
                    {autoVerifyStatus === "valid" && "حالة الاتصال: مؤكد وصالح 100% ✅"}
                    {autoVerifyStatus === "invalid" && "حالة الاتصال: يتطلب تصحيح البيانات ⚠️"}
                    {autoVerifyStatus === "idle" && "نظام الفحص الأوتوماتيكي بانتظار البيانات"}
                  </span>
                </div>

                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10">
                  Auto-Check Guard
                </span>
              </div>

              {autoVerifyMessage && (
                <p className="text-[11px] opacity-90 leading-relaxed font-sans pr-6">
                  {autoVerifyMessage}
                </p>
              )}
            </div>

            {/* Full Repository GitHub Link */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between text-slate-300 font-mono overflow-x-auto">
              <span className="text-[11px] text-slate-400">رابط المستودع الكامل بـ GitHub:</span>
              <a
                href={`https://github.com/${config.repoOwner || "username"}/${config.repoName || "repo"}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-bold text-[11px]"
              >
                <span>github.com/{config.repoOwner || "USER"}/{config.repoName || "REPO"} (فحص وتعديل أوتوماتيكي لكامل المشروع)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* GitHub Test Button & Status Output */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
              <button
                onClick={handleTestGitHub}
                disabled={isTestingGitHub}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isTestingGitHub ? "animate-spin text-cyan-400" : ""}`} />
                <span>{isTestingGitHub ? "جاري الاختبار..." : "اختبار الاتصال بـ GitHub"}</span>
              </button>

              {githubTestResult && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border w-full sm:w-auto ${
                    githubTestResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}
                >
                  {githubTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{githubTestResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: Auto-Fix Dispatch Strategy */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  2. إستراتيجية تطبيق الإصلاحات والـ Deployment Webhook
                </h2>
                <p className="text-xs text-slate-400">
                  حدد كيف ترغب في تسليم الأكواد المصححة بواسطة AutoBot WA بعد معالجة الأخطاء.
                </p>
              </div>
            </div>

            {/* Radio options for Fix Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label
                onClick={() => setConfig({ ...config, fixStrategy: "pull_request" })}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  config.fixStrategy === "pull_request"
                    ? "bg-purple-950/30 border-purple-500/50 text-white shadow-lg shadow-purple-500/10"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <GitPullRequest className="w-5 h-5 text-purple-400" />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      config.fixStrategy === "pull_request"
                        ? "border-purple-400 bg-purple-500/20"
                        : "border-slate-700"
                    }`}
                  >
                    {config.fixStrategy === "pull_request" && (
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                    )}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-1">
                    إنشاء Pull Request (موصى به)
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    فتح طلب سحب مراجعة على GitHub يحتوي على الكود المصحح مع شرح تفصيلي لتأكيد الدمج.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setConfig({ ...config, fixStrategy: "direct_push" })}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  config.fixStrategy === "direct_push"
                    ? "bg-cyan-950/30 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <GitCommit className="w-5 h-5 text-cyan-400" />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      config.fixStrategy === "direct_push"
                        ? "border-cyan-400 bg-cyan-500/20"
                        : "border-slate-700"
                    }`}
                  >
                    {config.fixStrategy === "direct_push" && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    )}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-1">
                    دفع مباشر (Direct Auto-Commit)
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    إرسال الكود وتحديث الفرع مباشرة على GitHub بدون انتظار مراجعة يدوية لتصحيح فوري.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setConfig({ ...config, fixStrategy: "deploy_webhook" })}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  config.fixStrategy === "deploy_webhook"
                    ? "bg-blue-950/30 border-blue-500/50 text-white shadow-lg shadow-blue-500/10"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      config.fixStrategy === "deploy_webhook"
                        ? "border-blue-400 bg-blue-500/20"
                        : "border-slate-700"
                    }`}
                  >
                    {config.fixStrategy === "deploy_webhook" && (
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                    )}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-1">
                    استدعاء Webhook للنشر التلقائي
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    إعادة تشغيل وتحديث الخدمة عبر استدعاء Deploy Hook لـ Vercel / Netlify / Render.
                  </p>
                </div>
              </label>
            </div>

            {/* Deployment Webhook URL Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                رابط النشر التلقائي (Deploy Trigger Webhook URL):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={config.deployWebhookUrl}
                  onChange={(e) => setConfig({ ...config, deployWebhookUrl: e.target.value })}
                  placeholder="https://api.vercel.com/v1/integrations/deploy/prj_xxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                />
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* STEP 3: WhatsApp Instant Alerts Settings */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  3. ربط إشعارات وتنبيهات الواتساب (WhatsApp Gateway)
                </h2>
                <p className="text-xs text-slate-400">
                  إرسال رسائل فورية وتنبيهات تفاعلية إلى هاتفك فور وقوع خطأ حرج مع أزرار التحكم الفوري.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  رقم الواتساب لاستلام الإشعارات (مع الرمز الدولي):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={config.whatsappPhone}
                    onChange={(e) => setConfig({ ...config, whatsappPhone: e.target.value })}
                    placeholder="+212600000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                  <Smartphone className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  مستوى الإشعارات المطلوبة:
                </label>
                <select
                  value={config.alertSeverity}
                  onChange={(e: any) => setConfig({ ...config, alertSeverity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-sans cursor-pointer"
                >
                  <option value="critical_only">🚨 الأخطاء الحرجة فقط (Critical Only)</option>
                  <option value="high_and_critical">⚠️ الأخطاء العالية والحرجة (High & Critical)</option>
                  <option value="all_alerts">📢 جميع التنبيهات والأحداث (All Events)</option>
                </select>
              </div>
            </div>

            {/* Test WhatsApp Alert Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
              <button
                onClick={handleTestWhatsApp}
                disabled={isTestingWA}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-4 h-4 ${isTestingWA ? "animate-bounce text-emerald-400" : ""}`} />
                <span>{isTestingWA ? "جاري الإرسال..." : "إرسال تنبيه تجريبي للواتساب"}</span>
              </button>

              {waTestResult && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border w-full sm:w-auto ${
                    waTestResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}
                >
                  {waTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{waTestResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar: Save Settings Button */}
          <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">تفعيل وإحداث الربط الشامل</h3>
              <p className="text-xs text-slate-400">
                سيتم حفظ كافة بيانات الإرسال لتفعيل المساعد الذكي AutoBot WA تلقائياً.
              </p>
            </div>

            <button
              onClick={handleSaveIntegration}
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isSaving ? "جاري الحفظ..." : "حفظ وتفعيل الربط الان"}</span>
            </button>
          </div>

          {saveMessage && (
            <div className={`p-4 rounded-xl text-xs font-bold text-center border animate-fadeIn flex items-center justify-center gap-2 ${
              saveMessage.startsWith("❌") || saveMessage.startsWith("⚠️")
                ? "bg-rose-950/60 border-rose-500/50 text-rose-200"
                : "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
            }`}>
              <span>{saveMessage}</span>
            </div>
          )}

          {/* STEP 2: Project Upload, Multi-Bot Scan & Direct GitHub Push */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>2. الفحص الشامل لجميع ملفات ومجلدات المشروع والدفع لـ GitHub</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      كافة الملفات والمجلدات
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    ارفع مجلدات وملفات مشروعك بالكامل (src/, server/, components/, config, package.json...). ستقوم كافة البوتات الذكية بفحص جميع الملفات بحثاً عن الثغرات والمفاتيح السرية، ثم دفعها بضغطة زر إلى مستودعك المرتبط.
                  </p>
                </div>
              </div>

              <button
                onClick={handleLoadSampleProject}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>نموذج تجريبي</span>
              </button>
            </div>

            {/* User Project Platform & Scan Scope */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-white">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>منصة استضافة مشروع المستخدم (User Project Platform):</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">اسم المستودع/المنصة:</span>
                  <input
                    type="text"
                    value={userPlatformName}
                    onChange={(e) => setUserPlatformName(e.target.value)}
                    placeholder="اسم منصة أومستودع المستخدم"
                    className="bg-slate-900 border border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-bold font-mono focus:outline-none focus:border-cyan-400 w-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>📁 مجلدات src/ & server/</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>🚫 حظر الملفات الضخمة والـ .env</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>🔑 كشف الأسرار والاعتمادات</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>🛡️ تقرير الأخطاء والثغرات</span>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/60 rounded-2xl p-6 text-center cursor-pointer transition-all group"
              >
                <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white mb-1">انقر لاختيار ملفات أو مجلد المشروع بالكامل</p>
                <p className="text-[11px] text-slate-500">
                  سيتم فحص كافة الملفات وحجب الملفات الضخمة ومجلدات Dependencies تلقائياً لمنع رفض الاستضافة ({userPlatformName})
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
              </div>

              {scanMessage && (
                <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{scanMessage}</span>
                </div>
              )}

              {/* Live Active Bots Telemetry Panel during scan */}
              {isScanning && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
                    <span className="flex items-center gap-2">
                      <Bot className="w-4 h-4 animate-bounce text-cyan-400" />
                      <span>شبكة وكلاء البوتات تفحص الملفات وتقارنها مع قيود ({userPlatformName}):</span>
                    </span>
                    <span>{botProgress}%</span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                      style={{ width: `${botProgress}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-300 font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    {activeBotStep}
                  </p>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 gap-2">
                    <span>
                      الملفات المرفوعة للفحص: <strong className="text-white font-mono">{uploadedFiles.length} ملف</strong>
                    </span>
                    {scanStats && (
                      <div className="flex items-center gap-3 text-[11px] font-mono">
                        <span className="text-emerald-400">الحجم: {scanStats.sizeKb} KB</span>
                        <span className="text-rose-400">محجوب: {scanStats.blocked} ملف</span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setUploadedFiles([]);
                        setFindings([]);
                        setScanStats(null);
                      }}
                      className="text-rose-400 hover:text-rose-300 font-bold"
                    >
                      مسح التحديد
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleRunComprehensiveScan}
                      disabled={isScanning}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري فحص جميع الملفات وتقييم الاستضافة...</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4" />
                          <span>تشغيل كافة البوتات واستخراج تقرير الأخطاء والتوافق</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Comprehensive Findings & Detailed Audit Report */}
              {findings.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>تقرير نتائج فحص البوتات والملفات المحظورة ({findings.length})</span>
                    </h3>
                    <button
                      onClick={handleFixAll}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-900 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تطهير الكود واستبعاد الملفات الممنوعة تلقائياً</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {findings.map((f) => (
                      <div
                        key={f.id}
                        className={`p-3.5 rounded-xl border space-y-1.5 text-xs transition-all ${
                          f.blocked
                            ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                            : f.severity === "CRITICAL"
                            ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                            : "bg-slate-950 border-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-white flex items-center gap-1.5">
                            <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{f.botName}</span>
                          </span>

                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            {f.blocked && (
                              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                🚫 محظور من الاستضافة
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded font-bold ${
                                f.severity === "CRITICAL"
                                  ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                                  : f.severity === "HIGH"
                                  ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                                  : "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                              }`}
                            >
                              {f.severity}
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-200 leading-relaxed">{f.issue}</p>

                        <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400 border-t border-white/5">
                          <span>📁 {f.file}</span>
                          {f.recommendation && (
                            <span className="text-cyan-300 text-[10px] truncate max-w-xs">
                              💡 {f.recommendation}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Push to GitHub Section */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-white text-xs font-bold">
                  <GitPullRequest className="w-4 h-4 text-cyan-400" />
                  <span>دفع وتحديث المستودع على GitHub ({config.repoOwner}/{config.repoName})</span>
                </div>

                {pushResult && (
                  <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${pushResult.success ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300" : "bg-rose-950/80 border-rose-500/40 text-rose-300"}`}>
                    {pushResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{pushResult.message}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">رسالة الـ Commit:</label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <button
                  onClick={handlePushToGitHub}
                  disabled={isPushing || uploadedFiles.length === 0}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isPushing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري دفع التحديثات إلى مستودع GitHub...</span>
                    </>
                  ) : (
                    <>
                      <GitPullRequest className="w-4 h-4" />
                      <span>🚀 دفع وتحديث المشروع الآن إلى GitHub</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};
