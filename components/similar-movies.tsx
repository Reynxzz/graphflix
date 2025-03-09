"use client"

import type { Movie } from "@/types/movie"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { useMockData } from "@/hooks/use-mock-data"

interface SimilarMoviesProps {
  movies: Array<Movie & { similarity: number }>
  onSelectMovie: (movie: Movie) => void
}

export function SimilarMovies({ movies, onSelectMovie }: SimilarMoviesProps) {
  const { getGenreName } = useMockData()

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium">Similar Movies</h3>

      <div className="space-y-4">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="flex gap-4 p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            onClick={() => onSelectMovie(movie)}
          >
            <div className="flex-shrink-0 w-24">
              <div className="aspect-[2/3] rounded overflow-hidden">
                <Image
                  src={movie.posterUrl || `/placeholder.svg?height=150&width=100`}
                  alt={movie.title}
                  width={100}
                  height={150}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            <div className="flex-1">
              <h4 className="font-medium mb-1">
                {movie.title} ({movie.year})
              </h4>

              <div className="flex items-center gap-2 mb-2">
                <div className="text-xs px-1.5 py-0.5 bg-green-600 rounded">
                  {Math.round(movie.similarity * 100)}% match
                </div>
                <div className="text-xs text-gray-400">{movie.runtime} min</div>
              </div>

              <p className="text-xs text-gray-300 line-clamp-2 mb-2">{movie.overview}</p>

              <div className="flex flex-wrap gap-1">
                {movie.genres.slice(0, 3).map((genreId) => (
                  <Badge key={genreId} variant="outline" className="text-xs">
                    {getGenreName(genreId)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

