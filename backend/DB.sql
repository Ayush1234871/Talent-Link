-- TalentLink Database
-- Milestone 1 Only
-- Database Design

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK(role IN ('client','freelancer')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    full_name VARCHAR(150),
    bio TEXT,
    location VARCHAR(100),
    hourly_rate INTEGER,
    availability VARCHAR(50),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    skill_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(skill_id) REFERENCES skills(id)
);

CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    budget INTEGER,
    duration VARCHAR(50),
    status VARCHAR(30) DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES users(id)
);