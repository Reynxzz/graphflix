"use client"

import { useEffect, useState } from "react"
import { useMockData } from "@/hooks/use-mock-data"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import dynamic from "next/dynamic"

// Use a simpler visualization approach to avoid the Image constructor issue
const GraphVisualization = dynamic(() => import("@/components/graph-visualization"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading graph visualization...</div>,
})

interface MovieGraphProps {
  movieId: string
}

export function MovieGraph({ movieId }: MovieGraphProps) {
  const { getGraphData } = useMockData()
  const [graphData, setGraphData] = useState<any>(null)

  useEffect(() => {
    // Get graph data for this movie
    const data = getGraphData(movieId)
    setGraphData(data)
  }, [movieId, getGraphData])

  if (!graphData) return <div className="flex items-center justify-center h-full">Loading graph data...</div>

  return (
    <div className="relative h-full">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button variant="secondary" size="sm">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="sm">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <GraphVisualization data={graphData} centralNodeId={movieId} />

      <div className="absolute bottom-2 left-2 z-10 bg-black/70 p-2 rounded text-xs">
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

