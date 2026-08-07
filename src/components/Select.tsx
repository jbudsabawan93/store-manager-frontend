import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'

export type SelectOption = { value: string; label: string }

type SelectProps = {
  name: string
  value: string
  options: SelectOption[]
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void
  placeholder?: string
  required?: boolean
  /** ใส่ตัวเลือกว่าง (value='') ที่หัวรายการ */
  allowEmpty?: boolean
  /** แสดงเมื่อ value มีค่าแต่ยังไม่เจอใน options */
  fallbackLabel?: string
}

export function Select({
  name,
  value,
  options,
  onChange,
  placeholder = 'เลือก…',
  required,
  allowEmpty,
  fallbackLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const normalized = value == null ? '' : String(value)
  const menuOptions =
    allowEmpty && !options.some((o) => o.value === '')
      ? [{ value: '', label: placeholder }, ...options]
      : options
  const selected = menuOptions.find((o) => String(o.value) === normalized)

  const displayLabel = selected
    ? selected.label
    : normalized
      ? (fallbackLabel ?? normalized)
      : placeholder
  const hasSelection = Boolean(selected ? selected.value !== '' : normalized)

  const pick = (optionValue: string) => {
    onChange({
      target: { name, value: optionValue },
    } as ChangeEvent<HTMLSelectElement>)
    setOpen(false)
  }

  return (
    <div
      ref={rootRef}
      className={`custom-select ${open ? 'is-open' : ''}`}
    >
      <button
        type="button"
        className="custom-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={hasSelection ? '' : 'custom-select__placeholder'}>
          {displayLabel}
        </span>
        <svg
          className="custom-select__arrow"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className="custom-select__menu" id={listId} role="listbox">
          {menuOptions.map((opt) => (
            <li key={opt.value || '__empty'} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={String(opt.value) === normalized}
                className={`custom-select__option ${String(opt.value) === normalized ? 'is-selected' : ''}`}
                onClick={() => pick(String(opt.value))}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {required && (
        <input
          type="text"
          className="custom-select__validator"
          value={normalized}
          required
          tabIndex={-1}
          aria-hidden
          onChange={() => {}}
        />
      )}
    </div>
  )
}
