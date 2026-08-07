import type { ProductCalc, ProductCalcInput } from '../types/product'

/** +3% หลังแปลงเรท */
export const RATE_BUFFER = 0.03

function n(value: number | '' | undefined) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : 0
}

export function toProductCalc(calc: ProductCalcInput | ProductCalc): ProductCalc {
  return {
    priceYuan: n(calc.priceYuan),
    rate: n(calc.rate),
    shipping: n(calc.shipping),
    shippingFee: n(calc.shippingFee),
    platformFee: n(calc.platformFee),
  }
}

/** ปัดเป็นบาททศนิยม 2 ตำแหน่ง แบบเงิน (กันคลาดเคลื่อน 0.01 จาก float) */
export function roundPrice(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** (ราคาสินค้าหยวน + ค่าส่งจีนหยวน) × เรท */
export function calcConverted(calc: ProductCalcInput | ProductCalc) {
  const c = toProductCalc(calc)
  return roundPrice((c.priceYuan + c.shipping) * c.rate)
}

/** หลังบวก 3% */
export function calcAfterBuffer(calc: ProductCalcInput | ProductCalc) {
  return roundPrice(calcConverted(calc) * (1 + RATE_BUFFER))
}

/**
 * ต้นทุนรวม — ไม่รวมค่าธรรมเนียมแพลตฟอร์ม
 * (((ราคาหยวน + ค่าส่งจีน) × เรท) + 3%) + ค่าชิปปิ้ง
 */
export function calcCostTotal(calc: ProductCalcInput | ProductCalc) {
  return roundPrice(calcAfterBuffer(calc) + n(calc.shippingFee))
}

/**
 * ราคารวมสุดท้าย
 * ต้นทุนรวม + ค่าธรรมเนียมแพลตฟอร์ม%
 */
export function calcFinalPrice(calc: ProductCalcInput | ProductCalc) {
  return roundPrice(calcCostTotal(calc) * (1 + n(calc.platformFee) / 100))
}

export function calcPlatformFeeAmount(calc: ProductCalcInput | ProductCalc) {
  const cost = calcCostTotal(calc)
  return roundPrice(calcFinalPrice(calc) - cost)
}

export function calcBufferAmount(calc: ProductCalcInput | ProductCalc) {
  return roundPrice(calcAfterBuffer(calc) - calcConverted(calc))
}
