const pool = require('../db/connection');

// מחזירה את כל המשימות, עם אפשרות לסינון לפי userId ו/או completed
const getAll = async (req, res) => {
  try {
    let sql = 'SELECT * FROM todos WHERE 1=1';
    const params = [];

    if (req.query.userId) {
      sql += ' AND user_id = ?';
      params.push(req.query.userId);
    }
    if (req.query.completed !== undefined) {
      sql += ' AND completed = ?';
      params.push(req.query.completed === 'true' ? 1 : 0);
    }
    sql += ' ORDER BY id';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מחזירה משימה בודדת לפי id, או 404 אם לא נמצאה
const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Todo not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// יוצרת משימה חדשה עבור המשתמש המחובר (מזוהה דרך הטוקן) ומחזירה את הרשומה שנוצרה
const create = async (req, res) => {
  const { title, completed = false } = req.body;
  if (!title)
    return res.status(400).json({ message: 'title is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO todos (user_id, title, completed) VALUES (?, ?, ?)',
      [req.user.id, title, completed ? 1 : 0]
    );
    const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מעדכנת שדות של משימה קיימת לאחר בדיקת בעלות — רק הבעלים רשאי לעדכן
const update = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id, user_id FROM todos WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Todo not found' });
    if (existing[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden — you do not own this todo' });

    const { title, completed } = req.body;
    const updates = {};
    if (title     !== undefined) updates.title     = title;
    if (completed !== undefined) updates.completed = completed ? 1 : 0;

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: 'No fields to update' });

    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];
    await pool.query(`UPDATE todos SET ${fields} WHERE id = ?`, values);

    res.json({ message: 'Todo updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מוחקת משימה לאחר בדיקת בעלות — רק הבעלים רשאי למחוק
const remove = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id, user_id FROM todos WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Todo not found' });
    if (existing[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden — you do not own this todo' });

    await pool.query('DELETE FROM todos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, getById, create, update, remove };
