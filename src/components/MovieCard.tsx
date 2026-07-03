import React from "react";
import { Star, Download, Eye, Clock } from "lucide-react";
import { Movie } from "../types";

interface MovieCardProps {
  key?: string;
  movie: Movie;
  onSelect: (movie: Movie) => void;
}

export default function MovieCard({ movie, onSelect }: MovieCardProps) {
  // Safe calculation for rating format
  const formattedRating = typeof movie.rating === "number" ? movie.rating.toFixed(1) : "5.0";

  return (
    <div
      onClick={() => onSelect(movie)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-800/80 p-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/40 hover:bg-slate-900 hover:shadow-2xl hover:shadow-amber-500/5"
      id={`movie-card-${movie.id}`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-slate-950">
        <img
          src={movie.imageUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80"}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Quality Tag - Top Left */}
        <div className="absolute top-2 left-2 rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-sm border border-amber-400/20">
          {movie.quality}
        </div>

        {/* Rating Tag - Top Right */}
        <div className="absolute top-2 right-2 flex items-center space-x-1 rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-sm border border-yellow-400/20">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span>{formattedRating}</span>
        </div>

        {/* Size tag - Bottom Right */}
        <div className="absolute bottom-2 right-2 rounded bg-slate-950/80 px-1.5 py-0.5 text-[9px] font-medium text-slate-300 backdrop-blur-sm">
          {movie.size}
        </div>

        {/* Play / Details Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
          <div className="rounded-full bg-amber-500 p-3.5 text-slate-950 shadow-lg shadow-amber-500/30 transition-transform duration-300 group-hover:scale-110">
            <Download className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Metadata Info */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="truncate text-amber-400/90">{movie.category}</span>
          <span className="flex items-center"><Clock className="h-3 w-3 mr-0.5 text-slate-500" />{movie.duration}</span>
        </div>

        <h3 className="mt-1.5 line-clamp-1 text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
          {movie.title}
        </h3>

        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span className="rounded bg-slate-900 px-1.5 py-0.5 border border-slate-800">{movie.language}</span>
          <span>{movie.releaseYear}</span>
        </div>
      </div>
    </div>
  );
}
