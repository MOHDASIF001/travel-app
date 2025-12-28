import bcrypt from 'bcryptjs';
import pool, { initDb } from './db.js';

async function createAdmin() {
    await initDb();

    const email = 'admin@itinerarypro.com';
    const password = 'adminpassword123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = 'admin_1';

    try {
        await pool.query(
            'INSERT INTO users (id, email, password, role, company_name) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?',
            [id, email, hashedPassword, 'admin', 'ItineraryPro Admin', hashedPassword]
        );
        console.log('Super Admin created successfully');
        console.log('Email:', email);
        console.log('Password:', password);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
