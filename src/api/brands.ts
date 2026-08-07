import type { Brand } from '../types/product'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

type BrandApiRow = { id: string | number; name: string }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { headers, ...rest } = init ?? {}
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(detail || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function mapBrand(row: BrandApiRow): Brand {
  return { id: String(row.id), name: row.name }
}

export async function fetchBrands() {
  const rows = await request<BrandApiRow[]>('/brands')
  return rows.map(mapBrand)
}

export async function createBrand(name: string) {
  const row = await request<BrandApiRow>('/brands', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
  return mapBrand(row)
}

export async function updateBrandApi(id: string, name: string) {
  const row = await request<BrandApiRow>(`/brands/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
  return mapBrand(row)
}

export function deleteBrandApi(id: string) {
  return request<void>(`/brands/${id}`, { method: 'DELETE' })
}
