export interface DownloadLink {
  id: string;
  label: string; // e.g. "1080p BluRay (Dual Audio)", "720p WEBRip", "4K UHD"
  url: string;   // magnet link or download link
  size: string;  // e.g. "2.4 GB", "1.2 GB"
}

export interface Comment {
  id: string;
  userName: string;
  userEmail?: string;
  text: string;
  rating?: number; // optionally linked to a rating
  timestamp: string; // ISO string or readable format
  isAdmin?: boolean;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  imageUrl: string; // Poster
  bannerUrl: string; // Hero banner background
  category: string; // e.g. "Action", "Drama", "Thriller", "Sci-Fi", "Comedy"
  releaseYear: number;
  rating: number; // calculated average rating (1 to 5)
  quality: string; // primary display quality (e.g., "1080p", "4K", "720p")
  size: string; // e.g. "1.5 GB"
  language: string; // e.g. "Bengali", "English", "Hindi", "Korean"
  duration: string; // e.g. "2h 14m"
  director: string;
  cast: string[];
  downloadLinks: DownloadLink[];
  comments: Comment[];
  featured?: boolean;
  views?: number;
}

export type Category = "All" | "Action" | "Drama" | "Thriller" | "Sci-Fi" | "Comedy" | "Animation" | "Horror";
