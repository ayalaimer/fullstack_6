import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UserInfo from './UserInfo'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate                = useNavigate()
  const [showInfo, setShowInfo] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const u = currentUser.username

  return (
    <>
      <nav className={styles.nav}>
        <span className={styles.brand}>Project 6</span>
        <div className={styles.links}>
          <button className={styles.navBtn} onClick={() => navigate(`/users/${u}/todos`)}>
            Todos
          </button>
          <button className={styles.navBtn} onClick={() => navigate(`/users/${u}/posts`)}>
            Posts
          </button>
          <button className={styles.navBtn} onClick={() => navigate(`/users/${u}/albums`)}>
            Albums
          </button>
          <button className={styles.navBtn} onClick={() => navigate(`/users/${u}/profile`)}>
            Profile
          </button>
          {currentUser.role === 'admin' && (
            <button className={styles.adminBtn} onClick={() => navigate('/admin')}>
              Admin
            </button>
          )}
          <button className={styles.infoBtn} onClick={() => setShowInfo(true)}>
            Info
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {showInfo && <UserInfo onClose={() => setShowInfo(false)} />}
    </>
  )
}
