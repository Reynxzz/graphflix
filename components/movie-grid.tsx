"use client"

import Image from "next/image"
import type { Movie } from "@/types/movie"

interface MovieGridProps {
  movies: Movie[]
  onSelectMovie: (movie: Movie) => void
}

export function MovieGrid({ movies, onSelectMovie }: MovieGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="relative group cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={() => onSelectMovie(movie)}
        >
          <div className="aspect-[2/3] rounded-md overflow-hidden bg-gray-800">
            <Image
              src={movie.posterUrl || `/placeholder.svg?height=450&width=300`}
              alt={movie.title}
              width={300}
              height={450}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <h3 className="text-sm font-medium line-clamp-2">{movie.title}</h3>
            <p className="text-xs text-gray-300">{movie.year}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

