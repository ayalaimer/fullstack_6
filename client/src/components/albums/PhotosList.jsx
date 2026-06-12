import { useState, useEffect } from 'react'
import { albumsService } from '../../services/albumsService'
import { photosService }  from '../../services/photosService'
import { useAuth } from '../../context/AuthContext'
import PhotoForm from './PhotoForm'
import styles from './PhotosList.module.css'

export default function PhotosList({ albumId }) {
  const { currentUser }       = useAuth()
  const [photos, setPhotos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  useEffect(() => {
    albumsService.getPhotos(albumId)
      .then(setPhotos)
      .finally(() => setLoading(false))
  }, [albumId])

  function handleAdd(photo) {
    setPhotos(prev => [...prev, photo])
  }

  async function saveEdit(id) {
    if (!editTitle.trim()) return
    const updated = await photosService.update(id, { title: editTitle.trim() })
    setPhotos(prev => prev.map(p => p.id === id ? updated : p))
    setEditingId(null)
  }

  async function handleDelete(id) {
    await photosService.remove(id)
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <p className={styles.info}>Loading photos…</p>

  return (
    <div className={styles.container}>
      {photos.length === 0 && <p className={styles.empty}>No photos yet.</p>}

      <div className={styles.grid}>
        {photos.map(p => (
          <div key={p.id} className={styles.photoCard}>
            <img src={p.thumbnail_url} alt={p.title} className={styles.thumb} />
            {editingId === p.id ? (
              <div className={styles.editRow}>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className={styles.editInput}
                  autoFocus
                />
                <div className={styles.editActions}>
                  <button className={styles.saveBtn} onClick={() => saveEdit(p.id)}>Save</button>
                  <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className={styles.photoTitle}>{p.title}</p>
                <div className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => { setEditingId(p.id); setEditTitle(p.title) }}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <PhotoForm albumId={albumId} onAdd={handleAdd} />
    </div>
  )
}
