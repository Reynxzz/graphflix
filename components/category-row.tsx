"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Movie } from "@/types/movie"
import { Button } from "@/components/ui/button"

interface CategoryRowProps {
  title: string
  movies: Movie[]
  onSelectMovie: (movie: Movie) => void
}

export function CategoryRow({ title, movies, onSelectMovie }: CategoryRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75

      rowRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      })
    }
  }

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  if (movies.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="relative group">
        {showLeftArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 rounded-full h-10 w-10"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        <div ref={rowRef} className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" onScroll={handleScroll}>
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex-none w-[180px] cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={() => onSelectMovie(movie)}
            >
              <div className="aspect-[2/3] rounded-md overflow-hidden bg-gray-800">
                <Image
                  src={movie.posterUrl || `/placeholder.svg?height=270&width=180`}
                  alt={movie.title}
                  width={180}
                  height={270}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="mt-2 text-sm font-medium line-clamp-1">{movie.title}</h3>
              <p className="text-xs text-gray-400">{movie.year}</p>
            </div>
          ))}
        </div>

        {showRightArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 rounded-full h-10 w-10"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}
      </div>
    </section>
  )
}

