import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { CalcPanelSection } from '../components/CalcPanelSection'
import { Select } from '../components/Select'
import { useCatalog } from '../context/CatalogContext'
import { useProducts } from '../context/ProductContext'
import { roundPrice, calcFinalPrice, toProductCalc } from '../utils/pricing'
import type {
  Product,
  ProductCalcInput,
  ProductKind,
} from '../types/product'
import { isBlindBoxCategory } from '../types/product'

type Num = number | ''

type FormBlindBox = {
  pricePc: number
  stockPc: Num
  descriptionPc: string
  priceBox: number
  stockBox: Num
  descriptionBox: string
  calcBox: ProductCalcInput
}

type FormState = {
  name: string
  animeName: string
  sku: string
  kind: ProductKind
  brandId: string
  categoryId: string
  price: number
  stock: Num
  status: Product['status']
  description: string
  calc: ProductCalcInput
  blindBox: FormBlindBox | null
}

const parseNumInput = (value: string): Num =>
  value === '' ? '' : Number(value)

const emptyCalc = (): ProductCalcInput => ({
  priceYuan: '',
  rate: '',
  shipping: '',
  shippingFee: '',
  platformFee: '',
})

const emptyBlindBox = (): FormBlindBox => ({
  pricePc: 0,
  stockPc: '',
  descriptionPc: '',
  priceBox: 0,
  stockBox: '',
  descriptionBox: '',
  calcBox: emptyCalc(),
})

const emptyForm = (): FormState => ({
  name: '',
  animeName: '',
  sku: '',
  kind: 'anime',
  brandId: '',
  categoryId: '',
  price: 0,
  stock: '',
  status: 'draft',
  description: '',
  calc: emptyCalc(),
  blindBox: null,
})

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const {
    getProduct,
    loadProduct,
    loading: listLoading,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useProducts()
  const { brands, categories } = useCatalog()
  const cached = !isNew && id ? getProduct(id) : undefined

  const [product, setProduct] = useState<Product | undefined>(cached)
  const [detailLoading, setDetailLoading] = useState(!isNew && !cached)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>(() => emptyForm())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (cached) setProduct(cached)
  }, [cached])

  useEffect(() => {
    if (isNew || !id) {
      setDetailLoading(false)
      setDetailError(null)
      return
    }
    if (cached) {
      setDetailLoading(false)
      setDetailError(null)
      return
    }
    if (listLoading) return

    let cancelled = false
    setDetailLoading(true)
    setDetailError(null)
    ;(async () => {
      try {
        const data = await loadProduct(id)
        if (!cancelled) setProduct(data)
      } catch (e) {
        if (!cancelled) {
          setProduct(undefined)
          setDetailError(e instanceof Error ? e.message : 'โหลดสินค้าไม่สำเร็จ')
        }
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, isNew, cached, listLoading, loadProduct])

  useEffect(() => {
    if (isNew) {
      setForm(emptyForm())
      return
    }
    if (!product) return
    setForm({
      name: product.name,
      animeName: product.animeName ?? '',
      sku: product.sku,
      kind: product.kind,
      brandId: product.brandId ?? '',
      categoryId: product.categoryId ?? '',
      price: product.price,
      stock: product.stock,
      status: product.status,
      description: product.description,
      calc: { ...product.calc },
      blindBox: product.blindBox
        ? {
            ...product.blindBox,
            calcBox: { ...product.blindBox.calcBox },
          }
        : isBlindBoxCategory(product.categoryId, categories)
          ? {
              ...emptyBlindBox(),
              pricePc: product.price,
              stockPc: product.stock,
              descriptionPc: product.description,
            }
          : null,
    })
  }, [product, isNew, categories])

  const isBlindBox = isBlindBoxCategory(form.categoryId, categories)
  const pageLoading = !isNew && (detailLoading || (listLoading && !product))

  if (pageLoading) {
    return (
      <AppShell>
        <div className="page page--narrow">
          <h1>กำลังโหลด…</h1>
        </div>
      </AppShell>
    )
  }

  if (!isNew && !product) {
    return (
      <AppShell>
        <div className="page page--narrow">
          <h1>ไม่พบสินค้า</h1>
          <p className="page__subtitle">
            {detailError ?? 'รายการนี้อาจถูกลบไปแล้ว'}
          </p>
          <Link to="/products" className="btn btn--primary">
            กลับรายการสินค้า
          </Link>
        </div>
      </AppShell>
    )
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    if (name === 'price') return

    setForm((prev) => {
      if (name === 'categoryId') {
        const nextIsBlind = isBlindBoxCategory(value, categories)
        const wasBlind = isBlindBoxCategory(prev.categoryId, categories)
        let blindBox = prev.blindBox

        if (nextIsBlind && !wasBlind) {
          blindBox = {
            ...emptyBlindBox(),
            pricePc: prev.price,
            stockPc: prev.stock,
            descriptionPc: prev.description,
          }
        } else if (!nextIsBlind && wasBlind) {
          blindBox = null
        }

        return { ...prev, categoryId: value, blindBox }
      }

      if (name === 'stock') {
        return { ...prev, stock: parseNumInput(value) }
      }

      return { ...prev, [name]: value }
    })
  }

  const handleBlindBoxChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    if (name === 'pricePc' || name === 'priceBox') return

    setForm((prev) => {
      if (!prev.blindBox) return prev
      const isStock = name === 'stockPc' || name === 'stockBox'
      return {
        ...prev,
        blindBox: {
          ...prev.blindBox,
          [name]: isStock ? parseNumInput(value) : value,
        },
      }
    })
  }

  const handleCalcChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => {
      const calc = {
        ...prev.calc,
        [name]: parseNumInput(value),
      }
      const finalPrice = roundPrice(calcFinalPrice(calc))

      if (isBlindBoxCategory(prev.categoryId, categories)) {
        return {
          ...prev,
          calc,
          price: finalPrice,
          blindBox: {
            ...(prev.blindBox ?? emptyBlindBox()),
            pricePc: finalPrice,
          },
        }
      }

      return {
        ...prev,
        calc,
        price: finalPrice,
      }
    })
  }

  const handleCalcBoxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => {
      if (!prev.blindBox) return prev
      const calcBox = {
        ...prev.blindBox.calcBox,
        [name]: parseNumInput(value),
      }
      return {
        ...prev,
        blindBox: {
          ...prev.blindBox,
          calcBox,
          priceBox: roundPrice(calcFinalPrice(calcBox)),
        },
      }
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    const calc = toProductCalc(form.calc)
    const stock = Number(form.stock) || 0
    const blindBox = form.blindBox
      ? {
          pricePc: form.blindBox.pricePc,
          stockPc: Number(form.blindBox.stockPc) || 0,
          descriptionPc: form.blindBox.descriptionPc,
          priceBox: form.blindBox.priceBox,
          stockBox: Number(form.blindBox.stockBox) || 0,
          descriptionBox: form.blindBox.descriptionBox,
          calcBox: toProductCalc(form.blindBox.calcBox),
        }
      : undefined
    const payload = {
      name: form.name,
      animeName: form.animeName,
      sku: form.sku.trim(),
      kind: form.kind,
      brandId: form.brandId,
      categoryId: form.categoryId,
      status: form.status,
      calc,
      stock: isBlindBox ? (blindBox?.stockPc ?? stock) : stock,
      description: isBlindBox
        ? (blindBox?.descriptionPc ?? '')
        : form.description,
      blindBox: isBlindBox ? blindBox : undefined,
      price: isBlindBox
        ? (blindBox?.pricePc ?? form.price)
        : form.price,
    }
    void (async () => {
      setSaving(true)
      setActionError(null)
      try {
        if (isNew) {
          const created = await addProduct(payload)
          navigate(`/products/${created.id}`, { replace: true })
          return
        }
        if (!product) return
        await updateProduct(product.id, payload)
        navigate('/products')
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
      } finally {
        setSaving(false)
      }
    })()
  }

  const handleCancel = () => {
    navigate('/products')
  }

  const handleConfirmDelete = () => {
    if (!product || saving) return
    void (async () => {
      setSaving(true)
      setActionError(null)
      try {
        await deleteProduct(product.id)
        navigate('/products')
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'ลบไม่สำเร็จ')
        setShowDeleteDialog(false)
      } finally {
        setSaving(false)
      }
    })()
  }

  return (
    <AppShell>
      <div className="page">
        <nav className="breadcrumb">
          <Link to="/products">สินค้า</Link>
          <span aria-hidden>/</span>
          <span>{isNew ? 'เพิ่มสินค้า' : product?.name}</span>
        </nav>

        <header className="page__header">
          <div>
            <h1>{isNew ? 'เพิ่มสินค้า' : 'รายละเอียดสินค้า'}</h1>
            {!isNew && product?.updatedAt && (
              <p className="page__subtitle">
                อัปเดตล่าสุด {product.updatedAt}
              </p>
            )}
            {actionError && (
              <p className="page__subtitle" role="alert">
                {actionError}
              </p>
            )}
          </div>
        </header>

        <form className="detail-layout" onSubmit={handleSubmit}>
          <section className="detail-form">
            <h2 className="section-title">ข้อมูลสินค้า</h2>
            <div className="form-grid">
              <label className="field">
                <span>ชื่อสินค้า</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span>ชื่ออนิเมะ</span>
                <input
                  name="animeName"
                  value={form.animeName}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>แบรนด์/ร้านค้า</span>
                <Select
                  name="brandId"
                  value={form.brandId}
                  onChange={handleChange}
                  allowEmpty
                  placeholder="— ไม่ระบุแบรนด์ —"
                  fallbackLabel={product?.brandName}
                  options={brands.map((b) => ({
                    value: String(b.id),
                    label: b.name,
                  }))}
                />
              </label>

              <label className="field">
                <span>หมวดหมู่</span>
                <Select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  allowEmpty
                  placeholder="— ไม่ระบุหมวดหมู่ —"
                  fallbackLabel={product?.categoryName}
                  options={categories.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                />
              </label>

              {!isBlindBox ? (
                <>
                  <label className="field">
                    <span>ราคาขาย (THB)</span>
                    <input
                      name="price"
                      type="number"
                      min={0}
                      value={form.price}
                      readOnly
                      className="input--readonly"
                      title="คำนวณจากฝั่งการคำนวณต้นทุน"
                    />
                  </label>

                  <label className="field">
                    <span>คลังสินค้า</span>
                    <input
                      name="stock"
                      type="number"
                      min={0}
                      value={form.stock}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </>
              ) : (
                <div className="blind-box-fields">
                  <div className="blind-box-variant">
                    <h3 className="blind-box-variant__title">1 pc</h3>
                    <div className="form-grid blind-box-fields__grid">
                      <label className="field">
                        <span>ราคาขาย (THB)</span>
                        <input
                          name="pricePc"
                          type="number"
                          min={0}
                          value={form.blindBox?.pricePc ?? 0}
                          readOnly
                          className="input--readonly"
                          title="คำนวณจากฝั่งการคำนวณต้นทุน"
                        />
                      </label>
                      <label className="field">
                        <span>คลังสินค้า</span>
                        <input
                          name="stockPc"
                          type="number"
                          min={0}
                          value={form.blindBox?.stockPc ?? ''}
                          onChange={handleBlindBoxChange}
                          required
                        />
                      </label>
                    </div>
                    <label className="field">
                      <span>รายละเอียด (1 pc)</span>
                      <textarea
                        name="descriptionPc"
                        rows={3}
                        value={form.blindBox?.descriptionPc ?? ''}
                        onChange={handleBlindBoxChange}
                      />
                    </label>
                  </div>

                  <div className="blind-box-variant">
                    <h3 className="blind-box-variant__title">1 Box</h3>
                    <div className="form-grid blind-box-fields__grid">
                      <label className="field">
                        <span>ราคาขาย (THB)</span>
                        <input
                          name="priceBox"
                          type="number"
                          min={0}
                          value={form.blindBox?.priceBox ?? 0}
                          readOnly
                          className="input--readonly"
                          title="คำนวณจากฝั่งการคำนวณต้นทุน"
                        />
                      </label>
                      <label className="field">
                        <span>คลังสินค้า</span>
                        <input
                          name="stockBox"
                          type="number"
                          min={0}
                          value={form.blindBox?.stockBox ?? ''}
                          onChange={handleBlindBoxChange}
                          required
                        />
                      </label>
                    </div>
                    <label className="field">
                      <span>รายละเอียด (1 Box)</span>
                      <textarea
                        name="descriptionBox"
                        rows={3}
                        value={form.blindBox?.descriptionBox ?? ''}
                        onChange={handleBlindBoxChange}
                      />
                    </label>
                  </div>
                </div>
              )}

              <label className="field">
                <span>รหัสสินค้า</span>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span>สถานะ</span>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={[
                    { value: 'active', label: 'พร้อมขาย' },
                    { value: 'inactive', label: 'ปิดขาย' },
                    { value: 'draft', label: 'ฉบับร่าง' },
                  ]}
                />
              </label>
            </div>

            {!isBlindBox && (
              <label className="field">
                <span>รายละเอียด</span>
                <textarea
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                />
              </label>
            )}

            <div className="form-actions">
              {!isNew ? (
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={saving}
                  title="ลบสินค้า"
                  aria-label="ลบสินค้า"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
              ) : (
                <span />
              )}
              <div className="form-actions__right">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={saving}
                >
                  {saving ? 'กำลังบันทึก…' : 'บันทึก'}
                </button>
              </div>
            </div>
          </section>

          <section className="calc-panel">
            <h2 className="section-title">การคำนวณต้นทุน</h2>

            <CalcPanelSection
              title={isBlindBox ? '1 pc' : undefined}
              calc={form.calc}
              onChange={handleCalcChange}
            />

            {isBlindBox && form.blindBox && (
              <CalcPanelSection
                title="1 Box"
                calc={form.blindBox.calcBox}
                onChange={handleCalcBoxChange}
              />
            )}
          </section>
        </form>

        {showDeleteDialog && (
          <div
            className="dialog-backdrop"
            role="presentation"
            onClick={() => setShowDeleteDialog(false)}
          >
            <div
              className="dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-dialog-title"
              aria-describedby="delete-dialog-desc"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="delete-dialog-title">ยืนยันการลบ</h2>
              <p id="delete-dialog-desc">
                ต้องการลบสินค้า “{product?.name}” หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
              <div className="dialog__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={saving}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={handleConfirmDelete}
                  disabled={saving}
                >
                  {saving ? 'กำลังลบ…' : 'ลบสินค้า'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
