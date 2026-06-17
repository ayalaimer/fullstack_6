import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { todosService } from '../../services/todosService'
import TodoItem from './TodoItem'
import TodoForm from './TodoForm'
import styles from './TodosList.module.css'

export default function TodosList() {
  const { currentUser }       = useAuth()
  const [todos, setTodos]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    todosService.getByUser(currentUser.id)
      .then(data => setTodos(data))
      .catch(() => setError('Failed to load todos'))
      .finally(() => setLoading(false))
  }, [currentUser.id])

  function handleAdd(todo) {
    setTodos(prev => [...prev, todo].sort((a, b) => a.id - b.id))
  }

  function handleUpdate(updated) {
    setTodos(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
  }

  function handleDelete(id) {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  if (loading) return <p className={styles.status}>Loading todos…</p>
  if (error)   return <p className={styles.status}>{error}</p>

  const done    = todos.filter(t => t.completed).length
  const total   = todos.length

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Todos</h2>
        <span className={styles.badge}>{done} / {total} done</span>
      </div>

      <TodoForm userId={currentUser.id} onAdd={handleAdd} />

      {todos.length === 0 ? (
        <p className={styles.empty}>No todos yet. Add one above!</p>
      ) : (
        <ul className={styles.list}>
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
