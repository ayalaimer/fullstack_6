import { useState } from 'react'
import { postsService } from '../../services/postsService'
import styles from './PostForm.module.css'

export default function PostForm({ userId, onAdd }) {
  const [open, setOpen]   = useState(false)
  const [form, setForm]   = useState({ title: '', body: '' })
  const [busy, setBusy]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setBusy(true)
    try {
      const post = await postsService.create({ userId, title: form.title.trim(), body: form.body.trim() })
      onAdd(post)
      setForm({ title: '', body: '' })
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button className={styles.toggle} onClick={() => setOpen(true)}>
        + New Post
      </button>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        placeholder="Post title"
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
        required
        disabled={busy}
      />
      <textarea
        placeholder="Post body (optional)"
        value={form.body}
        onChange={e => setForm({ ...form, body: e.target.value })}
        rows={3}
        disabled={busy}
      />
      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={busy || !form.title.trim()}>
          {busy ? 'Posting…' : 'Post'}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  )
}
