const pool = require('../db/connection');

const listUsers = async (req, res) => {
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

const blockUser = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user.id)
      return res.status(400).json({ message: 'Cannot block yourself' });

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [targetId]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'User not found' });

    await pool.query("UPDATE users SET role = 'blocked' WHERE id = ?", [targetId]);
    res.json({ message: 'User blocked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const unblockUser = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [targetId]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'User not found' });

    await pool.query("UPDATE users SET role = 'user' WHERE id = ?", [targetId]);
    res.json({ message: 'User unblocked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { listUsers, blockUser, unblockUser };
