"use client"

import { useState } from "react"
import Image from "next/image"
import { X, Play, Plus, ThumbsUp, Share2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImmersiveGraph } from "@/components/immersive-graph"
import { SimilarMovies } from "@/components/similar-movies"
import { RecommendationChat } from "@/components/recommendation-chat"
import { SidebarRecommendationChat } from "@/components/sidebar-recommendation-chat"
import type { Movie } from "@/types/movie"
import { useMockData } from "@/hooks/use-mock-data"

interface MovieDetailProps {
  movie: Movie
  onClose: () => void
  onSelectMovie: (movie: Movie) => void
}

export function MovieDetail({ movie, onClose, onSelectMovie }: MovieDetailProps) {
  const { getGenreName, getSimilarMovies } = useMockData()
  const [activeTab, setActiveTab] = useState("overview")
  const [showChat, setShowChat] = useState(false)

  const similarMovies = getSimilarMovies(movie.id)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 z-10 bg-black/50 hover:bg-black/70 rounded-full"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
            <Image
              src={movie.backdropUrl || `/placeholder.svg?height=720&width=1280`}
              alt={movie.title}
              width={1280}
              height={720}
              className="object-cover w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span>{movie.year}</span>
                <span className="border border-gray-500 px-1 rounded">HD</span>
                <span>{movie.runtime} min</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Play
            </Button>
            <Button variant="outline" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              <ThumbsUp className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant={showChat ? "default" : "outline"} size="icon" onClick={() => setShowChat(!showChat)}>
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>

          {showChat ? (
            <div className="h-[600px] mb-8">
              <RecommendationChat
                onSelectMovie={(selectedMovie) => {
                  setShowChat(false)
                  onSelectMovie(selectedMovie)
                }}
                onClose={() => setShowChat(false)}
              />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="bg-gray-900">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="connections">Graph Explorer</TabsTrigger>
                <TabsTrigger value="similar">Similar</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <p className="text-gray-300 mb-4">{movie.overview}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.genres.map((genreId) => (
                        <Badge key={genreId} variant="outline">
                          {getGenreName(genreId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm">
                      <p className="mb-2">
                        <span className="text-gray-400">Rating: </span>
                        <span className="text-white">{movie.rating}/5</span>
                      </p>
                      <p className="mb-2">
                        <span className="text-gray-400">Director: </span>
                        <span className="text-white">{movie.director}</span>
                      </p>
                      <p className="mb-2">
                        <span className="text-gray-400">Cast: </span>
                        <span className="text-white">{movie.cast.join(", ")}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="connections" className="pt-4">
                <div className="bg-gray-900 rounded-lg p-4 h-[600px]">
                  <ImmersiveGraph
                    movieId={movie.id}
                    onSelectMovie={(selectedMovie) => {
                      // Reset to overview tab when selecting a new movie
                      setActiveTab("overview")
                      onClose()
                      // Small delay to allow the current movie to close
                      setTimeout(() => {
                        onSelectMovie(selectedMovie)
                      }, 100)
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="similar" className="pt-4">
                <SimilarMovies
                  movies={similarMovies}
                  onSelectMovie={(selectedMovie) => {
                    // Reset to overview tab when selecting a new movie
                    setActiveTab("overview")
                    onClose()
                    // Small delay to allow the current movie to close
                    setTimeout(() => {
                      onSelectMovie(selectedMovie)
                    }, 100)
                  }}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="aspect-[2/3] rounded-lg overflow-hidden mb-4">
              <Image
                src={movie.posterUrl || `/placeholder.svg?height=450&width=300`}
                alt={movie.title}
                width={300}
                height={450}
                className="object-cover w-full h-full"
              />
            </div>

            <h3 className="text-lg font-medium mb-2">Why it's recommended</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              {movie.recommendationReasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>

            {/* Sidebar Recommendation Chat */}
            <SidebarRecommendationChat currentMovieId={movie.id} onSelectMovie={onSelectMovie} />
          </div>
        </div>
      </div>
    </div>
  )
}

