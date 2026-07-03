import React, { useState, useEffect } from "react";
import { Film, Search, Settings, ShieldCheck, LogOut } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  moviesCount: number;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  isAdminMode,
  setIsAdminMode,
  moviesCount
}: HeaderProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync local search input with global search state (e.g. if cleared from outside)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

  const handleClear = () => {
    setLocalSearch("");
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          className="flex cursor-pointer items-center space-x-2" 
          onClick={() => {
            setIsAdminMode(false);
            setSearchQuery("");
          }}
          id="brand-logo"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20">
            <Film className="h-5 w-5 text-slate-950" />
            <div className="absolute -top-1 -right-1 flex h-4 w-4 animate-ping rounded-full bg-amber-400 opacity-20"></div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider text-white sm:text-2xl">
              Drama <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">Duniya</span>
            </h1>
            <p className="text-[10px] tracking-widest text-amber-400/80 uppercase font-bold">Premium Film Portal</p>
          </div>
        </div>

        {/* Global Search Bar (hidden when in admin mode) */}
        {!isAdminMode && (
          <form onSubmit={handleSearchSubmit} className="relative mx-4 hidden max-w-md flex-1 sm:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search movies, cast, or directors..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-24 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all focus:border-amber-500 focus:bg-slate-900 focus:ring-1 focus:ring-amber-500"
              id="search-input"
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center space-x-1 py-1">
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-1.5 py-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-all hover:bg-amber-400 hover:shadow-md hover:shadow-amber-500/10 active:scale-95"
              >
                Search
              </button>
            </div>
          </form>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {isAdminMode && (
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-amber-500/20">
                <ShieldCheck className="h-3 w-3 mr-0.5" />
                Admin Mode
              </span>
              <button
                onClick={() => setIsAdminMode(false)}
                className="flex items-center space-x-1 rounded-xl bg-red-950/40 border border-red-900/40 px-3.5 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-950/60 hover:text-red-300"
                id="admin-logout-btn"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exit Control</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar (Only visible in User Mode) */}
      {!isAdminMode && (
        <div className="border-t border-slate-900 px-4 py-2.5 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center space-x-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search movies or cast..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-14 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                id="mobile-search-input"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute inset-y-0 right-2 flex items-center text-[10px] font-semibold text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 active:scale-95"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
