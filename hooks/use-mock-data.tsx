"use client"

import { useCallback } from "react"
import type { Movie } from "../types/movie"
import type { Genre } from "../types/genre"

// Mock data for the application
// Mock data for the application
const mockMovies: Movie[] = [
    {
      id: "movie_1",
      title: "Toy Story",
      year: 1995,
      overview:
        "A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy's room.",
      genres: ["genre_animation", "genre_adventure", "genre_comedy", "genre_family"],
      rating: 4.2,
      runtime: 81,
      director: "John Lasseter",
      cast: ["Tom Hanks", "Tim Allen", "Don Rickles"],
      posterUrl: "https://placehold.co/300x450/87CEEB/000000/png?text=Toy+Story",
      backdropUrl: "https://placehold.co/1280x720/87CEEB/000000/png?text=Toy+Story",
      recommendationReasons: [
        "Based on your interest in animated films",
        "Popular among users with similar taste",
        "Strong connections to other family movies you've watched",
      ],
    },
    {
      id: "movie_2",
      title: "Jumanji",
      year: 1995,
      overview:
        "When two kids find and play a magical board game, they release a man trapped in it for decades - and a host of dangers that can only be stopped by finishing the game.",
      genres: ["genre_adventure", "genre_fantasy", "genre_family"],
      rating: 3.9,
      runtime: 104,
      director: "Joe Johnston",
      cast: ["Robin Williams", "Kirsten Dunst", "Bonnie Hunt"],
      posterUrl: "https://placehold.co/300x450/228B22/FFFFFF/png?text=Jumanji",
      backdropUrl: "https://placehold.co/1280x720/228B22/FFFFFF/png?text=Jumanji",
      recommendationReasons: [
        "Similar to other adventure films you've enjoyed",
        "Features fantasy elements common in your watchlist",
        "Connected to other Robin Williams movies in your history",
      ],
    },
    {
      id: "movie_3",
      title: "The Matrix",
      year: 1999,
      overview:
        "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
      genres: ["genre_action", "genre_scifi"],
      rating: 4.7,
      runtime: 136,
      director: "Lana and Lilly Wachowski",
      cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
      posterUrl: "https://placehold.co/300x450/000000/00FF00/png?text=The+Matrix",
      backdropUrl: "https://placehold.co/1280x720/000000/00FF00/png?text=The+Matrix",
      recommendationReasons: [
        "Based on your interest in sci-fi films",
        "Connected to other dystopian movies you've watched",
        "High similarity to other action films in your history",
      ],
    },
    {
      id: "movie_4",
      title: "Pulp Fiction",
      year: 1994,
      overview:
        "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      genres: ["genre_crime", "genre_drama", "genre_thriller"],
      rating: 4.8,
      runtime: 154,
      director: "Quentin Tarantino",
      cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
      posterUrl: "https://placehold.co/300x450/FFD700/000000/png?text=Pulp+Fiction",
      backdropUrl: "https://placehold.co/1280x720/FFD700/000000/png?text=Pulp+Fiction",
      recommendationReasons: [
        "Connected to other crime films in your history",
        "Similar to other Tarantino movies you've enjoyed",
        "Strong thematic connections to other films in your watchlist",
      ],
    },
    {
      id: "movie_5",
      title: "Forrest Gump",
      year: 1994,
      overview:
        "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
      genres: ["genre_drama", "genre_romance"],
      rating: 4.5,
      runtime: 142,
      director: "Robert Zemeckis",
      cast: ["Tom Hanks", "Robin Wright", "Gary Sinise"],
      posterUrl: "https://placehold.co/300x450/4682B4/FFFFFF/png?text=Forrest+Gump",
      backdropUrl: "https://placehold.co/1280x720/4682B4/FFFFFF/png?text=Forrest+Gump",
      recommendationReasons: [
        "Based on your interest in historical dramas",
        "Connected to other Tom Hanks films you've watched",
        "Similar emotional themes to movies in your history",
      ],
    },
    {
      id: "movie_6",
      title: "Inception",
      year: 2010,
      overview:
        "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      genres: ["genre_action", "genre_scifi", "genre_thriller"],
      rating: 4.6,
      runtime: 148,
      director: "Christopher Nolan",
      cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"],
      posterUrl: "https://placehold.co/300x450/483D8B/FFFFFF/png?text=Inception",
      backdropUrl: "https://placehold.co/1280x720/483D8B/FFFFFF/png?text=Inception",
      recommendationReasons: [
        "Similar to other mind-bending films you've enjoyed",
        "Connected to other Christopher Nolan movies in your history",
        "Strong thematic links to sci-fi films in your watchlist",
      ],
    },
    {
      id: "movie_7",
      title: "The Shawshank Redemption",
      year: 1994,
      overview:
        "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      genres: ["genre_drama", "genre_crime"],
      rating: 4.9,
      runtime: 142,
      director: "Frank Darabont",
      cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
      posterUrl: "https://placehold.co/300x450/8B4513/FFFFFF/png?text=Shawshank+Redemption",
      backdropUrl: "https://placehold.co/1280x720/8B4513/FFFFFF/png?text=Shawshank+Redemption",
      recommendationReasons: [
        "Based on your interest in prison dramas",
        "Connected to other Stephen King adaptations you've watched",
        "Similar themes to other redemption stories in your history",
      ],
    },
    {
      id: "movie_8",
      title: "The Dark Knight",
      year: 2008,
      overview:
        "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
      genres: ["genre_action", "genre_crime", "genre_drama", "genre_thriller"],
      rating: 4.8,
      runtime: 152,
      director: "Christopher Nolan",
      cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
      posterUrl: "https://placehold.co/300x450/2F4F4F/FFA500/png?text=The+Dark+Knight",
      backdropUrl: "https://placehold.co/1280x720/2F4F4F/FFA500/png?text=The+Dark+Knight",
      recommendationReasons: [
        "Connected to other superhero films you've enjoyed",
        "Similar to other Christopher Nolan movies in your history",
        "Strong thematic links to crime thrillers in your watchlist",
      ],
    },
    // Add more mock movies as needed
  ]

const mockGenres: Genre[] = [
  { id: "genre_action", name: "Action" },
  { id: "genre_adventure", name: "Adventure" },
  { id: "genre_animation", name: "Animation" },
  { id: "genre_comedy", name: "Comedy" },
  { id: "genre_crime", name: "Crime" },
  { id: "genre_drama", name: "Drama" },
  { id: "genre_family", name: "Family" },
  { id: "genre_fantasy", name: "Fantasy" },
  { id: "genre_horror", name: "Horror" },
  { id: "genre_romance", name: "Romance" },
  { id: "genre_scifi", name: "Sci-Fi" },
  { id: "genre_thriller", name: "Thriller" },
]

// Mock similarity data
const mockSimilarities: Record<string, Array<{ id: string; similarity: number }>> = {
  movie_1: [
    { id: "movie_2", similarity: 0.75 },
    { id: "movie_5", similarity: 0.62 },
    { id: "movie_6", similarity: 0.45 },
  ],
  movie_2: [
    { id: "movie_1", similarity: 0.75 },
    { id: "movie_3", similarity: 0.58 },
    { id: "movie_8", similarity: 0.42 },
  ],
  movie_3: [
    { id: "movie_6", similarity: 0.82 },
    { id: "movie_8", similarity: 0.71 },
    { id: "movie_2", similarity: 0.58 },
  ],
  movie_4: [
    { id: "movie_7", similarity: 0.68 },
    { id: "movie_8", similarity: 0.65 },
    { id: "movie_5", similarity: 0.52 },
  ],
  movie_5: [
    { id: "movie_7", similarity: 0.78 },
    { id: "movie_4", similarity: 0.52 },
    { id: "movie_1", similarity: 0.62 },
  ],
  movie_6: [
    { id: "movie_3", similarity: 0.82 },
    { id: "movie_8", similarity: 0.76 },
    { id: "movie_1", similarity: 0.45 },
  ],
  movie_7: [
    { id: "movie_5", similarity: 0.78 },
    { id: "movie_4", similarity: 0.68 },
    { id: "movie_8", similarity: 0.59 },
  ],
  movie_8: [
    { id: "movie_6", similarity: 0.76 },
    { id: "movie_3", similarity: 0.71 },
    { id: "movie_4", similarity: 0.65 },
  ],
}

// Mock tags for movies
const mockTags: Record<string, string[]> = {
  movie_1: ["animated", "pixar", "toys", "friendship"],
  movie_2: ["board game", "adventure", "jungle", "magic"],
  movie_3: ["cyberpunk", "dystopian", "virtual reality", "kung fu"],
  movie_4: ["nonlinear", "crime", "dialogue", "hitman"],
  movie_5: ["historical", "inspirational", "americana", "vietnam"],
  movie_6: ["dreams", "heist", "mind-bending", "psychological"],
  movie_7: ["prison", "friendship", "hope", "redemption"],
  movie_8: ["superhero", "villain", "dark", "psychological"],
}

export function useMockData() {
  // Get all movies
  const getAllMovies = useCallback(() => {
    return mockMovies
  }, [])

  // Get popular movies
  const getPopularMovies = useCallback(() => {
    return [...mockMovies].sort((a, b) => b.rating - a.rating).slice(0, 6)
  }, [])

  // Get all genres
  const getAllGenres = useCallback(() => {
    return mockGenres
  }, [])

  // Get genre name by ID
  const getGenreName = useCallback((genreId: string) => {
    const genre = mockGenres.find((g) => g.id === genreId)
    return genre ? genre.name : "Unknown"
  }, [])

  // Get movie by ID
  const getMovie = useCallback((movieId: string) => {
    return mockMovies.find((m) => m.id === movieId)
  }, [])

  // Get similar movies
  const getSimilarMovies = useCallback((movieId: string) => {
    const similarIds = mockSimilarities[movieId] || []
    return similarIds.map((sim) => {
      const movie = mockMovies.find((m) => m.id === sim.id)
      return { ...movie, similarity: sim.similarity } as Movie & { similarity: number }
    })
  }, [])

  // Get graph data for visualization
  const getGraphData = useCallback(
    (movieId: string) => {
      // Start with the central movie
      const movie = mockMovies.find((m) => m.id === movieId)
      if (!movie) return { nodes: [], links: [] }

      const nodes: any[] = [{ id: movie.id, name: movie.title, type: "movie", year: movie.year }]

      const links: any[] = []

      // Add genre nodes and connections
      movie.genres.forEach((genreId) => {
        const genre = mockGenres.find((g) => g.id === genreId)
        if (genre) {
          nodes.push({ id: genre.id, name: genre.name, type: "genre" })
          links.push({
            source: movie.id,
            target: genre.id,
            type: "belongs_to",
          })
        }
      })

      // Add tag nodes and connections
      const movieTags = mockTags[movie.id] || []
      movieTags.forEach((tag, index) => {
        const tagId = `tag_${movie.id}_${index}`
        nodes.push({ id: tagId, name: tag, type: "tag" })
        links.push({
          source: movie.id,
          target: tagId,
          type: "has_tag",
        })
      })

      // Add similar movie nodes and connections
      const similarMovies = getSimilarMovies(movie.id)
      similarMovies.forEach((similarMovie) => {
        nodes.push({
          id: similarMovie.id,
          name: similarMovie.title,
          type: "movie",
          year: similarMovie.year,
        })

        links.push({
          source: movie.id,
          target: similarMovie.id,
          type: "similar_to",
          similarity: similarMovie.similarity,
        })

        // Add some shared genres to show connections
        const sharedGenres = movie.genres.filter((g) => similarMovie.genres.includes(g))

        sharedGenres.forEach((genreId) => {
          // Check if this genre node already exists
          if (!nodes.some((node) => node.id === genreId)) {
            const genre = mockGenres.find((g) => g.id === genreId)
            if (genre) {
              nodes.push({ id: genreId, name: genre.name, type: "genre" })
            }
          }

          links.push({
            source: similarMovie.id,
            target: genreId,
            type: "belongs_to",
          })
        })

        // Add some tags for similar movies
        const similarMovieTags = mockTags[similarMovie.id] || []
        similarMovieTags.slice(0, 2).forEach((tag, index) => {
          const tagId = `tag_${similarMovie.id}_${index}`

          // Check if this tag node already exists
          if (!nodes.some((node) => node.id === tagId)) {
            nodes.push({ id: tagId, name: tag, type: "tag" })
          }

          links.push({
            source: similarMovie.id,
            target: tagId,
            type: "has_tag",
          })
        })
      })

      return { nodes, links }
    },
    [getSimilarMovies],
  )

  return {
    movies: getAllMovies(),
    popularMovies: getPopularMovies(),
    genres: getAllGenres(),
    getGenreName,
    getMovie,
    getSimilarMovies,
    getGraphData,
  }
}

