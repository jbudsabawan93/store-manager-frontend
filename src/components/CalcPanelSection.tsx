import { useMemo, type ChangeEvent } from 'react'
import {
  calcBufferAmount,
  calcConverted,
  calcCostTotal,
  calcFinalPrice,
  calcPlatformFeeAmount,
  RATE_BUFFER,
} from '../utils/pricing'
import type { ProductCalcInput } from '../types/product'

function formatThb(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 2,
  }).format(value)
}

export function CalcPanelSection({
  title,
  calc,
  onChange,
}: {
  title?: string
  calc: ProductCalcInput
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  const costTotal = useMemo(() => calcCostTotal(calc), [calc])
  const finalPrice = useMemo(() => calcFinalPrice(calc), [calc])
  const converted = useMemo(() => calcConverted(calc), [calc])
  const bufferAmount = useMemo(() => calcBufferAmount(calc), [calc])
  const platformFeeAmount = useMemo(
    () => calcPlatformFeeAmount(calc),
    [calc],
  )

  return (
    <div className="calc-panel__block">
      {title && <h3 className="calc-panel__subtitle">{title}</h3>}

      <div className="calc-panel__grid">
        <label className="field">
          <span>ราคาสินค้า (CNY)</span>
          <input
            name="priceYuan"
            type="number"
            min={0}
            step="0.01"
            value={calc.priceYuan}
            onChange={onChange}
          />
        </label>

        <label className="field">
          <span>ค่าขนส่งต่างประเทศ (CNY)</span>
          <input
            name="shipping"
            type="number"
            min={0}
            step="0.01"
            value={calc.shipping}
            onChange={onChange}
          />
        </label>

        <label className="field">
          <span>เรท</span>
          <input
            name="rate"
            type="number"
            min={0}
            step="0.01"
            value={calc.rate}
            onChange={onChange}
          />
        </label>

        <label className="field">
          <span>ค่าขนส่งในประเทศ (THB)</span>
          <input
            name="shippingFee"
            type="number"
            min={0}
            step="0.01"
            value={calc.shippingFee}
            onChange={onChange}
          />
        </label>

        <label className="field">
          <span>ค่าธรรมเนียม Platform (%)</span>
          <input
            name="platformFee"
            type="number"
            min={0}
            step="0.01"
            value={calc.platformFee}
            onChange={onChange}
          />
        </label>
      </div>

      <div className="calc-summary">
        <div className="calc-summary__row">
          <span>(ราคา + ค่าส่งต่างประเทศ) × เรท</span>
          <strong>{formatThb(converted)}</strong>
        </div>
        <div className="calc-summary__row">
          <span>+{RATE_BUFFER * 100}%</span>
          <strong>{formatThb(bufferAmount)}</strong>
        </div>
        <div className="calc-summary__row">
          <span>ค่าขนส่งในประเทศ</span>
          <strong>{formatThb(Number(calc.shippingFee) || 0)}</strong>
        </div>
        <div className="calc-summary__row calc-summary__row--total">
          <span>ต้นทุนรวม</span>
          <strong>{formatThb(costTotal)}</strong>
        </div>
        <div className="calc-summary__row">
          <span>ค่าธรรมเนียม Platform ({Number(calc.platformFee) || 0}%)</span>
          <strong>{formatThb(platformFeeAmount)}</strong>
        </div>
        <div className="calc-summary__row calc-summary__row--total">
          <span>ราคารวมสุทธิ</span>
          <strong>{formatThb(finalPrice)}</strong>
        </div>
      </div>
    </div>
  )
}
