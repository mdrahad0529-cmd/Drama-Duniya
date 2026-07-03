import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, X, Film, Info, LayoutGrid, Download, Upload } from "lucide-react";
import { Movie, DownloadLink } from "../types";

interface MovieFormProps {
  movie?: Movie; // If provided, we are editing
  onSave: (movie: Omit<Movie, "id" | "comments" | "views"> & { id?: string }) => void;
  onCancel: () => void;
}

export default function MovieForm({ movie, onSave, onCancel }: MovieFormProps) {
  // Movie Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [category, setCategory] = useState("Action");
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [quality, setQuality] = useState("1080p WebRip");
  const [size, setSize] = useState("1.4 GB");
  const [language, setLanguage] = useState("Bengali");
  const [duration, setDuration] = useState("2h 15m");
  const [director, setDirector] = useState("");
  const [castInput, setCastInput] = useState("");
  const [featured, setFeatured] = useState(false);

  // Dynamic Download Links State
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([
    { id: "1", label: "Direct Download 1080p (Fast Server)", url: "#", size: "1.4 GB" }
  ]);

  // Load existing movie data for editing
  useEffect(() => {
    if (movie) {
      setTitle(movie.title);
      setDescription(movie.description);
      setImageUrl(movie.imageUrl);
      setBannerUrl(movie.bannerUrl || "");
      setCategory(movie.category);
      setReleaseYear(movie.releaseYear);
      setQuality(movie.quality);
      setSize(movie.size);
      setLanguage(movie.language);
      setDuration(movie.duration);
      setDirector(movie.director);
      setCastInput(movie.cast ? movie.cast.join(", ") : "");
      setFeatured(movie.featured || false);
      if (movie.downloadLinks && movie.downloadLinks.length > 0) {
        setDownloadLinks(movie.downloadLinks);
      }
    }
  }, [movie]);

  // Handle adding a new download link row
  const addDownloadLinkRow = () => {
    const newId = (downloadLinks.length + 1).toString() + "-" + Date.now();
    setDownloadLinks([
      ...downloadLinks,
      { id: newId, label: "Server Mirror (Download)", url: "#", size: "1.4 GB" }
    ]);
  };

  // Handle removing a download link row
  const removeDownloadLinkRow = (id: string) => {
    if (downloadLinks.length <= 1) return; // Must have at least one link
    setDownloadLinks(downloadLinks.filter((link) => link.id !== id));
  };

  // Handle modifying individual download link cell
  const updateDownloadLinkCell = (id: string, field: keyof Omit<DownloadLink, "id">, value: string) => {
    setDownloadLinks(
      downloadLinks.map((link) => {
        if (link.id === id) {
          return { ...link, [field]: value };
        }
        return link;
      })
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "poster" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === "poster") {
        setImageUrl(base64String);
      } else {
        setBannerUrl(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // Process Cast list from comma separated string
    const cast = castInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    onSave({
      id: movie?.id,
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
      bannerUrl: bannerUrl.trim() || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
      category,
      releaseYear: Number(releaseYear),
      rating: movie?.rating || 5.0, // default rating is 5.0
      quality,
      size,
      language,
      duration,
      director: director.trim() || "Unknown",
      cast,
      featured,
      downloadLinks
    });
  };

  const categories = ["Action", "Drama", "Thriller", "Sci-Fi", "Comedy", "Animation", "Horror"];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2 text-amber-400">
          <Film className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white">
            {movie ? "Edit Movie Metadata" : "Add New Movie"}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-sm">
        {/* Core Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Movie / Drama Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Toofan (2024)"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Description / Plot Summary *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter movie description beautifully to keep visitors engaged..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 outline-none focus:border-amber-500 transition-all resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 outline-none focus:border-amber-500 transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Release Year *</label>
                <input
                  type="number"
                  required
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(Number(e.target.value))}
                  placeholder="e.g., 2024"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
              <Info className="h-3.5 w-3.5 mr-1" />
              Technical Specifications
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Display Quality *</label>
              <input
                type="text"
                required
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                placeholder="e.g., 1080p WebRip"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Primary File Size *</label>
              <input
                type="text"
                required
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g., 1.4 GB"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Language *</label>
              <input
                type="text"
                required
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g., English / Japanese"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Duration *</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 2h 15m"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Casting, Poster and Featured section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Director (Optional)</label>
              <input
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="e.g., Raihan Rafi"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Cast / Actors (comma-separated) (Optional)</label>
              <input
                type="text"
                value={castInput}
                onChange={(e) => setCastInput(e.target.value)}
                placeholder="e.g., Matthew McConaughey, Anne Hathaway"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 outline-none focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-400 font-semibold">Poster Image</label>
                <span className="text-[11px] text-slate-500 font-medium">URL or File Upload</span>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 transition-all"
                />
                <div className="flex items-center space-x-2">
                  <label className="flex-1 flex items-center justify-center space-x-2 rounded-xl border border-dashed border-slate-800 hover:border-amber-500 bg-slate-950/50 hover:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-all cursor-pointer">
                    <Upload className="h-3.5 w-3.5 text-amber-500" />
                    <span>{imageUrl && imageUrl.startsWith("data:image") ? "Change Poster File" : "Upload Poster Image File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "poster")}
                      className="hidden"
                    />
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="rounded-xl border border-slate-800 hover:border-red-500 bg-slate-950 px-3 py-2 text-xs text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {imageUrl && (
                  <div className="mt-1 relative rounded-lg overflow-hidden border border-slate-800 h-16 w-12 bg-slate-950 flex items-center justify-center">
                    <img src={imageUrl} alt="Poster preview" className="object-cover h-full w-full" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-400 font-semibold">Backdrop Banner</label>
                <span className="text-[11px] text-slate-500 font-medium">URL or File Upload</span>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 transition-all"
                />
                <div className="flex items-center space-x-2">
                  <label className="flex-1 flex items-center justify-center space-x-2 rounded-xl border border-dashed border-slate-800 hover:border-amber-500 bg-slate-950/50 hover:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-all cursor-pointer">
                    <Upload className="h-3.5 w-3.5 text-amber-500" />
                    <span>{bannerUrl && bannerUrl.startsWith("data:image") ? "Change Banner File" : "Upload Backdrop File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "banner")}
                      className="hidden"
                    />
                  </label>
                  {bannerUrl && (
                    <button
                      type="button"
                      onClick={() => setBannerUrl("")}
                      className="rounded-xl border border-slate-800 hover:border-red-500 bg-slate-950 px-3 py-2 text-xs text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {bannerUrl && (
                  <div className="mt-1 relative rounded-lg overflow-hidden border border-slate-800 h-16 w-32 bg-slate-950 flex items-center justify-center">
                    <img src={bannerUrl} alt="Banner preview" className="object-cover h-full w-full" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="featured" className="text-slate-300 font-semibold cursor-pointer select-none">
                Highlight this movie in the homepage hero banner as Featured?
              </label>
            </div>
          </div>
        </div>

        {/* Download Server Links setup */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-400">
              <Download className="h-4 w-4" />
              <h3 className="text-base font-bold text-white">Download Server Links *</h3>
            </div>
            <button
              type="button"
              onClick={addDownloadLinkRow}
              className="flex items-center space-x-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Link Option</span>
            </button>
          </div>

          <div className="space-y-3">
            {downloadLinks.map((link, index) => (
              <div 
                key={link.id} 
                className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800"
              >
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-500 mb-0.5">Server Label / Quality</label>
                  <input
                    type="text"
                    required
                    value={link.label}
                    onChange={(e) => updateDownloadLinkCell(link.id, "label", e.target.value)}
                    placeholder="e.g., Download 1080p BluRay (Ultra Fast)"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 py-1 px-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="w-full md:w-32">
                  <label className="block text-[10px] text-slate-500 mb-0.5">Size</label>
                  <input
                    type="text"
                    required
                    value={link.size}
                    onChange={(e) => updateDownloadLinkCell(link.id, "size", e.target.value)}
                    placeholder="e.g., 2.1 GB"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 py-1 px-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] text-slate-500 mb-0.5">Download URL (Direct / Magnet Link)</label>
                  <input
                    type="text"
                    required
                    value={link.url}
                    onChange={(e) => updateDownloadLinkCell(link.id, "url", e.target.value)}
                    placeholder="Direct server download or magnet URL"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 py-1 px-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                {downloadLinks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDownloadLinkRow(link.id)}
                    className="mt-4 md:mt-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg self-end md:self-center transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action controls */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-slate-800 px-6 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 flex items-center space-x-1.5 shadow-md shadow-amber-500/10 hover:shadow-lg active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>Save Movie Metadata</span>
          </button>
        </div>
      </form>
    </div>
  );
}
