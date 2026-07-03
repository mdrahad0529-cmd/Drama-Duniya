import React, { useState } from "react";
import { X, Star, Download, Calendar, Clock, Film, Globe, MessageSquare, ShieldCheck, User, Play, Check, ServerCrash, Loader2, ArrowRight, Lock, Megaphone } from "lucide-react";
import { Movie, Comment } from "../types";

// Helper to convert Google Drive URL to Direct Download
const getDirectDownloadUrl = (url: string): string => {
  if (!url) return "";
  const cleanUrl = url.trim();
  const fileDMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${fileDMatch[1]}`;
  }
  const idMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
  }
  return cleanUrl;
};

// Extract Google Drive File ID for the backend bypass API
const getGoogleDriveFileId = (url: string): string | null => {
  if (!url) return null;
  const cleanUrl = url.trim();
  const fileDMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }
  const idMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }
  return null;
};

interface MovieDetailsModalProps {
  movie: Movie;
  onClose: () => void;
  onAddComment: (movieId: string, comment: Omit<Comment, "id" | "timestamp">) => void;
}

export default function MovieDetailsModal({
  movie,
  onClose,
  onAddComment
}: MovieDetailsModalProps) {
  // Comment Form States
  const [userName, setUserName] = useState("");
  const [userRating, setUserRating] = useState<number>(5);
  const [commentText, setCommentText] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Ad verification state for Post Page (Download links)
  const [postAdClicks, setPostAdClicks] = useState(0);
  const [postAdUnlocked, setPostAdUnlocked] = useState(false);
  const [postTimeLeft, setPostTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);

  // Post Page Ad Wait states
  const [postAdWaitTimer, setPostAdWaitTimer] = useState(0);
  const [postAdWaitActive, setPostAdWaitActive] = useState(false);
  const [postAdWaitMessage, setPostAdWaitMessage] = useState("");

  // Post page timer countdown
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && postTimeLeft > 0) {
      interval = setInterval(() => {
        setPostTimeLeft((prev) => {
          if (prev <= 1) {
            // Reset everything
            setPostAdClicks(0);
            setPostAdUnlocked(false);
            setTimerActive(false);
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, postTimeLeft]);

  // Post page Ad click 10s countdown timer
  React.useEffect(() => {
    if (!postAdWaitActive) return;

    setPostAdWaitTimer(10);
    setPostAdWaitMessage("Please wait 10s...");

    const interval = setInterval(() => {
      setPostAdWaitTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [postAdWaitActive]);

  // Handle countdown progress and final completion safely outside state updaters for Post Page
  React.useEffect(() => {
    if (!postAdWaitActive) return;

    if (postAdWaitTimer > 0) {
      setPostAdWaitMessage(`Please wait ${postAdWaitTimer}s...`);
    } else {
      setPostAdWaitMessage("Task Complete! ✓");
      const timeout = setTimeout(() => {
        setPostAdWaitActive(false);
        setPostAdWaitMessage("");
        setPostAdClicks((clicks) => {
          const nextClicks = clicks + 1;
          if (nextClicks >= 2) {
            setPostAdUnlocked(true);
            setPostTimeLeft(15);
            setTimerActive(true);
          }
          return nextClicks;
        });
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [postAdWaitActive, postAdWaitTimer]);

  const handlePostAdClick = () => {
    if (postAdWaitActive) return;

    // Open ad link
    window.open("https://www.effectivecpmnetwork.com/uk5x37ih?key=7029c8770d8362183bcf09703b7c730b", "_blank");
    
    // Start 10s wait
    setPostAdWaitTimer(10);
    setPostAdWaitActive(true);
    setPostAdWaitMessage("Please wait 10s...");
  };

  // Download Simulation States
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState("");
  const [downloadFinished, setDownloadFinished] = useState(false);
  const [downloadUrlToOpen, setDownloadUrlToOpen] = useState("");

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !commentText.trim()) return;

    onAddComment(movie.id, {
      userName: userName.trim(),
      text: commentText.trim(),
      rating: userRating,
      isAdmin: false
    });

    setUserName("");
    setCommentText("");
    setUserRating(5);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  const startSimulatedDownload = (linkId: string, label: string, linkUrl: string) => {
    setDownloadingId(linkId);
    setDownloadProgress(0);
    setDownloadFinished(false);
    setDownloadUrlToOpen("");

    // Resolve direct download URL as a base fallback
    const directUrl = getDirectDownloadUrl(linkUrl);
    const driveId = getGoogleDriveFileId(linkUrl);

    // If it's a Google Drive link, fetch the bypassed URL from our backend server
    let resolvedUrlPromise = Promise.resolve(directUrl);
    if (driveId) {
      resolvedUrlPromise = fetch(`/api/bypass-gdrive?id=${driveId}`)
        .then((res) => {
          if (!res.ok) throw new Error("HTTP error " + res.status);
          return res.json();
        })
        .then((data) => {
          if (data && data.success && data.url) {
            console.log("Resolved bypass link from backend:", data.url);
            return data.url;
          }
          return directUrl;
        })
        .catch((err) => {
          console.error("Error resolving bypass link:", err);
          return directUrl;
        });
    }

    // Pick a realistic high speed between 15MB/s and 45MB/s
    const speed = (Math.random() * 30 + 15).toFixed(1);
    setDownloadSpeed(`${speed} MB/s`);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Wait for backend resolution to finish and execute
          resolvedUrlPromise.then((finalUrl) => {
            setDownloadUrlToOpen(finalUrl);
            setDownloadFinished(true);

            // Trigger the download automatically
            try {
              const downloadAnchor = document.createElement("a");
              downloadAnchor.href = finalUrl;
              downloadAnchor.target = "_blank";
              downloadAnchor.rel = "noopener noreferrer";
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              document.body.removeChild(downloadAnchor);
            } catch (e) {
              console.error("Failed to automatically redirect download:", e);
              // Fallback: set location
              window.location.href = finalUrl;
            }

            // Keep the finished overlay visible slightly longer (4.5 seconds) so they can read or manual-click
            setTimeout(() => {
              setDownloadingId(null);
              setDownloadUrlToOpen("");
            }, 4500);
          });

          return 100;
        }
        // Increment progress by randomized high-speed increments
        return prev + Math.floor(Math.random() * 20 + 15);
      });
    }, 250);
  };

  const avgRating = typeof movie.rating === "number" ? movie.rating.toFixed(1) : "5.0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-2 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative my-8 w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        id="movie-details-modal"
      >
        {/* Banner Image / Backdrop Header */}
        <div className="relative h-48 w-full sm:h-64 md:h-80">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10"></div>
          <img
            src={movie.bannerUrl || movie.imageUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80"}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover opacity-60"
          />
          
          {/* Back to Home Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 flex items-center space-x-1.5 rounded-xl bg-slate-950/85 px-4 py-2 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-amber-500 transition-all cursor-pointer shadow-lg"
            id="back-to-home-btn"
          >
            <span>← Back to Home</span>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 rounded-full bg-slate-950/80 p-2.5 border border-slate-800 text-slate-400 hover:text-white hover:border-amber-500 transition-all"
            aria-label="Close"
            id="close-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Quick Play Info Badge overlay */}
          <div className="absolute bottom-4 left-4 sm:left-6 z-20 flex items-end space-x-4">
            <div className="hidden sm:block h-28 w-20 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-lg">
              <img src={movie.imageUrl} referrerPolicy="no-referrer" alt={movie.title} className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="flex flex-wrap gap-2 mb-1.5">
                <span className="rounded bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-slate-950 uppercase tracking-wide">
                  {movie.quality}
                </span>
                <span className="rounded bg-slate-900/90 px-2.5 py-0.5 text-xs font-semibold text-slate-300 border border-slate-800">
                  {movie.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">{movie.title}</h2>
            </div>
          </div>
        </div>

        {/* Modal Content container */}
        <div className="p-4 sm:p-6 md:p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* Prominent Back to Home header button */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-amber-500 hover:bg-slate-950 transition-all cursor-pointer shadow-md"
              id="top-modal-back-btn"
            >
              <span>← Back to Home Page</span>
            </button>
            <span className="text-xs text-slate-500 font-mono">Viewing Movie Details</span>
          </div>

          {/* Movie Metadata Block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Movie details left col */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">Movie Description & Story</h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                {movie.description}
              </p>

              {/* Specs Table */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-900/30 border border-slate-900 p-4">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Director</span>
                  <p className="text-sm font-bold text-slate-200 flex items-center">
                    <Film className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    {movie.director}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Release Year</span>
                  <p className="text-sm font-bold text-slate-200 flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    {movie.releaseYear}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Language</span>
                  <p className="text-sm font-bold text-slate-200 flex items-center">
                    <Globe className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    {movie.language}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Duration</span>
                  <p className="text-sm font-bold text-slate-200 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    {movie.duration}
                  </p>
                </div>
              </div>

              {/* Cast */}
              {movie.cast && movie.cast.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cast</span>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.cast.map((actor, idx) => (
                      <span key={idx} className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-slate-300 border border-slate-800/80">
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick rating summaries right card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Rating & Size</h3>
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-yellow-500/10 p-3 border border-yellow-500/20 text-center">
                  <Star className="h-7 w-7 text-yellow-400 fill-yellow-400 mx-auto" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-white">{avgRating}</span>
                  <span className="text-slate-500 text-xs">/5.0 Rating</span>
                  <p className="text-[10px] text-amber-400 font-semibold">{movie.comments.length} Public Comments</p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Size:</span>
                  <span className="font-bold text-white">{movie.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Download Quality:</span>
                  <span className="font-bold text-amber-400">{movie.quality}</span>
                </div>
              </div>
            </div>
          </div>          {/* Interactive Download Server Center */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/50 to-slate-950 p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center space-x-2">
                <div className="rounded-lg bg-amber-500/15 p-1.5 text-amber-400 border border-amber-500/30">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">High-Speed Download Server Links</h3>
                  <p className="text-[11px] text-slate-400">1-Click high speed download options supported</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase">Online</span>
            </div>

            {/* If locked, show sponsor verification unlock panel */}
            {!postAdUnlocked ? (
              <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-6 text-center space-y-4 animate-in fade-in duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto">
                  <Lock className="h-6 w-6 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-white">Unlock Direct High-Speed Download Links</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    To access direct mirrors, please click the verified sponsor button below <span className="text-amber-400 font-bold">2 times</span>. After 2 clicks, download links will instantly unlock for <span className="text-amber-400 font-bold">15 seconds</span>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto text-center">
                  <div className={`rounded-lg py-2 border text-[11px] font-bold transition-all ${
                    postAdClicks >= 1 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                      : "bg-slate-950 border-slate-900 text-slate-600"
                  }`}>
                    Ad Click 1: {postAdClicks >= 1 ? "Completed" : "Pending"}
                  </div>
                  <div className={`rounded-lg py-2 border text-[11px] font-bold transition-all ${
                    postAdClicks >= 2 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                      : "bg-slate-950 border-slate-900 text-slate-600"
                  }`}>
                    Ad Click 2: {postAdClicks >= 2 ? "Completed" : "Pending"}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 pt-1 w-full">
                  {postAdWaitActive ? (
                    <div className="w-full max-w-xs rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center space-y-2 animate-pulse mx-auto">
                      <div className="flex items-center justify-center space-x-2 text-amber-400 font-extrabold text-xs">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying Sponsor Click...</span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium">
                        {postAdWaitMessage.includes("Complete") ? (
                          <span className="text-emerald-400 font-bold">{postAdWaitMessage}</span>
                        ) : (
                          <>Please wait <span className="text-amber-400 font-black font-mono">{postAdWaitTimer}s</span> to complete task.</>
                        )}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handlePostAdClick}
                      className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Megaphone className="h-4 w-4" />
                      <span>Click Sponsor Ad to Unlock ({postAdClicks}/2)</span>
                    </button>
                  )}
                  <p className="text-[9px] text-slate-500">Redirect Link: effectivecpmnetwork.com</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                {/* Active countdown banner */}
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Check className="h-5 w-5" />
                    <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">Download Mirrors Unlocked!</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300 font-mono text-xs font-bold bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
                    <span>Session Resets In:</span>
                    <span className="text-amber-400 font-black text-sm">{postTimeLeft}s</span>
                  </div>
                </div>

                {/* List of links */}
                <div className="space-y-3">
                  {movie.downloadLinks.map((link) => {
                    const isThisDownloading = downloadingId === link.id;

                    return (
                      <div 
                        key={link.id} 
                        className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all duration-200 hover:border-amber-500/30"
                      >
                        {/* Simulated Download Progress overlay */}
                        {isThisDownloading && (
                          <div className="absolute inset-0 bg-slate-950/95 flex flex-col justify-center px-6 z-10">
                            <div className="flex items-center justify-between text-xs font-semibold mb-2">
                              <span className="text-amber-400 flex items-center">
                                {downloadFinished ? (
                                  <>
                                    <Check className="h-4 w-4 text-emerald-400 mr-1.5" />
                                    <span>Direct download link generated!</span>
                                  </>
                                ) : (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400 mr-1.5" />
                                    <span>Generating premium direct file link ({downloadProgress}%)</span>
                                  </>
                                )}
                              </span>
                              <span className="text-slate-400">{downloadSpeed}</span>
                            </div>
                            {/* Progress bar container */}
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full"
                                style={{ width: `${downloadProgress}%` }}
                              ></div>
                            </div>
                            {downloadFinished && (
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1 text-[11px] animate-in fade-in slide-in-from-bottom-1 duration-200 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                                <span className="text-slate-300 font-medium">If download didn't start automatically:</span>
                                <a
                                  href={downloadUrlToOpen}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-center px-3 py-1.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-amber-500 shadow-md transition-all cursor-pointer"
                                >
                                  Click to Download Now
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-slate-200 hover:text-amber-400 transition-colors line-clamp-1">{link.label}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">High speed broadband & mobile data supported link</p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-slate-800/50 sm:border-t-0 pt-2 sm:pt-0">
                            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/10">{link.size}</span>
                            <button
                              onClick={() => startSimulatedDownload(link.id, link.label, link.url)}
                              className="flex items-center space-x-1 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/15 transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download Now</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Ratings & Comments Timeline section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            
            {/* Left: Comment timeline */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
                <MessageSquare className="h-4 w-4 text-amber-500" />
                <h3 className="text-base font-bold text-white">User Reviews ({movie.comments.length})</h3>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {movie.comments.length === 0 ? (
                  <div className="text-center py-8 bg-slate-900/10 rounded-2xl border border-slate-900">
                    <p className="text-xs text-slate-500">No reviews yet. Be the first to leave a review!</p>
                  </div>
                ) : (
                  movie.comments.map((comment) => (
                    <div 
                      key={comment.id}
                      className={`rounded-2xl p-4 border text-xs space-y-2 bg-slate-900/30 ${
                        comment.isAdmin 
                          ? "border-amber-500/20 bg-amber-500/5" 
                          : "border-slate-900 bg-slate-900/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`rounded-lg p-1.5 ${comment.isAdmin ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-400"}`}>
                            {comment.isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 flex items-center">
                              {comment.userName}
                              {comment.isAdmin && (
                                <span className="ml-1 text-[9px] bg-amber-500 text-slate-950 px-1 py-0.2 rounded font-bold uppercase">Admin</span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {new Date(comment.timestamp).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        {comment.rating && (
                          <div className="flex items-center space-x-0.5 text-yellow-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-0.5" />
                            <span>{comment.rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-300 leading-relaxed font-light">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Submit Review Form */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-4 sm:p-6 h-fit space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2">Submit Your Rating & Review</h3>
              
              <form onSubmit={handleCommentSubmit} className="space-y-4 text-xs">
                {formSuccess && (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-400 font-bold text-center">
                    Review successfully added! The movie average rating has been updated.
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., John Doe"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 outline-none focus:border-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Your Rating</label>
                  <div className="flex items-center space-x-2 bg-slate-950 rounded-xl p-2.5 border border-slate-800 w-fit">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125"
                      >
                        <Star 
                          className={`h-5 w-5 ${
                            star <= userRating 
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-slate-600"
                          }`} 
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-yellow-400">{userRating} / 5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Review / Comment</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="What did you think of the movie? How is the audio & print quality?"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 outline-none focus:border-amber-500 transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/10 transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 flex items-center justify-center space-x-1.5"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Submit Review</span>
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Back to Home Button */}
          <div className="flex justify-center pt-6 border-t border-slate-900">
            <button
              onClick={onClose}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 hover:bg-slate-950 px-8 py-4 text-sm font-extrabold text-slate-300 hover:text-white transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg"
              id="bottom-back-to-home-btn"
            >
              <span>← Back to Home Page</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
