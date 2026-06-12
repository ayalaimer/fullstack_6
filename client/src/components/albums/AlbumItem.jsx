import { useState } from 'react'
import { albumsService } from '../../services/albumsService'
import PhotosList from './PhotosList'
import styles from './AlbumItem.module.css'

export default function AlbumItem({ album, onUpdate, onDelete }) {
  const [editing, setEditing]       = useState(false)
  const [editTitle, setEditTitle]   = useState(album.title)
  const [showPhotos, setShowPhotos] = useState(false)
  const [busy, setBusy]             = useState(false)

  async function saveEdit() {
    if (!editTitle.trim() || editTitle.trim() === album.title) {
      setEditing(false)
      return
    }
    setBusy(true)
    try {
      const updated = await albumsService.update(album.id, { title: editTitle.trim() })
      onUpdate(updated)
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete album "${album.title}" and all its photos?`)) return
    setBusy(true)
    try {
      await albumsService.remove(album.id)
      onDelete(album.id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.card}>
      {editing ? (
        <div className={styles.editRow}>
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className={styles.editInput}
            autoFocus
          />
          <div className={styles.editActions}>
            <button className={styles.saveBtn} onClick={saveEdit} disabled={busy}>Save</button>
            <button className={styles.cancelBtn} onClick={() => { setEditing(false); setEditTitle(album.title) }}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{album.title}</h3>
            <div className={styles.actions}>
              <button className={styles.editBtn} onClick={() => setEditing(true)} disabled={busy}>Edit</button>
              <button className={styles.deleteBtn} onClick={handleDelete} disabled={busy}>Delete</button>
            </div>
          </div>
          <button
            className={styles.photosToggle}
            onClick={() => setShowPhotos(v => !v)}
          >
            {showPhotos ? 'Hide Photos' : 'Show Photos'}
          </button>
          {showPhotos && <PhotosList albumId={album.id} />}
        </>
      )}
    </div>
  )
}
