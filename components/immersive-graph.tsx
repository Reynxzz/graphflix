"use client"

import React from "react"

import { useEffect, useRef, useState } from "react"
import { useMockData } from "../hooks/use-mock-data"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Filter, Wand2, Compass, Sparkles, Clock, Layers, X, Send, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Movie } from "../types/movie"
import Image from "next/image"
import { Input } from "@/components/ui/input"

interface ImmersiveGraphProps {
  movieId: string
  onSelectMovie: (movie: Movie) => void
}

export function ImmersiveGraph({ movieId, onSelectMovie }: ImmersiveGraphProps) {
  const { getGraphData, getMovie, getGenreName } = useMockData()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [graphData, setGraphData] = useState<any>(null)
  const [hoveredNode, setHoveredNode] = useState<any>(null)
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [viewMode, setViewMode] = useState<"connections" | "similarity" | "timeline" | "mood">("connections")
  const [filterStrength, setFilterStrength] = useState(0.3)
  const [isExploring, setIsExploring] = useState(false)
  const [moviePath, setMoviePath] = useState<string[]>([])
  const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>({})
  const animationRef = useRef<number>()
  const isDraggingRef = useRef(false)
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const [forceUpdate, setForceUpdate] = useState(0)

  const [showAnalyticsChat, setShowAnalyticsChat] = useState(false)
  const [analyticsQuery, setAnalyticsQuery] = useState("")
  const [analyticsMessages, setAnalyticsMessages] = useState([
    { sender: "ai", content: "Ask me about graph analytics like PageRank, community detection, or shortest paths." },
  ])
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false)

  // Load graph data
  useEffect(() => {
    const data = getGraphData(movieId)
    setGraphData(data)

    // Initialize movie path with current movie
    setMoviePath([movieId])

    // Reset other states
    setHoveredNode(null)
    setSelectedNode(null)
    setIsExploring(false)
  }, [movieId, getGraphData])

  // Handle canvas interactions
  useEffect(() => {
    if (!canvasRef.current || !graphData) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (isDraggingRef.current) {
        // Handle dragging to move the graph
        const dx = x - lastMousePosRef.current.x
        const dy = y - lastMousePosRef.current.y

        // Update all node positions
        const newPositions = { ...nodePositionsRef.current }
        Object.keys(newPositions).forEach((id) => {
          newPositions[id] = {
            x: newPositions[id].x + dx,
            y: newPositions[id].y + dy,
          }
        })
        nodePositionsRef.current = newPositions
        setForceUpdate((prev) => prev + 1)

        lastMousePosRef.current = { x, y }
        return
      }

      // Find node under cursor
      const node = findNodeAtPosition(x, y)
      setHoveredNode(node)
    }

    const handleMouseDown = (e: MouseEvent) => {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      lastMousePosRef.current = { x, y }
      isDraggingRef.current = true

      // Check if clicked on a node
      const node = findNodeAtPosition(x, y)
      if (node) {
        setSelectedNode(node)

        // If it's a movie node, add to path
        if (node.type === "movie" && node.id !== moviePath[moviePath.length - 1]) {
          setMoviePath((prev) => [...prev, node.id])
        }
      }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
    }

    const handleClick = (e: MouseEvent) => {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Only register as click if not dragging
      if (!isDraggingRef.current) {
        const node = findNodeAtPosition(x, y)
        if (node && node.type === "movie" && node.id !== movieId) {
          const movie = getMovie(node.id)
          if (movie) {
            onSelectMovie(movie)
          }
        }
      }
    }

    const findNodeAtPosition = (x: number, y: number) => {
      for (const node of graphData.nodes) {
        const nodePos = nodePositionsRef.current[node.id] || { x: 0, y: 0 }
        const dx = x - nodePos.x
        const dy = y - nodePos.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Node radius depends on type
        const radius = node.id === movieId ? 20 : node.type === "movie" ? 15 : 10

        if (distance <= radius) {
          return node
        }
      }
      return null
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("click", handleClick)

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("click", handleClick)
    }
  }, [graphData, movieId, moviePath, getMovie, onSelectMovie])

  // Initialize node positions
  useEffect(() => {
    if (!graphData || !canvasRef.current) return

    const canvas = canvasRef.current
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Only initialize positions if not already set
    if (Object.keys(nodePositionsRef.current).length === 0) {
      const newPositions: Record<string, { x: number; y: number }> = {}

      // Position based on view mode
      if (viewMode === "connections") {
        // Radial layout
        const centralNode = graphData.nodes.find((n: any) => n.id === movieId)
        if (centralNode) {
          newPositions[centralNode.id] = { x: centerX, y: centerY }
        }

        // Group nodes by type
        const nodesByType: Record<string, any[]> = {}
        graphData.nodes.forEach((node: any) => {
          if (node.id !== movieId) {
            if (!nodesByType[node.type]) {
              nodesByType[node.type] = []
            }
            nodesByType[node.type].push(node)
          }
        })

        // Position nodes in concentric circles by type
        let angleOffset = 0
        Object.entries(nodesByType).forEach(([type, nodes], typeIndex) => {
          const typeRadius = 200 * (0.8 + typeIndex * 0.3)
          const angleStep = (2 * Math.PI) / nodes.length

          nodes.forEach((node, i) => {
            const angle = angleOffset + i * angleStep
            newPositions[node.id] = {
              x: centerX + typeRadius * Math.cos(angle),
              y: centerY + typeRadius * Math.sin(angle),
            }
          })

          angleOffset += Math.PI / 4 // Offset each type group
        })
      } else if (viewMode === "similarity") {
        // Position by similarity - closer = more similar
        graphData.nodes.forEach((node: any) => {
          if (node.id === movieId) {
            newPositions[node.id] = { x: centerX, y: centerY }
          } else if (node.type === "movie") {
            // Find similarity link
            const link = graphData.links.find(
              (l: any) =>
                (l.source === movieId && l.target === node.id) || (l.source === node.id && l.target === movieId),
            )

            const similarity = link?.similarity || 0.1
            const distance = 500 * (1 - similarity)
            const angle = Math.random() * 2 * Math.PI

            newPositions[node.id] = {
              x: centerX + distance * Math.cos(angle),
              y: centerY + distance * Math.sin(angle),
            }
          } else {
            // Random position for other nodes
            const angle = Math.random() * 2 * Math.PI
            const distance = 100 + Math.random() * 300

            newPositions[node.id] = {
              x: centerX + distance * Math.cos(angle),
              y: centerY + distance * Math.sin(angle),
            }
          }
        })
      } else if (viewMode === "timeline") {
        // Position by year (horizontal timeline)
        const movieNodes = graphData.nodes.filter((n: any) => n.type === "movie")
        const years = movieNodes.map((n: any) => n.year || 2000)
        const minYear = Math.min(...years)
        const maxYear = Math.max(...years)
        const yearRange = maxYear - minYear || 1

        graphData.nodes.forEach((node: any) => {
          if (node.type === "movie") {
            const year = node.year || 2000
            const x = centerX - 400 + ((year - minYear) / yearRange) * 800
            const y = centerY + (Math.random() * 100 - 50)

            newPositions[node.id] = { x, y }
          } else if (node.type === "genre") {
            // Position genres above
            const x = centerX - 300 + Math.random() * 600
            const y = centerY - 150 - Math.random() * 100

            newPositions[node.id] = { x, y }
          } else {
            // Position tags below
            const x = centerX - 300 + Math.random() * 600
            const y = centerY + 150 + Math.random() * 100

            newPositions[node.id] = { x, y }
          }
        })
      } else if (viewMode === "mood") {
        // Position by mood/genre clusters
        const genreNodes = graphData.nodes.filter((n: any) => n.type === "genre")
        const genrePositions: Record<string, { x: number; y: number }> = {}

        // Position genres in a circle
        genreNodes.forEach((node: any, i: number) => {
          const angle = (i / genreNodes.length) * 2 * Math.PI
          const x = centerX + 250 * Math.cos(angle)
          const y = centerY + 250 * Math.sin(angle)

          genrePositions[node.id] = { x, y }
          newPositions[node.id] = { x, y }
        })

        // Position movies near their primary genres
        graphData.nodes.forEach((node: any) => {
          if (node.type === "movie") {
            // Find connected genres
            const connectedGenres = graphData.links
              .filter((l: any) => l.type === "belongs_to" && (l.source === node.id || l.target === node.id))
              .map((l: any) => (l.source === node.id ? l.target : l.source))
              .filter((id: string) => genrePositions[id])

            if (connectedGenres.length > 0) {
              // Position near first genre with some randomness
              const primaryGenre = connectedGenres[0]
              const genrePos = genrePositions[primaryGenre]

              newPositions[node.id] = {
                x: genrePos.x + (Math.random() * 100 - 50),
                y: genrePos.y + (Math.random() * 100 - 50),
              }
            } else {
              // Random position if no genres
              newPositions[node.id] = {
                x: centerX + (Math.random() * 400 - 200),
                y: centerY + (Math.random() * 400 - 200),
              }
            }
          } else if (node.type === "tag") {
            // Random position for tags
            newPositions[node.id] = {
              x: centerX + (Math.random() * 500 - 250),
              y: centerY + (Math.random() * 500 - 250),
            }
          }
        })
      }

      nodePositionsRef.current = newPositions
      // Force a re-render
      setForceUpdate((prev) => prev + 1)
    }
  }, [graphData, viewMode, movieId])

  // Animation loop for force-directed layout
  useEffect(() => {
    if (!graphData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Animation function
    const animate = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Apply force-directed layout if in exploring mode
      if (isExploring) {
        applyForces()
      }

      // Draw links
      drawLinks(ctx)

      // Draw nodes
      drawNodes(ctx)

      // Draw movie path
      drawMoviePath(ctx)

      // Draw hover/selection effects
      drawInteractions(ctx)

      // Continue animation
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [graphData, hoveredNode, selectedNode, isExploring, moviePath, viewMode, filterStrength, forceUpdate])

  // Helper functions for drawing
  const drawLinks = (ctx: CanvasRenderingContext2D) => {
    if (!graphData) return

    graphData.links.forEach((link: any) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source
      const targetId = typeof link.target === "object" ? link.target.id : link.target

      const sourcePos = nodePositionsRef.current[sourceId]
      const targetPos = nodePositionsRef.current[targetId]

      if (!sourcePos || !targetPos) return

      // Filter links based on strength in similarity mode
      if (viewMode === "similarity" && link.type === "similar_to") {
        if ((link.similarity || 0) < filterStrength) {
          return
        }
      }

      // Set link style based on type
      if (link.type === "similar_to") {
        const similarity = link.similarity || 0.5
        ctx.strokeStyle = `rgba(155, 89, 182, ${similarity})`
        ctx.lineWidth = similarity * 3
      } else if (link.type === "belongs_to") {
        ctx.strokeStyle = "rgba(52, 152, 219, 0.6)"
        ctx.lineWidth = 1.5
      } else if (link.type === "has_tag") {
        ctx.strokeStyle = "rgba(243, 156, 18, 0.6)"
        ctx.lineWidth = 1
      } else {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
        ctx.lineWidth = 1
      }

      // Draw link
      ctx.beginPath()
      ctx.moveTo(sourcePos.x, sourcePos.y)
      ctx.lineTo(targetPos.x, targetPos.y)
      ctx.stroke()

      // Draw directional arrow for some link types
      if (link.type === "belongs_to" || link.type === "has_tag") {
        const dx = targetPos.x - sourcePos.x
        const dy = targetPos.y - sourcePos.y
        const angle = Math.atan2(dy, dx)

        const headLength = 10
        const arrowX = targetPos.x - headLength * Math.cos(angle)
        const arrowY = targetPos.y - headLength * Math.sin(angle)

        ctx.beginPath()
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(
          arrowX - headLength * Math.cos(angle - Math.PI / 6),
          arrowY - headLength * Math.sin(angle - Math.PI / 6),
        )
        ctx.lineTo(
          arrowX - headLength * Math.cos(angle + Math.PI / 6),
          arrowY - headLength * Math.sin(angle + Math.PI / 6),
        )
        ctx.closePath()
        ctx.fill()
      }
    })
  }

  const drawNodes = (ctx: CanvasRenderingContext2D) => {
    if (!graphData) return

    graphData.nodes.forEach((node: any) => {
      const pos = nodePositionsRef.current[node.id]
      if (!pos) return

      // Set node style based on type
      if (node.id === movieId) {
        ctx.fillStyle = "#e50914" // Netflix red for selected movie
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
      } else if (node.type === "movie") {
        ctx.fillStyle = "#3498db" // Blue for movies
        ctx.strokeStyle = "transparent"
      } else if (node.type === "genre") {
        ctx.fillStyle = "#e74c3c" // Red for genres
        ctx.strokeStyle = "transparent"
      } else if (node.type === "tag") {
        ctx.fillStyle = "#f39c12" // Orange for tags
        ctx.strokeStyle = "transparent"
      } else {
        ctx.fillStyle = "#95a5a6" // Default gray
        ctx.strokeStyle = "transparent"
      }

      // Node size based on type and importance
      const radius = node.id === movieId ? 20 : node.type === "movie" ? 15 : 10

      // Draw node
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
      ctx.fill()
      if (ctx.strokeStyle !== "transparent") {
        ctx.stroke()
      }

      // Draw label if not in exploring mode or if it's an important node
      if (
        !isExploring ||
        node.id === movieId ||
        node.type === "movie" ||
        node === hoveredNode ||
        node === selectedNode
      ) {
        ctx.font = node.id === movieId ? "bold 14px Arial" : "12px Arial"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(node.name, pos.x, pos.y + radius + 15)
      }

      // In timeline mode, add year labels for movies
      if (viewMode === "timeline" && node.type === "movie" && node.year) {
        ctx.font = "10px Arial"
        ctx.fillStyle = "rgba(255,255,255,0.7)"
        ctx.fillText(node.year.toString(), pos.x, pos.y - radius - 5)
      }
    })
  }

  const drawMoviePath = (ctx: CanvasRenderingContext2D) => {
    if (moviePath.length <= 1) return

    // Draw path between movies
    ctx.strokeStyle = "rgba(229, 9, 20, 0.7)"
    ctx.lineWidth = 3
    ctx.setLineDash([5, 5])

    ctx.beginPath()

    for (let i = 0; i < moviePath.length; i++) {
      const pos = nodePositionsRef.current[moviePath[i]]
      if (!pos) continue

      if (i === 0) {
        ctx.moveTo(pos.x, pos.y)
      } else {
        ctx.lineTo(pos.x, pos.y)
      }
    }

    ctx.stroke()
    ctx.setLineDash([])
  }

  const drawInteractions = (ctx: CanvasRenderingContext2D) => {
    // Draw hover effect
    if (hoveredNode) {
      const pos = nodePositionsRef.current[hoveredNode.id]
      if (pos) {
        const radius = hoveredNode.id === movieId ? 22 : hoveredNode.type === "movie" ? 17 : 12

        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
        ctx.stroke()

        // Draw tooltip with more info
        const tooltipWidth = 200
        const tooltipHeight = hoveredNode.type === "movie" ? 80 : 40
        const tooltipX = pos.x + radius + 10
        const tooltipY = pos.y - tooltipHeight / 2

        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight)

        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 12px Arial"
        ctx.textAlign = "left"
        ctx.fillText(hoveredNode.name, tooltipX + 10, tooltipY + 20)

        ctx.font = "11px Arial"
        if (hoveredNode.type === "movie") {
          // Show movie details
          const movie = getMovie(hoveredNode.id)
          if (movie) {
            ctx.fillText(`Year: ${movie.year}`, tooltipX + 10, tooltipY + 40)
            ctx.fillText(`Rating: ${movie.rating}/5`, tooltipX + 10, tooltipY + 60)
          }
        } else if (hoveredNode.type === "genre") {
          ctx.fillText(`Genre: ${hoveredNode.name}`, tooltipX + 10, tooltipY + 40)
        } else if (hoveredNode.type === "tag") {
          ctx.fillText(`Tag: ${hoveredNode.name}`, tooltipX + 10, tooltipY + 40)
        }
      }
    }

    // Draw selection effect
    if (selectedNode) {
      const pos = nodePositionsRef.current[selectedNode.id]
      if (pos) {
        const radius = selectedNode.id === movieId ? 25 : selectedNode.type === "movie" ? 20 : 15

        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 3
        ctx.setLineDash([2, 2])
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }
  }

  const applyForces = () => {
    if (!graphData) return

    // Simple force-directed layout
    const newPositions = { ...nodePositionsRef.current }
    let hasChanges = false

    // Apply forces
    graphData.nodes.forEach((node: any) => {
      const pos = newPositions[node.id]
      if (!pos) return

      // Repulsion between nodes
      let fx = 0
      let fy = 0

      graphData.nodes.forEach((otherNode: any) => {
        if (node.id === otherNode.id) return

        const otherPos = newPositions[otherNode.id]
        if (!otherPos) return

        const dx = pos.x - otherPos.x
        const dy = pos.y - otherPos.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1

        // Stronger repulsion between same type nodes
        const repulsionStrength = node.type === otherNode.type ? 500 : 300
        const force = repulsionStrength / (distance * distance)

        fx += (dx / distance) * force
        fy += (dy / distance) * force
      })

      // Attraction along links
      graphData.links.forEach((link: any) => {
        const sourceId = typeof link.source === "object" ? link.source.id : link.source
        const targetId = typeof link.target === "object" ? link.target.id : link.target

        if (sourceId === node.id || targetId === node.id) {
          const otherId = sourceId === node.id ? targetId : sourceId
          const otherPos = newPositions[otherId]
          if (!otherPos) return

          const dx = otherPos.x - pos.x
          const dy = otherPos.y - pos.y
          const distance = Math.sqrt(dx * dx + dy * dy) || 1

          // Stronger attraction for similarity links
          const attractionStrength = link.type === "similar_to" ? (link.similarity || 0.5) * 0.05 : 0.02

          fx += dx * attractionStrength
          fy += dy * attractionStrength
        }
      })

      // Update position with damping
      newPositions[node.id] = {
        x: pos.x + fx * 0.1,
        y: pos.y + fy * 0.1,
      }
      hasChanges = true

      // Keep central movie fixed
      if (node.id === movieId) {
        const canvas = canvasRef.current
        if (canvas) {
          newPositions[node.id] = {
            x: canvas.width / 2,
            y: canvas.height / 2,
          }
        }
      }
    })

    if (hasChanges) {
      nodePositionsRef.current = newPositions
      // We don't need to force a re-render here as the animation loop will handle it
    }
  }

  const handleAnalyticsQuery = async () => {
    if (!analyticsQuery.trim()) return

    // Add user message
    setAnalyticsMessages((prev) => [...prev, { sender: "user", content: analyticsQuery }])

    setIsAnalyticsLoading(true)
    setAnalyticsQuery("")

    try {
      // This is where you would integrate with your actual graph analytics agent
      // For now, we'll use a mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let response = { content: "", result: "" }

      // Simple keyword matching for the mock
      const query = analyticsQuery.toLowerCase()

      if (query.includes("pagerank")) {
        response = {
          content: "PageRank analysis for this movie graph:",
          result: `${currentMovie?.title}: 0.85\nInception: 0.72\nThe Matrix: 0.68\nAction (genre): 0.54\nSci-Fi (genre): 0.49`,
        }
      } else if (query.includes("communit")) {
        response = {
          content: "Community detection results:",
          result:
            "Community 1: Action movies (The Matrix, Inception)\nCommunity 2: Drama movies (Forrest Gump, Shawshank Redemption)\nCommunity 3: Family movies (Toy Story, Jumanji)",
        }
      } else if (query.includes("path") || query.includes("route")) {
        response = {
          content: "Shortest path analysis:",
          result: `${currentMovie?.title} → Sci-Fi (genre) → The Matrix\nDistance: 2 hops`,
        }
      } else {
        response = {
          content:
            "I can analyze this graph for PageRank (node importance), community detection (clusters), and shortest paths between nodes. Please specify which analysis you need.",
        }
      }

      // Add AI response
      setAnalyticsMessages((prev) => [...prev, { sender: "ai", content: response.content, result: response.result }])
    } catch (error) {
      console.error("Error processing analytics query:", error)
      setAnalyticsMessages((prev) => [
        ...prev,
        { sender: "ai", content: "Sorry, I encountered an error processing your request." },
      ])
    } finally {
      setIsAnalyticsLoading(false)
    }
  }

  // Get current movie details
  const currentMovie = getMovie(movieId)

  if (!graphData || !currentMovie) {
    return <div className="flex items-center justify-center h-full">Loading graph data...</div>
  }

  return (
    <div className="relative h-full">
      {/* Top controls */}
      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "connections" ? "default" : "secondary"}
            size="sm"
            onClick={() => setViewMode("connections")}
            className="gap-1"
          >
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline">Connections</span>
          </Button>
          <Button
            variant={viewMode === "similarity" ? "default" : "secondary"}
            size="sm"
            onClick={() => setViewMode("similarity")}
            className="gap-1"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Similarity</span>
          </Button>
          <Button
            variant={viewMode === "timeline" ? "default" : "secondary"}
            size="sm"
            onClick={() => setViewMode("timeline")}
            className="gap-1"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </Button>
          <Button
            variant={viewMode === "mood" ? "default" : "secondary"}
            size="sm"
            onClick={() => setViewMode("mood")}
            className="gap-1"
          >
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Mood</span>
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={isExploring ? "default" : "secondary"}
            size="sm"
            onClick={() => setIsExploring(!isExploring)}
            className="gap-1"
          >
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">{isExploring ? "Stop" : "Explore"}</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              nodePositionsRef.current = {}
              setForceUpdate((prev) => prev + 1)
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter slider for similarity mode */}
      {viewMode === "similarity" && (
        <div className="absolute top-14 left-2 right-2 z-10 bg-black/50 p-2 rounded flex items-center gap-3">
          <Filter className="h-4 w-4" />
          <div className="text-xs">Min Similarity:</div>
          <div className="flex-1">
            <Slider
              value={[filterStrength]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={(value) => setFilterStrength(value[0])}
            />
          </div>
          <div className="text-xs w-8">{Math.round(filterStrength * 100)}%</div>
        </div>
      )}

      {/* Movie journey path */}
      {moviePath.length > 1 && (
        <div className="absolute bottom-2 left-2 right-2 z-10 bg-black/70 p-2 rounded">
          <div className="text-xs mb-1 flex justify-between">
            <span>Your Movie Journey:</span>
            <Button variant="link" size="sm" className="h-4 p-0 text-xs" onClick={() => setMoviePath([movieId])}>
              Reset
            </Button>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {moviePath.map((id, index) => {
              const movie = getMovie(id)
              return (
                <React.Fragment key={id}>
                  {index > 0 && <span className="text-gray-500">→</span>}
                  <Badge variant={id === movieId ? "default" : "outline"} className="whitespace-nowrap">
                    {movie?.title || id}
                  </Badge>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      )}

      {/* Canvas for graph visualization */}
      <canvas ref={canvasRef} className="w-full h-full bg-gray-900 rounded-lg" />

      {/* Graph Analytics Chat */}
      <div className="absolute bottom-20 right-2 z-10">
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1"
            onClick={() => setShowAnalyticsChat(!showAnalyticsChat)}
          >
            <Sparkles className="h-4 w-4" />
            <span>Graph Analytics</span>
          </Button>

          {showAnalyticsChat && (
            <div className="absolute bottom-full right-0 mb-2 w-80 bg-black/90 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
              <div className="p-2 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Graph Analytics</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowAnalyticsChat(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-2 max-h-60 overflow-y-auto">
                {analyticsMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 rounded-lg text-xs ${
                      message.sender === "user" ? "bg-primary text-primary-foreground ml-8" : "bg-gray-800 mr-8"
                    }`}
                  >
                    {message.content}
                    {message.result && <div className="mt-1 p-1 bg-gray-700 rounded text-xs">{message.result}</div>}
                  </div>
                ))}

                {isAnalyticsLoading && (
                  <div className="flex items-center gap-2 p-2 text-xs">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-gray-700">
                <div className="flex gap-1">
                  <Input
                    value={analyticsQuery}
                    onChange={(e) => setAnalyticsQuery(e.target.value)}
                    placeholder="Ask about PageRank, communities, paths..."
                    className="h-7 text-xs bg-gray-800 border-gray-700"
                  />
                  <Button
                    size="sm"
                    className="h-7 px-2"
                    onClick={handleAnalyticsQuery}
                    disabled={isAnalyticsLoading || !analyticsQuery.trim()}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setAnalyticsQuery("What's the PageRank of this movie?")}
                  >
                    PageRank
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px] cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setAnalyticsQuery("Detect communities in this graph")}
                  >
                    Communities
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px] cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setAnalyticsQuery("Find shortest path to The Matrix")}
                  >
                    Shortest Path
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Node details panel */}
      <AnimatePresence>
        {selectedNode && selectedNode.id !== movieId && (
          <motion.div
            className="absolute top-14 right-2 w-64 bg-black/80 rounded-lg overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{selectedNode.name}</h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedNode(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {selectedNode.type === "movie" && (
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <div className="w-16 h-24 bg-gray-800 rounded overflow-hidden">
                      <Image
                        src={getMovie(selectedNode.id)?.posterUrl || `/placeholder.svg?height=96&width=64`}
                        alt={selectedNode.name}
                        width={64}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="text-gray-400">Year: {getMovie(selectedNode.id)?.year}</p>
                      <p className="text-gray-400">Rating: {getMovie(selectedNode.id)?.rating}/5</p>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const movie = getMovie(selectedNode.id)
                          if (movie) onSelectMovie(movie)
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedNode.type === "genre" && (
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">Genre: {selectedNode.name}</p>
                  <p className="text-gray-400">
                    Connected to{" "}
                    {
                      graphData.links.filter(
                        (l: any) =>
                          l.type === "belongs_to" && (l.source === selectedNode.id || l.target === selectedNode.id),
                      ).length
                    }{" "}
                    movies
                  </p>
                </div>
              )}

              {selectedNode.type === "tag" && (
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">Tag: {selectedNode.name}</p>
                  <p className="text-gray-400">
                    Applied to{" "}
                    {
                      graphData.links.filter(
                        (l: any) =>
                          l.type === "has_tag" && (l.source === selectedNode.id || l.target === selectedNode.id),
                      ).length
                    }{" "}
                    movies
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-2 right-2 z-10 bg-black/70 p-2 rounded text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-[#e50914]"></span>
          <span>Selected Movie</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-[#3498db]"></span>
          <span>Movie</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-[#e74c3c]"></span>
          <span>Genre</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#f39c12]"></span>
          <span>Tag</span>
        </div>
      </div>
    </div>
  )
}

