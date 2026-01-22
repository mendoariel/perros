const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.get('/api/pet/:medalString', async (req, res) => {
    const { medalString } = req.params;
    console.log(`[API] Processing pet lookup for: ${medalString}`);


    try {
        const query = `
      SELECT 
        m.pet_name, 
        m.description, 
        m.image, 
        m.medal_string,
        u.phonenumber as phone_number,
        CASE 
          WHEN u.username IS NOT NULL AND TRIM(u.username) != '' THEN u.username 
          ELSE u.email 
        END as owner_name

      FROM medals m

      JOIN users u ON m.owner_id = u.id
      WHERE m.medal_string = $1 AND m.status = 'ENABLED'

    `;

        const result = await pool.query(query, [medalString]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Mascota no encontrada o medalla no activada' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error querying database:', err);
        res.status(500).json({ message: 'Error interno del servidor de emergencia' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Emergency API listening at http://localhost:${port}`);
});
