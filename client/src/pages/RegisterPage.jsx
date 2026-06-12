import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const [form, setForm]       = useState({ username: '', password: '', name: '', email: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, token } = await authService.register(form)
      login({ user, token })
      navigate(`/users/${user.username}/todos`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Create Account</h1>

        {error && <p className={styles.error}>{error}</p>}

        <label className={styles.field}>
          <span>Full Name</span>
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label className={styles.field}>
          <span>Username</span>
          <input name="username" value={form.username} onChange={handleChange} autoComplete="username" required />
        </label>

        <label className={styles.field}>
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
        </label>

        <label className={styles.field}>
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
        </label>

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </button>

        <p className={styles.alt}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </div>
  )
}
