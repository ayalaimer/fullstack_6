const pool = require('../db/connection');

// מחזירה את כל התגובות, עם אפשרות לסינון לפי postId
const getAll = async (req, res) => {
  try {
    let sql = 'SELECT * FROM comments WHERE 1=1';
    const params = [];

    if (req.query.postId) {
      sql += ' AND post_id = ?';
      params.push(req.query.postId);
    }
    sql += ' ORDER BY id';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מחזירה תגובה בודדת לפי id, או 404 אם לא נמצאה
const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// יוצרת תגובה חדשה על פוסט נתון עבור המשתמש המחובר (מזוהה דרך הטוקן)
const create = async (req, res) => {
  const { postId, name, body } = req.body;
  if (!postId || !body)
    return res.status(400).json({ message: 'postId and body are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, name, body) VALUES (?, ?, ?, ?)',
      [postId, req.user.id, name || '', body]
    );
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מעדכנת תגובה קיימת לאחר בדיקת בעלות — רק הבעלים רשאי לעדכן
const update = async (req, res) => {
  const { name, body } = req.body;
  try {
    const [existing] = await pool.query('SELECT id, user_id FROM comments WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Comment not found' });
    if (existing[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden — you do not own this comment' });

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (body !== undefined) updates.body = body;

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: 'No fields to update' });

    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];
    await pool.query(`UPDATE comments SET ${fields} WHERE id = ?`, values);

    res.json({ message: 'Comment updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מוחקת תגובה לאחר בדיקת בעלות — רק הבעלים רשאי למחוק
const remove = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id, user_id FROM comments WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Comment not found' });
    if (existing[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden — you do not own this comment' });

    await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, getById, create, update, remove };
