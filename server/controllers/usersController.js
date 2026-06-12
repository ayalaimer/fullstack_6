const pool   = require('../db/connection');
const bcrypt = require('bcryptjs');

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

const updateProfile = async (req, res) => {
  const targetId = Number(req.params.id);
  if (req.user.id !== targetId)
    return res.status(403).json({ message: 'Forbidden' });

  const { username, name, email } = req.body;
  try {
    const [existing] = await pool.query(
      'SELECT id, username, name, email FROM users WHERE id = ?',
      [targetId]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'User not found' });

    const current = existing[0];
    const newUsername = username !== undefined ? username : current.username;
    const newName     = name     !== undefined ? name     : current.name;
    const newEmail    = email    !== undefined ? email    : current.email;

    if (newUsername !== current.username || newEmail !== current.email) {
      const [conflict] = await pool.query(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [newUsername, newEmail, targetId]
      );
      if (conflict.length > 0)
        return res.status(409).json({ message: 'Username or email already taken' });
    }

    await pool.query(
      'UPDATE users SET username = ?, name = ?, email = ? WHERE id = ?',
      [newUsername, newName, newEmail, targetId]
    );
    const [rows] = await pool.query(
      'SELECT id, username, name, email, role FROM safe_users WHERE id = ?',
      [targetId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePassword = async (req, res) => {
  const targetId = Number(req.params.id);
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
