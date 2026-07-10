"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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
        className={`max-w-3xl rounded-[1.8rem] px-5 py-4 ${
          isAssistant
            ? "border border-emerald-100 bg-[linear-gradient(180deg,rgba(239,244,234,0.94),rgba(226,234,220,0.94))] text-slate-900 shadow-[0_16px_40px_rgba(95,141,88,0.08)]"
            : "bg-[linear-gradient(90deg,rgba(53,90,60,0.96),rgba(95,141,88,0.93),rgba(126,166,108,0.92))] text-white shadow-[0_18px_40px_rgba(53,90,60,0.18)]"
        }`}
      >
        <div
          className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] ${
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
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              {getLanguageMeta(message.activeTranslation.language).name} translation
            </div>
            <div
              dir={getLanguageMeta(message.activeTranslation.language).dir}
              className="mt-2 text-sm leading-7 text-slate-600"
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
              className="button-secondary px-3 py-2 text-xs"
            >
              {audioLoadingId === message.id ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : playingId === message.id ? (
                <Square className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
              {playingId === message.id ? "Stop" : "Listen"}
            </button>

            {/* copy */}
            <button
              type="button"
              onClick={() => onCopy(message.id, message.text)}
              className="button-secondary px-3 py-2 text-xs"
            >
              {copiedId === message.id ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <ClipboardCopy className="h-3.5 w-3.5" />
              )}
              {copiedId === message.id ? "Copied!" : "Copy"}
            </button>

            {/* translate */}
            {LANGUAGES.filter((l) => l.code !== message.language).map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => onTranslate(message.id, lang.code)}
                className="button-secondary bg-transparent px-3 py-2 text-xs text-slate-700"
              >
                {translatingId === `${message.id}:${lang.code}` ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Languages className="h-3.5 w-3.5" />
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

        <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* left — headline */}
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/15 backdrop-blur-sm px-4 py-2 text-xs font-semibold uppercase tracking-widest text-green-300 mb-6"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                AI Agriculture Assistant
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-[clamp(2.2rem,5.5vw,4.4rem)] font-extrabold leading-[1.1] tracking-tight text-white"
              >
                Ask in Urdu.<br />
                Think in Punjabi.<br />
                <span className="text-green-400">Farm smarter.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.22 }}
                className="mt-5 max-w-xl text-sm sm:text-base leading-8 text-slate-300"
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
                className="mt-8 flex flex-wrap gap-3"
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
                className="mt-8 flex flex-wrap gap-5 text-sm text-slate-300"
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
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ["اردو",    "Urdu Language"],
              ["پنجابی", "Punjabi Shahmukhi"],
              ["English", "English Language"],
              ["🎤",      "Voice Input"],
            ].map(([val, label]) => (
              <div key={label} className="flex items-center gap-3">
                <div className="text-green-400 text-xl">⚡</div>
                <div>
                  <div className="text-base sm:text-lg font-extrabold text-white">{val}</div>
                  <div className="text-[10px] sm:text-xs text-slate-400">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CAPABILITIES
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 text-green-600 font-semibold text-sm mb-3">
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
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        <Image
          src="/assistant-knowledge-bg.png"
          alt="Knowledge base visualization"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-900/60" />

        <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* left — explanation */}
            <div>
              <div className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">
                HOW THE AI KNOWS
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-6">
                Powered by real<br />
                <span className="text-green-400">agricultural documents</span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-8 mb-10">
                Our AI reads and indexes OCR&apos;d farming guides, pest management manuals,
                and irrigation documents from Pakistan. Every answer is grounded in this
                knowledge — not hallucinated.
              </p>

              <div className="space-y-6">
                {RAG_STEPS.map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.12 }}
                    className="flex items-start gap-5"
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
            <div className="grid grid-cols-2 gap-4">
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
                  <div className="text-xs text-slate-400 leading-6">{body}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CHAT SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section id="chat" className="section-dark pt-8 pb-20">
        <div className="page-wrap">
          <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">

            {/* ── sidebar ──────────────────────────────────────── */}
            <aside className="space-y-4 xl:sticky xl:top-28 xl:h-fit">

              {/* identity panel */}
              <div className="panel rounded-[2rem] p-5">
                <div className="eyebrow">
                  <NotebookText className="h-3.5 w-3.5 text-emerald-500" />
                  assistant
                </div>
                <h1 className="section-title mt-5 text-[1.9rem]">
                  Ask like a farmer,<br />not a search form.
                </h1>

                {/* language mode tile */}
                <div className="mt-5 metric-tile rounded-[1.35rem] bg-slate-100/78">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Answer mode
                  </div>
                  <div className="mt-2 font-display text-2xl text-slate-950">
                    {getLanguageMeta(responseLanguage).label}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {getLanguageMeta(responseLanguage).name} responses
                  </div>
                </div>

                {/* action buttons */}
                <div className="mt-5 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleNewConversation}
                    className="button-primary w-full"
                  >
                    <Plus className="h-4 w-4" />
                    New conversation
                  </button>
                  {!user ? (
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(true)}
                      className="button-secondary w-full"
                    >
                      <LogIn className="h-4 w-4" />
                      Login to save chats
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleManualSave}
                      className="button-secondary w-full"
                    >
                      <Save className="h-4 w-4" />
                      Save chat
                    </button>
                  )}
                </div>
              </div>

              {/* quick feature tiles */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { emoji: "🎤", label: "Voice input"   },
                  { emoji: "🔊", label: "Listen aloud"  },
                  { emoji: "🌐", label: "3 languages"   },
                  { emoji: "📚", label: "Source-backed" },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="metric-tile rounded-[1.35rem] flex items-center gap-2 py-3"
                  >
                    <span className="text-lg">{f.emoji}</span>
                    <span className="text-xs font-medium text-slate-700">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* saved sessions */}
              <div className="rounded-[1.8rem] border border-emerald-100 bg-[rgba(244,247,240,0.76)] p-4 shadow-[0_18px_40px_rgba(95,141,88,0.08)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-slate-950">Saved sessions</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {savedSessions.length} stored
                  </div>
                </div>

                {savedSessions.length === 0 ? (
                  <div className="empty-state rounded-[1.5rem] px-4 py-5">
                    <div className="font-medium text-slate-950 text-sm">
                      {user ? "No saved sessions yet" : "Sign in to keep history"}
                    </div>
                    <div className="mt-1 text-xs leading-6 text-slate-500">
                      {user
                        ? "Conversations appear here after saving."
                        : "Login lets you return to past questions."}
                    </div>
                  </div>
                ) : (
                  <div className="custom-scrollbar flex gap-3 overflow-x-auto pb-1 xl:max-h-[28rem] xl:flex-col xl:overflow-auto xl:pb-0">
                    {savedSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`min-w-[220px] rounded-[1.35rem] border p-4 xl:min-w-0 ${
                          session.id === sessionId
                            ? "border-emerald-200 bg-emerald-50/70"
                            : "border-emerald-100 bg-slate-100/78"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleLoadSession(session.id)}
                          className="w-full text-left"
                        >
                          <div className="font-medium text-slate-950 text-sm leading-5 line-clamp-2">
                            {session.title || "Conversation"}
                          </div>
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                              {formatRelative(session.updatedAt)}
                            </span>
                            {session.language && (
                              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                                {getLanguageMeta(session.language).name}
                              </span>
                            )}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(session.id)}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* ── main chat area ───────────────────────────────── */}
            <div className="min-w-0 space-y-4">

              {/* ── language toggles panel ── */}
              <div className="panel rounded-[2rem] p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      Conversation controls
                    </div>
                    <div className="mt-1 font-display text-[1.4rem] leading-tight text-slate-950">
                      Multilingual, source-backed guidance.
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[400px]">
                    {/* question language */}
                    <div>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Question language
                      </div>
                      <div className="flex gap-2">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => setInputLanguage(lang.code)}
                            className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                              inputLanguage === lang.code
                                ? "border-emerald-400 bg-[linear-gradient(90deg,rgba(53,90,60,0.92),rgba(95,141,88,0.88))] text-white shadow-md"
                                : "border-emerald-100 bg-slate-100/70 text-slate-600 hover:border-emerald-200 hover:bg-slate-100"
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* answer language */}
                    <div>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Answer language
                      </div>
                      <div className="flex gap-2">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => setResponseLanguage(lang.code)}
                            className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                              responseLanguage === lang.code
                                ? "border-emerald-400 bg-[linear-gradient(90deg,rgba(53,90,60,0.92),rgba(95,141,88,0.88))] text-white shadow-md"
                                : "border-emerald-100 bg-slate-100/70 text-slate-600 hover:border-emerald-200 hover:bg-slate-100"
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── chat panel ── */}
              <div className="panel rounded-[2rem] p-4 md:p-5">

                {/* messages scroll area */}
                <div className="custom-scrollbar min-h-[32rem] max-h-[56vh] space-y-4 overflow-auto pr-1">
                  {!hasRealMessages ? (
                    <EmptyChatState />
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

                {/* source matrix */}
                {sourceStats.length > 0 && (
                  <div className="mt-4">
                    <SourceMatrix sources={sourceStats} />
                  </div>
                )}

                {/* error */}
                {error ? (
                  <div className="mt-4 rounded-[1.3rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                {/* ── input area ── */}
                <div className="mt-4 rounded-[1.8rem] border border-emerald-100 bg-[linear-gradient(180deg,rgba(239,244,234,0.97),rgba(226,234,220,0.97))] p-4 shadow-[0_24px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">

                  {/* suggested prompts */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(PROMPTS[inputLanguage] || PROMPTS.ur).map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handlePromptInsert(prompt)}
                        className="data-chip transition hover:border-emerald-200 hover:text-slate-950 text-left max-w-[260px]"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{prompt}</span>
                      </button>
                    ))}
                  </div>

                  {/* textarea */}
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={3}
                    className="field-input resize-none"
                    placeholder={
                      inputLanguage === "ur"
                        ? "اپنا سوال یہاں لکھیں..."
                        : inputLanguage === "pa"
                        ? "اپنا سوال اتھے لکھو..."
                        : "Type your crop, pest, irrigation, or market question..."
                    }
                  />

                  {/* bottom action bar */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">

                      {/* animated mic button */}
                      <div className="relative">
                        {isListening && (
                          <>
                            <span className="absolute inset-0 rounded-full bg-rose-400/30 animate-ping" />
                            <span className="absolute inset-[-4px] rounded-full border border-rose-400/40 animate-pulse" />
                          </>
                        )}
                        <button
                          type="button"
                          onClick={toggleListening}
                          title={isListening ? "Stop recording" : "Voice input"}
                          className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 ${
                            isListening
                              ? "border-rose-400 bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                              : "border-emerald-100 bg-[rgba(238,243,233,0.82)] text-slate-700 hover:border-emerald-200 hover:bg-[rgba(243,248,238,0.94)]"
                          }`}
                        >
                          {isListening ? (
                            <MicOff className="h-4 w-4" />
                          ) : (
                            <Mic className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {isListening && (
                        <div className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5">
                          <Waves className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                          <span className="text-xs font-medium text-rose-600">
                            Recording…
                          </span>
                        </div>
                      )}

                      {playingId && (
                        <button
                          type="button"
                          onClick={stopAudio}
                          className="button-secondary px-4 py-2 text-xs"
                        >
                          <Square className="h-3.5 w-3.5" />
                          Stop playback
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden sm:block text-xs text-slate-400">
                        Shift+Enter for new line
                      </span>
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="button-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        {loading ? "Thinking…" : "Send"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
