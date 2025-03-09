import { type NextRequest, NextResponse } from "next/server"

// This is a route handler that will proxy requests to your Python backend
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const movieId = searchParams.get("movieId")

  if (!movieId) {
    return NextResponse.json({ error: "Missing movieId parameter" }, { status: 400 })
  }

  try {
    // Call your Python backend
    const response = await fetch(`${process.env.PYTHON_API_URL}/graph/${movieId}`)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching graph data:", error)
    return NextResponse.json({ error: "Failed to fetch graph data" }, { status: 500 })
  }
}