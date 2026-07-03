import React, { useState, useEffect } from "react";
import { INITIAL_MOVIES } from "./data/initialMovies";
import { Movie, Comment } from "./types";
import Header from "./components/Header";
import MovieCard from "./components/MovieCard";
import MovieDetailsModal from "./components/MovieDetailsModal";
import AdminPanel from "./components/AdminPanel";
import {
  seedMoviesIfEmpty,
  subscribeToMovies,
  addFirestoreMovie,
  updateFirestoreMovie,
  deleteFirestoreMovie,
  incrementMovieViews,
  updateMovieCommentsAndRating
} from "./firebase";
import { Film, Play, Flame, Star, Compass, Download, ShieldCheck, Heart, AlertTriangle, X, Lock, Facebook, Users, Megaphone, Loader2 } from "lucide-react";

export default function App() {
  // Main states
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Admin PIN modal states
  const [showAdminPINModal, setShowAdminPINModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "@AdminDD2026*#") {
      setIsAdminMode(true);
      setShowAdminPINModal(false);
      setPinInput("");
      setPinError("");
    } else {
      setPinError("Invalid security password. Please try again.");
    }
  };


  // Load from Firebase and seed if empty
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let active = true;

    const initFirebase = async () => {
      await seedMoviesIfEmpty();
      if (!active) return;

      unsubscribe = subscribeToMovies((fetchedMovies) => {
        setMovies(fetchedMovies);
        setIsLoading(false);
      });
    };

    initFirebase();

    return () => {
      active = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Keep selectedMovie in sync with the live movies state
  useEffect(() => {
    if (selectedMovie) {
      const current = movies.find((m) => m.id === selectedMovie.id);
      if (current) {
        setSelectedMovie(current);
      } else {
        // If the movie was deleted, close details modal
        setSelectedMovie(null);
      }
    }
  }, [movies]);

  // Ad verification state for Home Page (Opening movie detail pages)
  const [homeAdClicks, setHomeAdClicks] = useState(0);
  const [homeAdUnlocked, setHomeAdUnlocked] = useState(false);
  const [homeTimeLeft, setHomeTimeLeft] = useState(15);
  const [homeTimerActive, setHomeTimerActive] = useState(false);
  const [pendingMovieToSelect, setPendingMovieToSelect] = useState<Movie | null>(null);

  // Home Page Ad Wait states
  const [homeAdWaitTimer, setHomeAdWaitTimer] = useState(0);
  const [homeAdWaitActive, setHomeAdWaitActive] = useState(false);
  const [homeAdWaitMessage, setHomeAdWaitMessage] = useState("");

  // Home page timer countdown (for the 15s expiration after 2 clicks are unlocked)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (homeTimerActive && homeTimeLeft > 0) {
      interval = setInterval(() => {
        setHomeTimeLeft((prev) => {
          if (prev <= 1) {
            // Reset everything
            setHomeAdClicks(0);
            setHomeAdUnlocked(false);
            setHomeTimerActive(false);
            setPendingMovieToSelect(null);
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [homeTimerActive, homeTimeLeft]);

  // Home page Ad click 10s countdown timer
  useEffect(() => {
    if (!homeAdWaitActive) return;

    setHomeAdWaitTimer(10);
    setHomeAdWaitMessage("Please wait 10s...");

    const interval = setInterval(() => {
      setHomeAdWaitTimer((prev) => {
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
  }, [homeAdWaitActive]);

  // Handle countdown progress and final completion safely outside state updaters for Home Page
  useEffect(() => {
    if (!homeAdWaitActive) return;

    if (homeAdWaitTimer > 0) {
      setHomeAdWaitMessage(`Please wait ${homeAdWaitTimer}s...`);
    } else {
      setHomeAdWaitMessage("Task Complete! ✓");
      const timeout = setTimeout(() => {
        setHomeAdWaitActive(false);
        setHomeAdWaitMessage("");
        setHomeAdClicks((clicks) => {
          const nextClicks = clicks + 1;
          if (nextClicks >= 2) {
            setHomeAdUnlocked(true);
            setHomeTimeLeft(15);
            setHomeTimerActive(true);
          }
          return nextClicks;
        });
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [homeAdWaitActive, homeAdWaitTimer]);

  // Update movie views when opened (wrapped with ad block)
  const handleSelectMovie = (movie: Movie) => {
    // If admin, bypass ads entirely
    if (isAdminMode) {
      triggerSelectMovie(movie);
      return;
    }

    // If already unlocked and within the 10s window, open it!
    if (homeAdUnlocked) {
      triggerSelectMovie(movie);
      // Reset ad lock so they have to unlock next time
      setHomeAdClicks(0);
      setHomeAdUnlocked(false);
      setHomeTimerActive(false);
      setPendingMovieToSelect(null);
      return;
    }

    // Otherwise, open the verification modal for this movie
    setPendingMovieToSelect(movie);
  };

  const triggerSelectMovie = async (movie: Movie) => {
    // Optimistically update views locally, and run increment on Firestore
    const updatedMovie = { ...movie, views: (movie.views || 0) + 1 };
    setSelectedMovie(updatedMovie);
    try {
      await incrementMovieViews(movie.id);
    } catch (e) {
      console.error("Error updating views in Firestore: ", e);
    }
  };

  const handleHomeAdClick = () => {
    if (homeAdWaitActive) return;

    // Open ad link
    window.open("https://www.effectivecpmnetwork.com/uk5x37ih?key=7029c8770d8362183bcf09703b7c730b", "_blank");

    // Start 10 seconds wait
    setHomeAdWaitTimer(10);
    setHomeAdWaitActive(true);
    setHomeAdWaitMessage("Please wait 10s...");
  };

  // Add Comment & Rating - and automatically update Movie Average Rating
  const handleAddComment = async (movieId: string, commentData: Omit<Comment, "id" | "timestamp">) => {
    const movie = movies.find((m) => m.id === movieId);
    if (!movie) return;

    const newComment: Comment = {
      ...commentData,
      id: "c-" + Date.now(),
      timestamp: new Date().toISOString()
    };

    const updatedComments = [...(movie.comments || []), newComment];
    
    // Recalculate average rating based on comments that contain ratings
    const ratedComments = updatedComments.filter((c) => typeof c.rating === "number");
    let newRating = movie.rating;
    if (ratedComments.length > 0) {
      const sum = ratedComments.reduce((acc, c) => acc + (c.rating || 5), 0);
      newRating = Number((sum / ratedComments.length).toFixed(1));
    }

    const updatedMovie = {
      ...movie,
      comments: updatedComments,
      rating: newRating
    };

    // Keep modal state updated immediately
    if (selectedMovie && selectedMovie.id === movieId) {
      setSelectedMovie(updatedMovie);
    }

    try {
      await updateMovieCommentsAndRating(movieId, updatedComments, newRating);
    } catch (e) {
      console.error("Error saving comment to Firestore: ", e);
    }
  };

  // Admin: Add a new movie
  const handleAddMovie = async (newMovieData: Omit<Movie, "id" | "comments" | "views">) => {
    try {
      await addFirestoreMovie(newMovieData);
    } catch (e) {
      console.error("Error adding movie to Firestore: ", e);
    }
  };

  // Admin: Edit movie info
  const handleEditMovie = async (updatedMovie: Movie) => {
    try {
      await updateFirestoreMovie(updatedMovie);
      if (selectedMovie && selectedMovie.id === updatedMovie.id) {
        setSelectedMovie(updatedMovie);
      }
    } catch (e) {
      console.error("Error editing movie in Firestore: ", e);
    }
  };

  // Admin: Delete a movie
  const handleDeleteMovie = async (id: string) => {
    try {
      await deleteFirestoreMovie(id);
      if (selectedMovie?.id === id) {
        setSelectedMovie(null);
      }
    } catch (e) {
      console.error("Error deleting movie from Firestore: ", e);
    }
  };

  // Admin: Delete a comment globally
  const handleDeleteComment = async (movieId: string, commentId: string) => {
    const movie = movies.find((m) => m.id === movieId);
    if (!movie) return;

    const updatedComments = movie.comments.filter((c) => c.id !== commentId);
    
    // Recalculate average rating
    const ratedComments = updatedComments.filter((c) => typeof c.rating === "number");
    let newRating = 5.0;
    if (ratedComments.length > 0) {
      const sum = ratedComments.reduce((acc, c) => acc + (c.rating || 5), 0);
      newRating = Number((sum / ratedComments.length).toFixed(1));
    } else {
      newRating = 5.0;
    }

    const updatedMovie = {
      ...movie,
      comments: updatedComments,
      rating: newRating
    };

    if (selectedMovie && selectedMovie.id === movieId) {
      setSelectedMovie(updatedMovie);
    }

    try {
      await updateMovieCommentsAndRating(movieId, updatedComments, newRating);
    } catch (e) {
      console.error("Error deleting comment from Firestore: ", e);
    }
  };

  // Filter & Search Logic
  const filteredMovies = movies.filter((movie) => {
    const matchesCategory = selectedCategory === "All" || movie.category === selectedCategory;
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      movie.title.toLowerCase().includes(query) ||
      movie.description.toLowerCase().includes(query) ||
      movie.director.toLowerCase().includes(query) ||
      movie.language.toLowerCase().includes(query) ||
      movie.cast?.some((actor) => actor.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  // Featured Movie selection for Hero section
  const featuredMovie = movies.find((m) => m.featured) || movies[0];

  const categories = ["All", "Action", "Drama", "Thriller", "Sci-Fi", "Comedy", "Animation", "Horror"];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans" id="app-container">
      
      {/* Dynamic Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        moviesCount={movies.length}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
            <p className="text-sm text-slate-400 font-medium animate-pulse">Loading Drama Duniya database...</p>
          </div>
        ) : isAdminMode ? (
          /* Admin Controller Dashboard Mode */
          <div className="animate-in fade-in duration-300">
            <AdminPanel
              movies={movies}
              onAddMovie={handleAddMovie}
              onEditMovie={handleEditMovie}
              onDeleteMovie={handleDeleteMovie}
              onDeleteComment={handleDeleteComment}
            />
          </div>
        ) : (
          /* Premium Cinema Portal Mode */
          <div className="space-y-8">
            
            {/* Aesthetic Welcome Banner */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950 p-6 sm:p-10 shadow-2xl">
                {/* Background Image with Overlay */}
                <img
                  src="/src/assets/images/banner_bg_1783062690092.jpg"
                  alt="Deama Duniya Cinematic Banner Background"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-cover opacity-65 select-none z-0 animate-fade-in duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/50 to-slate-950/85 z-0"></div>

                {/* Background ambient lighting */}
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl z-0"></div>
                <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl z-0"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4 max-w-2xl text-center md:text-left">
                    <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/10">
                      <Film className="h-3.5 w-3.5" />
                      <span>Welcome to Drama Duniya</span>
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                      Welcome to <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">Drama Duniya</span>
                    </h2>
                    <p className="text-sm text-slate-200 leading-relaxed font-light drop-shadow-sm">
                      Welcome to Drama Duniya! Explore our carefully curated list of movies, complete with detailed descriptions, technical file sizes, and reviews. Download your favorite films easily with our fast server links.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0 justify-center">
                    <button
                      onClick={() => {
                        const target = document.getElementById("movie-collection-gallery-section");
                        if (target) {
                          target.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Compass className="h-4.5 w-4.5" />
                      <span>Visit Site</span>
                    </button>
                    
                    <a
                      href="https://www.facebook.com/profile.php?id=100085348971576"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/30 px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all hover:bg-[#1877F2]/20"
                    >
                      <Facebook className="h-4.5 w-4.5 text-[#1877F2]" />
                      <span>Join Facebook</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Catalog Grid container */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20" id="movie-collection-gallery-section">
              
              {/* Category slider pills & filter title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-5">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center">
                    <Compass className="h-5 w-5 mr-1.5 text-amber-500" />
                    Movie Collection Gallery
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Filter by category to find and download your favorite movies easily</p>
                </div>

                {/* Category Pills list */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-black"
                          : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      {cat === "All" ? "All Movies" : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid content */}
              {filteredMovies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-slate-900 rounded-3xl bg-slate-900/10 max-w-xl mx-auto space-y-3">
                  <div className="rounded-full bg-red-500/10 p-4 border border-red-500/20 text-red-400">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">No Movies Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm px-4">
                    No movies match your search query or selected category filter. Try looking for something else or clear the filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold border border-slate-800 text-amber-400 hover:border-amber-500 cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4" id="movies-catalog-grid">
                  {filteredMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={handleSelectMovie}
                    />
                  ))}
                </div>
              )}

            </div>

            {/* Beautiful About Section */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-900/60" id="about-section">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-1 space-y-3 text-center lg:text-left">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Our Platform</span>
                  <h3 className="text-2xl font-black text-white tracking-tight">About Deama Duniya</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light">
                    Deama Duniya is a premier community-driven digital catalog for high-quality cinema enthusiasts. We connect users with rapid-mirror server links, highly detailed video specification breakdowns, and genuine viewer reviews.
                  </p>
                </div>
                
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-slate-900 bg-slate-950/20 p-5 space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Verified Server Links</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      All download links are actively tested and mapped directly to rapid mirrors for continuous downloading with no speed throttling.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-900 bg-slate-950/20 p-5 space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                      <Users className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Community Driven Reviews</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Write reviews, rate your downloads out of 5 stars, and discuss cinematic content with fellow site visitors directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Home Page Ad Verification Unlock Modal */}
      {pendingMovieToSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200" id="home-ad-unlock-modal">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6">
            {/* Close button */}
            <button
              onClick={() => {
                setPendingMovieToSelect(null);
                setHomeAdClicks(0);
                setHomeAdUnlocked(false);
                setHomeTimerActive(false);
              }}
              className="absolute top-4 right-4 rounded-lg bg-slate-900 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Lock className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Unlock Movie Details</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                To keep our movie download portal active & free, please click the sponsor ad button below <span className="text-amber-400 font-bold">2 times</span> to unlock this movie.
              </p>
            </div>

            {/* Steps & Verification Controls */}
            <div className="space-y-4">
              {/* Step indicator pills */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className={`rounded-xl p-3 border text-xs font-bold transition-all ${
                  homeAdClicks >= 1 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                    : "bg-slate-900/50 border-slate-800 text-slate-500"
                }`}>
                  Click 1: {homeAdClicks >= 1 ? "✓ Completed" : "Pending"}
                </div>
                <div className={`rounded-xl p-3 border text-xs font-bold transition-all ${
                  homeAdClicks >= 2 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                    : "bg-slate-900/50 border-slate-800 text-slate-500"
                }`}>
                  Click 2: {homeAdClicks >= 2 ? "✓ Completed" : "Pending"}
                </div>
              </div>

              {/* Action Button */}
              {!homeAdUnlocked ? (
                <div className="space-y-2">
                  {homeAdWaitActive ? (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center space-y-2 animate-pulse">
                      <div className="flex items-center justify-center space-x-2 text-amber-400 font-extrabold text-xs sm:text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying Ad Click...</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        {homeAdWaitMessage.includes("Complete") ? (
                          <span className="text-emerald-400 font-bold">{homeAdWaitMessage}</span>
                        ) : (
                          <>Please wait <span className="text-amber-400 font-black font-mono">{homeAdWaitTimer}s</span> to complete task.</>
                        )}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleHomeAdClick}
                      className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      <Megaphone className="h-4.5 w-4.5 animate-bounce" />
                      <span>Click Sponsor Ad to Verify ({homeAdClicks}/2)</span>
                    </button>
                  )}
                  <p className="text-[10px] text-center text-slate-500">Sponsor Link: effectivecpmnetwork.com</p>
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center animate-in zoom-in-95">
                  <div className="flex items-center justify-center space-x-1.5 text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="h-4.5 w-4.5" />
                    <span>Content Unlocked!</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    You have <span className="text-amber-400 font-bold font-mono">{homeTimeLeft} seconds</span> to click the access button below to open the movie detail page.
                  </p>

                  <button
                    onClick={() => {
                      if (pendingMovieToSelect) {
                        handleSelectMovie(pendingMovieToSelect);
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer animate-pulse"
                  >
                    <Play className="h-4.5 w-4.5 fill-current" />
                    <span>Access Movie & Reviews Now</span>
                  </button>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-600 text-center leading-relaxed">
              If the 15-second timer runs out before clicking access, the system will automatically lock the content and reset the click requirements for security purposes.
            </div>
          </div>
        </div>
      )}

      {/* Detail overlay Modal */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onAddComment={handleAddComment}
        />
      )}

      {/* Admin PIN Login Modal */}
      {showAdminPINModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => {
                setShowAdminPINModal(false);
                setPinInput("");
                setPinError("");
              }}
              className="absolute top-4 right-4 rounded-lg bg-slate-900 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Admin Authentication</h3>
              <p className="text-xs text-slate-400">Enter the system security password to access the database controls.</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError("");
                  }}
                  className="w-full text-center tracking-widest text-lg font-black rounded-xl border border-slate-800 bg-slate-900/50 py-3 text-white outline-none focus:border-amber-500 transition-all"
                  autoFocus
                />
                {pinError && (
                  <p className="text-center text-[11px] font-semibold text-red-400 mt-2">{pinError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPINModal(false);
                    setPinInput("");
                    setPinError("");
                  }}
                  className="flex-1 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  Verify & Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer copyright & admin trigger */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="font-bold text-slate-400">
            Deama Duniya - Movie & Drama Download Portal © {new Date().getFullYear()}
          </p>
          <p className="text-[10px] text-slate-600 max-w-xl mx-auto leading-relaxed">
            All featured movies and download indicators are created purely for prototype and educational evaluation purposes. For queries, please access our dedicated administrative console below.
          </p>
          
          <div className="pt-2 flex justify-center">
            {isAdminMode ? (
              <button
                onClick={() => setIsAdminMode(false)}
                className="flex items-center space-x-1.5 rounded-lg bg-red-950/20 border border-red-900/30 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                id="footer-exit-admin-btn"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Exit Admin Panel</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAdminPINModal(true)}
                className="flex items-center space-x-1.5 rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-bold text-slate-400 hover:border-amber-500/40 hover:text-amber-400 transition-all cursor-pointer"
                id="footer-admin-login-btn"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
