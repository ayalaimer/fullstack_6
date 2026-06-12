import { useState } from 'react'
import { todosService } from '../../services/todosService'
import styles from './TodoItem.module.css'

export default function TodoItem({ todo, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle]     = useState(todo.title)
  const [busy, setBusy]       = useState(false)

  async function toggleComplete() {
    setBusy(true)
    try {
      const updated = await todosService.update(todo.id, { completed: !todo.completed })
      onUpdate(updated)
    } finally {
      setBusy(false)
    }
  }

  async function saveEdit() {
    if (!title.trim()) return
    setBusy(true)
    try {
      const updated = await todosService.update(todo.id, { title: title.trim() })
      onUpdate(updated)
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await todosService.remove(todo.id)
      onDelete(todo.id)
    } finally {
      setBusy(false)
    }
  }

  function cancelEdit() {
    setTitle(todo.title)
    setEditing(false)
  }

  return (
    <li className={`${styles.item} ${todo.completed ? styles.done : ''}`}>
      <input
        type="checkbox"
        className={styles.check}
        checked={!!todo.completed}
        onChange={toggleComplete}
        disabled={busy}
      />

      {editing ? (
        <div className={styles.editRow}>
          <input
            className={styles.editInput}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
            autoFocus
          />
          <button className={styles.saveBtn} onClick={saveEdit} disabled={busy}>Save</button>
          <button className={styles.cancelBtn} onClick={cancelEdit}>Cancel</button>
        </div>
      ) : (
        <div className={styles.row}>
          <span className={styles.title}>{todo.title}</span>
          <span className={styles.id}>#{todo.id}</span>
          <button className={styles.editBtn} onClick={() => setEditing(true)} disabled={busy}>Edit</button>
          <button className={styles.deleteBtn} onClick={handleDelete} disabled={busy}>Delete</button>
        </div>
      )}
    </li>
  )
}
