import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { albumsService } from '../../services/albumsService'
import AlbumItem from './AlbumItem'
import AlbumForm from './AlbumForm'
import styles from './AlbumsList.module.css'

export default function AlbumsList() {
  const { currentUser } = useAuth()
  const [albums, setAlbums]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    albumsService.getByUser(currentUser.id)
      .then(setAlbums)
      .finally(() => setLoading(false))
  }, [currentUser.id])

  function handleAdd(album) {
    setAlbums(prev => [...prev, album])
  }

  function handleUpdate(updated) {
    setAlbums(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a))
  }

  function handleDelete(id) {
    setAlbums(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return <p className={styles.info}>Loading albums…</p>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Albums</h2>
        <span className={styles.count}>{albums.length} album{albums.length !== 1 ? 's' : ''}</span>
      </div>

      <AlbumForm onAdd={handleAdd} />

      {albums.length === 0 && (
        <p className={styles.empty}>No albums yet. Create one above.</p>
      )}

      <div className={styles.grid}>
        {albums.map(album => (
          <AlbumItem
            key={album.id}
            album={album}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}
