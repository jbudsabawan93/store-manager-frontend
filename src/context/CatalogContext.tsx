import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  createBrand,
  deleteBrandApi,
  fetchBrands,
  updateBrandApi,
} from '../api/brands'
import {
  createCategory,
  deleteCategoryApi,
  fetchCategories,
  updateCategoryApi,
} from '../api/categories'
import type { Brand, Category } from '../types/product'

interface CatalogContextValue {
  brands: Brand[]
  categories: Category[]
  brandsLoading: boolean
  brandsError: string | null
  categoriesLoading: boolean
  categoriesError: string | null
  addBrand: (name: string) => Promise<void>
  updateBrand: (id: string, name: string) => Promise<void>
  deleteBrand: (id: string) => Promise<void>
  addCategory: (name: string) => Promise<void>
  updateCategory: (id: string, name: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [brandsError, setBrandsError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setBrandsLoading(true)
      setBrandsError(null)
      try {
        const data = await fetchBrands()
        if (!cancelled) setBrands(data)
      } catch (e) {
        if (!cancelled) {
          setBrandsError(e instanceof Error ? e.message : 'โหลดแบรนด์ไม่สำเร็จ')
        }
      } finally {
        if (!cancelled) setBrandsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setCategoriesLoading(true)
      setCategoriesError(null)
      try {
        const data = await fetchCategories()
        if (!cancelled) setCategories(data)
      } catch (e) {
        if (!cancelled) {
          setCategoriesError(
            e instanceof Error ? e.message : 'โหลดหมวดหมู่ไม่สำเร็จ',
          )
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const addBrand = useCallback(async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const brand = await createBrand(trimmed)
    setBrands((prev) => [...prev, brand].sort((a, b) => a.name.localeCompare(b.name)))
  }, [])

  const updateBrand = useCallback(async (id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const brand = await updateBrandApi(id, trimmed)
    setBrands((prev) =>
      prev
        .map((b) => (b.id === id ? brand : b))
        .sort((a, b) => a.name.localeCompare(b.name)),
    )
  }, [])

  const deleteBrand = useCallback(async (id: string) => {
    await deleteBrandApi(id)
    setBrands((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const addCategory = useCallback(async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const category = await createCategory(trimmed)
    setCategories((prev) =>
      [...prev, category].sort((a, b) => a.name.localeCompare(b.name)),
    )
  }, [])

  const updateCategory = useCallback(async (id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const category = await updateCategoryApi(id, trimmed)
    setCategories((prev) =>
      prev
        .map((c) => (c.id === id ? category : c))
        .sort((a, b) => a.name.localeCompare(b.name)),
    )
  }, [])

  const deleteCategory = useCallback(async (id: string) => {
    await deleteCategoryApi(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return (
    <CatalogContext.Provider
      value={{
        brands,
        categories,
        brandsLoading,
        brandsError,
        categoriesLoading,
        categoriesError,
        addBrand,
        updateBrand,
        deleteBrand,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider')
  return ctx
}
