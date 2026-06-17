import { useState, useEffect } from 'react'
import { postsService }    from '../../services/postsService'
import { commentsService } from '../../services/commentsService'
import CommentForm from './CommentForm'
import styles from './CommentsList.module.css'

export default function CommentsList({ postId, currentUserId, currentUsername }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editBody, setEditBody]   = useState('')

  useEffect(() => {
    postsService.getComments(postId)
      .then(setComments)
      .finally(() => setLoading(false))
  }, [postId])

  function handleAdd(comment) {
    setComments(prev => [...prev, comment])
  }

  async function saveEdit(id) {
    if (!editBody.trim()) return
    const updated = await commentsService.update(id, { userId: currentUserId, body: editBody.trim() })
    setComments(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
    setEditingId(null)
  }

  async function handleDelete(id) {
    await commentsService.remove(id, { userId: currentUserId })
    setComments(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return <p className={styles.loading}>Loading comments…</p>

  return (
    <div className={styles.container}>
      <h4 className={styles.heading}>Comments ({comments.length})</h4>

      {comments.length === 0 && (
        <p className={styles.empty}>No comments yet.</p>
      )}

      {comments.map(c => (
        <div key={c.id} className={styles.comment}>
          {editingId === c.id ? (
            <div className={styles.editRow}>
              <textarea
                value={editBody}
                onChange={e => setEditBody(e.target.value)}
                rows={2}
                autoFocus
              />
              <div className={styles.editActions}>
                <button className={styles.saveBtn} onClick={() => saveEdit(c.id)}>Save</button>
                <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p className={styles.body}>{c.body}</p>
              <div className={styles.footer}>
                <span className={styles.author}>— {c.name || `User ${c.user_id}`}</span>
                {c.user_id === currentUserId && (
                  <span className={styles.actions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => { setEditingId(c.id); setEditBody(c.body) }}
                    >
                      Edit
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(c.id)}>
                      Delete
                    </button>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      ))}

      <CommentForm
        postId={postId}
        userId={currentUserId}
        username={currentUsername}
        onAdd={handleAdd}
      />
    </div>
  )
}
