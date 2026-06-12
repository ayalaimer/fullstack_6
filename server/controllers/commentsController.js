const pool = require('../db/connection');

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

const create = async (req, res) => {
  const { postId, userId, name, body } = req.body;
  if (!postId || !userId || !body)
    return res.status(400).json({ message: 'postId, userId and body are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, name, body) VALUES (?, ?, ?, ?)',
      [postId, userId, name || '', body]
    );
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const update = async (req, res) => {
  const { userId, name, body } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Comment not found' });
    if (existing[0].user_id !== Number(userId))
      return res.status(403).json({ message: 'Forbidden — you do not own this comment' });

    const newName = name !== undefined ? name : existing[0].name;
    const newBody = body !== undefined ? body : existing[0].body;

    await pool.query(
      'UPDATE comments SET name = ?, body = ? WHERE id = ?',
      [newName, newBody, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const remove = async (req, res) => {
  const { userId } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Comment not found' });
    if (existing[0].user_id !== Number(userId))
      return res.status(403).json({ message: 'Forbidden — you do not own this comment' });

    await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, getById, create, update, remove };
