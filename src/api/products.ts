import type { Product, ProductCalc } from '../types/product'
import { apiRequest } from './client'

/** Shape จาก backend /products */
export interface ProductApiRow {
  id: string | number
  product_name: string
  product_detail: string | null
  anime_name: string | null
  category_id: string | number | null
  brand_id: string | number | null
  product_price: number
  stock: number
  sku: string
  status: string
  cost_price: number
  shipping_china: number
  currency_rate: number
  shipping_thailand: number
  platform_fee: number
  brand?: { id: string | number; name: string } | null
  category?: { id: string | number; name: string } | null
}

export type ProductWriteBody = {
  product_name: string
  product_detail: string
  anime_name: string
  category_id: string | null
  brand_id: string | null
  product_price: number
  stock: number
  sku: string
  status: string
  cost_price: number
  shipping_china: number
  currency_rate: number
  shipping_thailand: number
  platform_fee: number
}

const emptyCalc = (): ProductCalc => ({
  priceYuan: 0,
  rate: 5.2,
  shipping: 0,
  shippingFee: 0,
  platformFee: 5,
})

function asId(value: string | number | null | undefined): string {
  if (value == null || value === '') return ''
  return String(value)
}

function asStatus(value: string): Product['status'] {
  if (value === 'active' || value === 'inactive' || value === 'draft') {
    return value
  }
  return 'draft'
}

export function mapProductFromApi(row: ProductApiRow): Product {
  const animeName = row.anime_name ?? ''
  return {
    id: String(row.id),
    name: row.product_name,
    animeName,
    sku: row.sku,
    kind: animeName.trim() ? 'anime' : 'other',
    brandId: asId(row.brand_id ?? row.brand?.id),
    categoryId: asId(row.category_id ?? row.category?.id),
    brandName: row.brand?.name,
    categoryName: row.category?.name,
    price: Number(row.product_price) || 0,
    stock: Number(row.stock) || 0,
    status: asStatus(row.status),
    description: row.product_detail ?? '',
    calc: {
      ...emptyCalc(),
      priceYuan: Number(row.cost_price) || 0,
      rate: Number(row.currency_rate) || 0,
      shipping: Number(row.shipping_china) || 0,
      shippingFee: Number(row.shipping_thailand) || 0,
      platformFee: Number(row.platform_fee) || 0,
    },
  }
}

export function mapProductToApi(
  data: Omit<Product, 'id' | 'updatedAt' | 'kind' | 'blindBox' | 'brandName' | 'categoryName'> &
    Partial<Pick<Product, 'blindBox'>>,
): ProductWriteBody {
  return {
    product_name: data.name,
    product_detail: data.description,
    anime_name: data.animeName,
    category_id: data.categoryId || null,
    brand_id: data.brandId || null,
    product_price: data.price,
    stock: data.stock,
    sku: data.sku,
    status: data.status,
    cost_price: data.calc.priceYuan,
    shipping_china: data.calc.shipping,
    currency_rate: data.calc.rate,
    shipping_thailand: data.calc.shippingFee,
    platform_fee: data.calc.platformFee,
  }
}

export async function fetchProducts() {
  const rows = await apiRequest<ProductApiRow[]>('/products')
  return rows.map(mapProductFromApi)
}

export async function fetchProduct(id: string) {
  const row = await apiRequest<ProductApiRow>(`/products/${id}`)
  return mapProductFromApi(row)
}

export async function createProductApi(
  data: Parameters<typeof mapProductToApi>[0],
) {
  const row = await apiRequest<ProductApiRow>('/products', {
    method: 'POST',
    body: JSON.stringify(mapProductToApi(data)),
  })
  return mapProductFromApi(row)
}

export async function updateProductApi(
  id: string,
  data: Parameters<typeof mapProductToApi>[0],
) {
  const row = await apiRequest<ProductApiRow>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapProductToApi(data)),
  })
  return mapProductFromApi(row)
}

export async function deleteProductApi(id: string) {
  return apiRequest<void>(`/products/${id}`, { method: 'DELETE' })
}
