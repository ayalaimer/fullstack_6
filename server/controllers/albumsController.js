const pool = require('../db/connection');

// מחזירה את כל האלבומים, עם אפשרות לסינון לפי userId
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

// מחזירה אלבום בודד לפי id, או 404 אם לא נמצא
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

// מחזירה את כל האלבומים השייכים למשתמש לפי id
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

// מחזירה את כל התמונות השייכות לאלבום לפי id
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

// יוצרת אלבום חדש עבור המשתמש המחובר (מזוהה דרך הטוקן) ומחזירה את הרשומה שנוצרה
const create = async (req, res) => {
  const { title } = req.body;
  if (!title)
    return res.status(400).json({ message: 'title is required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO albums (user_id, title) VALUES (?, ?)',
      [req.user.id, title]
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

// מעדכנת כותרת אלבום קיים לאחר בדיקת בעלות — רק הבעלים רשאי לעדכן
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

// מוחקת אלבום לאחר בדיקת בעלות — רק הבעלים רשאי למחוק
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
