const { randomUUID } = require('crypto');
const pool   = require('../db/connection');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// יוצרת טוקן JWT חתום עם הנתונים שהתקבלו, בתוקף ל-7 ימים
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// מקבלת שם משתמש וסיסמה, מאמתת אותם מול ה-DB, ומחזירה טוקן JWT ופרטי המשתמש
const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required' });

  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.name, u.email, u.role, p.password_hash
       FROM users u
       JOIN passwords p ON u.id = p.user_id
       WHERE u.username = ?`,
      [username]
    );
    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid username or password' });

    const user = rows[0];

    if (user.role === 'blocked')
      return res.status(401).json({ message: 'Account is blocked' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: 'Invalid username or password' });

    const { password_hash, ...safeUser } = user;
    const token = signToken({ id: safeUser.id, username: safeUser.username, role: safeUser.role });
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// רושמת משתמש חדש: בודקת שהשם והמייל פנויים, מכניסה לטבלת users, מצפינה את הסיסמה ושומרת בטבלת passwords
const register = async (req, res) => {
  const { username, password, name, email } = req.body;
  if (!username || !password || !name || !email)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0)
      return res.status(409).json({ message: 'Username or email already taken' });

    const userId = randomUUID();
    await pool.query(
      'INSERT INTO users (id, username, name, email) VALUES (?, ?, ?, ?)',
      [userId, username, name, email]
    );

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO passwords (user_id, password_hash) VALUES (?, ?)',
      [userId, hash]
    );

    const newUser = { id: userId, username, name, email, role: 'user' };
    const token = signToken({ id: userId, username, role: 'user' });
    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, register };
