const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { getClient } = require('./get-client');
const createHash = require('hash-generator');
require('./config'); // Cargar configuración

const app = express();
const PORT = process.env.PORT || 3334;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Función para crear hash único
async function createUniqueHash() {
    let medalString = createHash(36);
    const client = await getClient();
    let createQuery = `SELECT * FROM virgin_medals WHERE medal_string = '${medalString}'`;
    const medal = await client.query(createQuery);
    client.end();
    if(medal.rows.length > 0) return createUniqueHash();
    else return medalString;
}

// GET /virgin-medals - Obtener todas las medallas virgin
app.get('/virgin-medals', async (req, res) => {
    try {
        const client = await getClient();
        const query = `
            SELECT id, status, medal_string, register_hash, created_at, updated_at
            FROM virgin_medals 
            ORDER BY created_at DESC
        `;
        const result = await client.query(query);
        client.end();
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching virgin medals:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /virgin-medals/stats - Obtener estadísticas
app.get('/virgin-medals/stats', async (req, res) => {
    try {
        const client = await getClient();
        
        // Total de medallas
        const totalQuery = 'SELECT COUNT(*) as total FROM virgin_medals';
        const totalResult = await client.query(totalQuery);
        
        // Estadísticas por estado
        const statsQuery = `
            SELECT status, COUNT(*) as count 
            FROM virgin_medals 
            GROUP BY status
        `;
        const statsResult = await client.query(statsQuery);
        
        client.end();
        
        // Construir objeto de estadísticas
        const stats = {
            total: parseInt(totalResult.rows[0].total),
            virgin: 0,
            enabled: 0,
            disabled: 0,
            dead: 0,
            registerProcess: 0,
            pendingConfirmation: 0,
            incomplete: 0,
            registered: 0
        };
        
        // Mapear resultados
        statsResult.rows.forEach(row => {
            const status = row.status.toLowerCase();
            if (stats.hasOwnProperty(status)) {
                stats[status] = parseInt(row.count);
            }
        });
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /virgin-medals/create - Crear nuevas medallas
app.post('/virgin-medals/create', async (req, res) => {
    try {
        const { quantity, registerHash } = req.body;
        
        if (!quantity || !registerHash) {
            return res.status(400).json({ error: 'Cantidad y registerHash son requeridos' });
        }
        
        if (quantity < 1 || quantity > 1000) {
            return res.status(400).json({ error: 'La cantidad debe estar entre 1 y 1000' });
        }
        
        const client = await getClient();
        
        // Crear medallas
        for (let i = 0; i < quantity; i++) {
            const medalString = await createUniqueHash();
            const insertQuery = `
                INSERT INTO virgin_medals (status, medal_string, register_hash) 
                VALUES ('VIRGIN', '${medalString}', '${registerHash}')
            `;
            await client.query(insertQuery);
        }
        
        client.end();
        
        res.json({ 
            message: `${quantity} medallas creadas exitosamente`,
            registerHash 
        });
    } catch (error) {
        console.error('Error creating medals:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// PATCH /virgin-medals/:id/status - Actualizar estado de una medalla
app.patch('/virgin-medals/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = [
            'VIRGIN', 'ENABLED', 'DISABLED', 'DEAD', 
            'REGISTER_PROCESS', 'PENDING_CONFIRMATION', 'INCOMPLETE', 'REGISTERED'
        ];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Estado no válido' });
        }
        
        const client = await getClient();
        const updateQuery = `
            UPDATE virgin_medals 
            SET status = '${status}', updated_at = CURRENT_TIMESTAMP 
            WHERE id = ${id}
        `;
        const result = await client.query(updateQuery);
        client.end();
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Medalla no encontrada' });
        }
        
        res.json({ message: 'Estado actualizado exitosamente' });
    } catch (error) {
        console.error('Error updating medal status:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// DELETE /virgin-medals/:id - Eliminar una medalla
app.delete('/virgin-medals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const client = await getClient();
        const deleteQuery = `DELETE FROM virgin_medals WHERE id = ${id}`;
        const result = await client.query(deleteQuery);
        client.end();
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Medalla no encontrada' });
        }
        
        res.json({ message: 'Medalla eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleting medal:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Dashboard server running on port ${PORT}`);
}); 