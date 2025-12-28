import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';
import { login, createAgent, changePassword, authenticateToken } from './auth.js';
import pool from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 5000;

// Auth Routes
app.post('/api/login', login);
app.post('/api/create-agent', authenticateToken, createAgent);
app.post('/api/change-password', authenticateToken, changePassword);

// Itinerary Routes
app.get('/api/itineraries', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT data_json FROM itineraries WHERE user_id = ? ORDER BY updated_at DESC', [req.user.id]);
        res.json(rows.map(r => JSON.parse(r.data_json)));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching itineraries' });
    }
});

app.post('/api/itineraries', authenticateToken, async (req, res) => {
    const data = req.body;
    try {
        const [exists] = await pool.query('SELECT id FROM itineraries WHERE id = ?', [data.id]);
        if (exists.length > 0) {
            await pool.query('UPDATE itineraries SET data_json = ? WHERE id = ?', [JSON.stringify(data), data.id]);
        } else {
            await pool.query('INSERT INTO itineraries (id, user_id, data_json) VALUES (?, ?, ?)', [data.id, req.user.id, JSON.stringify(data)]);
        }
        res.json({ message: 'Saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving itinerary' });
    }
});

app.delete('/api/itineraries/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM itineraries WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting itinerary' });
    }
});

// Hotels Routes
app.get('/api/hotels', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT data_json FROM master_hotels WHERE user_id = ?', [req.user.id]);
        res.json(rows.map(r => JSON.parse(r.data_json)));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hotels' });
    }
});

app.post('/api/hotels', authenticateToken, async (req, res) => {
    const hotels = req.body; // Expecting array
    try {
        // For simplicity, we replace all hotels for the user
        await pool.query('DELETE FROM master_hotels WHERE user_id = ?', [req.user.id]);
        for (const hotel of hotels) {
            await pool.query('INSERT INTO master_hotels (id, user_id, data_json) VALUES (?, ?, ?)', [hotel.id, req.user.id, JSON.stringify(hotel)]);
        }
        res.json({ message: 'Hotels updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating hotels' });
    }
});

// Branding Routes
app.get('/api/branding', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT data_json FROM branding WHERE user_id = ?', [req.user.id]);
        if (rows.length > 0) {
            res.json(JSON.parse(rows[0].data_json));
        } else {
            res.status(404).json({ message: 'Branding not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching branding' });
    }
});

app.post('/api/branding', authenticateToken, async (req, res) => {
    const data = req.body;
    try {
        const [exists] = await pool.query('SELECT user_id FROM branding WHERE user_id = ?', [req.user.id]);
        if (exists.length > 0) {
            await pool.query('UPDATE branding SET data_json = ? WHERE user_id = ?', [JSON.stringify(data), req.user.id]);
        } else {
            await pool.query('INSERT INTO branding (user_id, data_json) VALUES (?, ?)', [req.user.id, JSON.stringify(data)]);
        }
        res.json({ message: 'Branding updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating branding' });
    }
});

// Admin Route: List Agents
app.get('/api/admin/agents', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
        const [rows] = await pool.query('SELECT id, email, company_name, created_at FROM users WHERE role = "agent"');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching agents' });
    }
});

app.delete('/api/admin/agents/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
        await pool.query('DELETE FROM users WHERE id = ? AND role = "agent"', [req.params.id]);
        res.json({ message: 'Agent deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting agent' });
    }
});

// Start Server
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
