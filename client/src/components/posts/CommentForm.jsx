import { useState } from 'react'
import { commentsService } from '../../services/commentsService'
import styles from './CommentForm.module.css'

export default function CommentForm({ postId, userId, username, onAdd }) {
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return
    setBusy(true)
    try {
      const comment = await commentsService.create({
        postId,
        userId,
        name: username,
        body: body.trim(),
      })
      onAdd(comment)
      setBody('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Write a comment…"
        rows={2}
        disabled={busy}
      />
      <button
        type="submit"
        className={styles.submitBtn}
        disabled={busy || !body.trim()}
      >
        {busy ? 'Posting…' : 'Comment'}
      </button>
    </form>
  )
}
