"use client"

import { useEffect, useRef } from "react"

interface GraphVisualizationProps {
  data: any
  centralNodeId: string
}

export default function GraphVisualization({ data, centralNodeId }: GraphVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Calculate node positions using a simple radial layout
  useEffect(() => {
    if (!canvasRef.current || !data || !data.nodes || !data.links) return

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

    // Calculate positions
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.8

    // Find central node
    const centralNode = data.nodes.find((node: any) => node.id === centralNodeId)
    if (!centralNode) return

    // Position central node in the middle
    centralNode.x = centerX
    centralNode.y = centerY

    // Group nodes by type
    const nodesByType: Record<string, any[]> = {}
    data.nodes.forEach((node: any) => {
      if (node.id !== centralNodeId) {
        if (!nodesByType[node.type]) {
          nodesByType[node.type] = []
        }
        nodesByType[node.type].push(node)
      }
    })

    // Position nodes in concentric circles by type
    let angleOffset = 0
    Object.entries(nodesByType).forEach(([type, nodes], typeIndex) => {
      const typeRadius = radius * (0.4 + typeIndex * 0.2)
      const angleStep = (2 * Math.PI) / nodes.length

      nodes.forEach((node, i) => {
        const angle = angleOffset + i * angleStep
        node.x = centerX + typeRadius * Math.cos(angle)
        node.y = centerY + typeRadius * Math.sin(angle)
      })

      angleOffset += Math.PI / 4 // Offset each type group
    })

    // Draw function
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw links
      ctx.lineWidth = 1
      data.links.forEach((link: any) => {
        const source = typeof link.source === "object" ? link.source : data.nodes.find((n: any) => n.id === link.source)
        const target = typeof link.target === "object" ? link.target : data.nodes.find((n: any) => n.id === link.target)

        if (!source || !target) return

        // Set link color based on type
        if (link.type === "similar_to") {
          ctx.strokeStyle = "#9b59b6" // Purple for similarity
        } else if (link.type === "belongs_to") {
          ctx.strokeStyle = "#3498db" // Blue for genre
        } else if (link.type === "has_tag") {
          ctx.strokeStyle = "#f39c12" // Orange for tags
        } else {
          ctx.strokeStyle = "rgba(255,255,255,0.2)"
        }

        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.stroke()
      })

      // Draw nodes
      data.nodes.forEach((node: any) => {
        // Set node color based on type
        if (node.id === centralNodeId) {
          ctx.fillStyle = "#e50914" // Netflix red for selected movie
        } else if (node.type === "movie") {
          ctx.fillStyle = "#3498db" // Blue for movies
        } else if (node.type === "genre") {
          ctx.fillStyle = "#e74c3c" // Red for genres
        } else if (node.type === "tag") {
          ctx.fillStyle = "#f39c12" // Orange for tags
        } else {
          ctx.fillStyle = "#95a5a6" // Default gray
        }

        // Draw circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.id === centralNodeId ? 10 : 6, 0, 2 * Math.PI)
        ctx.fill()

        // Draw label
        ctx.font = "12px Arial"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(node.name, node.x, node.y + 20)
      })
    }

    // Initial draw
    draw()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [data, centralNodeId])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

