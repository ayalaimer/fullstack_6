const pool = require('../db/connection');

// מחזירה את כל הפוסטים, עם אפשרות לסינון לפי userId
const getAll = async (req, res) => {
  try {
    let sql = 'SELECT * FROM posts WHERE 1=1';
    const params = [];

    if (req.query.userId) {
      sql += ' AND user_id = ?';
      params.push(req.query.userId);
    }
    sql += ' ORDER BY id';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מחזירה פוסט בודד לפי id, או 404 אם לא נמצא
const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מחזירה את כל התגובות השייכות לפוסט לפי id
const getPostComments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM comments WHERE post_id = ? ORDER BY id',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// יוצרת פוסט חדש עבור המשתמש המחובר (מזוהה דרך הטוקן) ומחזירה את הרשומה שנוצרה
const create = async (req, res) => {
  const { title, body } = req.body;
  if (!title)
    return res.status(400).json({ message: 'title is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, title, body) VALUES (?, ?, ?)',
      [req.user.id, title, body || '']
    );
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מעדכנת פוסט קיים לאחר בדיקת בעלות — רק הבעלים רשאי לעדכן
const update = async (req, res) => {
  const { title, body } = req.body;
  try {
    const [existing] = await pool.query('SELECT id, user_id FROM posts WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Post not found' });
    if (existing[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden — you do not own this post' });

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (body  !== undefined) updates.body  = body;

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: 'No fields to update' });

    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];
    await pool.query(`UPDATE posts SET ${fields} WHERE id = ?`, values);

    res.json({ message: 'Post updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מוחקת פוסט לאחר בדיקת בעלות — רק הבעלים רשאי למחוק
const remove = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id, user_id FROM posts WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Post not found' });
    if (existing[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden — you do not own this post' });

    await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, getById, getPostComments, create, update, remove };
