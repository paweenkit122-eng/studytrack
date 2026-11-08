import { useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import type { AppData } from '../types'

/** Basic runtime check that an imported object looks like our AppData. */
function isAppData(value: unknown): value is AppData {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return Array.isArray(v.subjects) && Array.isArray(v.events)
}

/**
 * Backup & restore. Export writes the current data to a .json file;
 * import reads one back. Handy because all data lives only on this device.
 */
export function DataMenu({ data, onImport }: { data: AppData; onImport: (data: AppData) => void }) {
  const { t } = useLanguage()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `studytrack-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-importing the same file
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      if (!isAppData(parsed)) throw new Error('bad shape')
      if (confirm(t('data.importConfirm'))) onImport(parsed)
    } catch {
      alert(t('data.importError'))
    }
  }

  return (
    <div className="data-menu">
      <button className="btn btn--ghost btn--sm" onClick={handleExport}>
        ⬇︎ {t('data.export')}
      </button>
      <button className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}>
        ⬆︎ {t('data.import')}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImport}
        hidden
      />
    </div>
  )
}
