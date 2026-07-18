"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { usePathname } from "next/navigation";

const ToastContext = createContext({ pushToast: () => {} });

const toastIcons = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

function ToastViewport({ toasts, removeToast }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 top-24 z-[80] flex justify-end">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = toastIcons[toast.type] || Info;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 26, y: -12 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 26, y: -8 }}
                className="pointer-events-auto panel rounded-[1.4rem] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] ${
                      toast.type === "success"
                        ? "bg-emerald-100 text-emerald-700"
                        : toast.type === "error"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-lime-100 text-emerald-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-950">{toast.title}</div>
                    {toast.message ? <div className="mt-1 text-sm leading-6 text-slate-600">{toast.message}</div> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100 bg-[rgba(245,248,241,0.84)] text-slate-500 transition hover:text-slate-900"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

import { AuthProvider } from "@/contexts/AuthContext";

export default function AppProviders({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const pushToast = ({ title, message = "", type = "info", duration = 3200 }) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, title, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, duration);
  };

  const value = useMemo(() => ({ pushToast }), []);

  return (
    <AuthProvider>
      <ToastContext.Provider value={value}>
        <ToastViewport toasts={toasts} removeToast={removeToast} />
        <PageTransition>{children}</PageTransition>
      </ToastContext.Provider>
    </AuthProvider>
  );
}
