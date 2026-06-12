import { useState } from 'react'
import { postsService } from '../../services/postsService'
import CommentsList from './CommentsList'
import styles from './PostItem.module.css'

export default function PostItem({ post, currentUserId, currentUsername, onUpdate, onDelete }) {
  const [editing, setEditing]         = useState(false)
  const [form, setForm]               = useState({ title: post.title, body: post.body || '' })
  const [showComments, setShowComments] = useState(false)
  const [busy, setBusy]               = useState(false)

  const isOwner = post.user_id === currentUserId

  async function saveEdit() {
    if (!form.title.trim()) return
    setBusy(true)
    try {
      const updated = await postsService.update(post.id, { userId: currentUserId, ...form })
      onUpdate(updated)
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  function cancelEdit() {
    setForm({ title: post.title, body: post.body || '' })
    setEditing(false)
  }

  async function handleDelete() {
    if (!window.confirm('Delete this post and all its comments?')) return
    setBusy(true)
    try {
      await postsService.remove(post.id, { userId: currentUserId })
      onDelete(post.id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.id}>#{post.id}</span>
        <span className={styles.author}>
          {isOwner ? 'You' : `User ${post.user_id}`}
        </span>
      </div>

      {editing ? (
        <div className={styles.editForm}>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
          />
          <textarea
            value={form.body}
            onChange={e => setForm({ ...form, body: e.target.value })}
            rows={3}
            placeholder="Body"
          />
          <div className={styles.actions}>
            <button className={styles.saveBtn} onClick={saveEdit} disabled={busy}>Save</button>
            <button className={styles.cancelBtn} onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <h3 className={styles.title}>{post.title}</h3>
          {post.body && <p className={styles.body}>{post.body}</p>}

          <div className={styles.actions}>
            <button
              className={styles.commentsBtn}
              onClick={() => setShowComments(v => !v)}
            >
              {showComments ? 'Hide Comments' : 'Comments'}
            </button>
            {isOwner && (
              <>
                <button className={styles.editBtn} onClick={() => setEditing(true)} disabled={busy}>
                  Edit
                </button>
                <button className={styles.deleteBtn} onClick={handleDelete} disabled={busy}>
                  Delete
                </button>
              </>
            )}
          </div>

          {showComments && (
            <CommentsList
              postId={post.id}
              currentUserId={currentUserId}
              currentUsername={currentUsername}
            />
          )}
        </>
      )}
    </li>
  )
}
