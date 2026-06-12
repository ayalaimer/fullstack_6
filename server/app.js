require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes     = require('./routes/authRoutes');
const usersRoutes    = require('./routes/usersRoutes');
const todosRoutes    = require('./routes/todosRoutes');
const postsRoutes    = require('./routes/postsRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const albumsRoutes   = require('./routes/albumsRoutes');
const photosRoutes   = require('./routes/photosRoutes');
const adminRoutes    = require('./routes/adminRoutes');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth',     authRoutes);
app.use('/api/users',    usersRoutes);
app.use('/api/todos',    todosRoutes);
app.use('/api/posts',    postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/albums',   albumsRoutes);
app.use('/api/photos',   photosRoutes);
app.use('/api/admin',    adminRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
