import type { Brand } from '../types/product'
import { apiRequest } from './client'

type BrandApiRow = { id: string | number; name: string }

function mapBrand(row: BrandApiRow): Brand {
  return { id: String(row.id), name: row.name }
}

export async function fetchBrands() {
  const rows = await apiRequest<BrandApiRow[]>('/brands')
  return rows.map(mapBrand)
}

export async function createBrand(name: string) {
  const row = await apiRequest<BrandApiRow>('/brands', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
  return mapBrand(row)
}

export async function updateBrandApi(id: string, name: string) {
  const row = await apiRequest<BrandApiRow>(`/brands/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
  return mapBrand(row)
}

export function deleteBrandApi(id: string) {
  return apiRequest<void>(`/brands/${id}`, { method: 'DELETE' })
}
