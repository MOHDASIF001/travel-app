import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

export async function login(req, res) {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role, company_name: user.company_name } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export async function createAgent(req, res) {
    // Only admin can create agents
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Permission denied' });
    }

    const { email, password, company_name } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = `user_${Date.now()}`;
        await pool.query(
            'INSERT INTO users (id, email, password, company_name, role) VALUES (?, ?, ?, ?, ?)',
            [id, email, hashedPassword, company_name, 'agent']
        );
        res.json({ message: 'Agent created successfully', id });
    } catch (error) {
        res.status(500).json({ message: 'Error creating agent', error: error.message });
    }
}

export async function changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
            return res.status(401).json({ message: 'Invalid old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password', error: error.message });
    }
}

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}
