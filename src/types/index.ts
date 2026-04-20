export interface Schedule {
  time: string
  days: string[]
}

export interface Show {
  id: number
  name: string
  genres: string[]
  rating: { average: number | null }
  image: { medium: string; original: string } | null
}

export interface Network {
  name: string
  country?: { name: string } | null
}

export interface CastMember {
  person: { id: number; name: string; image: { medium: string; original: string } | null }
  character: { id: number; name: string }
}

export interface ShowDetail extends Show {
  summary: string | null
  status: string
  language: string | null
  runtime: number | null
  premiered: string | null
  ended: string | null
  officialSite: string | null
  schedule: Schedule
  network: Network | null
  webChannel: Network | null
}
