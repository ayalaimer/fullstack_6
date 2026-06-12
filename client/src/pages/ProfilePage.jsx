import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usersService } from '../services/usersService'
import Navbar from '../components/Navbar'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { currentUser, updateCurrentUser } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    username: currentUser.username,
    name:     currentUser.name,
    email:    currentUser.email,
  })
  const [profileMsg, setProfileMsg]   = useState('')
  const [profileErr, setProfileErr]   = useState('')
  const [profileBusy, setProfileBusy] = useState(false)

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwMsg, setPwMsg]         = useState('')
  const [pwErr, setPwErr]         = useState('')
  const [pwBusy, setPwBusy]       = useState(false)

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setProfileMsg('')
    setProfileErr('')
    setProfileBusy(true)
    try {
      const updated = await usersService.updateProfile(currentUser.id, {
        username: profile.username,
        name:     profile.name,
        email:    profile.email,
      })
      updateCurrentUser(updated)
      setProfileMsg('Profile updated successfully.')
      if (updated.username !== currentUser.username) {
        navigate(`/users/${updated.username}/profile`, { replace: true })
      }
    } catch (err) {
      setProfileErr(err.message)
    } finally {
      setProfileBusy(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPwMsg('')
    setPwErr('')
    if (passwords.newPassword !== passwords.confirm) {
      setPwErr('New passwords do not match.')
      return
    }
    setPwBusy(true)
    try {
      await usersService.updatePassword(currentUser.id, {
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword,
      })
      setPwMsg('Password changed successfully.')
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      setPwErr(err.message)
    } finally {
      setPwBusy(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>

        <section className={styles.card}>
          <h2 className={styles.heading}>Edit Profile</h2>
          <form onSubmit={handleProfileSubmit} className={styles.form}>
            {profileMsg && <p className={styles.success}>{profileMsg}</p>}
            {profileErr && <p className={styles.error}>{profileErr}</p>}

            <label className={styles.field}>
              <span>Full Name</span>
              <input
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Username</span>
              <input
                value={profile.username}
                onChange={e => setProfile({ ...profile, username: e.target.value })}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                required
              />
            </label>
            <button className={styles.saveBtn} disabled={profileBusy}>
              {profileBusy ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </section>

        <section className={styles.card}>
          <h2 className={styles.heading}>Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            {pwMsg && <p className={styles.success}>{pwMsg}</p>}
            {pwErr && <p className={styles.error}>{pwErr}</p>}

            <label className={styles.field}>
              <span>Current Password</span>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />
            </label>
            <label className={styles.field}>
              <span>New Password</span>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                minLength={6}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Confirm New Password</span>
              <input
                type="password"
                value={passwords.confirm}
                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                required
              />
            </label>
            <button className={styles.saveBtn} disabled={pwBusy}>
              {pwBusy ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </section>

      </div>
    </>
  )
}
