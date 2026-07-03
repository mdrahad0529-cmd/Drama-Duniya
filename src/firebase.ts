import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  updateDoc,
  increment
} from "firebase/firestore";
import { Movie, Comment } from "./types";
import { INITIAL_MOVIES } from "./data/initialMovies";

const firebaseConfig = {
  apiKey: "AIzaSyDTdIsdOVXRAI320bMMhQltuNoJVmno_M0",
  authDomain: "gen-lang-client-0593176189.firebaseapp.com",
  projectId: "gen-lang-client-0593176189",
  storageBucket: "gen-lang-client-0593176189.firebasestorage.app",
  messagingSenderId: "132316191373",
  appId: "1:132316191373:web:a9b264cdd3e9bab13060c4"
};

const app = initializeApp(firebaseConfig);

// Use the specific named Firestore Database ID provisioned for this applet
export const db = initializeFirestore(app, {}, "ai-studio-dramaduniya-01c982a9-848e-4de5-8267-7ae6157a0fca");

const moviesCollection = collection(db, "movies");

// Seed database with initial movies if empty
export async function seedMoviesIfEmpty() {
  try {
    const querySnapshot = await getDocs(moviesCollection);
    if (querySnapshot.empty) {
      console.log("Firestore movies collection is empty. Seeding initial movies...");
      const batch = writeBatch(db);
      INITIAL_MOVIES.forEach((movie) => {
        const docRef = doc(moviesCollection, movie.id);
        batch.set(docRef, movie);
      });
      await batch.commit();
      console.log("Successfully seeded Firestore with initial movies.");
    } else {
      console.log("Firestore movies collection already has data. Skipping seeding.");
    }
  } catch (error) {
    console.error("Error seeding movies: ", error);
  }
}

// Subscribe to movies list in real-time
export function subscribeToMovies(onUpdate: (movies: Movie[]) => void) {
  return onSnapshot(moviesCollection, (snapshot) => {
    const moviesList: Movie[] = [];
    snapshot.forEach((doc) => {
      moviesList.push(doc.data() as Movie);
    });
    
    // Sort movies: featured first, then id descending
    moviesList.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.id.localeCompare(a.id);
    });
    
    onUpdate(moviesList);
  }, (error) => {
    console.error("Error subscribing to movies: ", error);
  });
}

// Admin: Add a movie
export async function addFirestoreMovie(movieData: Omit<Movie, "id" | "comments" | "views">) {
  const id = "m-" + Date.now();
  const newMovie: Movie = {
    ...movieData,
    id,
    views: 0,
    comments: []
  };
  await setDoc(doc(moviesCollection, id), newMovie);
}

// Admin: Edit movie info
export async function updateFirestoreMovie(movie: Movie) {
  await setDoc(doc(moviesCollection, movie.id), movie);
}

// Admin: Delete a movie
export async function deleteFirestoreMovie(id: string) {
  await deleteDoc(doc(moviesCollection, id));
}

// Increment movie views
export async function incrementMovieViews(id: string) {
  const docRef = doc(moviesCollection, id);
  await updateDoc(docRef, {
    views: increment(1)
  });
}

// Update comments and rating together
export async function updateMovieCommentsAndRating(movieId: string, comments: Comment[], rating: number) {
  const docRef = doc(moviesCollection, movieId);
  await updateDoc(docRef, {
    comments,
    rating
  });
}
