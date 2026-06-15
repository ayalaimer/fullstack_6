const pool = require('../db/connection');

// מחזירה את כל התמונות, עם אפשרות לסינון לפי albumId
const getAll = async (req, res) => {
  try {
    const { albumId } = req.query;
    let sql = 'SELECT id, album_id, title, url, thumbnail_url FROM photos';
    const params = [];
    if (albumId) {
      sql += ' WHERE album_id = ?';
      params.push(Number(albumId));
    }
    sql += ' ORDER BY id';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מחזירה תמונה בודדת לפי id, או 404 אם לא נמצאה
const getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, album_id, title, url, thumbnail_url FROM photos WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Photo not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// יוצרת תמונה חדשה באלבום לאחר בדיקה שהמשתמש הוא בעל האלבום, ומחזירה את הרשומה שנוצרה
const create = async (req, res) => {
  const { albumId, title, url, thumbnail_url } = req.body;
  if (!albumId || !title || !url || !thumbnail_url)
    return res.status(400).json({ message: 'albumId, title, url, and thumbnail_url are required' });
  try {
    const [album] = await pool.query(
      'SELECT user_id FROM albums WHERE id = ?',
      [albumId]
    );
    if (album.length === 0) return res.status(404).json({ message: 'Album not found' });
    if (album[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    const [result] = await pool.query(
      'INSERT INTO photos (album_id, title, url, thumbnail_url) VALUES (?, ?, ?, ?)',
      [albumId, title, url, thumbnail_url]
    );
    const [rows] = await pool.query(
      'SELECT id, album_id, title, url, thumbnail_url FROM photos WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json({message: 'Photo created successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מעדכנת פרטי תמונה (כותרת, url, thumbnail) לאחר בדיקת בעלות דרך האלבום
const update = async (req, res) => {
  const { title, url, thumbnail_url } = req.body;
  try {
    const [existing] = await pool.query(
      `SELECT p.id, p.album_id, p.title, p.url, p.thumbnail_url, a.user_id
       FROM photos p
       JOIN albums a ON p.album_id = a.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'Photo not found' });
    if (existing[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    const photo = existing[0];
    const newTitle = title !== undefined ? title : photo.title;
    const newUrl   = url !== undefined ? url : photo.url;
    const newThumb = thumbnail_url !== undefined ? thumbnail_url : photo.thumbnail_url;

    await pool.query(
      'UPDATE photos SET title = ?, url = ?, thumbnail_url = ? WHERE id = ?',
      [newTitle, newUrl, newThumb, req.params.id]
    );
    const [rows] = await pool.query(
      'SELECT id, album_id, title, url, thumbnail_url FROM photos WHERE id = ?',
      [req.params.id]
    );
    res.json({message: 'Photo updated successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מוחקת תמונה לאחר בדיקת בעלות דרך האלבום — רק בעל האלבום רשאי למחוק
const remove = async (req, res) => {
  try {
    const [existing] = await pool.query(
      `SELECT p.id, a.user_id
       FROM photos p
       JOIN albums a ON p.album_id = a.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'Photo not found' });
    if (existing[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    await pool.query('DELETE FROM photos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, getById, create, update, remove };
