import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import * as SQLite from 'wa-sqlite'

// Array to store all connected ports
const ports = []

// Database instance will be shared across all connections
let db = null
let sqlite3 = null

// Initialize database once
const initializeDatabase = async () => {
    if (!db) {
        const module = await SQLiteESMFactory()
        sqlite3 = SQLite.Factory(module)
        db = await sqlite3.open_v2('shared_medical_db')
        await sqlite3.exec(db, 
            `
            CREATE TABLE IF NOT EXISTS parametros (
                descripcion TEXT NOT NULL,
                nodo INTEGER NOT NULL,
                valor INTEGER NOT NULL,
                activo BOOLEAN NOT NULL
            );
            CREATE TABLE IF NOT EXISTS derivaciones (
                id INTEGER PRIMARY KEY,
                especialidad TEXT NOT NULL,           -- Eg. "Odontología", "Pediatría"
                nodoOrigen TEXT NOT NULL,             -- Eg. "CESFAM de Pichilemu"
                nodoDestino TEXT NOT NULL,            -- Eg. "Hospital de Pichilemu"
                fecha TEXT NOT NULL,                  -- Stored in ISO format: "YYYY-MM-DD"
                estado TEXT NOT NULL,                 -- Eg. "Pendiente", "Enviado", "Rechazado", "Atendido"
                observaciones TEXT,                   -- Optional field
                nombrePaciente TEXT NOT NULL,         -- Eg. "Juan Pérez"
                rutPaciente TEXT NOT NULL,            -- Eg. "12345678-9"
                nombreFuncionario TEXT NOT NULL,      -- Eg. "Juan Pérez"
                rutFuncionario TEXT NOT NULL          -- Eg. "12345678-9"
            );
            `
        )
        await sqlite3.exec(db, 
            `
            INSERT OR IGNORE INTO parametros (descripcion, nodo, valor, activo) VALUES ('usa_parametro_1', 1, 1, false);
            INSERT OR IGNORE INTO parametros (descripcion, nodo, valor, activo) VALUES ('usa_parametro_2', 2, 1, true);
            INSERT OR IGNORE INTO parametros (descripcion, nodo, valor, activo) VALUES ('usa_parametro_3', 3, 1, true);

            -- INSERT data into 'derivaciones'
            INSERT OR IGNORE INTO derivaciones (
                id,
                especialidad,
                nodoOrigen,
                nodoDestino,
                fecha,
                estado,
                observaciones,
                nombrePaciente,
                rutPaciente,
                nombreFuncionario,
                rutFuncionario
            ) VALUES
            (1, 'Cardiología', 'CESFAM Pichilemu', 'Hospital Regional', '2025-01-15', 'Nueva',
             'Prioridad alta', 'María González', '12.345.678-9', 'Dr. Carlos López', '11.222.333-4'),

            (2, 'Oftalmología', 'CESFAM La Estrella', 'Hospital de Especialidades', '2025-01-14', 'Enviada',
             'Control post-operatorio de cataratas', 'Pedro Ramírez', '98.765.432-1', 'Dra. Ana Morales', '22.333.444-5'),

            (3, 'Pediatría', 'CESFAM Norte', 'Hospital Infantil', '2025-01-13', 'Atendida',
             'Evaluación de desarrollo psicomotor completada', 'Sofía Herrera', '19.876.543-2', 'Dr. Luis Fernández', '33.444.555-6');
            `
        )
    }
}

// Handle SharedWorker connections
self.addEventListener('connect', async (event) => {
    const port = event.ports[0]
    ports.push(port)
    
    // Initialize database when first connection is made
    await initializeDatabase()
    
    port.addEventListener('message', async (event) => {
        try {
            const { type } = event.data
            
            if (type === 'obtenerDerivaciones') {
                const results = []
                await sqlite3.exec(db, `SELECT * FROM derivaciones`, (row, col) => {
                    results.push(row)
                })
                port.postMessage({type: 'derivacionesObtenidas', derivaciones: results})
                
            } else if (type === 'obtenerParametros') {
                const results = []
                await sqlite3.exec(db, `SELECT * FROM parametros`, (row, col) => {
                    results.push(row)
                })
                port.postMessage({type: 'parametrosObtenidos', parametros: results})
                
            } else if (type === 'actualizarDerivacion') {
                const {
                    id,
                    estado,
                    observaciones,
                    nombrePaciente,
                    rutPaciente,
                    nombreFuncionario,
                    rutFuncionario
                } = event.data
                
                await sqlite3.exec(db, `UPDATE derivaciones SET estado = '${estado}', observaciones = '${observaciones}', nombrePaciente = '${nombrePaciente}', rutPaciente = '${rutPaciente}', nombreFuncionario = '${nombreFuncionario}', rutFuncionario = '${rutFuncionario}' WHERE id = ${id}`)
                
                // Notify all connected ports about the update
                const updateMessage = {type: 'derivacionActualizada', id, estado, observaciones, nombrePaciente, rutPaciente, nombreFuncionario, rutFuncionario}
                ports.forEach(p => {
                    try {
                        p.postMessage(updateMessage)
                    } catch (e) {
                        // Remove disconnected ports
                        const index = ports.indexOf(p)
                        if (index > -1) {
                            ports.splice(index, 1)
                        }
                    }
                })
            } else if (type === 'actualizarParametros') {
                const { parametros } = event.data
                
                // Clear existing parameters and insert new ones
                await sqlite3.exec(db, 'DELETE FROM parametros')
                
                for (const param of parametros) {
                    await sqlite3.exec(db, `INSERT INTO parametros (descripcion, nodo, valor, activo) VALUES ('${param.descripcion}', ${param.nodo}, ${param.valor}, ${param.activo ? 1 : 0})`)
                }
                
                // Notify all connected ports about the parameter update
                const updateMessage = {type: 'parametrosActualizados', parametros}
                ports.forEach(p => {
                    try {
                        p.postMessage(updateMessage)
                    } catch (e) {
                        // Remove disconnected ports
                        const index = ports.indexOf(p)
                        if (index > -1) {
                            ports.splice(index, 1)
                        }
                    }
                })
            }
        } catch (e) {
            console.log("### SharedWorker error", e)
            port.postMessage({type: 'error', message: e.message})
        }
    })
    
    port.start()
})