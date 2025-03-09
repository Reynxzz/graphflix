"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Bell, User, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RecommendationChat } from "@/components/recommendation-chat"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import type { Movie } from "@/types/movie"

interface NavBarProps {
  onSelectMovie?: (movie: Movie) => void
}

export function NavBar({ onSelectMovie }: NavBarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? "bg-black" : "bg-gradient-to-b from-black/80 to-transparent"}`}
    >
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-red-600 font-bold text-2xl">
            GraphFlix
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-gray-300 transition-colors">
              Home
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-gray-300 transition-colors">
              Movies
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-gray-300 transition-colors">
              My List
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-gray-300 transition-colors">
              Graph Explorer
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            {showSearch ? (
              <div className="flex items-center bg-black/80 border border-gray-700 rounded-md overflow-hidden">
                <Input
                  type="search"
                  placeholder="Titles, people, genres"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9 w-[200px]"
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                />
                <Button variant="ghost" size="sm" className="h-9 px-2">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                <Search className="h-5 w-5" />
              </Button>
            )}
          </div>

          <Dialog open={showChat} onOpenChange={setShowChat}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 bg-transparent border-0">
              <div className="h-[600px]">
                <RecommendationChat
                  onSelectMovie={(movie) => {
                    setShowChat(false)
                    if (onSelectMovie) {
                      onSelectMovie(movie)
                    }
                  }}
                  onClose={() => setShowChat(false)}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

