/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Image as ImageIcon,
  LoaderCircle,
  LogIn,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Users,
  Send,
  TrendingUp,
  Flame,
  Camera,
  Leaf,
  ChevronRight,
  Sprout,
  BarChart2,
  X,
  Filter,
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useToast } from "@/components/system/AppProviders";
import { uploadToCloudinary } from "@/utils/cloudinary";

const API_URL =
  process.env.NEXT_PUBLIC_APP_API_URL ||
  "https://agrisence-backend.onrender.com/api";

/* ─── helpers ─────────────────────────────────────────────────── */
function getStoredAuth() {
  if (typeof window === "undefined") return { token: null, user: null };
  const token =
    window.localStorage.getItem("token") ||
    window.sessionStorage.getItem("token");
  const user =
    window.localStorage.getItem("user") ||
    window.sessionStorage.getItem("user");
  if (!token || !user) return { token: null, user: null };
  try {
    return { token, user: JSON.parse(user) };
  } catch {
    return { token: null, user: null };
  }
}

function getUserId(user) {
  return user?.id || user?._id || null;
}

function timeAgo(value) {
  if (!value) return "just now";
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getInitials(name) {
  return (
    name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "FR"
  );
}

/* ─── PostCard ─────────────────────────────────────────────────── */
function PostCard({ post, currentUser, onAuthRequired, onToggleLike, onDelete, onComment }) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const isLiked = post.likes?.some((item) => item.userId === getUserId(currentUser));
  const isOwner = post.userId === getUserId(currentUser);
  const initials = getInitials(post.user?.name);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!currentUser) { onAuthRequired(); return; }
    setSubmitting(true);
    try {
      await onComment(post.id, comment.trim());
      setComment("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
    >
      {/* Post header */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.1rem] bg-gradient-to-br from-emerald-100 to-green-200 font-display text-base font-bold text-emerald-800 shadow-sm">
            {initials}
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
              Field Report
            </div>
            <div className="mt-1 font-display text-lg font-extrabold text-slate-900">
              {post.user?.name || "Farmer"}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{timeAgo(post.createdAt)}</div>
          </div>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={() => onDelete(post.id)}
            className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-6 pb-4 text-base leading-8 text-slate-700 whitespace-pre-wrap">
          {post.content}
        </div>
      )}

      {/* Media */}
      {post.mediaUrl && (
        <div className="mx-6 mb-4 overflow-hidden rounded-[1.4rem] border border-slate-100">
          {post.mediaType === "video" ? (
            <video src={post.mediaUrl} controls className="max-h-[440px] w-full bg-slate-100 object-cover" />
          ) : (
            <img src={post.mediaUrl} alt="Post media" className="max-h-[440px] w-full object-cover" />
          )}
        </div>
      )}

      {/* Actions bar */}
      <div className="px-6 pb-4 flex items-center gap-3 border-t border-slate-50 pt-4">
        <button
          type="button"
          onClick={() => (currentUser ? onToggleLike(post.id) : onAuthRequired())}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
            isLiked
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
              : "border border-slate-100 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          {post.likes?.length || 0}
        </button>

        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-emerald-200 hover:text-emerald-700 transition-all duration-200"
        >
          <MessageSquare className="h-4 w-4" />
          {post.comments?.length || 0} comments
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-3 border-t border-slate-50 pt-4 bg-emerald-50/30">
              {/* Existing comments */}
              {(post.comments || []).map((item) => (
                <div
                  key={item.id || `${item.userId}-${item.createdAt}`}
                  className="rounded-[1.2rem] bg-white border border-slate-100 px-4 py-3"
                >
                  <div className="text-sm font-bold text-slate-800">
                    {item.user?.name || "Farmer"}
                  </div>
                  <div className="mt-1 text-sm leading-7 text-slate-600">{item.text}</div>
                </div>
              ))}

              {/* Comment input */}
              <form onSubmit={submitComment} className="flex gap-3 items-end pt-1">
                <textarea
                  rows={1}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/10 transition resize-none"
                  placeholder="Add a comment..."
                />
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white disabled:opacity-50 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/25"
                >
                  {submitting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

/* ─── FeedSkeleton ─────────────────────────────────────────────── */
function FeedSkeleton() {
  return (
    <div className="space-y-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-[1.1rem] bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 rounded-full bg-slate-200" />
              <div className="h-5 w-36 rounded-full bg-slate-200" />
              <div className="h-3 w-16 rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-3 w-[92%] rounded-full bg-slate-100" />
            <div className="h-3 w-[80%] rounded-full bg-slate-100" />
            <div className="h-3 w-[68%] rounded-full bg-slate-100" />
          </div>
          <div className="mt-5 flex gap-3">
            <div className="h-9 w-20 rounded-full bg-slate-100" />
            <div className="h-9 w-28 rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── EmptyFeed ────────────────────────────────────────────────── */
function EmptyFeed() {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative w-44 h-44 mb-6">
        <Image src="/community-empty.png" fill className="object-contain" alt="No posts yet" />
      </div>
      <div className="font-display text-2xl font-extrabold text-slate-900">No reports yet</div>
      <div className="mt-3 max-w-sm text-base leading-relaxed text-slate-500">
        Be the first to share a field update, pest sighting, or crop insight with the community.
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────── */
export default function SocialPage() {
  const { pushToast } = useToast();
  const fileInputRef = useRef(null);

  const [user, setUser]               = useState(null);
  const [token, setToken]             = useState(null);
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mediaFile, setMediaFile]     = useState(null);
  const [previewUrl, setPreviewUrl]   = useState("");
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState("latest");
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const auth = getStoredAuth();
    setUser(auth.user);
    setToken(auth.token);
    fetchPosts(1, false);
  }, []);

  const fetchPosts = async (pageNumber = 1, append = false) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await fetch(`${API_URL}/posts?page=${pageNumber}&limit=10`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load posts.");
      
      if (append) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = (data.posts || []).filter((p) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      } else {
        setPosts(data.posts || []);
      }
      setHasMore(data.pagination?.hasMore || false);
      setPage(pageNumber);
    } catch (e) {
      setError(e.message || "Community backend unavailable.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...posts];
    if (filter === "popular") list.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    else if (filter === "media") list = list.filter((p) => p.mediaUrl);
    else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (!q) return list;
    return list.filter((p) =>
      p.content?.toLowerCase().includes(q) || p.user?.name?.toLowerCase().includes(q)
    );
  }, [filter, posts, search]);

  const stats = useMemo(() => {
    const growers = new Set(posts.map((p) => p.userId).filter(Boolean));
    return {
      posts: posts.length,
      growers: growers.size,
      comments: posts.reduce((t, p) => t + (p.comments?.length || 0), 0),
    };
  }, [posts]);

  const trendRows = useMemo(() => [
    { label: "Pest reports",   value: Math.min(Math.max(18, stats.posts * 7), 100),    color: "from-emerald-400 to-green-500" },
    { label: "Water concerns", value: Math.min(Math.max(14, stats.comments * 5), 100), color: "from-cyan-400 to-blue-500" },
    { label: "Market talk",    value: Math.min(Math.max(22, stats.growers * 9), 100),  color: "from-amber-400 to-orange-500" },
  ], [stats]);

  const handleAuthSuccess = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    setShowAuthModal(false);
    pushToast({ title: "Welcome!", message: "You can now post and join discussions.", type: "success" });
  };

  const handleCreatePost = async () => {
    if (!user || !token) { setShowAuthModal(true); return; }
    if (!postContent.trim() && !mediaFile) {
      setError("Write something or attach an image before posting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      let mediaUrl = null, mediaType = null;
      if (mediaFile) {
        const up = await uploadToCloudinary(mediaFile);
        mediaUrl = up.url; mediaType = up.type;
      }
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: postContent.trim(), mediaUrl, mediaType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not create post.");
      setPosts((cur) => [data.post, ...cur]);
      setPostContent(""); setMediaFile(null); setPreviewUrl("");
      pushToast({ title: "Report published!", message: "Your field update is live.", type: "success" });
    } catch (e) {
      setError(e.message || "Could not create the post.");
      pushToast({ title: "Publish failed", message: e.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    if (!token) { setShowAuthModal(true); return; }
    const prev = posts;
    setPosts((cur) => cur.map((p) => {
      if (p.id !== postId) return p;
      const liked = p.likes?.some((l) => l.userId === getUserId(user));
      return {
        ...p,
        likes: liked
          ? (p.likes || []).filter((l) => l.userId !== getUserId(user))
          : [...(p.likes || []), { userId: getUserId(user), createdAt: new Date().toISOString() }],
      };
    }));
    try {
      await fetch(`${API_URL}/posts/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ postId }),
      });
    } catch {
      setPosts(prev);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not delete.");
      setPosts((cur) => cur.filter((p) => p.id !== postId));
      pushToast({ title: "Deleted", message: "Post removed.", type: "success" });
    } catch (e) {
      pushToast({ title: "Delete failed", message: e.message, type: "error" });
    }
  };

  const handleAddComment = async (postId, text) => {
    if (!token) { setShowAuthModal(true); return; }
    const res = await fetch(`${API_URL}/posts/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ postId, text }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) throw new Error(data.message || "Could not comment.");
    setPosts((cur) => cur.map((p) => p.id === postId ? { ...p, comments: [...(p.comments || []), data.comment] } : p));
    pushToast({ title: "Comment added", message: "Your reply is now live.", type: "success" });
  };

  return (
    <>
      {/* ══ HERO ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[52vh] flex items-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/community-hero-bg.png"
          alt="Farmers community in a lush green field"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2318]/90 via-[#1e3528]/80 to-[#2d6a4f]/70" />
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(126,166,108,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(126,166,108,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32 py-20 lg:py-24">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/15 backdrop-blur-sm px-4 py-2 text-xs font-semibold uppercase tracking-widest text-green-300 mb-5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Grower Network · Pakistan
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-[clamp(2rem,5.5vw,4.4rem)] font-extrabold leading-[1.1] tracking-tight text-white"
            >
              Share what you see.<br />
              <span className="text-green-400">Learn from the field.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              className="mt-5 max-w-xl text-base leading-8 text-slate-300"
            >
              Post field reports, pest sightings, and crop tips. Connect with thousands of Pakistani farmers growing cotton, wheat, and rice.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.36 }}
              className="mt-8 flex flex-wrap gap-5 text-sm text-slate-300"
            >
              {["Real farmers", "Verified reports", "Free to join"].map((b) => (
                <span key={b} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {b}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-md border-t border-white/10">
          <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32 py-4 sm:py-5 grid grid-cols-3 gap-4 sm:gap-6">
            {[
              { val: stats.posts || "—",    label: "Field Reports" },
              { val: stats.growers || "—",  label: "Active Farmers" },
              { val: stats.comments || "—", label: "Discussions" },
            ].map(({ val, label }) => (
              <div key={label} className="flex items-center gap-3 sm:gap-4">
                <div className="text-green-400 text-2xl">🌾</div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold text-white">{val}</div>
                  <div className="text-xs sm:text-sm text-slate-400">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MAIN CONTENT ════════════════════════════════════════════════ */}
      <div className="bg-slate-50 min-h-screen w-full">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32 py-10">
          <div className="grid gap-7 xl:grid-cols-[360px_minmax(0,1fr)] items-start">

            {/* ── SIDEBAR ─────────────────────────────────────────── */}
            <aside className="space-y-5 xl:sticky xl:top-28">

              {/* Community info card */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Community</div>
                    <div className="text-lg font-extrabold text-slate-900 font-display">AgriSense Network</div>
                  </div>
                </div>
                <p className="text-base leading-8 text-slate-500">
                  A field board for real updates — pest reports, irrigation issues, market prices, and crop lessons from farmers across Pakistan.
                </p>

                {/* Auth CTA */}
                {!user ? (
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="mt-5 w-full flex items-center justify-center gap-2 rounded-[999px] py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #1e3528 0%, #2d6a4f 45%, #40916c 100%)",
                      boxShadow: "0 4px 20px rgba(30,53,40,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
                    }}
                  >
                    <LogIn className="h-4 w-4" />
                    Login to post
                  </button>
                ) : (
                  <div className="mt-5 flex items-center gap-3 rounded-[1.2rem] bg-emerald-50 border border-emerald-100 px-4 py-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-200 text-emerald-800 font-bold text-base">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <div className="text-base font-bold text-slate-900">{user.name}</div>
                      <div className="text-sm text-emerald-600">Active member</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filters */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-emerald-600" />
                  <span className="text-lg font-bold text-slate-900">Feed Controls</span>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 mb-4 focus-within:border-emerald-300 transition">
                  <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search posts or farmers..."
                    className="w-full bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400"
                  />
                  {search && (
                    <button onClick={() => setSearch("")}>
                      <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-700" />
                    </button>
                  )}
                </div>

                {/* Filter pills */}
                <div className="space-y-2">
                  {[
                    { value: "latest",  label: "Latest Reports",  icon: Leaf },
                    { value: "popular", label: "Most Liked",      icon: Flame },
                    { value: "media",   label: "With Photos",     icon: Camera },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilter(value)}
                      className={`w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-200 ${
                        filter === value
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                          : "border border-slate-100 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {label}
                      {filter === value && <ChevronRight className="h-4 w-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trends */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                  <span className="text-lg font-bold text-slate-900">Conversation Trends</span>
                </div>
                <div className="space-y-5">
                  {trendRows.map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-base text-slate-700 font-semibold mb-2">
                        <span>{label}</span>
                        <span className="text-sm text-slate-400">{value} posts</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100">
                        <div
                          className={`h-2.5 rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stats tiles */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: BarChart2, label: "Reports",  value: stats.posts },
                  { icon: Users,     label: "Growers",  value: stats.growers },
                  { icon: MessageSquare, label: "Replies", value: stats.comments },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-4 flex flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900">{value}</div>
                    <div className="text-sm text-slate-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </aside>

            {/* ── MAIN FEED ────────────────────────────────────────── */}
            <div className="space-y-6 max-w-[980px] mx-auto w-full">

              {/* Post Composer */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                {/* Composer header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <Sprout className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">New Field Report</div>
                      <div className="text-sm font-bold text-slate-800">Share what you're seeing</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!user && (
                      <button
                        type="button"
                        onClick={() => setShowAuthModal(true)}
                        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-emerald-200 transition"
                      >
                        <LogIn className="h-4 w-4" />
                        Login
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCreatePost}
                      disabled={submitting}
                      className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #1e3528 0%, #2d6a4f 45%, #40916c 100%)",
                        boxShadow: "0 4px 16px rgba(30,53,40,0.3), inset 0 1px 0 rgba(255,255,255,0.12)",
                      }}
                    >
                      {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Publish Report
                    </button>
                  </div>
                </div>

                {/* Composer body */}
                <div className="p-6">
                  <textarea
                    rows={4}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full rounded-[1.4rem] border border-slate-200 bg-slate-50/60 px-5 py-4 text-base text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/10 transition resize-none"
                    placeholder="Describe the field condition, pest pressure, irrigation issue, or lesson learned..."
                  />

                  {/* Image preview */}
                  {previewUrl && (
                    <div className="mt-4 relative rounded-[1.4rem] overflow-hidden border border-emerald-100">
                      <img src={previewUrl} alt="Preview" className="max-h-[300px] w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setMediaFile(null); setPreviewUrl(""); }}
                        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Action row */}
                  <div className="mt-4 flex items-center gap-3">
                    <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition">
                      <ImageIcon className="h-4 w-4" />
                      Attach Image
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) { setMediaFile(file); setPreviewUrl(URL.createObjectURL(file)); }
                        }}
                      />
                    </label>
                    {mediaFile && (
                      <span className="text-xs text-emerald-600 font-medium">{mediaFile.name}</span>
                    )}
                  </div>

                  {error && (
                    <div className="mt-4 rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Feed */}
              {loading ? (
                <FeedSkeleton />
              ) : filteredPosts.length === 0 ? (
                <EmptyFeed />
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={user}
                    onAuthRequired={() => setShowAuthModal(true)}
                    onToggleLike={handleToggleLike}
                    onDelete={handleDeletePost}
                    onComment={handleAddComment}
                  />
                ))
              )}

              {/* Load More Pagination Trigger */}
              {hasMore && (
                <div className="flex justify-center pt-4 pb-8">
                  <button
                    type="button"
                    onClick={() => fetchPosts(page + 1, true)}
                    disabled={loadingMore}
                    className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white hover:bg-emerald-50 px-6 py-3 text-sm font-bold text-emerald-700 shadow-sm transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                  >
                    {loadingMore ? (
                      <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" />
                    ) : (
                      <Sprout className="h-4 w-4 text-emerald-600" />
                    )}
                    {loadingMore ? "Loading more..." : "Load More Posts"}
                  </button>
                </div>
              )}

              {!hasMore && posts.length > 0 && !loading && (
                <div className="text-center text-xs font-semibold text-slate-400 py-8 border-t border-slate-100">
                  You're all caught up! 🌾
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
