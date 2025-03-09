"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useMockData } from "../hooks/use-mock-data"
import type { Movie } from "../types/movie"

interface RecommendationChatProps {
  onSelectMovie: (movie: Movie) => void
  onClose: () => void
}

type MessageType = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  recommendations?: Movie[]
}

export function RecommendationChat({ onSelectMovie, onClose }: RecommendationChatProps) {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "welcome",
      content:
        "Hi there! I can help you discover movies based on your preferences. Try asking something like 'Show me sci-fi movies similar to The Matrix' or 'What are some good comedies from the 90s?'",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { movies, getMovie } = useMockData()

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // This is where you would integrate with your actual AI agent
      // For now, we'll use a mock implementation
      const aiResponse = await mockAIResponse(input)
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("Error getting AI response:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          content: "Sorry, I encountered an error while processing your request. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Mock AI response - replace this with your actual AI agent integration
  const mockAIResponse = async (userInput: string): Promise<MessageType> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const userInputLower = userInput.toLowerCase()
    let responseText = ""
    let recommendedMovies: Movie[] = []

    // Simple keyword matching for the mock
    if (userInputLower.includes("sci-fi") || userInputLower.includes("science fiction")) {
      responseText = "Here are some science fiction movies you might enjoy:"
      recommendedMovies = movies.filter((m) => m.genres.includes("genre_scifi")).slice(0, 3)
    } else if (userInputLower.includes("action")) {
      responseText = "Check out these action-packed movies:"
      recommendedMovies = movies.filter((m) => m.genres.includes("genre_action")).slice(0, 3)
    } else if (userInputLower.includes("drama")) {
      responseText = "These drama films might interest you:"
      recommendedMovies = movies.filter((m) => m.genres.includes("genre_drama")).slice(0, 3)
    } else if (userInputLower.includes("comedy")) {
      responseText = "Here are some comedies that should make you laugh:"
      recommendedMovies = movies.filter((m) => m.genres.includes("genre_comedy")).slice(0, 3)
    } else if (userInputLower.includes("similar") || userInputLower.includes("like")) {
      // Extract movie name after "similar to" or "like"
      const movieNames = movies.map((m) => m.title.toLowerCase())
      const matchedMovie = movieNames.find((name) => userInputLower.includes(name))

      if (matchedMovie) {
        const movie = movies.find((m) => m.title.toLowerCase() === matchedMovie)
        if (movie) {
          responseText = `If you liked ${movie.title}, you might also enjoy these similar movies:`
          // In a real implementation, you would use your graph to find similar movies
          const similarMovieIds = ["movie_3", "movie_6", "movie_8"].filter((id) => id !== movie.id)
          recommendedMovies = similarMovieIds.map((id) => getMovie(id)!).filter(Boolean)
        }
      } else {
        responseText = "I found some movies you might enjoy based on your preferences:"
        recommendedMovies = movies.slice(0, 3) // Just return some random movies
      }
    } else if (userInputLower.includes("90s") || userInputLower.includes("1990")) {
      responseText = "Here are some great movies from the 90s:"
      recommendedMovies = movies.filter((m) => m.year >= 1990 && m.year < 2000).slice(0, 3)
    } else if (userInputLower.includes("recommend") || userInputLower.includes("suggestion")) {
      responseText = "Based on the movies in our database, here are some recommendations for you:"
      // In a real implementation, you would use your recommendation algorithm
      recommendedMovies = movies.slice(0, 3)
    } else {
      responseText = "I'm not sure what kind of movies you're looking for. Here are some popular options:"
      recommendedMovies = movies.sort((a, b) => b.rating - a.rating).slice(0, 3)
    }

    return {
      id: `ai-${Date.now()}`,
      content: responseText,
      sender: "ai",
      timestamp: new Date(),
      recommendations: recommendedMovies,
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Movie Recommendation Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-gray-800 text-gray-100"
                  }`}
                >
                  {message.sender === "ai" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <div className="bg-gray-700 h-full w-full flex items-center justify-center">
                          <Sparkles className="h-3 w-3 text-primary" />
                        </div>
                      </Avatar>
                      <span className="text-xs font-medium">Graph Recommender</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>

                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.recommendations.map((movie) => (
                        <div
                          key={movie.id}
                          className="flex items-start gap-2 p-2 rounded bg-gray-700/50 hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => onSelectMovie(movie)}
                        >
                          <div className="w-10 h-15 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={
                                movie.posterUrl ||
                                `/placeholder.svg?height=60&width=40&text=${encodeURIComponent(movie.title)}`
                              }
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">
                              {movie.title} ({movie.year})
                            </h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {movie.rating}/5
                              </Badge>
                              {movie.genres.slice(0, 2).map((genreId) => (
                                <Badge key={genreId} variant="secondary" className="text-xs">
                                  {genreId.replace("genre_", "")}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gray-800">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for movie recommendations..."
            className="bg-gray-800 border-gray-700"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

