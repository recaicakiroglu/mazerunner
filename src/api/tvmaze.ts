import type { ShowDetail, Show, CastMember } from '@/types'

const BASE_URL = 'https://api.tvmaze.com'

/** 404 means end of pagination — TVMaze returns 404 on the first out-of-range page. */
export async function fetchShowsPage(page: number): Promise<Show[]> {
  const res = await fetch(`${BASE_URL}/shows?page=${page}`)
  if (res.status === 404) {return []}
  if (!res.ok) {throw new Error(`Failed to fetch shows page ${page}`)}
  const data: Show[] = await res.json()
  return data.map(({ id, name, genres, rating, image }) => ({ id, name, genres, rating, image }))
}

export async function searchShows(query: string): Promise<Show[]> {
  const res = await fetch(`${BASE_URL}/search/shows?q=${encodeURIComponent(query)}`)
  if (!res.ok) {throw new Error(`Search failed for "${query}"`)}
  const data: { show: Show }[] = await res.json()
  return data.map(({ show: { id, name, genres, rating, image } }) => ({ id, name, genres, rating, image }))
}

export async function getShowById(id: number): Promise<ShowDetail> {
  const res = await fetch(`${BASE_URL}/shows/${id}`)
  if (!res.ok) {throw new Error(`Show ${id} not found`)}
  return res.json()
}

/** Returns empty array on failure — cast is non-critical, missing it shouldn't block the detail page. */
export async function getShowCast(id: number): Promise<CastMember[]> {
  const res = await fetch(`${BASE_URL}/shows/${id}/cast`)
  if (!res.ok) {return []}
  return res.json()
}
