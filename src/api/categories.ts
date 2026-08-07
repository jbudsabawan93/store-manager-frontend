import type { Category } from '../types/product'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

type CategoryApiRow = { id: string | number; name: string }

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

function mapCategory(row: CategoryApiRow): Category {
  return { id: String(row.id), name: row.name }
}

export async function fetchCategories() {
  const rows = await request<CategoryApiRow[]>('/categories')
  return rows.map(mapCategory)
}

export async function createCategory(name: string) {
  const row = await request<CategoryApiRow>('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
  return mapCategory(row)
}

export async function updateCategoryApi(id: string, name: string) {
  const row = await request<CategoryApiRow>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
  return mapCategory(row)
}

export function deleteCategoryApi(id: string) {
  return request<void>(`/categories/${id}`, { method: 'DELETE' })
}
