import React, { useState } from 'react'

export default function CitasV1() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      paciente: 'María González',
      doctor: 'Dr. Carlos Mendoza',
      especialidad: 'Cardiología',
      fecha: '2024-01-15',
      hora: '10:30',
      estado: 'confirmada'
    },
    {
      id: 2,
      paciente: 'Juan Pérez',
      doctor: 'Dra. Ana Martínez',
      especialidad: 'Dermatología',
      fecha: '2024-01-16',
      hora: '14:00',
      estado: 'pendiente'
    },
    {
      id: 3,
      paciente: 'Carmen Silva',
      doctor: 'Dr. Luis Rodríguez',
      especialidad: 'Neurología',
      fecha: '2024-01-17',
      hora: '09:15',
      estado: 'confirmada'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    paciente: '',
    doctor: '',
    especialidad: '',
    fecha: '',
    hora: ''
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
      hora: ''
    });
    setShowForm(false);
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'confirmada': return '#28a745';
      case 'pendiente': return '#ffc107';
      case 'cancelada': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const containerStyle = {
    padding: '20px',
    fontFamily: 'sans-serif',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '2px solid #e9ecef'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const cardHoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  };

  const buttonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease'
  };

  const formStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '25px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid #e9ecef',
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '15px'
  };

  const statusBadgeStyle = (estado) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    color: 'white',
    backgroundColor: getStatusColor(estado)
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>
            Citas v1
          </h2>
        </div>
        <button
          style={buttonStyle}
          onClick={() => setShowForm(!showForm)}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          {showForm ? 'Cancelar' : '+ Nueva Cita'}
        </button>
      </div>

      {showForm && (
        <form style={formStyle} onSubmit={handleSubmit}>
          <h3 style={{ marginTop: 0, color: '#333', marginBottom: '20px' }}>
            Agendar Nueva Cita
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input
              style={inputStyle}
              type="text"
              placeholder="Nombre del paciente"
              value={formData.paciente}
              onChange={(e) => setFormData({...formData, paciente: e.target.value})}
              required
            />
            <input
              style={inputStyle}
              type="text"
              placeholder="Doctor"
              value={formData.doctor}
              onChange={(e) => setFormData({...formData, doctor: e.target.value})}
              required
            />
            <input
              style={inputStyle}
              type="text"
              placeholder="Especialidad"
              value={formData.especialidad}
              onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
              required
            />
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
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={buttonStyle}>
              Agendar Cita
            </button>
            <button 
              type="button" 
              style={{...buttonStyle, backgroundColor: '#6c757d'}}
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div>
        <h3 style={{ color: '#333', marginBottom: '20px' }}>
          Próximas Citas ({appointments.length})
        </h3>
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px' }}>
                  👤 {appointment.paciente}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px', color: '#666' }}>
                  <div>
                    <strong>Doctor:</strong> {appointment.doctor}
                  </div>
                  <div>
                    <strong>Especialidad:</strong> {appointment.especialidad}
                  </div>
                  <div>
                    <strong>Fecha:</strong> {new Date(appointment.fecha).toLocaleDateString('es-ES')}
                  </div>
                  <div>
                    <strong>Hora:</strong> {appointment.hora}
                  </div>
                </div>
              </div>
              <div style={{ marginLeft: '20px' }}>
                <span style={statusBadgeStyle(appointment.estado)}>
                  {appointment.estado}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}