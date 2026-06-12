import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { albumsService } from '../../services/albumsService'
import styles from './AlbumForm.module.css'

export default function AlbumForm({ onAdd }) {
  const { currentUser } = useAuth()
  const [title, setTitle] = useState('')
  const [busy, setBusy]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    try {
      const album = await albumsService.create({ userId: currentUser.id, title: title.trim() })
      onAdd(album)
      setTitle('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="New album title…"
        disabled={busy}
        className={styles.input}
      />
      <button className={styles.addBtn} disabled={busy || !title.trim()}>
        {busy ? 'Adding…' : '+ Album'}
      </button>
    </form>
  )
}
