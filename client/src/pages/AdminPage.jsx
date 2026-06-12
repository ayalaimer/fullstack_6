import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import Navbar from '../components/Navbar'
import styles from './AdminPage.module.css'

export default function AdminPage() {
  const { currentUser } = useAuth()
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [busy, setBusy]       = useState(null)

  useEffect(() => {
    api.get('/admin/users')
      .then(setUsers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleBlock(id) {
    setBusy(id)
    try {
      await api.put(`/admin/users/${id}/block`)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'blocked' } : u))
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(null)
    }
  }

  async function handleUnblock(id) {
    setBusy(id)
    try {
      await api.put(`/admin/users/${id}/unblock`)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'user' } : u))
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <h1 className={styles.title}>Admin Dashboard</h1>

        {loading && <p className={styles.info}>Loading users…</p>}
        {error   && <p className={styles.error}>{error}</p>}

        {!loading && !error && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={u.role === 'blocked' ? styles.blockedRow : ''}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={styles[`badge_${u.role}`]}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.id !== currentUser.id && (
                        u.role === 'blocked' ? (
                          <button
                            className={styles.unblockBtn}
                            onClick={() => handleUnblock(u.id)}
                            disabled={busy === u.id}
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            className={styles.blockBtn}
                            onClick={() => handleBlock(u.id)}
                            disabled={busy === u.id || u.role === 'admin'}
                          >
                            Block
                          </button>
                        )
                      )}
                      {u.id === currentUser.id && <span className={styles.you}>You</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
