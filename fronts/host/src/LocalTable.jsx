import React, { useEffect, useState } from 'react';
import initSqlite from 'wa-sqlite';

// Componente que muestra una tabla editable usando wa-sqlite
export default function LocalTable() {
  const [db, setDb] = useState(null);
  const [rows, setRows] = useState([]);

  // Inicializar la base de datos en memoria
  useEffect(() => {
    const init = async () => {
      try {
        // Inicializa wa-sqlite y crea una base en IndexedDB
        const sqlite = await initSqlite();
        const db = await sqlite.open({ filename: 'datos.db', vfs: 'idb' });
        await db.exec('CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY, nombre TEXT, valor TEXT)');

        // Insertar datos de ejemplo si la tabla está vacía
        const countRes = await db.exec('SELECT count(*) as c FROM items');
        const count = countRes[0]?.values?.[0]?.[0] || 0;
        if (count === 0) {
          await db.run('BEGIN');
          for (let i = 1; i <= 100; i++) {
            await db.run('INSERT INTO items(nombre, valor) VALUES(?, ?)', [`Item ${i}`, `Valor ${i}`]);
          }
          await db.run('COMMIT');
        }

        const result = await db.exec('SELECT id, nombre, valor FROM items');
        const loadedRows = result[0].values.map(([id, nombre, valor]) => ({ id, nombre, valor }));
        setRows(loadedRows);
        setDb(db);
      } catch (e) {
        console.error('Error inicializando wa-sqlite', e);
      }
    };
    init();
  }, []);

  // Actualizar un valor en la tabla y en la base de datos
  const updateRow = async (id, field, value) => {
    const updated = rows.map(r => (r.id === id ? { ...r, [field]: value } : r));
    setRows(updated);
    if (db) {
      await db.run(`UPDATE items SET ${field}=? WHERE id=?`, [value, id]);
    }
  };

  // Simula el envío de datos a un backend
  const commitChanges = () => {
    console.log('Datos a enviar', rows);
    alert('Cambios enviados al backend (simulado)');
  };

  return (
    <div>
      <h2>Tabla local</h2>
      <table border="1" cellPadding="4" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>
                <input value={row.nombre} onChange={e => updateRow(row.id, 'nombre', e.target.value)} />
              </td>
              <td>
                <input value={row.valor} onChange={e => updateRow(row.id, 'valor', e.target.value)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={commitChanges} style={{ marginTop: '10px' }}>Commit</button>
    </div>
  );
}
