import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { postsService } from '../../services/postsService'
import PostItem from './PostItem'
import PostForm from './PostForm'
import styles from './PostsList.module.css'

export default function PostsList() {
  const { currentUser }         = useAuth()
  const [posts, setPosts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [myOnly, setMyOnly]     = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    const fetch = myOnly
      ? postsService.getByUser(currentUser.id)
      : postsService.getAll()
    fetch
      .then(data => setPosts(data))
      .catch(() => setError('Failed to load posts'))
      .finally(() => setLoading(false))
  }, [myOnly, currentUser.id])

  function handleAdd(post) {
    setPosts(prev => [...prev, post].sort((a, b) => a.id - b.id))
  }

  function handleUpdate(updated) {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  function handleDelete(id) {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{myOnly ? 'My Posts' : 'All Posts'}</h2>
        <button
          className={myOnly ? styles.filterActive : styles.filterBtn}
          onClick={() => setMyOnly(v => !v)}
        >
          {myOnly ? 'Show All' : 'My Posts Only'}
        </button>
      </div>

      <PostForm userId={currentUser.id} onAdd={handleAdd} />

      {loading && <p className={styles.status}>Loading posts…</p>}
      {error   && <p className={styles.status}>{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className={styles.empty}>No posts found.</p>
      )}

      {!loading && !error && (
        <ul className={styles.list}>
          {posts.map(post => (
            <PostItem
              key={post.id}
              post={post}
              currentUserId={currentUser.id}
              currentUsername={currentUser.username}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
