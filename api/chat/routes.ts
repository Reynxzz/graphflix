import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.message) {
      return NextResponse.json({ error: "Missing message parameter" }, { status: 400 })
    }

    // Call your Python backend
    const response = await fetch(`${process.env.PYTHON_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing chat message:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}