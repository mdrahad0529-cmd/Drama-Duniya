import { Movie } from "../types";

export const INITIAL_MOVIES: Movie[] = [
  {
    id: "1",
    title: "Toofan (2024)",
    description: "An action-packed blockbuster showing the rise and dominance of an underworld kingpin. With thrilling action sequences, outstanding background scores, and intense dialogue, it became one of the highest-grossing Bangladeshi movies of all time.",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
    category: "Action",
    releaseYear: 2024,
    rating: 4.8,
    quality: "1080p WebRip",
    size: "2.1 GB",
    language: "Bengali",
    duration: "2h 25m",
    director: "Raihan Rafi",
    cast: ["Shakib Khan", "Mimi Chakraborty", "Chanchal Chowdhury", "Masuma Rahman Nabila"],
    featured: true,
    views: 4520,
    downloadLinks: [
      { id: "1-1", label: "Toofan 1080p BluRay x264 Dual Audio (Bengali + English)", url: "#", size: "2.1 GB" },
      { id: "1-2", label: "Toofan 720p WEBRip x264 Bengali DD5.1", url: "#", size: "1.2 GB" },
      { id: "1-3", label: "Toofan 480p HDRip Bengali HEVC", url: "#", size: "650 MB" }
    ],
    comments: [
      { id: "c1", userName: "Sabbir Ahmed", text: "Shakib Khan's acting was on another level this time! Raihan Rafi's direction is superb.", rating: 5, timestamp: "2026-06-25T14:32:00Z" },
      { id: "c2", userName: "Nusrat Jahan", text: "Chanchal Chowdhury is always stellar. Great to be able to download in such good quality.", rating: 4, timestamp: "2026-06-26T09:15:00Z" }
    ]
  },
  {
    id: "2",
    title: "Surongo (2023)",
    description: "Masud, a simple driver, gets pushed into a dark criminal world because of greed and love. He plans a mind-boggling tunnel bank heist that shocks the whole nation. Based on true incidents and full of brilliant suspense.",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80",
    category: "Thriller",
    releaseYear: 2023,
    rating: 4.6,
    quality: "1080p BluRay",
    size: "1.8 GB",
    language: "Bengali",
    duration: "2h 30m",
    director: "Raihan Rafi",
    cast: ["Afran Nisho", "Tama Mirza", "Mustafa Monwar"],
    featured: true,
    views: 3120,
    downloadLinks: [
      { id: "2-1", label: "Surongo 1080p BluRay x264 DD5.1 Bengali", url: "#", size: "1.8 GB" },
      { id: "2-2", label: "Surongo 720p WEBRip x264 Bengali AAC", url: "#", size: "1.1 GB" },
      { id: "2-3", label: "Surongo 480p WEBRip HEVC Bengali", url: "#", size: "550 MB" }
    ],
    comments: [
      { id: "c3", userName: "Rashed Hasan", text: "Afran Nisho's debut on silver screen is absolutely incredible. Story is gripping!", rating: 5, timestamp: "2026-06-20T18:22:00Z" }
    ]
  },
  {
    id: "3",
    title: "Hawa (2022)",
    description: "A group of fishermen in deep waters discover an unknown, mystical young woman caught in their nets. Soon, strange incidents start happening on board, leading to suspicion, superstition, and ultimate tragedy in the middle of the sea.",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    category: "Drama",
    releaseYear: 2022,
    rating: 4.7,
    quality: "1080p WEBRip",
    size: "1.6 GB",
    language: "Bengali",
    duration: "2h 11m",
    director: "Mejbaur Rahman Sumon",
    cast: ["Chanchal Chowdhury", "Nazifa Tushi", "Sariful Razz", "Shohel Mondol"],
    featured: false,
    views: 5200,
    downloadLinks: [
      { id: "3-1", label: "Hawa 1080p WEB-DL x264 AAC 5.1 Bengali", url: "#", size: "1.6 GB" },
      { id: "3-2", label: "Hawa 720p WEBRip Bengali", url: "#", size: "990 MB" }
    ],
    comments: [
      { id: "c4", userName: "Tanvir Sadek", text: "A masterpiece of Bangladeshi cinema. Sound design, cinematography, everything is premium quality.", rating: 5, timestamp: "2026-06-18T12:00:00Z" }
    ]
  },
  {
    id: "4",
    title: "Interstellar (2014)",
    description: "When Earth becomes uninhabitable, a team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival. An epic sci-fi drama that bends time, space, and emotion.",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80",
    category: "Sci-Fi",
    releaseYear: 2014,
    rating: 4.9,
    quality: "4K UHD BluRay",
    size: "4.8 GB",
    language: "English",
    duration: "2h 49m",
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    featured: true,
    views: 8900,
    downloadLinks: [
      { id: "4-1", label: "Interstellar 2160p 4K HDR Atmos x265 (Dual Audio English+Hindi)", url: "#", size: "4.8 GB" },
      { id: "4-2", label: "Interstellar 1080p BluRay 10bit Dual Audio DTS-HD", url: "#", size: "2.4 GB" },
      { id: "4-3", label: "Interstellar 720p BRRip x264 English", url: "#", size: "1.1 GB" }
    ],
    comments: [
      { id: "c5", userName: "Abid Rahman", text: "One of the best sci-fi movies of all time. Nolan is a genius and Hans Zimmer's score is pure gold.", rating: 5, timestamp: "2026-06-28T22:11:00Z" }
    ]
  },
  {
    id: "5",
    title: "Inception (2010)",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.",
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80",
    category: "Sci-Fi",
    releaseYear: 2010,
    rating: 4.8,
    quality: "1080p BluRay",
    size: "2.0 GB",
    language: "English",
    duration: "2h 28m",
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"],
    featured: false,
    views: 6400,
    downloadLinks: [
      { id: "5-1", label: "Inception 1080p BluRay x264 Dual Audio (Eng + Hindi)", url: "#", size: "2.0 GB" },
      { id: "5-2", label: "Inception 720p BRRip AAC English", url: "#", size: "1.2 GB" }
    ],
    comments: []
  },
  {
    id: "6",
    title: "The Dark Knight (2008)",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    imageUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80",
    category: "Action",
    releaseYear: 2008,
    rating: 4.9,
    quality: "1080p BluRay",
    size: "2.3 GB",
    language: "English",
    duration: "2h 32m",
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Maggie Gyllenhaal"],
    featured: false,
    views: 9100,
    downloadLinks: [
      { id: "6-1", label: "The Dark Knight 1080p BluRay Dual Audio (English + Hindi)", url: "#", size: "2.3 GB" },
      { id: "6-2", label: "The Dark Knight 720p BluRay x264 English", url: "#", size: "1.2 GB" }
    ],
    comments: [
      { id: "c6", userName: "Mahdi Hasan", text: "Heath Ledger's performance is legendary. Best superhero movie ever.", rating: 5, timestamp: "2026-06-29T11:45:00Z" }
    ]
  },
  {
    id: "7",
    title: "Spirited Away (2001)",
    description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts. She must work at a bathhouse to free herself and her parents.",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80",
    category: "Animation",
    releaseYear: 2001,
    rating: 4.8,
    quality: "1080p BRRip",
    size: "1.4 GB",
    language: "Japanese",
    duration: "2h 5m",
    director: "Hayao Miyazaki",
    cast: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki"],
    featured: false,
    views: 3800,
    downloadLinks: [
      { id: "7-1", label: "Spirited Away 1080p BluRay Dual Audio (Japanese + English) DTS", url: "#", size: "1.4 GB" },
      { id: "7-2", label: "Spirited Away 720p BluRay AAC Dual Audio", url: "#", size: "850 MB" }
    ],
    comments: [
      { id: "c7", userName: "Anika Rahman", text: "Ghibli movies are absolute therapy. Beautiful animation and music.", rating: 5, timestamp: "2026-06-30T04:30:00Z" }
    ]
  },
  {
    id: "8",
    title: "The Conjuring (2013)",
    description: "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse. Based on true reports of spooky hauntings in Rhode Island.",
    imageUrl: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=500&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?w=1200&q=80",
    category: "Horror",
    releaseYear: 2013,
    rating: 4.5,
    quality: "1080p WebRip",
    size: "1.5 GB",
    language: "English",
    duration: "1h 52m",
    director: "James Wan",
    cast: ["Vera Farmiga", "Patrick Wilson", "Lili Taylor", "Ron Livingston"],
    featured: false,
    views: 4100,
    downloadLinks: [
      { id: "8-1", label: "The Conjuring 1080p BluRay x264 Dual Audio (Eng + Hindi)", url: "#", size: "1.5 GB" },
      { id: "8-2", label: "The Conjuring 720p WEBRip x264 English", url: "#", size: "900 MB" }
    ],
    comments: [
      { id: "c8", userName: "Imtiaz Shuvro", text: "Scariest theater experience ever back then. Still holds up perfectly!", rating: 4, timestamp: "2026-07-01T21:05:00Z" }
    ]
  }
];
