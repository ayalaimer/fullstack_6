const pool   = require('../db/connection');
const bcrypt = require('bcryptjs');

// מחזירה את רשימת כל המשתמשים מה-VIEW הבטוח (ללא סיסמאות), ממוינים לפי id
const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, name, email, role FROM safe_users ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מחזירה משתמש בודד לפי id, או 404 אם לא נמצא
const getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, name, email, role FROM safe_users WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מחזירה את כל המשימות השייכות למשתמש לפי id
const getUserTodos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, user_id, title, completed FROM todos WHERE user_id = ? ORDER BY id',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מחזירה את כל הפוסטים השייכים למשתמש לפי id
const getUserPosts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, user_id, title, body FROM posts WHERE user_id = ? ORDER BY id',
      [req.params.id]
    );
    res.json(rows);
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

// מעדכנת את פרטי הפרופיל (שם משתמש, שם, מייל) של המשתמש המחובר בלבד, ובודקת שאין התנגשות עם משתמשים אחרים
const updateProfile = async (req, res) => {
  const targetId = req.params.id;
  if (req.user.id !== targetId)
    return res.status(403).json({ message: 'Forbidden' });

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [targetId]);
    if (existing.length === 0) return res.status(404).json({ message: 'User not found' });

    const { username, name, email } = req.body;
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (name     !== undefined) updates.name     = name;
    if (email    !== undefined) updates.email    = email;

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: 'No fields to update' });

    if (updates.username !== undefined || updates.email !== undefined) {
      const conflictConds = [];
      const conflictParams = [];
      if (updates.username !== undefined) { conflictConds.push('username = ?'); conflictParams.push(updates.username); }
      if (updates.email    !== undefined) { conflictConds.push('email = ?');    conflictParams.push(updates.email); }
      conflictParams.push(targetId);

      const [conflict] = await pool.query(
        `SELECT id FROM users WHERE (${conflictConds.join(' OR ')}) AND id != ?`,
        conflictParams
      );
      if (conflict.length > 0)
        return res.status(409).json({ message: 'Username or email already taken' });
    }

    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), targetId];
    await pool.query(`UPDATE users SET ${fields} WHERE id = ?`, values);

    res.json({ message: 'Profile updated successfully', updated: updates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// מאפשרת למשתמש המחובר לשנות סיסמה לאחר אימות הסיסמה הנוכחית
const updatePassword = async (req, res) => {
  const targetId = req.params.id;
  if (req.user.id !== targetId)
    return res.status(403).json({ message: 'Forbidden' });

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'currentPassword and newPassword are required' });
  if (newPassword.length < 6)
    return res.status(400).json({ message: 'New password must be at least 6 characters' });

  try {
    const [rows] = await pool.query(
      'SELECT password_hash FROM passwords WHERE user_id = ?',
      [targetId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid)
      return res.status(401).json({ message: 'Current password is incorrect' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE passwords SET password_hash = ? WHERE user_id = ?',
      [hash, targetId]
    );
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, getById, getUserTodos, getUserPosts, getUserAlbums, updateProfile, updatePassword };
