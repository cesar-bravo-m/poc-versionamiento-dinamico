import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import * as SQLite from 'wa-sqlite'

(async () => {
    const module = await SQLiteESMFactory()
    const sqlite3 = SQLite.Factory(module)
    const db = await sqlite3.open_v2('hello')
    await sqlite3.exec(db, 
        `
        CREATE TABLE IF NOT EXISTS parametros (
            descripcion TEXT NOT NULL,
            nodo INTEGER NOT NULL,
            valor INTEGER NOT NULL,
            activo BOOLEAN NOT NULL
        );
        `
    )
    await sqlite3.exec(db, 
        `
INSERT INTO parametros (descripcion, nodo, valor, activo) VALUES ('usa_parametro1', 1, 1, false);
INSERT INTO parametros (descripcion, nodo, valor, activo) VALUES ('usa_parametro2', 2, 1, true);
        `
    )
    addEventListener('message', async (event) => {
        try {
            const { type } = event.data
            if (type === 'query') {
                const results = []
                await sqlite3.exec(db, event.data.query, (row, col) => {
                    results.push(row)
                })
                postMessage(results)
            }
        } catch (e) {
            console.log("### error", e);
        }
    })
    // await sqlite3.close(db)
})()