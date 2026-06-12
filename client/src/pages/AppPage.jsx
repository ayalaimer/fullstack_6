import Navbar      from '../components/Navbar'
import TodosList   from '../components/todos/TodosList'
import PostsList   from '../components/posts/PostsList'
import AlbumsList  from '../components/albums/AlbumsList'
import styles      from './AppPage.module.css'

export default function AppPage({ view }) {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        {view === 'todos'  && <TodosList />}
        {view === 'posts'  && <PostsList />}
        {view === 'albums' && <AlbumsList />}
      </main>
    </div>
  )
}
