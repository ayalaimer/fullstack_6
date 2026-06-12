const pool = require('../db/connection');

const getAll = async (req, res) => {
  try {
    const { userId } = req.query;
    let sql = 'SELECT id, user_id, title FROM albums';
    const params = [];
    if (userId) {
      sql += ' WHERE user_id = ?';
      params.push(Number(userId));
    }
    sql += ' ORDER BY id';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, user_id, title FROM albums WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Album not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserAlbums = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, user_id, title FROM albums WHERE user_id = ? ORDER BY id',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAlbumPhotos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, album_id, title, url, thumbnail_url FROM photos WHERE album_id = ? ORDER BY id',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const create = async (req, res) => {
  const { userId, title } = req.body;
  if (!userId || !title)
    return res.status(400).json({ message: 'userId and title are required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO albums (user_id, title) VALUES (?, ?)',
      [userId, title]
    );
    const [rows] = await pool.query(
      'SELECT id, user_id, title FROM albums WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const update = async (req, res) => {
  const { title } = req.body;
  try {
    const [existing] = await pool.query(
      'SELECT id, user_id, title FROM albums WHERE id = ?',
      [req.params.id]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'Album not found' });
    if (existing[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    const newTitle = title !== undefined ? title : existing[0].title;
    await pool.query('UPDATE albums SET title = ? WHERE id = ?', [newTitle, req.params.id]);
    const [rows] = await pool.query(
      'SELECT id, user_id, title FROM albums WHERE id = ?',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT id, user_id FROM albums WHERE id = ?',
      [req.params.id]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'Album not found' });
    if (existing[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    await pool.query('DELETE FROM albums WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, getById, getUserAlbums, getAlbumPhotos, create, update, remove };
