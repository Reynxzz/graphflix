"use client"

import { useState } from "react"
import { MovieGrid } from "@/components/movie-grid"
import { MovieDetail } from "@/components/movie-detail"
import { NavBar } from "@/components/nav-bar"
import { CategoryRow } from "@/components/category-row"
import { useMockData } from '../hooks/use-mock-data'
import type { Movie } from "../types"

export function MovieBrowser() {
  const { movies, genres, popularMovies } = useMockData()
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie)
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
  }

  return (
    <div className="flex flex-col w-full">
      <NavBar onSelectMovie={handleSelectMovie} />

      <div className="px-4 md:px-8 pt-20 pb-10">
        {!showDetail ? (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Popular Movies</h2>
              <MovieGrid movies={popularMovies} onSelectMovie={handleSelectMovie} />
            </section>

            {genres.map((genre) => (
              <CategoryRow
                key={genre.id}
                title={genre.name}
                movies={movies.filter((m) => m.genres.includes(genre.id))}
                onSelectMovie={handleSelectMovie}
              />
            ))}
          </>
        ) : (
          <MovieDetail movie={selectedMovie!} onClose={handleCloseDetail} onSelectMovie={handleSelectMovie} />
        )}
      </div>
    </div>
  )
}

