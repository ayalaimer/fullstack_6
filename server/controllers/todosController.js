const pool = require('../db/connection');

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

const create = async (req, res) => {
  const { userId, title, completed = false } = req.body;
  if (!userId || !title)
    return res.status(400).json({ message: 'userId and title are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO todos (user_id, title, completed) VALUES (?, ?, ?)',
      [userId, title, completed ? 1 : 0]
    );
    const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const update = async (req, res) => {
  const { title, completed } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Todo not found' });

    const newTitle     = title     !== undefined ? title     : existing[0].title;
    const newCompleted = completed !== undefined ? (completed ? 1 : 0) : existing[0].completed;

    await pool.query(
      'UPDATE todos SET title = ?, completed = ? WHERE id = ?',
      [newTitle, newCompleted, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM todos WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Todo not found' });

    await pool.query('DELETE FROM todos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAll, getById, create, update, remove };
