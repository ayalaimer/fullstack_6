const pool = require('../db/connection');

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

const create = async (req, res) => {
  const { userId, title, body } = req.body;
  if (!userId || !title)
    return res.status(400).json({ message: 'userId and title are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, title, body) VALUES (?, ?, ?)',
      [userId, title, body || '']
    );
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const update = async (req, res) => {
  const { userId, title, body } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Post not found' });
    if (existing[0].user_id !== Number(userId))
      return res.status(403).json({ message: 'Forbidden — you do not own this post' });

    const newTitle = title !== undefined ? title : existing[0].title;
    const newBody  = body  !== undefined ? body  : existing[0].body;

    await pool.query(
      'UPDATE posts SET title = ?, body = ? WHERE id = ?',
      [newTitle, newBody, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const remove = async (req, res) => {
  const { userId } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Post not found' });
    if (existing[0].user_id !== Number(userId))
      return res.status(403).json({ message: 'Forbidden — you do not own this post' });

    await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, getById, getPostComments, create, update, remove };
