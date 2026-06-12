import { useAuth } from '../context/AuthContext'
import styles from './UserInfo.module.css'

export default function UserInfo({ onClose }) {
  const { currentUser } = useAuth()

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>My Info</h2>
        <dl className={styles.list}>
          <div className={styles.row}>
            <dt>ID</dt>
            <dd>{currentUser.id}</dd>
          </div>
          <div className={styles.row}>
            <dt>Username</dt>
            <dd>{currentUser.username}</dd>
          </div>
          <div className={styles.row}>
            <dt>Name</dt>
            <dd>{currentUser.name}</dd>
          </div>
          <div className={styles.row}>
            <dt>Email</dt>
            <dd>{currentUser.email}</dd>
          </div>
        </dl>
        <button className={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
