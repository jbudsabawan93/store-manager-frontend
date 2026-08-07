import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  createProductApi,
  deleteProductApi,
  fetchProduct,
  fetchProducts,
  updateProductApi,
} from '../api/products'
import type { Product } from '../types/product'

type ProductInput = Omit<Product, 'id' | 'updatedAt'>

interface ProductContextValue {
  products: Product[]
  loading: boolean
  error: string | null
  getProduct: (id: string) => Product | undefined
  loadProduct: (id: string) => Promise<Product>
  addProduct: (data: ProductInput) => Promise<Product>
  updateProduct: (id: string, data: ProductInput) => Promise<Product>
  deleteProduct: (id: string) => Promise<void>
  refreshProducts: () => Promise<void>
}

const ProductContext = createContext<ProductContextValue | null>(null)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'โหลดสินค้าไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchProducts()
        if (!cancelled) setProducts(data)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'โหลดสินค้าไม่สำเร็จ')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  )

  const loadProduct = useCallback(async (id: string) => {
    const product = await fetchProduct(id)
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id)
      if (idx === -1) return [product, ...prev]
      const next = [...prev]
      next[idx] = product
      return next
    })
    return product
  }, [])

  const addProduct = useCallback(async (data: ProductInput) => {
    const product = await createProductApi(data)
    setProducts((prev) => [product, ...prev.filter((p) => p.id !== product.id)])
    return product
  }, [])

  const updateProduct = useCallback(async (id: string, data: ProductInput) => {
    const product = await updateProductApi(id, data)
    setProducts((prev) => prev.map((p) => (p.id === id ? product : p)))
    return product
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    await deleteProductApi(id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        getProduct,
        loadProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be used within ProductProvider')
  return ctx
}
