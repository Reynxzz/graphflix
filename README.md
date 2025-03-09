# GraphFlix
Explore Movie Recommendation with Natural Language and Graph Analytics!

# Frontend Integration Guide

This guide explains how to integrate your existing React frontend with the new Graphflix API backend.

## Overview

The Graphflix API provides the following endpoints:

- **Movie Recommendations**: Natural language query-based recommendations
- **Similar Movies**: Get movies similar to a given movie
- **Movie Details**: Get comprehensive information about a movie
- **Graph Exploration**: Get graph data centered around a movie
- **Movie Search**: Search for movies by title
- **Chat Recommendations**: Chat-based recommendation interface

## Integration Steps

### 1. Set up Environment Variables

Create a `.env` file in your React project's root directory:

```
REACT_APP_API_URL=http://localhost:5000
```

### 2. Update API Data Fetching

Replace your mock data functions with actual API calls. Create a custom hook called `useApiData.js`:

```jsx
// hooks/use-api-data.js
import { useState } from "react";

export function useApiData() {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Get movie details by ID
  const getMovie = async (movieId) => {
    try {
      const response = await fetch(`${API_URL}/api/movies/${movieId}`);
      if (!response.ok) {
        throw new Error(`Error fetching movie: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching movie:", error);
      return null;
    }
  };

  // Other API functions...

  return {
    getMovie,
    getSimilarMovies,
    getGraphData,
    searchMovies,
    getGenres,
    getGenreName
  };
}
```

### 3. Update Components

Modify your components to use the new API hooks. For example:

**Before (with mock data):**
```jsx
import { useMockData } from "../hooks/use-mock-data";

export function MovieDetail({ movieId }) {
  const { getMovie, getSimilarMovies } = useMockData();
  const movie = getMovie(movieId);
  const similarMovies = getSimilarMovies(movieId);
  
  // Component rendering...
}
```

**After (with API):**
```jsx
import { useApiData } from "../hooks/use-api-data";
import { useEffect, useState } from "react";

export function MovieDetail({ movieId }) {
  const { getMovie, getSimilarMovies } = useApiData();
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const movieData = await getMovie(movieId);
        setMovie(movieData);
        
        const similarData = await getSimilarMovies(movieId);
        setSimilarMovies(similarData);
      } catch (error) {
        console.error("Error fetching movie data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [movieId, getMovie, getSimilarMovies]);
  
  if (isLoading) return <div>Loading...</div>;
  if (!movie) return <div>Movie not found</div>;
  
  // Component rendering...
}
```

### 4. Chat and Recommendation Components

Use the chat recommendations API for the recommendation chat component:

```jsx
// Example of sending a message to the recommendation chat API
const handleSendMessage = async () => {
  setIsLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/chat/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userInput,
        history: conversationHistory,
      }),
    });
    
    if (!response.ok) throw new Error("API request failed");
    
    const data = await response.json();
    
    // Handle response...
    setMessages(prev => [...prev, {
      id: Date.now(),
      content: data.response,
      sender: "ai",
      recommendations: data.recommendations || []
    }]);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setIsLoading(false);
  }
};
```

### 5. Graph Visualization

Update the graph visualization component to use the graph data API:

```jsx
useEffect(() => {
  const fetchGraphData = async () => {
    setIsLoading(true);
    try {
      const data = await getGraphData(movieId);
      setGraphData(data);
    } catch (error) {
      console.error("Error fetching graph data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchGraphData();
}, [movieId, getGraphData]);
```

## API Response Formats

### Movie Details Response

```json
{
  "id": "1",
  "title": "Toy Story",
  "year": 1995,
  "genres": ["Animation", "Adventure", "Comedy"],
  "tags": [
    {"name": "pixar", "significance": 0.85},
    {"name": "animation", "significance": 0.75}
  ],
  "rating": 4.2,
  "rating_count": 215,
  "popularity": 245,
  "overview": "A movie about toys that come to life...",
  "recommendationReasons": [
    "Highly rated with an average of 4.2/5 stars",
    "Strong example of the Animation genre"
  ]
}
```

### Similar Movies Response

```json
{
  "source_movie": "Toy Story",
  "similar_movies": [
    {
      "id": "3",
      "title": "Toy Story 2",
      "year": 1999,
      "similarity": 0.92,
      "genres": ["Animation", "Adventure", "Comedy"]
    },
    // More similar movies...
  ]
}
```

### Graph Data Response

```json
{
  "nodes": [
    {"id": "movie_1", "name": "Toy Story", "type": "movie", "year": 1995},
    {"id": "genre_animation", "name": "Animation", "type": "genre"},
    // More nodes...
  ],
  "links": [
    {
      "source": "movie_1",
      "target": "genre_animation",
      "type": "belongs_to"
    },
    // More links...
  ]
}
```

## Error Handling

Always include error handling in your API requests:

```jsx
try {
  const response = await fetch(`${API_URL}/api/endpoint`);
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  // Process data...
} catch (error) {
  console.error("API Error:", error);
  // Show error UI
}
```

## Testing the Integration

1. Start the API server: `cd api && python app.py`
2. Start your React app: `cd frontend && npm start`
3. Test all features to ensure they're working with the API

## Troubleshooting

- **CORS Issues**: Ensure the API server has CORS enabled (it should by default)
- **Network Errors**: Check that your `REACT_APP_API_URL` is pointing to the correct server
- **Data Format Errors**: Compare the API response format with what your components expect
- **Authentication Issues**: If you add authentication later, ensure tokens are being passed correctly
