export interface Movie {
    id: string
    title: string
    year: number
    overview: string
    genres: string[]
    rating: number
    runtime: number
    director: string
    cast: string[]
    posterUrl?: string
    backdropUrl?: string
    recommendationReasons: string[]
  }
  
  