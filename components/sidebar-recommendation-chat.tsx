"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useMockData } from "../hooks/use-mock-data"
import type { Movie } from "../types/movie"

interface SidebarRecommendationChatProps {
  currentMovieId: string
  onSelectMovie: (movie: Movie) => void
}

type MessageType = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  recommendations?: Movie[]
}

export function SidebarRecommendationChat({ currentMovieId, onSelectMovie }: SidebarRecommendationChatProps) {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "welcome",
      content: "Ask me for personalized recommendations based on this movie.",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { getMovie, getSimilarMovies, movies } = useMockData()

  const currentMovie = getMovie(currentMovieId)

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
      const aiResponse = await mockAIResponse(input, currentMovieId)
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("Error getting AI response:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          content: "Sorry, I encountered an error. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Mock AI response - replace this with your actual AI agent integration
  const mockAIResponse = async (userInput: string, movieId: string): Promise<MessageType> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const currentMovie = getMovie(movieId)
    if (!currentMovie) {
      return {
        id: `ai-${Date.now()}`,
        content: "I couldn't find information about this movie.",
        sender: "ai",
        timestamp: new Date(),
      }
    }

    const userInputLower = userInput.toLowerCase()
    let responseText = ""
    let recommendedMovies: Movie[] = []

    // Simple keyword matching for the mock
    if (userInputLower.includes("similar") || userInputLower.includes("like this")) {
      responseText = `If you enjoyed ${currentMovie.title}, you might like these similar movies:`
      // In a real implementation, you would use your graph to find similar movies
      recommendedMovies = getSimilarMovies(movieId).slice(0, 2)
    } else if (userInputLower.includes("same director") || userInputLower.includes("director")) {
      responseText = `Here are more movies directed by ${currentMovie.director}:`
      // Mock response - in a real implementation, you would query your database
      recommendedMovies = [getMovie("movie_6"), getMovie("movie_8")].filter(Boolean) as Movie[]
    } else if (
      userInputLower.includes("cast") ||
      userInputLower.includes("actor") ||
      userInputLower.includes("actress")
    ) {
      responseText = `Here are movies featuring the same cast members:`
      // Mock response - in a real implementation, you would query your database
      recommendedMovies = [getMovie("movie_1"), getMovie("movie_5")].filter(Boolean) as Movie[]
    } else if (
      userInputLower.includes("genre") ||
      userInputLower.includes(currentMovie.genres[0].replace("genre_", ""))
    ) {
      responseText = `You might enjoy these movies in the same genre:`
      // Mock response - in a real implementation, you would query your database
      recommendedMovies = movies
        .filter((m) => m.id !== movieId && m.genres.some((g) => currentMovie.genres.includes(g)))
        .slice(0, 2)
    } else if (userInputLower.includes("recommend") || userInputLower.includes("suggestion")) {
      responseText = `Based on your interest in ${currentMovie.title}, I recommend:`
      // In a real implementation, you would use your recommendation algorithm
      recommendedMovies = getSimilarMovies(movieId).slice(0, 2)
    } else {
      responseText = `Here are some recommendations based on ${currentMovie.title}:`
      // Mock response - in a real implementation, you would query your database
      recommendedMovies = getSimilarMovies(movieId).slice(0, 2)
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
    <div className="flex flex-col h-[300px] bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800 mt-6">
      <div className="flex items-center p-2 border-b border-gray-800">
        <Sparkles className="h-4 w-4 text-primary mr-2" />
        <h4 className="text-sm font-medium">Ask for Recommendations</h4>
      </div>

      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-lg p-2 text-xs ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-gray-800 text-gray-100"
                  }`}
                >
                  <p>{message.content}</p>

                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.recommendations.map((movie) => (
                        <div
                          key={movie.id}
                          className="flex items-start gap-2 p-1.5 rounded bg-gray-700/50 hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => onSelectMovie(movie)}
                        >
                          <div className="w-8 h-12 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={
                                movie.posterUrl ||
                                `/placeholder.svg?height=48&width=32&text=${encodeURIComponent(movie.title)}`
                              }
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium truncate">{movie.title}</h4>
                            <p className="text-[10px] text-gray-300">{movie.year}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {movie.rating}/5
                              </Badge>
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
              <div className="bg-gray-800 rounded-lg p-2 flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">Thinking...</span>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-gray-800">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex gap-1"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this movie..."
            className="bg-gray-800 border-gray-700 h-8 text-xs"
            disabled={isLoading}
          />
          <Button type="submit" size="sm" className="h-8 px-2" disabled={isLoading || !input.trim()}>
            <Send className="h-3 w-3" />
          </Button>
        </form>
      </div>
    </div>
  )
}

