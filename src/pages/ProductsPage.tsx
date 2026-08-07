import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useCatalog } from '../context/CatalogContext'
import { useProducts } from '../context/ProductContext'
import { calcCostTotal } from '../utils/pricing'
import type { Product, ProductKind } from '../types/product'

const statusLabel: Record<Product['status'], string> = {
  active: 'พร้อมขาย',
  inactive: 'ปิดขาย',
  draft: 'ฉบับร่าง',
}

const tabs: { key: ProductKind; label: string }[] = [
  { key: 'anime', label: 'อนิเมะ' },
  { key: 'other', label: 'อื่นๆ' },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(price)
}

export function ProductsPage() {
  const { products, loading, error } = useProducts()
  const { brands, categories } = useCatalog()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<ProductKind>('anime')

  const brandMap = useMemo(
    () => Object.fromEntries(brands.map((b) => [String(b.id), b.name])),
    [brands],
  )
  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [String(c.id), c.name])),
    [categories],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (p.kind !== tab) return false
      if (!q) return true
      const brand = brandMap[p.brandId] ?? ''
      const category = categoryMap[p.categoryId] ?? ''
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        brand.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q)
      )
    })
  }, [products, query, tab, brandMap, categoryMap])

  return (
    <AppShell>
      <div className="page">
        <header className="page__header">
          <div>
            <h1>สินค้า</h1>
            <p className="page__subtitle">
              {loading
                ? 'กำลังโหลด…'
                : `${filtered.length} รายการ — กดแถวเพื่อดูรายละเอียด`}
            </p>
            {error && (
              <p className="page__subtitle" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="page__toolbar">
            <label className="search">
              <span className="sr-only">ค้นหาสินค้า</span>
              <input
                type="search"
                placeholder="ค้นหาชื่อ, SKU, แบรนด์…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/products/new')}
            >
              เพิ่มสินค้า
            </button>
          </div>
        </header>

        <div className="tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`tabs__btn ${tab === t.key ? 'is-active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="table-wrap table-wrap--scroll">
          <table className="table table--products">
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>SKU</th>
                <th>แบรนด์</th>
                <th>หมวดหมู่</th>
                <th>ราคาต้นทุน</th>
                <th>ราคาขาย</th>
                <th>คงเหลือ</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="table__empty">
                    กำลังโหลด…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table__empty">
                    ไม่พบสินค้า
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr
                    key={product.id}
                    tabIndex={0}
                    className="table__row"
                    onClick={() => navigate(`/products/${product.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/products/${product.id}`)
                      }
                    }}
                  >
                    <td>
                      <span className="product-name">{product.name}</span>
                    </td>
                    <td className="mono">{product.sku}</td>
                    <td>
                      {brandMap[product.brandId] ??
                        product.brandName ??
                        (product.brandId ? product.brandId : '—')}
                    </td>
                    <td>
                      {categoryMap[product.categoryId] ??
                        product.categoryName ??
                        (product.categoryId ? product.categoryId : '—')}
                    </td>
                    <td>{formatPrice(calcCostTotal(product.calc))}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`status status--${product.status}`}>
                        {statusLabel[product.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
