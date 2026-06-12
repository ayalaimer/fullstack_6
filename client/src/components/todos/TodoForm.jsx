import { useState } from 'react'
import { todosService } from '../../services/todosService'
import styles from './TodoForm.module.css'

export default function TodoForm({ userId, onAdd }) {
  const [title, setTitle] = useState('')
  const [busy, setBusy]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    try {
      const todo = await todosService.create({ userId, title: title.trim(), completed: false })
      onAdd(todo)
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
        placeholder="Add a new todo…"
        disabled={busy}
      />
      <button type="submit" className={styles.addBtn} disabled={busy || !title.trim()}>
        Add
      </button>
    </form>
  )
}
