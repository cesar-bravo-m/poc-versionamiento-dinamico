import React, { useState } from 'react'

export default function CitasV2() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      paciente: 'María González',
      doctor: 'Dr. Carlos Mendoza',
      especialidad: 'Cardiología',
      fecha: '2024-01-15',
      hora: '10:30',
      estado: 'confirmada',
      urgencia: 'alta'
    },
    {
      id: 2,
      paciente: 'Juan Pérez',
      doctor: 'Dra. Ana Martínez',
      especialidad: 'Dermatología',
      fecha: '2024-01-16',
      hora: '14:00',
      estado: 'pendiente',
      urgencia: 'media'
    },
    {
      id: 3,
      paciente: 'Carmen Silva',
      doctor: 'Dr. Luis Rodríguez',
      especialidad: 'Neurología',
      fecha: '2024-01-17',
      hora: '09:15',
      estado: 'confirmada',
      urgencia: 'baja'
    },
    {
      id: 4,
      paciente: 'Pedro Martín',
      doctor: 'Dra. Laura Fernández',
      especialidad: 'Pediatría',
      fecha: '2024-01-18',
      hora: '16:45',
      estado: 'pendiente',
      urgencia: 'alta'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [formData, setFormData] = useState({
    paciente: '',
    doctor: '',
    especialidad: '',
    fecha: '',
    hora: '',
    urgencia: 'media'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAppointment = {
      id: appointments.length + 1,
      ...formData,
      estado: 'pendiente'
    };
    setAppointments([...appointments, newAppointment]);
    setFormData({
      paciente: '',
      doctor: '',
      especialidad: '',
      fecha: '',
      hora: '',
      urgencia: 'media'
    });
    setShowForm(false);
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'confirmada': return '#10b981';
      case 'pendiente': return '#f59e0b';
      case 'cancelada': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getUrgencyColor = (urgencia) => {
    switch (urgencia) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      case 'baja': return '#10b981';
      default: return '#6b7280';
    }
  };

  const containerStyle = {
    padding: '24px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    borderRadius: '12px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    padding: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)'
  };

  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  };

  const gridCardStyle = {
    ...cardStyle,
    display: 'flex',
    flexDirection: 'column',
    height: '280px'
  };

  const buttonStyle = {
    backgroundColor: '#8b5cf6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
  };

  const formStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    marginBottom: '24px',
    backdropFilter: 'blur(10px)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  };

  const statusBadgeStyle = (estado) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    color: 'white',
    backgroundColor: getStatusColor(estado),
    gap: '4px'
  });

  const urgencyBadgeStyle = (urgencia) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'white',
    backgroundColor: getUrgencyColor(urgencia),
    marginLeft: '8px'
  });

  const toggleButtonStyle = (isActive) => ({
    ...buttonStyle,
    backgroundColor: isActive ? '#8b5cf6' : 'transparent',
    color: isActive ? 'white' : '#8b5cf6',
    border: `2px solid ${isActive ? '#8b5cf6' : '#8b5cf6'}`,
    padding: '8px 16px',
    fontSize: '12px',
    marginLeft: '8px'
  });

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, color: '#1f2937', fontSize: '28px', fontWeight: '700' }}>
            Citas v2
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Sistema avanzado de gestión médica
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <button
              style={toggleButtonStyle(viewMode === 'grid')}
              onClick={() => setViewMode('grid')}
            >
              📊 Grid
            </button>
            <button
              style={toggleButtonStyle(viewMode === 'list')}
              onClick={() => setViewMode('list')}
            >
              📋 Lista
            </button>
          </div>
          <button
            style={buttonStyle}
            onClick={() => setShowForm(!showForm)}
            onMouseOver={(e) => e.target.style.backgroundColor = '#7c3aed'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
          >
            {showForm ? '✖ Cerrar' : '➕ Nueva Cita'}
          </button>
        </div>
      </div>

      {showForm && (
        <form style={formStyle} onSubmit={handleSubmit}>
          <h3 style={{ marginTop: 0, color: '#1f2937', marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
            🩺 Crear Nueva Cita
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <input
              style={inputStyle}
              type="text"
              placeholder="👤 Nombre del paciente"
              value={formData.paciente}
              onChange={(e) => setFormData({...formData, paciente: e.target.value})}
              required
            />
            <input
              style={inputStyle}
              type="text"
              placeholder="👨‍⚕️ Doctor"
              value={formData.doctor}
              onChange={(e) => setFormData({...formData, doctor: e.target.value})}
              required
            />
            <input
              style={inputStyle}
              type="text"
              placeholder="🏥 Especialidad"
              value={formData.especialidad}
              onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
              required
            />
            <select
              style={selectStyle}
              value={formData.urgencia}
              onChange={(e) => setFormData({...formData, urgencia: e.target.value})}
            >
              <option value="baja">🟢 Urgencia Baja</option>
              <option value="media">🟡 Urgencia Media</option>
              <option value="alta">🔴 Urgencia Alta</option>
            </select>
            <input
              style={inputStyle}
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              required
            />
            <input
              style={inputStyle}
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({...formData, hora: e.target.value})}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" style={buttonStyle}>
              💾 Guardar Cita
            </button>
            <button 
              type="button" 
              style={{...buttonStyle, backgroundColor: '#6b7280'}}
              onClick={() => setShowForm(false)}
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      )}

      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ color: '#1f2937', marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
          Agenda Médica ({appointments.length} citas)
        </h3>
        
        <div style={viewMode === 'grid' ? gridContainerStyle : {}}>
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              style={viewMode === 'grid' ? gridCardStyle : cardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                    👤 {appointment.paciente}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={statusBadgeStyle(appointment.estado)}>
                      {appointment.estado === 'confirmada' ? '✅' : '⏳'} {appointment.estado}
                    </span>
                    <span style={urgencyBadgeStyle(appointment.urgencia)}>
                      {appointment.urgencia === 'alta' ? '🔴' : appointment.urgencia === 'media' ? '🟡' : '🟢'} {appointment.urgencia}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: viewMode === 'grid' ? '1fr' : '1fr 1fr', 
                gap: '12px', 
                fontSize: '14px', 
                color: '#4b5563',
                flex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>👨‍⚕️</span>
                  <span><strong>Doctor:</strong> {appointment.doctor}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🏥</span>
                  <span><strong>Especialidad:</strong> {appointment.especialidad}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>📅</span>
                  <span><strong>Fecha:</strong> {new Date(appointment.fecha).toLocaleDateString('es-ES')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>⏰</span>
                  <span><strong>Hora:</strong> {appointment.hora}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}