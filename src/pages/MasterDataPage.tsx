import { useState, type FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { useCatalog } from '../context/CatalogContext'

type EditState = { id: string; name: string } | null

function CatalogSection({
  title,
  items,
  loading,
  error,
  onAdd,
  onUpdate,
  onDelete,
}: {
  title: string
  items: { id: string; name: string }[]
  loading?: boolean
  error?: string | null
  onAdd: (name: string) => void | Promise<void>
  onUpdate: (id: string, name: string) => void | Promise<void>
  onDelete: (id: string) => void | Promise<void>
}) {
  const [newName, setNewName] = useState('')
  const [editing, setEditing] = useState<EditState>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => void | Promise<void>) => {
    setActionError(null)
    setBusy(true)
    try {
      await fn()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
    } finally {
      setBusy(false)
    }
  }

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || busy) return
    const name = newName
    void run(async () => {
      await onAdd(name)
      setNewName('')
    })
  }

  return (
    <section className="catalog-section">
      {(error || actionError) && (
        <p className="page__subtitle" role="alert">
          {error || actionError}
        </p>
      )}

      <form className="catalog-add" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder={`ชื่อ${title}ใหม่…`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={busy || loading}
        />
        <button
          type="submit"
          className="btn btn--primary"
          disabled={busy || loading}
        >
          เพิ่ม
        </button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th className="table__actions-col">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="table__empty">
                  กำลังโหลด…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={2} className="table__empty">
                  ยังไม่มีรายการ
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isEditing = editing?.id === item.id

                return (
                  <tr
                    key={item.id}
                    className={isEditing ? 'table__row--editing' : undefined}
                  >
                    <td>
                      {isEditing ? (
                        <input
                          className="inline-edit__input"
                          autoFocus
                          value={editing.name}
                          disabled={busy}
                          onChange={(e) =>
                            setEditing({ id: item.id, name: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (!editing.name.trim() || busy) return
                              void run(async () => {
                                await onUpdate(item.id, editing.name)
                                setEditing(null)
                              })
                            }
                            if (e.key === 'Escape') setEditing(null)
                          }}
                        />
                      ) : (
                        <span className="product-name">{item.name}</span>
                      )}
                    </td>
                    <td className="table__actions-col">
                      <div className="table__actions">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="btn btn--primary btn--sm"
                              disabled={busy}
                              onClick={() => {
                                if (!editing.name.trim() || busy) return
                                void run(async () => {
                                  await onUpdate(item.id, editing.name)
                                  setEditing(null)
                                })
                              }}
                            >
                              บันทึก
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              disabled={busy}
                              onClick={() => setEditing(null)}
                            >
                              ยกเลิก
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              disabled={busy}
                              onClick={() =>
                                setEditing({ id: item.id, name: item.name })
                              }
                            >
                              แก้ไข
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              disabled={busy}
                              onClick={() => {
                                void run(() => onDelete(item.id))
                              }}
                            >
                              ลบ
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/** หน้าข้อมูลหลัก — จัดการแบรนด์และหมวดหมู่สำหรับ dropdown */
export function MasterDataPage() {
  const {
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
  } = useCatalog()

  const [tab, setTab] = useState<'brands' | 'categories'>('brands')

  return (
    <AppShell>
      <div className="page">
        <header className="page__header">
          <div>
            <h1>ข้อมูลหลัก</h1>
            <p className="page__subtitle">
              เพิ่ม ลบ แก้ไขแบรนด์และหมวดหมู่ สำหรับใช้ในหน้าสินค้า
            </p>
          </div>
        </header>

        <div className="tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'brands'}
            className={`tabs__btn ${tab === 'brands' ? 'is-active' : ''}`}
            onClick={() => setTab('brands')}
          >
            แบรนด์
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'categories'}
            className={`tabs__btn ${tab === 'categories' ? 'is-active' : ''}`}
            onClick={() => setTab('categories')}
          >
            หมวดหมู่
          </button>
        </div>

        {tab === 'brands' ? (
          <CatalogSection
            title="แบรนด์"
            items={brands}
            loading={brandsLoading}
            error={brandsError}
            onAdd={addBrand}
            onUpdate={updateBrand}
            onDelete={deleteBrand}
          />
        ) : (
          <CatalogSection
            title="หมวดหมู่"
            items={categories}
            loading={categoriesLoading}
            error={categoriesError}
            onAdd={addCategory}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
          />
        )}
      </div>
    </AppShell>
  )
}
