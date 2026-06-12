-- Project 6 — Database Schema
-- DDL only. No seed data — insert records manually.

CREATE DATABASE IF NOT EXISTS project6
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE project6;

-- ─────────────────────────────────────────────
-- Core user identity (no password here)
-- role: 'user' | 'admin' | 'blocked'
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id       INT          PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50)  UNIQUE NOT NULL,
  name     VARCHAR(100) NOT NULL,
  email    VARCHAR(100) UNIQUE NOT NULL,
  role     ENUM('user','admin','blocked') NOT NULL DEFAULT 'user'
);

-- ─────────────────────────────────────────────
-- Credentials — isolated table, FK-linked to users.
-- Only authController.js queries this table.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS passwords (
  user_id       INT          PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- Todos
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS todos (
  id        INT          PRIMARY KEY AUTO_INCREMENT,
  user_id   INT          NOT NULL,
  title     VARCHAR(255) NOT NULL,
  completed BOOLEAN      NOT NULL DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- Posts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id      INT          PRIMARY KEY AUTO_INCREMENT,
  user_id INT          NOT NULL,
  title   VARCHAR(255) NOT NULL,
  body    TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- Comments
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id      INT          PRIMARY KEY AUTO_INCREMENT,
  post_id INT          NOT NULL,
  user_id INT          NOT NULL,
  name    VARCHAR(255),
  body    TEXT,
  FOREIGN KEY (post_id) REFERENCES posts(id)  ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- Albums (1:N → photos)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS albums (
  id      INT          PRIMARY KEY AUTO_INCREMENT,
  user_id INT          NOT NULL,
  title   VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- Photos (belong to album)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS photos (
  id            INT          PRIMARY KEY AUTO_INCREMENT,
  album_id      INT          NOT NULL,
  title         VARCHAR(255) NOT NULL,
  url           VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) NOT NULL,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- View: safe_users
-- Exposes user data without any access to passwords.
-- ALL GET queries for user information must use this view.
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW safe_users AS
  SELECT id, username, name, email, role
  FROM   users;
