import React, { useState } from "react";
import { Plus, Edit, Trash2, LayoutDashboard, Film, MessageSquare, Star, Eye, Calendar, HardDrive, PlusCircle, Sparkles, Check, Trash } from "lucide-react";
import { Movie, Comment } from "../types";
import MovieForm from "./MovieForm";

interface AdminPanelProps {
  movies: Movie[];
  onAddMovie: (movie: Omit<Movie, "id" | "comments" | "views">) => void;
  onEditMovie: (movie: Movie) => void;
  onDeleteMovie: (id: string) => void;
  onDeleteComment: (movieId: string, commentId: string) => void;
}

export default function AdminPanel({
  movies,
  onAddMovie,
  onEditMovie,
  onDeleteMovie,
  onDeleteComment
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"movies" | "comments" | "stats">("movies");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | undefined>(undefined);
  const [adminSearch, setAdminSearch] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteCommentConfirmId, setDeleteCommentConfirmId] = useState<string | null>(null);

  // Statistics calculation
  const totalMovies = movies.length;
  const totalComments = movies.reduce((acc, m) => acc + (m.comments?.length || 0), 0);
  const totalViews = movies.reduce((acc, m) => acc + (m.views || 0), 0) + 1450; // Add standard starting base views
  const avgRating = movies.length > 0 
    ? (movies.reduce((acc, m) => acc + m.rating, 0) / movies.length).toFixed(1)
    : "5.0";

  // Gather all comments for global moderation tab
  interface GlobalComment extends Comment {
    movieTitle: string;
    movieId: string;
  }

  const globalComments: GlobalComment[] = [];
  movies.forEach((m) => {
    if (m.comments) {
      m.comments.forEach((c) => {
        globalComments.push({
          ...c,
          movieId: m.id,
          movieTitle: m.title
        });
      });
    }
  });

  // Sort comments by timestamp (newest first)
  globalComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter movies for admin table
  const filteredMovies = movies.filter((m) => 
    m.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
    m.director.toLowerCase().includes(adminSearch.toLowerCase()) ||
    m.category.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const handleAddNewClick = () => {
    setEditingMovie(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (movie: Movie) => {
    setEditingMovie(movie);
    setIsFormOpen(true);
  };

  const handleFormSave = (formData: Omit<Movie, "id" | "comments" | "views"> & { id?: string }) => {
    if (formData.id) {
      // Find existing views and comments to preserve them on edit
      const existing = movies.find((m) => m.id === formData.id);
      onEditMovie({
        ...formData,
        id: formData.id,
        views: existing?.views || 0,
        comments: existing?.comments || []
      });
    } else {
      onAddMovie(formData);
    }
    setIsFormOpen(false);
    setEditingMovie(undefined);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Drama Duniya <span className="text-amber-400 font-bold uppercase tracking-wider">Admin Control Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage movies, edit catalogs, and moderate community reviews</p>
        </div>
        
        {!isFormOpen && (
          <button
            onClick={handleAddNewClick}
            className="flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all hover:shadow-xl active:scale-95"
            id="admin-add-movie-btn"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Upload New Movie</span>
          </button>
        )}
      </div>

      {/* Form Overlay/Section as Backdrop Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200" id="admin-movie-form-modal">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 p-1 max-h-[90vh] overflow-y-auto shadow-2xl">
            <MovieForm
              movie={editingMovie}
              onSave={handleFormSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingMovie(undefined);
              }}
            />
          </div>
        </div>
      )}

      {/* Stats Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Movies</span>
            <Film className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-white">{totalMovies}</p>
          <span className="text-[10px] text-slate-400">Live Published</span>
        </div>

        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Views</span>
            <Eye className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-white">{totalViews.toLocaleString()}</p>
          <span className="text-[10px] text-sky-400 font-medium">Movie Click Impressions</span>
        </div>

        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">User Reviews</span>
            <MessageSquare className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-white">{totalComments}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Public Feedback</span>
        </div>

        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Rating</span>
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-black text-white">{avgRating} ★</p>
          <span className="text-[10px] text-yellow-500 font-bold">Out of 5.0</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-800 mb-6 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("movies")}
          className="flex items-center space-x-1.5 border-b-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-amber-500 text-amber-400 bg-amber-500/5"
        >
          <Film className="h-4 w-4" />
          <span>Movie List ({totalMovies})</span>
        </button>

        <button
          onClick={() => setActiveTab("comments")}
          className="flex items-center space-x-1.5 border-b-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-transparent text-slate-400 hover:text-slate-200"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Moderation ({totalComments})</span>
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className="flex items-center space-x-1.5 border-b-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-transparent text-slate-400 hover:text-slate-200"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Server Stats</span>
        </button>
      </div>

      {/* Tab contents */}
      {activeTab === "movies" && (
        <div className="space-y-4">
          {/* Internal search filter for admin */}
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Admin search..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-4 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-900">
                <tr>
                  <th className="px-6 py-4">Poster & Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Language & Year</th>
                  <th className="px-6 py-4">Size & Quality</th>
                  <th className="px-6 py-4 text-center">Server Links</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredMovies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500 font-medium">
                      No movies found!
                    </td>
                  </tr>
                ) : (
                  filteredMovies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-slate-900/30">
                      <td className="px-6 py-4 font-semibold text-slate-100 flex items-center space-x-3">
                        <img 
                          src={movie.imageUrl} 
                          alt={movie.title} 
                          referrerPolicy="no-referrer"
                          className="h-10 w-7 rounded object-cover border border-slate-800" 
                        />
                        <div>
                          <span className="text-slate-100 font-bold block">{movie.title}</span>
                          <span className="text-[10px] text-slate-500">Director: {movie.director}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-amber-400 font-semibold">{movie.category}</td>
                      <td className="px-6 py-4">
                        <span className="block">{movie.language}</span>
                        <span className="text-[10px] text-slate-500">{movie.releaseYear}</span>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        <span className="block text-slate-200">{movie.size}</span>
                        <span className="text-[10px] text-amber-500/80 font-bold">{movie.quality}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-400">
                        {movie.downloadLinks?.length || 0} Links
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center space-x-2">
                          {deleteConfirmId === movie.id ? (
                            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl animate-in fade-in slide-in-from-right-2 duration-150">
                              <span className="text-[10px] text-red-400 font-bold px-1.5">Delete?</span>
                              <button
                                onClick={() => {
                                  onDeleteMovie(movie.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="rounded-lg px-2.5 py-1 text-[10px] font-extrabold bg-red-600 text-white hover:bg-red-500 transition-all cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="rounded-lg px-2.5 py-1 text-[10px] font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditClick(movie)}
                                className="rounded-lg bg-slate-800 p-1.5 text-amber-400 hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer"
                                title="Edit Movie"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(movie.id)}
                                className="rounded-lg bg-slate-800 p-1.5 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "comments" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-4 flex items-center">
              <MessageSquare className="h-4 w-4 mr-1.5" />
              Comment Moderation Zone
            </h3>

            <div className="space-y-4">
              {globalComments.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-medium">
                  No comments found!
                </div>
              ) : (
                globalComments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border border-slate-900 bg-slate-900/20 hover:border-slate-800"
                  >
                    <div className="space-y-1.5 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white">{comment.userName}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(comment.timestamp).toLocaleString("en-US")}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.2 rounded border border-amber-500/10">
                          Movie: {comment.movieTitle}
                        </span>
                      </div>
                      
                      {comment.rating && (
                        <div className="flex items-center space-x-0.5 text-yellow-400 font-bold">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-0.5" />
                          <span>{comment.rating} / 5</span>
                        </div>
                      )}

                      <p className="text-slate-300 leading-relaxed max-w-3xl">{comment.text}</p>
                    </div>

                    {deleteCommentConfirmId === comment.id ? (
                      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-2 rounded-xl animate-in fade-in slide-in-from-right-2 duration-150 self-end sm:self-center">
                        <span className="text-[10px] text-red-400 font-bold px-1.5">Delete?</span>
                        <button
                          onClick={() => {
                            onDeleteComment(comment.movieId, comment.id);
                            setDeleteCommentConfirmId(null);
                          }}
                          className="rounded-lg px-2.5 py-1 text-xs font-extrabold bg-red-600 text-white hover:bg-red-500 transition-all cursor-pointer"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteCommentConfirmId(null)}
                          className="rounded-lg px-2.5 py-1 text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteCommentConfirmId(comment.id)}
                        className="flex items-center space-x-1 rounded-lg bg-red-950/40 border border-red-900/30 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all self-end sm:self-center cursor-pointer"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "stats" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Server Overview
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/30 border border-slate-900">
                <span className="text-slate-400">Media Server Status:</span>
                <span className="text-emerald-400 font-bold flex items-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
                  Online (99.9%)
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/30 border border-slate-900">
                <span className="text-slate-400">Download Traffic:</span>
                <span className="text-slate-200 font-bold">3.2 GB/s</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/30 border border-slate-900">
                <span className="text-slate-400">Active Download Sessions:</span>
                <span className="text-slate-200 font-bold">480+ Continuous</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/30 border border-slate-900">
                <span className="text-slate-400">Server Location:</span>
                <span className="text-amber-400 font-bold">Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center">
              <HardDrive className="h-4 w-4 mr-1.5" />
              Category Content Storage Distribution
            </h3>
            <div className="space-y-3.5">
              {["Action", "Drama", "Thriller", "Sci-Fi", "Comedy", "Animation", "Horror"].map((cat) => {
                const count = movies.filter((m) => m.category === cat).length;
                const percentage = totalMovies > 0 ? (count / totalMovies) * 100 : 0;

                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>{cat} ({count} Movies)</span>
                      <span>{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
