"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardCopy,
  FileText,
  Globe,
  Languages,
  LoaderCircle,
  LogIn,
  Mic,
  MicOff,
  NotebookText,
  Plus,
  Save,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  Waves,
  Zap,
  ShieldCheck,
  MessageSquare,
  Paperclip,
  Bug,
  CloudRain,
  LineChart,
  MoreVertical,
  Send,
  User,
  CheckCircle2,
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useToast } from "@/components/system/AppProviders";
import {
  askRagAssistant,
  deleteChatSession,
  getChatSession,
  getChatSessions,
  saveChatSession,
  speakText,
  translateAssistantText,
} from "@/utils/api";

// ─── constants ────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: "ur", name: "Urdu",    label: "اردو",   dir: "rtl", speech: "ur-PK" },
  { code: "pa", name: "Punjabi", label: "پنجابی", dir: "rtl", speech: "ur-PK" },
  { code: "en", name: "English", label: "English", dir: "ltr", speech: "en-US" },
];

const WELCOME = {
  ur: "السلام علیکم۔ فصل، بیماری، آبپاشی، کھاد، منڈی یا موسمی فیصلوں سے متعلق سوال پوچھیے۔",
  pa: "السلام علیکم۔ فصل، بیماری، پانی، کھاد یا منڈی بارے سوال پچھو، میں عملی مدد دیواں گا۔",
  en: "Ask about crops, pests, irrigation, fertilizer, or farm decisions and I will answer with source-backed guidance.",
};

const PROMPTS = {
  ur: [
    "کپاس کے پتے مڑنے لگیں تو پہلے کیا دیکھوں؟",
    "گلابی سنڈی کے ابتدائی آثار کیا ہیں؟",
    "بارش کے بعد آبپاشی کا فیصلہ کیسے کروں؟",
  ],
  pa: [
    "روئی دے پتّے مڑن لگن تاں سب توں پہلا کیہڑا چیک کراں؟",
    "گلابی سنڈی دے شروع دے نشان کی نیں؟",
    "بارش توں بعد پانی کدوں دینا چاہیدا اے؟",
  ],
  en: [
    "What should a cotton farmer check first when leaves start curling?",
    "How can I distinguish pest damage from nutrient stress?",
    "What should I review after unexpected rain in cotton fields?",
  ],
};

const SOURCE_THEME = [
  "from-blue-600 via-cyan-500 to-teal-400",
  "from-violet-600 via-blue-500 to-cyan-400",
];

const CAPABILITIES = [
  {
    icon: Globe,
    title: "3 Languages",
    body: "Ask in Urdu, Punjabi Shahmukhi, or English. Get answers in any language you choose.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: BookOpen,
    title: "Source-Backed",
    body: "Every answer cites real agricultural documents — OCR'd from trusted Pakistani farming guides.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Mic,
    title: "Voice Input",
    body: "Speak your question instead of typing. Full browser speech recognition support.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: Volume2,
    title: "Listen Aloud",
    body: "Have any answer read to you in your language using natural text-to-speech audio.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const RAG_STEPS = [
  { num: "1", label: "You ask a question",   sub: "In Urdu, Punjabi, or English" },
  { num: "2", label: "AI searches documents", sub: "Top 5 matching sources retrieved instantly" },
  { num: "3", label: "GPT-4o reads context",  sub: "Answers using only real source content" },
  { num: "4", label: "Cited answer returned", sub: "With document page references shown" },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function getLanguageMeta(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}

function createWelcomeMessage(language) {
  return {
    id: `welcome-${language}`,
    sender: "assistant",
    text: WELCOME[language] || WELCOME.ur,
    language,
    createdAt: new Date().toISOString(),
    sources: [],
    translations: {},
    isWelcome: true,
  };
}

function getStoredAuth() {
  if (typeof window === "undefined") return { token: null, user: null };
  const token =
    window.localStorage.getItem("token") || window.sessionStorage.getItem("token");
  const user =
    window.localStorage.getItem("user") || window.sessionStorage.getItem("user");
  if (!token || !user) return { token: null, user: null };
  try {
    return { token, user: JSON.parse(user) };
  } catch {
    return { token: null, user: null };
  }
}

function buildTitle(messages) {
  return (
    messages.find((m) => m.sender === "user")?.text?.slice(0, 72) ||
    "AgriSense chat"
  );
}

function formatTime(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatRelative(value) {
  if (!value) return "now";
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getSourceStrength(source, index, total) {
  const numeric = Number(
    source?.score ?? source?.similarity ?? source?.confidence ?? 0
  );
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.max(18, Math.min(100, Math.round(numeric <= 1 ? numeric * 100 : numeric)));
  }
  const falloff = total > 1 ? index / (total - 1) : 0;
  return Math.max(36, Math.round(100 - falloff * 42));
}

// ─── sub-components ───────────────────────────────────────────────────────────

function LoadingTranscript() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="w-full max-w-2xl rounded-[1.8rem] bg-[linear-gradient(90deg,rgba(53,90,60,0.96),rgba(95,141,88,0.93),rgba(126,166,108,0.92))] px-5 py-4 text-white shadow-[0_18px_40px_rgba(53,90,60,0.18)]">
          <div className="skeleton-line h-3 w-28 bg-white/25" />
          <div className="skeleton-line mt-4 h-3 w-[92%] bg-white/25" />
          <div className="skeleton-line mt-3 h-3 w-[78%] bg-white/25" />
        </div>
      </div>
      <div className="flex justify-start">
        <div className="w-full max-w-3xl rounded-[1.8rem] border border-emerald-100 bg-[linear-gradient(180deg,rgba(239,244,234,0.94),rgba(226,234,220,0.94))] px-5 py-4 shadow-[0_16px_40px_rgba(95,141,88,0.08)]">
          <div className="skeleton-line h-3 w-36" />
          <div className="skeleton-line mt-4 h-3 w-[94%]" />
          <div className="skeleton-line mt-3 h-3 w-[88%]" />
          <div className="skeleton-line mt-3 h-3 w-[73%]" />
        </div>
      </div>
    </div>
  );
}

function SourceMatrix({ sources }) {
  if (!sources?.length) return null;
  return (
    <div className="rounded-[1.6rem] border border-emerald-100 bg-slate-100/76 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-950">Sources</div>
        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {sources.length} refs
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {sources.slice(0, 4).map((source, index, list) => {
          const strength = getSourceStrength(source, index, list.length);
          return (
            <div
              key={`${source.source || "source"}-${index}`}
              className="rounded-[1.25rem] border border-emerald-100 bg-slate-100/84 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-950">
                    {(source.source || "Document").slice(0, 46)}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {source.page ? `page ${source.page}` : "knowledge source"}
                  </div>
                </div>
                <div className="rounded-full border border-emerald-100 bg-slate-200/80 px-3 py-1 text-xs text-slate-600">
                  {strength}%
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${SOURCE_THEME[index % SOURCE_THEME.length]}`}
                  style={{ width: `${strength}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MessageCard({
  message,
  playingId,
  audioLoadingId,
  onSpeak,
  onTranslate,
  translatingId,
  onCopy,
  copiedId,
}) {
  const language = getLanguageMeta(message.language);
  const isAssistant = message.sender === "assistant";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-3xl rounded-[1.8rem] px-6 py-5 ${
          isAssistant
            ? "border border-emerald-100 bg-white text-slate-900 )]"
            : "bg-[linear-gradient(90deg,rgba(53,90,60,0.96),rgba(95,141,88,0.93),rgba(126,166,108,0.92))] text-white shadow-[0_18px_40px_rgba(53,90,60,0.18)]"
        }`}
      >
        <div
          className={`flex items-center gap-2 text-xs uppercase tracking-[0.16em] font-medium ${
            isAssistant ? "text-slate-400" : "text-white/70"
          }`}
        >
          <span>{isAssistant ? "Assistant" : "You"}</span>
          <span>•</span>
          <span>{language.name}</span>
          <span>•</span>
          <span>{formatTime(message.createdAt)}</span>
        </div>

        <div dir={language.dir} className="mt-3 whitespace-pre-wrap text-[15px] leading-7">
          {message.text}
        </div>

        {message.activeTranslation ? (
          <div className="mt-4 rounded-[1.2rem] border border-emerald-100 bg-slate-100/75 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-400 font-medium">
              {getLanguageMeta(message.activeTranslation.language).name} translation
            </div>
            <div
              dir={getLanguageMeta(message.activeTranslation.language).dir}
              className="mt-2 text-base leading-8 text-slate-600"
            >
              {message.activeTranslation.text}
            </div>
          </div>
        ) : null}

        {isAssistant && message.sources?.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.sources.slice(0, 4).map((source, index) => (
              <span
                key={`${source.source || "source"}-${index}`}
                className="data-chip"
              >
                {(source.source || "Document").slice(0, 34)}
                {source.page ? ` | p.${source.page}` : ""}
              </span>
            ))}
          </div>
        ) : null}

        {isAssistant && !message.isWelcome ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {/* listen */}
            <button
              type="button"
              onClick={() => onSpeak(message)}
              className="button-secondary px-4 py-2.5 text-sm"
            >
              {audioLoadingId === message.id ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : playingId === message.id ? (
                <Square className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              {playingId === message.id ? "Stop" : "Listen"}
            </button>

            {/* copy */}
            <button
              type="button"
              onClick={() => onCopy(message.id, message.text)}
              className="button-secondary px-4 py-2.5 text-sm"
            >
              {copiedId === message.id ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <ClipboardCopy className="h-4 w-4" />
              )}
              {copiedId === message.id ? "Copied!" : "Copy"}
            </button>

            {/* translate */}
            {LANGUAGES.filter((l) => l.code !== message.language).map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => onTranslate(message.id, lang.code)}
                className="button-secondary bg-transparent px-4 py-2.5 text-sm text-slate-700"
              >
                {translatingId === `${message.id}:${lang.code}` ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Languages className="h-4 w-4" />
                )}
                {lang.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

function EmptyChatState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] px-4 py-8 text-center">
      <div className="relative w-40 h-40 mb-5">
        <Image
          src="/assistant-empty-chat.png"
          fill
          className="object-contain"
          alt="Ask a question"
        />
      </div>
      <div className="font-display text-xl text-slate-900">Ask your first question</div>
      <div className="mt-2 max-w-sm text-sm leading-7 text-slate-500">
        Type below or tap a suggestion to get expert farm guidance in seconds.
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AssistantContent() {
  const { pushToast } = useToast();

  // ── state ──
  const [inputLanguage, setInputLanguage]     = useState("ur");
  const [responseLanguage, setResponseLanguage] = useState("ur");
  const [messages, setMessages]               = useState([createWelcomeMessage("ur")]);
  const [input, setInput]                     = useState("");
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const [token, setToken]                     = useState(null);
  const [user, setUser]                       = useState(null);
  const [sessionId, setSessionId]             = useState(null);
  const [savedSessions, setSavedSessions]     = useState([]);
  const [showAuthModal, setShowAuthModal]     = useState(false);
  const [isListening, setIsListening]         = useState(false);
  const [translatingId, setTranslatingId]     = useState(null);
  const [audioLoadingId, setAudioLoadingId]   = useState(null);
  const [playingId, setPlayingId]             = useState(null);
  const [copiedId, setCopiedId]               = useState(null);
  const [sidebarOpen, setSidebarOpen]         = useState(false);

  // ── refs ──
  const recognitionRef = useRef(null);
  const audioRef       = useRef(null);
  const audioUrlRef    = useRef(null);
  const messagesEndRef = useRef(null);

  // ── derived ──
  const assistantReplies = useMemo(
    () => messages.filter((m) => m.sender === "assistant" && !m.isWelcome),
    [messages]
  );
  const latestAssistant = assistantReplies[assistantReplies.length - 1] || null;
  const sourceStats     = latestAssistant?.sources || [];
  const hasRealMessages = messages.some((m) => !m.isWelcome);

  // ── effects ──
  useEffect(() => {
    const auth = getStoredAuth();
    setToken(auth.token);
    setUser(auth.user);
    if (auth.token) refreshSessions(auth.token);
    return () => {
      recognitionRef.current?.stop();
      stopAudio();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── handlers ──
  const refreshSessions = async (nextToken) => {
    try {
      const data = await getChatSessions(nextToken);
      setSavedSessions(data.sessions || []);
    } catch {}
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setPlayingId(null);
    setAudioLoadingId(null);
  };

  const persistMessages = async (nextMessages, nextLanguage, currentSessionId) => {
    if (!token) return;
    const payload = {
      token,
      sessionId: currentSessionId,
      title: buildTitle(nextMessages),
      language: nextLanguage,
      messages: nextMessages
        .filter((m) => !m.isWelcome)
        .map((m) => ({
          sender: m.sender,
          text: m.text,
          language: m.language,
          sources: m.sources || [],
          createdAt: m.createdAt,
        })),
    };
    try {
      let data;
      try {
        data = await saveChatSession(payload);
      } catch (saveError) {
        if (currentSessionId) {
          data = await saveChatSession({ ...payload, sessionId: null });
        } else {
          throw saveError;
        }
      }
      if (data?.session?.id) setSessionId(data.session.id);
      await refreshSessions(token);
    } catch {}
  };

  const handleManualSave = async () => {
    await persistMessages(messages, responseLanguage, sessionId);
    pushToast({
      title: "Conversation saved",
      message: "This thread is now in your saved sessions.",
      type: "success",
    });
  };

  const handleNewConversation = () => {
    stopAudio();
    setSessionId(null);
    setMessages([createWelcomeMessage(responseLanguage)]);
    setInput("");
    setError("");
    pushToast({
      title: "Fresh conversation started",
      message: "Clean workspace ready for a new question.",
      type: "info",
    });
  };

  const handlePromptInsert = (text) => setInput(text);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: input.trim(),
      language: inputLanguage,
      createdAt: new Date().toISOString(),
      sources: [],
      translations: {},
    };

    const chatHistory = messages
      .filter((m) => !m.isWelcome)
      .slice(-8)
      .map((m) => ({ sender: m.sender, text: m.text, language: m.language }));

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await askRagAssistant({
        question: userMessage.text,
        language: responseLanguage,
        chatHistory,
      });

      const assistantMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        text: response.answer,
        language: response.language || responseLanguage,
        createdAt: new Date().toISOString(),
        sources: response.sources || [],
        translations: {},
      };

      const updatedMessages = [...nextMessages, assistantMessage];
      setMessages(updatedMessages);
      await persistMessages(updatedMessages, assistantMessage.language, sessionId);

      if (
        !token &&
        updatedMessages.filter((m) => m.sender === "assistant" && !m.isWelcome).length >= 2
      ) {
        setShowAuthModal(true);
      }
    } catch (sendError) {
      setError(sendError.message || "The assistant could not answer right now.");
      pushToast({
        title: "Assistant unavailable",
        message: sendError.message || "Could not get an answer.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTranslate = async (messageId, languageCode) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;
    setTranslatingId(`${messageId}:${languageCode}`);
    setError("");
    try {
      const translated = await translateAssistantText({
        text: message.text,
        language: languageCode,
      });
      setMessages((cur) =>
        cur.map((m) =>
          m.id === messageId
            ? {
                ...m,
                translations: {
                  ...(m.translations || {}),
                  [languageCode]: translated.translation,
                },
                activeTranslation: {
                  language: languageCode,
                  text: translated.translation,
                },
              }
            : m
        )
      );
      pushToast({
        title: `Translated to ${getLanguageMeta(languageCode).name}`,
        message: "Translation shown inside the message card.",
        type: "success",
      });
    } catch (translateError) {
      setError(translateError.message || "Translation failed.");
      pushToast({
        title: "Translation failed",
        message: translateError.message || "Could not translate this answer.",
        type: "error",
      });
    } finally {
      setTranslatingId(null);
    }
  };

  const handleCopy = (messageId, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSpeak = async (message) => {
    if (playingId === message.id) {
      stopAudio();
      return;
    }
    stopAudio();
    setAudioLoadingId(message.id);
    setError("");
    try {
      const blob = await speakText({ text: message.text, language: message.language });
      const url  = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current    = audio;
      audioUrlRef.current = url;
      setPlayingId(message.id);
      setAudioLoadingId(null);
      audio.onended = stopAudio;
      audio.onerror = () => {
        stopAudio();
        setError("Audio playback failed.");
      };
      await audio.play();
    } catch (audioError) {
      stopAudio();
      setError(audioError.message || "Could not generate audio.");
      pushToast({
        title: "Audio unavailable",
        message: audioError.message || "The TTS request did not complete.",
        type: "error",
      });
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang              = getLanguageMeta(inputLanguage).speech;
    recognition.interimResults    = false;
    recognition.maxAlternatives   = 1;
    recognition.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript || "";
      setInput((cur) => `${cur} ${transcript}`.trim());
    };
    recognition.onend  = () => setIsListening(false);
    recognition.onerror = () => {
      setError("Voice input stopped before capturing a result.");
      setIsListening(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setError("");
    setIsListening(true);
  };

  const handleLoadSession = async (id) => {
    if (!token) return;
    setLoading(true);
    stopAudio();
    setError("");
    try {
      const data    = await getChatSession({ token, sessionId: id });
      const session = data.session;
      const restoredMessages = (session.messages || []).map((m, index) => ({
        id: m.id || `${id}-${index}`,
        sender: m.sender,
        text: m.text,
        language: m.language || session.language || "ur",
        createdAt: m.createdAt,
        sources: m.sources || [],
        translations: {},
      }));
      setSessionId(id);
      setInputLanguage(session.language || "ur");
      setResponseLanguage(session.language || "ur");
      setMessages(
        restoredMessages.length
          ? restoredMessages
          : [createWelcomeMessage(session.language || "ur")]
      );
    } catch (loadError) {
      setError(loadError.message || "Could not load that conversation.");
      pushToast({
        title: "Could not load session",
        message: loadError.message || "The saved conversation could not be restored.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!token) return;
    try {
      await deleteChatSession({ token, sessionId: id });
      setSavedSessions((cur) => cur.filter((s) => s.id !== id));
      if (sessionId === id) handleNewConversation();
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete that conversation.");
      pushToast({
        title: "Delete failed",
        message: deleteError.message || "The session could not be deleted.",
        type: "error",
      });
    }
  };

  const handleAuthSuccess = async (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    await refreshSessions(nextToken);
    await persistMessages(messages, responseLanguage, sessionId);
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <Image
          src="/assistant-hero-bg.png"
          alt="Farmer using AgriSense AI assistant in cotton field"
          fill
          priority
          className="object-cover object-center"
        />
        {/* overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        <div className="relative w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* left — headline */}
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/15 backdrop-blur-sm px-4 py-2 text-xs font-semibold uppercase tracking-widest text-green-300 mb-5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                AI Agriculture Assistant
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-[clamp(2rem,5.5vw,4.4rem)] font-extrabold leading-[1.1] tracking-tight text-white"
              >
                Ask in Urdu.<br />
                Think in Punjabi.<br />
                <span className="text-green-400">Farm smarter.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.22 }}
                className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base leading-7 sm:leading-8 text-slate-300"
              >
                Source-backed answers from real agricultural documents. Ask in{" "}
                <span className="text-green-400 font-semibold">
                  Urdu, Punjabi, or English
                </span>{" "}
                — get expert farm guidance instantly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.32 }}
                className="mt-7 sm:mt-8 flex flex-wrap gap-3"
              >
                <a
                  href="#chat"
                  className="inline-flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-400 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Bot className="h-4 w-4" />
                  Start asking
                  <ChevronRight className="h-4 w-4" />
                </a>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-5 py-3 text-sm font-semibold text-white">
                  🎤 Voice enabled
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.44 }}
                className="mt-6 flex flex-wrap gap-5 text-sm text-slate-300"
              >
                {["3 Languages", "Source-Backed Answers", "Free to Use"].map((b) => (
                  <span key={b} className="flex items-center gap-1.5">
                    <span className="text-green-400">✓</span>
                    {b}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* right — floating chat preview */}
            <div className="relative hidden lg:flex justify-center items-center h-[65vh] max-h-[680px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative h-full max-h-[560px] w-[270px]"
              >
                <Image
                  src="/assistant-chat-preview.png"
                  alt="AgriSense AI chat preview"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
              </motion.div>

              {/* floating — AI thinking */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: [0, -8, 0],
                }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.6 },
                  y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
                }}
                className="absolute top-10 right-2 w-48 rounded-2xl border border-white/30 bg-white/90 backdrop-blur-md shadow-xl px-4 py-3"
              >
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  AI thinking
                </div>
                <div className="flex gap-1.5 mt-2 items-center">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-2.5 h-2.5 rounded-full bg-green-500 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* floating — sources found */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: [0, 8, 0],
                }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.8 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
                }}
                className="absolute bottom-20 right-2 w-48 rounded-2xl border border-white/30 bg-white/90 backdrop-blur-md shadow-xl px-4 py-3"
              >
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
                  Sources found
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <div className="text-sm font-bold text-slate-900">5 documents</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* stats bar */}
        <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-md border-t border-white/10">
          <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32 py-4 sm:py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              ["اردو",    "Urdu Language"],
              ["پنجابی", "Punjabi Shahmukhi"],
              ["English", "English Language"],
              ["🎤",      "Voice Input"],
            ].map(([val, label]) => (
              <div key={label} className="flex items-center gap-3 sm:gap-4">
                <div className="text-green-400 text-2xl">⚡</div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold text-white">{val}</div>
                  <div className="text-xs sm:text-sm text-slate-400">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CAPABILITIES
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-12 lg:py-16">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32">
          <div className="text-center mb-8 lg:mb-10">
            <div className="inline-flex items-center gap-2 text-green-600 font-semibold text-xs mb-2">
              🌿 What the assistant can do
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
              Built for <span className="text-green-500">real farm questions</span>
            </h2>
            <p className="mt-3 text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
              Not a generic chatbot — tuned specifically for cotton, irrigation,
              pest control, and soil health in Pakistan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={cap.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${cap.bg} mb-4`}>
                    <Icon className={`h-6 w-6 ${cap.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{cap.title}</h3>
                  <p className="text-sm text-slate-500 leading-7">{cap.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          KNOWLEDGE BASE (dark section)
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        <Image
          src="/assistant-knowledge-bg.png"
          alt="Knowledge base visualization"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-900/60" />

        <div className="relative w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* left — explanation */}
            <div>
              <div className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                HOW THE AI KNOWS
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-6">
                Powered by real<br />
                <span className="text-green-400">agricultural documents</span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-8 mb-8">
                Our AI reads and indexes OCR&apos;d farming guides, pest management manuals,
                and irrigation documents from Pakistan. Every answer is grounded in this
                knowledge — not hallucinated.
              </p>

              <div className="space-y-4">
                {RAG_STEPS.map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.12 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white font-extrabold text-sm shadow-lg shadow-green-500/30">
                      {step.num}
                    </div>
                    <div>
                      <div className="text-base font-bold text-white">{step.label}</div>
                      <div className="mt-1 text-sm text-slate-400">{step.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* right — feature tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                ["📄", "OCR Processed",   "Urdu PDF documents scanned and parsed"],
                ["🔍", "Vector Search",   "Semantic similarity matching in milliseconds"],
                ["🤖", "GPT-4o Mini",     "Industry-leading language model for answers"],
                ["📌", "Source Citations","Every answer references its document page"],
              ].map(([emoji, title, body]) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-white/10 bg-white/8 backdrop-blur-sm p-5 hover:bg-white/12 transition-colors"
                >
                  <div className="text-2xl mb-3">{emoji}</div>
                  <div className="text-sm font-bold text-white mb-1">{title}</div>
                  <div className="text-xs text-slate-400 leading-relaxed">{body}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CHAT SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section id="chat" className="section-cream pt-8 pb-20">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32">
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start relative">

            {/* Sidebar drawer overlay for mobile */}
            {sidebarOpen && (
              <div
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-sm xl:hidden"
              />
            )}

            <aside
              className={`panel rounded-[2.2rem] p-7 space-y-6 bg-white border border-slate-100/80 shadow-md flex flex-col justify-between overflow-hidden transition-all duration-300 z-40 xl:z-10
                fixed inset-y-0 left-0 w-[320px] h-full transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                xl:translate-x-0 xl:static xl:w-auto xl:h-[860px] xl:sticky xl:top-28`}
            >
              
              <div className="space-y-6">
                {/* Brand logo & close button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <Bot className="h-5 w-5" />
                    </div>
                    <span className="font-display text-lg font-bold text-slate-900">Agri Assistant</span>
                  </div>
                  {/* Close drawer button on mobile */}
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="xl:hidden flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Headline */}
                <h1 className="font-display text-[2rem] font-extrabold text-slate-900 leading-tight">
                  Ask like a <span className="text-emerald-700 relative inline-block">farmer<span className="absolute left-0 bottom-[-2px] w-full h-[3px] bg-emerald-500 rounded-full" /></span>, not a search form.
                </h1>

                {/* Language Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 block">
                    LANGUAGE (زبان)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                      <Globe className="h-4 w-4" />
                    </div>
                    <select
                      value={responseLanguage}
                      onChange={(e) => {
                        setResponseLanguage(e.target.value);
                        setInputLanguage(e.target.value);
                      }}
                      className="w-full rounded-xl border border-slate-100 bg-white py-3 pl-10 pr-8 text-base font-semibold text-slate-700 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer appearance-none"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 pl-1 font-medium mt-1">
                    {responseLanguage === "ur" ? "اردو میں جواب حاصل کریں" : responseLanguage === "pa" ? "پنجابی وچ جواب پاؤ" : "Get answers in English"}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      handleNewConversation();
                      setSidebarOpen(false);
                    }}
                    className="w-full justify-center py-3 text-sm font-bold rounded-[999px] flex items-center gap-2 text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #1e3528 0%, #2d6a4f 45%, #40916c 100%)",
                      boxShadow: "0 4px 20px rgba(30,53,40,0.35), inset 0 1px 0 rgba(255,255,255,0.12)"
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    New Conversation
                  </button>
                  {!user ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAuthModal(true);
                        setSidebarOpen(false);
                      }}
                      className="button-secondary w-full justify-center py-3 text-sm font-bold border border-slate-100 bg-white shadow-sm"
                    >
                      <User className="h-4 w-4" />
                      Login to save chats
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        handleManualSave();
                        setSidebarOpen(false);
                      }}
                      className="button-secondary w-full justify-center py-3 text-sm font-bold border border-slate-100 bg-white shadow-sm"
                    >
                      <Save className="h-4 w-4" />
                      Save chat
                    </button>
                  )}
                </div>

                {/* Tools & Resources */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Tools & Resources
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link href="/disease-detection" className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-sm hover:border-emerald-200 transition">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Bug className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Crop Doctor</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setInput(inputLanguage === "ur" ? "کپاس کے لیے کھاد کا مناسب حساب کیا ہے؟" : inputLanguage === "pa" ? "کپاس لئی کھاد دا حساب دسو" : "What is the fertilizer calculator for cotton?");
                        setSidebarOpen(false);
                        pushToast({ title: "Prompt loaded", message: "Fertilizer calculator query loaded into input.", type: "info" });
                      }}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-sm hover:border-emerald-200 text-left transition"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Fertilizer Guide</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInput(inputLanguage === "ur" ? "آج موسم کیسا رہے گا؟" : inputLanguage === "pa" ? "اج موسم کیسا رہے گا؟" : "What is the weather forecast today?");
                        setSidebarOpen(false);
                        pushToast({ title: "Prompt loaded", message: "Weather forecast query loaded into input.", type: "info" });
                      }}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-sm hover:border-emerald-200 text-left transition"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <CloudRain className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Weather</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInput(inputLanguage === "ur" ? "کپاس کی تازہ ترین منڈی کی قیمتیں کیا ہیں؟" : inputLanguage === "pa" ? "کپاس دے منڈی ریٹ دسو" : "What are the latest cotton market prices?");
                        setSidebarOpen(false);
                        pushToast({ title: "Prompt loaded", message: "Market prices query loaded into input.", type: "info" });
                      }}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-sm hover:border-emerald-200 text-left transition"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <LineChart className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Market Prices</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Saved Sessions */}
              <div className="space-y-2.5 z-10">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Saved sessions</div>
                  {savedSessions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => pushToast({ title: "Sessions", message: "Use conversation items below to load past chats.", type: "info" })}
                      className="text-[10px] font-bold text-emerald-700 hover:underline"
                    >
                      View all
                    </button>
                  )}
                </div>

                {savedSessions.length === 0 ? (
                  <div className="rounded-[1.2rem] border border-slate-100 bg-slate-50/50 p-4 shadow-inner">
                    <div className="font-semibold text-slate-900 text-xs">
                      {user ? "No saved sessions yet" : "Sign in to keep history"}
                    </div>
                    <div className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                      {user
                        ? "Your recent conversations will appear here."
                        : "Login lets you return to past farm questions."}
                    </div>
                  </div>
                ) : (
                  <div className="custom-scrollbar flex gap-3 overflow-x-auto pb-1 max-h-[160px] flex-col overflow-auto pb-0">
                    {savedSessions.slice(0, 3).map((session) => (
                      <div
                        key={session.id}
                        className={`rounded-[1.2rem] border p-3 flex items-center justify-between gap-3 transition hover:border-emerald-200 ${
                          session.id === sessionId
                            ? "border-emerald-200 bg-emerald-50/40"
                            : "border-slate-100 bg-white"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            handleLoadSession(session.id);
                            setSidebarOpen(false);
                          }}
                          className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 text-[12px] leading-tight truncate">
                              {session.title || "Conversation"}
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-400">
                              {formatRelative(session.updatedAt)}
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rolling Hills Vector Decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden pointer-events-none opacity-40 select-none">
                <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,80 C100,60 150,90 300,70 L300,100 L0,100 Z" fill="#7ea66c" opacity="0.3" />
                  <path d="M0,90 C80,80 180,95 300,85 L300,100 L0,100 Z" fill="#5f8d58" opacity="0.5" />
                  <path d="M0,95 C120,90 200,98 300,92 L300,100 L0,100 Z" fill="#355a3c" />
                </svg>
              </div>
            </aside>

            {/* ── main chat app window ─────────────────────────── */}
            <div className="min-w-0 flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: "580px" }}>
              
              {/* ── Single slim controls toolbar ── */}
              <div className="mb-3 flex items-center gap-3 rounded-2xl border border-slate-100/80 bg-white/90 px-4 py-2 shadow-sm">
                {/* Status */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="hidden sm:block text-[11px] font-semibold text-slate-500">Multilingual</span>
                </div>

                <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

                {/* Question lang */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
                    {LANGUAGES.map((lang) => (
                      <button key={lang.code} type="button" onClick={() => setInputLanguage(lang.code)}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-all duration-200 ${inputLanguage === lang.code ? "bg-emerald-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

                {/* Answer lang */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
                    {LANGUAGES.map((lang) => (
                      <button key={lang.code} type="button" onClick={() => setResponseLanguage(lang.code)}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-all duration-200 ${responseLanguage === lang.code ? "bg-emerald-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile sidebar trigger */}
                <button type="button" onClick={() => setSidebarOpen(true)}
                  className="xl:hidden ml-auto flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition shrink-0">
                  <NotebookText className="h-3 w-3" />
                  Menu
                </button>
              </div>


              <div className="panel rounded-[2.2rem] flex flex-col flex-1 bg-white border border-slate-100/80 shadow-md overflow-hidden relative min-h-0">
                
                {/* Scrollable Messages Container — SourceMatrix lives INSIDE here so it scrolls with messages */}
                <div className="custom-scrollbar flex-1 min-h-0 p-5 sm:p-6 space-y-5 overflow-y-auto pr-2">
                  {!hasRealMessages ? (
                    <div className="flex flex-col items-center justify-center px-6 py-5 text-center">
                      {/* Compact illustration */}
                      <div className="relative w-24 h-24 mb-3">
                        <Image
                          src="/assistant-empty-chat.png"
                          fill
                          className="object-contain animate-float-y"
                          alt="Ask a question"
                        />
                      </div>
                      <div className="font-display text-xl text-slate-900 font-extrabold leading-tight">
                        اپنا پہلا سوال پوچھیں
                      </div>
                      <div className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-400">
                        اپنے فصل سے متعلق سوال اپنی زبان میں کریں۔
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MessageCard
                        key={message.id}
                        message={message}
                        playingId={playingId}
                        audioLoadingId={audioLoadingId}
                        onSpeak={handleSpeak}
                        onTranslate={handleTranslate}
                        translatingId={translatingId}
                        onCopy={handleCopy}
                        copiedId={copiedId}
                      />
                    ))
                  )}
                  {loading ? <LoadingTranscript /> : null}



                  <div ref={messagesEndRef} />
                </div>

                {/* Error messages */}
                {error ? (
                  <div className="mx-5 mb-3 rounded-[1.3rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                {/* Empty State Suggested Prompts */}
                {!hasRealMessages && (
                  <div className="relative px-4 py-3 bg-emerald-50/60 border-t border-emerald-100/60">
                    <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
                      {/* Card 1 */}
                      <button
                        type="button"
                        onClick={() => handlePromptInsert("پودوں پر کیڑے لگ گئے ہیں۔ کیا کروں؟")}
                        className="min-w-[200px] rounded-xl border border-emerald-100/80 bg-white px-3 py-2.5 flex items-center gap-2.5 shadow-sm hover:border-emerald-300 hover:shadow-md transition text-right shrink-0"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Bug className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-sm font-bold text-slate-800 leading-snug">پودوں پر کیڑے لگ گئے ہیں۔ کیا کروں؟</span>
                      </button>

                      {/* Card 2 */}
                      <button
                        type="button"
                        onClick={() => handlePromptInsert("کپاس میں کون سی کھاد ڈالیں؟")}
                        className="min-w-[200px] rounded-xl border border-emerald-100/80 bg-white px-3 py-2.5 flex items-center gap-2.5 shadow-sm hover:border-emerald-300 hover:shadow-md transition text-right shrink-0"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Sparkles className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-sm font-bold text-slate-800 leading-snug">کپاس میں کون سی کھاد ڈالیں؟</span>
                      </button>

                      {/* Card 3 */}
                      <button
                        type="button"
                        onClick={() => handlePromptInsert("آج موسم کیسا رہے گا؟")}
                        className="min-w-[200px] rounded-xl border border-emerald-100/80 bg-white px-3 py-2.5 flex items-center gap-2.5 shadow-sm hover:border-emerald-300 hover:shadow-md transition text-right shrink-0"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <CloudRain className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-sm font-bold text-slate-800 leading-snug">آج موسم کیسا رہے گا؟</span>
                      </button>
                    </div>
                    {/* Right-edge fade to hint scrollable overflow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-emerald-50/80 to-transparent" />
                  </div>
                )}

                {/* Suggested Questions for active chat — single scrollable row */}
                {hasRealMessages && (
                  <div className="relative px-4 py-2 border-t border-emerald-100/60 bg-emerald-50/30">
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-0.5">
                      {(PROMPTS[inputLanguage] || PROMPTS.ur).map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => handlePromptInsert(prompt)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-800 shadow-sm transition-all duration-200 whitespace-nowrap shrink-0"
                        >
                          <Sparkles className="h-3 w-3 text-emerald-500 shrink-0" />
                          {prompt}
                        </button>
                      ))}
                    </div>
                    {/* fade hint */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-emerald-50/80 to-transparent" />
                  </div>
                )}

                {/* Integrated Chat Input Bar */}
                <div className="px-4 py-3 border-t border-emerald-100/60 bg-emerald-50/30 backdrop-blur-md rounded-b-[2.2rem]">
                  <div className="flex items-end gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-emerald-400/20 focus-within:border-emerald-300 transition-all duration-300">
                    {/* Textarea — single row, auto-grows */}
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-slate-800 placeholder-slate-400/70 resize-none min-h-[28px] max-h-[160px] custom-scrollbar text-sm leading-6"
                      placeholder={
                        inputLanguage === "ur"
                          ? "یہاں اپنا سوال لکھیں..."
                          : inputLanguage === "pa"
                          ? "اپنا سوال اتھے لکھو..."
                          : "Type your crop, pest or market question..."
                      }
                    />

                    {/* Right controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Attach */}
                      <button
                        type="button"
                        onClick={() => pushToast({ title: "Attach file", message: "File attachment capability is integrated with user uploads.", type: "info" })}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                        title="Attach file"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>

                      {/* Listening indicator */}
                      {isListening && (
                        <div className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-1">
                          <Waves className="h-3 w-3 text-rose-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-rose-600">Listening…</span>
                        </div>
                      )}

                      {/* Stop audio */}
                      {playingId && (
                        <button type="button" onClick={stopAudio}
                          className="flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition">
                          <Square className="h-3 w-3" />
                          Stop
                        </button>
                      )}

                      {/* Mic */}
                      <div className="relative">
                        {isListening && (
                          <>
                            <span className="absolute inset-0 rounded-full bg-rose-400/30 animate-ping" />
                            <span className="absolute inset-[-3px] rounded-full border border-rose-400/40 animate-pulse" />
                          </>
                        )}
                        <button
                          type="button"
                          onClick={toggleListening}
                          title={isListening ? "Stop recording" : "Voice input"}
                          className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                            isListening
                              ? "border-rose-400 bg-rose-500 text-white shadow-md shadow-rose-500/30"
                              : "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Send */}
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white disabled:opacity-50 transition-all hover:scale-[1.03] active:scale-[0.97]"
                        style={{ background: "linear-gradient(135deg,#1e3528 0%,#2d6a4f 55%,#40916c 100%)", boxShadow: "0 2px 10px rgba(30,53,40,0.25)" }}
                      >
                        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {loading ? "…" : "Send"}
                      </button>
                    </div>
                  </div>

                  {/* Bottom hint */}
                  <div className="mt-1.5 flex items-center justify-between px-1">
                    <span className="text-[10px] text-slate-400">Shift+Enter for new line</span>
                    <span className="hidden sm:block text-[10px] text-slate-400">Enter to send</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      
      {/* ── Auth Modal ─────────────────────────────────────────── */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}

