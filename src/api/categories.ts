import type { Category } from '../types/product'
import { apiRequest } from './client'

type CategoryApiRow = { id: string | number; name: string }

function mapCategory(row: CategoryApiRow): Category {
  return { id: String(row.id), name: row.name }
}

export async function fetchCategories() {
  const rows = await apiRequest<CategoryApiRow[]>('/categories')
  return rows.map(mapCategory)
}

export async function createCategory(name: string) {
  const row = await apiRequest<CategoryApiRow>('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
  return mapCategory(row)
}

export async function updateCategoryApi(id: string, name: string) {
  const row = await apiRequest<CategoryApiRow>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
  return mapCategory(row)
}

export function deleteCategoryApi(id: string) {
  return apiRequest<void>(`/categories/${id}`, { method: 'DELETE' })
}
