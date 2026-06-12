import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { photosService } from '../../services/photosService'
import styles from './PhotoForm.module.css'

export default function PhotoForm({ albumId, onAdd }) {
  const [form, setForm] = useState({ title: '', url: '', thumbnail_url: '' })
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.url.trim() || !form.thumbnail_url.trim()) return
    setBusy(true)
    try {
      const photo = await photosService.create({
        albumId,
        title:         form.title.trim(),
        url:           form.url.trim(),
        thumbnail_url: form.thumbnail_url.trim(),
      })
      onAdd(photo)
      setForm({ title: '', url: '', thumbnail_url: '' })
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button className={styles.openBtn} onClick={() => setOpen(true)}>
        + Add Photo
      </button>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Photo title"
        required
        className={styles.input}
      />
      <input
        name="url"
        value={form.url}
        onChange={handleChange}
        placeholder="Image URL"
        required
        className={styles.input}
      />
      <input
        name="thumbnail_url"
        value={form.thumbnail_url}
        onChange={handleChange}
        placeholder="Thumbnail URL"
        required
        className={styles.input}
      />
      <div className={styles.actions}>
        <button className={styles.addBtn} disabled={busy}>
          {busy ? 'Adding…' : 'Add Photo'}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  )
}
