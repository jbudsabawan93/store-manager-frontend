export type ProductKind = 'anime' | 'other'

export interface ProductCalc {
  /** ราคาสินค้า (หยวน) */
  priceYuan: number
  /** เรท */
  rate: number
  /** ค่าส่งในจีน (หยวน) */
  shipping: number
  /** ค่าชิปปิ้ง (บาท) */
  shippingFee: number
  /** ค่าธรรมเนียมแพลตฟอร์ม (%) */
  platformFee: number
}

/** ค่าในฟอร์ม — ว่างได้จนกว่าผู้ใช้จะกรอก */
export type ProductCalcInput = {
  [K in keyof ProductCalc]: number | ''
}

export interface BlindBoxVariant {
  pricePc: number
  stockPc: number
  descriptionPc: string
  priceBox: number
  stockBox: number
  descriptionBox: string
  calcBox: ProductCalc
}

export interface Product {
  id: string
  name: string
  animeName: string
  sku: string
  kind: ProductKind
  brandId: string
  categoryId: string
  /** ชื่อจาก relation (ถ้า API ส่งมา) — ใช้แสดงตอนยังไม่เจอใน options */
  brandName?: string
  categoryName?: string
  price: number
  stock: number
  status: 'active' | 'inactive' | 'draft'
  description: string
  calc: ProductCalc
  blindBox?: BlindBoxVariant
  updatedAt?: string
}

export interface Brand {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
}

export const BLIND_BOX_CATEGORY_NAME = 'กล่องสุ่ม'

export function isBlindBoxCategory(
  categoryId: string,
  categories: Category[],
) {
  if (!categoryId) return false
  return (
    categories.find((c) => String(c.id) === String(categoryId))?.name ===
    BLIND_BOX_CATEGORY_NAME
  )
}
