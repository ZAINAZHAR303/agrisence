/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ScanLine,
  RefreshCw,
  LoaderCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Microscope,
  Stethoscope,
  Leaf,
  ChevronRight,
  X,
  Camera,
  Info,
} from "lucide-react";
import { useToast } from "@/components/system/AppProviders";
import { predictDisease } from "@/utils/api";

/* ─── severity config ───────────────────────────────────────── */
const severityConfig = {
  "None":            { color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200", dot: "bg-green-500" },
  "Medium":          { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-500" },
  "Medium to High":  { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  "High":            { color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500" },
  "Very High":       { color: "text-red-700",    bg: "bg-red-50",    border: "border-red-300",    dot: "bg-red-600" },
};

function getSeverityStyle(severity) {
  return severityConfig[severity] || { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", dot: "bg-slate-400" };
}

/* ─── tips shown in upload panel ───────────────────────────── */
const uploadTips = [
  { icon: Camera,      text: "Take photo in natural daylight" },
  { icon: Leaf,        text: "Keep the leaf centered in frame" },
  { icon: Microscope,  text: "Capture the most affected area" },
];

/* ─── main component ────────────────────────────────────────── */
export default function DiseaseDetectionContent() {
  const { pushToast } = useToast();
  const [uploadedFile, setUploadedFile]   = useState(null);
  const [previewUrl, setPreviewUrl]       = useState("");
  const [dragging, setDragging]           = useState(false);
  const [analyzing, setAnalyzing]         = useState(false);
  const [result, setResult]               = useState(null);   // { topPrediction, diseaseInfo }
  const [error, setError]                 = useState("");
  const [zoomOpen, setZoomOpen]           = useState(false);

  /* ── file handling ── */
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      pushToast({ title: "Invalid file", message: "Upload a leaf image (JPG, PNG, WEBP).", type: "error" });
      return;
    }
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError("");
    pushToast({ title: "Image loaded", message: "Ready to scan for diseases.", type: "success" });
  };

  /* ── analyze ── */
  const handleAnalyze = async () => {
    if (!uploadedFile) {
      setError("Please upload a leaf image first.");
      return;
    }
    setAnalyzing(true);
    setError("");
    try {
      const data = await predictDisease(uploadedFile, 1);
      const top  = data?.top_prediction;
      const info = data?.disease_info;

      if (!top) throw new Error("No prediction returned from the API.");

      setResult({
        topPrediction: {
          disease:    top.disease,
          confidence: top.confidence_percent || `${(top.confidence * 100).toFixed(1)}%`,
        },
        diseaseInfo: {
          scientificName: info?.scientific_name  || "N/A",
          severity:       info?.severity         || "Unknown",
          description:    info?.description      || "",
          symptoms:       info?.symptoms         || [],
          treatment:      info?.treatment        || [],
          prevention:     info?.prevention       || [],
        },
      });

      pushToast({ title: "Scan complete", message: "Disease analysis finished.", type: "success" });
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
      pushToast({ title: "Scan failed", message: err.message || "Could not process the image.", type: "error" });
    } finally {
      setAnalyzing(false);
    }
  };

  /* ── reset ── */
  const reset = () => {
    setUploadedFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    setZoomOpen(false);
  };

  const isHealthy = result?.topPrediction?.disease === "Healthy Leaf";
  const sevStyle  = result ? getSeverityStyle(result.diseaseInfo.severity) : null;

  return (
    <>
      {/* ══ HERO HEADER ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/disease-hero-bg.png" alt="" fill className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/75 to-slate-950/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/60" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-green-400 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            AI Disease Detection
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-3xl">
            Scan Your Leaf,<br />
            <span className="text-green-400">Get Instant Results</span>
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-7 sm:leading-8 max-w-xl">
            Upload a clear photo of your cotton leaf and our AI will identify the disease, severity, and recommend the right treatment — in seconds.
          </p>

          {/* quick stats */}
          <div className="mt-10 flex flex-wrap gap-8 sm:gap-12">
            {[
              { label: "Detection Accuracy", value: "94.2%" },
              { label: "Diseases Detected",  value: "7 Types" },
              { label: "Scan Time",          value: "< 3 sec" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-green-400">{s.value}</div>
                <div className="text-sm text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MAIN CONTENT ══════════════════════════════════════ */}
      <div className="bg-slate-50 min-h-screen w-full">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-32 py-12">

          {/* ── UPLOAD SECTION ── */}
          <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start w-full">

            {/* upload card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden w-full">
              <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <ScanLine className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-bold text-lg text-slate-900">Scan Deck</span>
                </div>
                {uploadedFile && (
                  <button onClick={reset} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors">
                    <RefreshCw className="h-3.5 w-3.5" /> Reset
                  </button>
                )}
              </div>

              <div className="p-6">
                {/* drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
                  className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden
                    ${dragging ? "border-green-400 bg-green-50" : "border-slate-200 bg-slate-50"}
                    ${previewUrl ? "border-solid border-slate-200" : ""}
                  `}
                >
                  {/* scan animation overlay */}
                  {analyzing && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                      <div className="relative mb-4">
                        <div className="h-16 w-16 rounded-full border-4 border-green-100 border-t-green-500 animate-spin" />
                        <Leaf className="absolute inset-0 m-auto h-6 w-6 text-green-500" />
                      </div>
                      <div className="text-sm font-semibold text-slate-700">Analyzing leaf...</div>
                      <div className="text-xs text-slate-400 mt-1">AI is scanning for diseases</div>
                    </div>
                  )}

                  {previewUrl ? (
                    /* uploaded image preview */
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Uploaded leaf"
                        className="w-full h-72 md:h-96 object-cover"
                      />
                      {/* overlay bottom bar */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-end justify-between">
                        <div>
                          <div className="text-white text-sm font-semibold truncate max-w-[200px]">{uploadedFile?.name}</div>
                          <div className="text-green-300 text-xs mt-0.5">Ready to scan</div>
                        </div>
                        <button
                          onClick={() => setZoomOpen(true)}
                          className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 px-3 py-1.5 text-xs text-white transition-all"
                        >
                          <Camera className="h-3.5 w-3.5" /> Zoom
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* empty state */
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                      <div className="relative mb-4">
                        <Image src="/healthy-leaf.png" alt="Upload a leaf" width={120} height={120} className="object-contain opacity-70" />
                        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                          <Upload className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="text-xl font-bold text-slate-700 mt-3">Drop your leaf photo here</div>
                      <div className="text-base text-slate-400 mt-1.5">or click below to choose a file</div>
                      <div className="mt-2 text-sm text-slate-300">JPG, PNG, WEBP supported</div>
                    </div>
                  )}
                </div>

                {/* action buttons */}
                <div className="mt-5 flex gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-4 text-base font-semibold text-slate-700 cursor-pointer transition-all">
                    <Upload className="h-5 w-5 text-green-600" />
                    Choose Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                  </label>
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing || !uploadedFile}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-4 text-base font-bold text-white transition-all shadow-md shadow-green-500/20"
                  >
                    {analyzing ? (
                      <><LoaderCircle className="h-5 w-5 animate-spin" /> Scanning...</>
                    ) : (
                      <><ScanLine className="h-5 w-5" /> Scan Now</>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* tips sidebar */}
            <div className="space-y-4">
              {/* how to take photo */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Info className="h-5 w-5 text-green-600" />
                  <span className="text-base font-bold text-slate-900">Photo Tips</span>
                </div>
                <div className="space-y-3">
                  {uploadTips.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3.5">
                      <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm text-slate-600 leading-6">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* detectable diseases */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Microscope className="h-5 w-5 text-green-600" />
                  <span className="text-base font-bold text-slate-900">Can Detect</span>
                </div>
                <div className="space-y-2.5">
                  {["Bacterial Blight", "Curl Virus", "Herbicide Damage", "Leaf Hopper", "Leaf Redding", "Leaf Variegation", "Healthy Leaf"].map((d) => (
                    <div key={d} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <ChevronRight className="h-4 w-4 text-green-500 shrink-0" />
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ RESULT SECTION ══════════════════════════════════ */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                {/* result header banner */}
                <div className={`rounded-3xl border p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                  ${isHealthy
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0
                      ${isHealthy ? "bg-green-100" : "bg-red-100"}`}
                    >
                      {isHealthy
                        ? <ShieldCheck className="h-7 w-7 text-green-600" />
                        : <AlertTriangle className="h-7 w-7 text-red-600" />
                      }
                    </div>
                    <div>
                      <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${isHealthy ? "text-green-600" : "text-red-600"}`}>
                        {isHealthy ? "✓ No Disease Found" : "⚠ Disease Detected"}
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900">{result.topPrediction.disease}</div>
                      <div className="text-sm text-slate-500 mt-0.5 italic">{result.diseaseInfo.scientificName}</div>
                    </div>
                  </div>

                  {/* confidence + severity badges */}
                  <div className="flex gap-3 flex-wrap">
                    <div className="rounded-2xl bg-white border border-slate-200 px-5 py-3 text-center shadow-sm">
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Confidence</div>
                      <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{result.topPrediction.confidence}</div>
                    </div>
                    <div className={`rounded-2xl border px-5 py-3 text-center shadow-sm ${sevStyle.bg} ${sevStyle.border}`}>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Severity</div>
                      <div className={`text-xl font-extrabold mt-0.5 ${sevStyle.color}`}>{result.diseaseInfo.severity}</div>
                    </div>
                  </div>
                </div>

                {/* main result grid */}
                <div className="grid lg:grid-cols-[1fr_1fr_320px] gap-6">

                  {/* ── YOUR SCANNED LEAF (user's own photo) ── */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-bold text-slate-900">Your Scanned Leaf</span>
                      </div>
                    </div>
                    <div className="relative">
                      {/* THIS IS THE USER'S OWN UPLOADED PHOTO */}
                      <img
                        src={previewUrl}
                        alt="Your uploaded leaf"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs text-white font-medium">
                          <span className={`h-2 w-2 rounded-full ${isHealthy ? "bg-green-400" : "bg-red-400"}`} />
                          {result.topPrediction.disease}
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-slate-600 leading-7">{result.diseaseInfo.description}</p>
                    </div>
                  </div>

                  {/* ── SYMPTOMS & TREATMENT ── */}
                  <div className="space-y-5">
                    {/* symptoms */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-7 w-7 rounded-lg bg-orange-50 flex items-center justify-center">
                          <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">Symptoms to Watch</span>
                      </div>
                      <div className="space-y-2.5">
                        {result.diseaseInfo.symptoms.length > 0
                          ? result.diseaseInfo.symptoms.map((s) => (
                              <div key={s} className="flex items-start gap-2.5 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3">
                                <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-700 leading-6">{s}</span>
                              </div>
                            ))
                          : <div className="text-sm text-slate-400">No symptom data available.</div>
                        }
                      </div>
                    </div>

                    {/* treatment */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-7 w-7 rounded-lg bg-green-50 flex items-center justify-center">
                          <Stethoscope className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">Treatment Steps</span>
                      </div>
                      <div className="space-y-2.5">
                        {result.diseaseInfo.treatment.length > 0
                          ? result.diseaseInfo.treatment.map((t, i) => (
                              <div key={t} className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 px-4 py-3">
                                <div className="h-5 w-5 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {i + 1}
                                </div>
                                <span className="text-sm text-slate-700 leading-6">{t}</span>
                              </div>
                            ))
                          : <div className="text-sm text-slate-400">No treatment data available.</div>
                        }
                      </div>
                    </div>
                  </div>

                  {/* ── REFERENCE IMAGE + PREVENTION ── */}
                  <div className="space-y-5">
                    {/* reference image */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100">
                        <span className="text-sm font-bold text-slate-900">
                          {isHealthy ? "Healthy Reference" : "Disease Reference"}
                        </span>
                      </div>
                      <div className="relative h-44">
                        <Image
                          src={isHealthy ? "/healthy-leaf.png" : "/diseased-leaf.png"}
                          alt={isHealthy ? "Healthy cotton leaf" : "Diseased cotton leaf"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-xs text-slate-400 text-center">
                          {isHealthy ? "What a healthy cotton leaf looks like" : "Example of cotton leaf disease"}
                        </div>
                      </div>
                    </div>

                    {/* prevention */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">Prevention</span>
                      </div>
                      <div className="space-y-2.5">
                        {result.diseaseInfo.prevention.length > 0
                          ? result.diseaseInfo.prevention.map((p) => (
                              <div key={p} className="flex items-start gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-600 leading-6">{p}</span>
                              </div>
                            ))
                          : <div className="text-sm text-slate-400">No prevention data available.</div>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* scan again CTA */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-8 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all"
                  >
                    <RefreshCw className="h-4 w-4 text-green-600" />
                    Scan Another Leaf
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══ ZOOM MODAL ════════════════════════════════════════ */}
      <AnimatePresence>
        {zoomOpen && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setZoomOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <span className="font-bold text-slate-900 truncate">{uploadedFile?.name}</span>
                <button onClick={() => setZoomOpen(false)} className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <X className="h-4 w-4 text-slate-600" />
                </button>
              </div>
              <img src={previewUrl} alt="Zoomed leaf" className="w-full max-h-[75vh] object-contain bg-slate-50" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

