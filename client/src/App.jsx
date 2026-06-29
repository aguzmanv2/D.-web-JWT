import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'jwt_token';

const initialLoginState = {
  email: '',
  password: ''
};

const initialRegisterState = {
  name: '',
  email: '',
  password: ''
};

const initialRecordState = {
  nombres: '',
  apellidos: '',
  edad: '',
  profesion: ''
};

export default function App() {
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [recordForm, setRecordForm] = useState(initialRecordState);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    setCurrentUser(null);
    setRecords([]);
    setRecordModalOpen(false);
    setRegisterModalOpen(false);
    setEditingRecord(null);
    setRecordForm(initialRecordState);
    setLoginForm(initialLoginState);
    setRegisterForm(initialRegisterState);
    setMessage('');
  };

  const requestJson = async (path, options = {}) => {
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      throw new Error('Sesion expirada, inicia sesion otra vez');
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storedToken}`,
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      clearSession();
      throw new Error(data.message || 'Sesion expirada, inicia sesion otra vez');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Algo salio mal');
    }

    return data;
  };

  const loadRecords = async () => {
    const data = await requestJson('/api/records');
    setRecords(data.records || []);
  };

  const bootSession = async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      setCheckingSession(false);
      return;
    }

    try {
      const sessionData = await requestJson('/api/auth/me');
      setCurrentUser(sessionData.user);
      await loadRecords();
    } catch (error) {
      clearSession();
      setMessage(error.message);
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    bootSession();
  }, []);

  const updateLoginField = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  };

  const updateRegisterField = (event) => {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
  };

  const updateRecordField = (event) => {
    const { name, value } = event.target;
    setRecordForm((current) => ({ ...current, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || 'No se pudo iniciar sesion');
      }

      localStorage.setItem(TOKEN_KEY, loginData.token);
      console.log('Token recibido en el navegador:', loginData.token);

      const sessionData = await requestJson('/api/auth/me');
      setCurrentUser(sessionData.user);
      await loadRecords();
      setMessage('Ingreso validado');
      setLoginForm(initialLoginState);
    } catch (error) {
      clearSession();
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo registrar el usuario');
      }

      setMessage(data.message);
      setRegisterForm(initialRegisterState);
      setRegisterModalOpen(false);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    setRecordForm(initialRecordState);
    setMessage('');
    setRecordModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setRecordForm({
      nombres: record.nombres || '',
      apellidos: record.apellidos || '',
      edad: record.edad?.toString?.() || '',
      profesion: record.profesion || ''
    });
    setMessage('');
    setRecordModalOpen(true);
  };

  const closeRecordModal = () => {
    setRecordModalOpen(false);
    setEditingRecord(null);
    setRecordForm(initialRecordState);
  };

  const closeRegisterModal = () => {
    setRegisterModalOpen(false);
    setRegisterForm(initialRegisterState);
  };

  const handleRecordSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        nombres: recordForm.nombres.trim(),
        apellidos: recordForm.apellidos.trim(),
        edad: Number(recordForm.edad),
        profesion: recordForm.profesion.trim()
      };

      const path = editingRecord ? `/api/records/${editingRecord.id}` : '/api/records';
      const method = editingRecord ? 'PUT' : 'POST';

      const data = await requestJson(path, {
        method,
        body: JSON.stringify(payload)
      });

      setMessage(data.message);
      closeRecordModal();
      await loadRecords();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    const shouldDelete = window.confirm('Quieres eliminar este registro?');

    if (!shouldDelete) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const data = await requestJson(`/api/records/${recordId}`, {
        method: 'DELETE'
      });

      setMessage(data.message);
      await loadRecords();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="page-shell">
        <section className="auth-card">
          <div>
            <p className="eyebrow">JWT + CRUD protegido</p>
            <h1>Verificando sesion</h1>
            <p className="muted-copy">Estamos revisando si el token guardado sigue siendo valido.</p>
          </div>
        </section>
      </main>
    );
  }

  if (currentUser) {
    return (
      <main className="page-shell dashboard-shell">
        <section className="dashboard-card">
          <header className="dashboard-header">
            <div>
              <p className="eyebrow">Modulo protegido</p>
              <h1>CRUD de registros</h1>
              <p className="muted-copy">Hola, {currentUser.name}. Solo puedes trabajar aqui si el token es valido.</p>
            </div>
            <div className="header-actions">
              <button type="button" className="soft-button primary" onClick={openCreateModal} disabled={loading}>
                Nuevo registro
              </button>
              <button type="button" className="soft-button secondary" onClick={clearSession} disabled={loading}>
                Cerrar sesion
              </button>
            </div>
          </header>

          {message ? (
            <div className={`status-box ${message === 'Ingreso validado' ? 'success' : ''}`}>
              {message}
            </div>
          ) : null}

          <div className="records-grid">
            {records.length === 0 ? (
              <article className="empty-state">
                <h2>No hay registros aun</h2>
                <p>Abre el modal para crear el primer registro protegido por JWT.</p>
              </article>
            ) : (
              records.map((record) => (
                <article key={record.id} className="record-card">
                  <div className="record-main">
                    <p className="record-name">
                      {record.nombres} {record.apellidos}
                    </p>
                    <p className="record-meta">
                      <span>Edad: {record.edad}</span>
                      <span>Profesion: {record.profesion}</span>
                    </p>
                  </div>
                  <div className="record-actions">
                    <button type="button" className="soft-button ghost" onClick={() => openEditModal(record)}>
                      Editar
                    </button>
                    <button type="button" className="soft-button danger" onClick={() => handleDeleteRecord(record.id)}>
                      Eliminar
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {recordModalOpen ? (
          <div className="modal-backdrop" role="presentation" onClick={closeRecordModal}>
            <div className="modal-card soft-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <p className="eyebrow">{editingRecord ? 'Editar registro' : 'Nuevo registro'}</p>
                  <h2>{editingRecord ? 'Actualizar datos' : 'Crear registro'}</h2>
                </div>
                <button type="button" className="modal-close" onClick={closeRecordModal} aria-label="Cerrar modal">
                  x
                </button>
              </div>

              <form className="modal-form" onSubmit={handleRecordSubmit}>
                <div className="field-grid">
                  <label>
                    Nombres
                    <input
                      type="text"
                      name="nombres"
                      value={recordForm.nombres}
                      onChange={updateRecordField}
                      placeholder="Tus nombres"
                      required
                    />
                  </label>
                  <label>
                    Apellidos
                    <input
                      type="text"
                      name="apellidos"
                      value={recordForm.apellidos}
                      onChange={updateRecordField}
                      placeholder="Tus apellidos"
                      required
                    />
                  </label>
                  <label>
                    Edad
                    <input
                      type="number"
                      name="edad"
                      value={recordForm.edad}
                      onChange={updateRecordField}
                      placeholder="Tu edad"
                      min="0"
                      required
                    />
                  </label>
                  <label>
                    Profesion
                    <input
                      type="text"
                      name="profesion"
                      value={recordForm.profesion}
                      onChange={updateRecordField}
                      placeholder="Tu profesion"
                      required
                    />
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="soft-button secondary" onClick={closeRecordModal} disabled={loading}>
                    Cancelar
                  </button>
                  <button type="submit" className="soft-button primary" disabled={loading}>
                    {loading ? 'Guardando...' : editingRecord ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="auth-card login-card">
        <div className="auth-copy">
          <p className="eyebrow">React + Node.js + JWT</p>
          <h1>Acceso al sistema</h1>
          <p className="muted-copy">Inicia sesion o crea una cuenta para entrar al modulo CRUD protegido.</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={loginForm.email}
              onChange={updateLoginField}
              placeholder="correo@ejemplo.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={loginForm.password}
              onChange={updateLoginField}
              placeholder="Tu password"
              required
            />
          </label>
          <div className="header-actions">
            <button type="button" className="soft-button secondary" onClick={() => setRegisterModalOpen(true)} disabled={loading}>
              Registro
            </button>
            <button type="submit" className="soft-button primary" disabled={loading}>
              {loading ? 'Validando...' : 'Iniciar sesion'}
            </button>
          </div>
        </form>

        {message ? <div className="status-box">{message}</div> : null}
      </section>

      {registerModalOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={closeRegisterModal}>
          <div className="modal-card soft-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Nuevo usuario</p>
                <h2>Registro</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeRegisterModal} aria-label="Cerrar modal">
                x
              </button>
            </div>

            <form className="modal-form" onSubmit={handleRegister}>
              <label>
                Nombre
                <input
                  type="text"
                  name="name"
                  value={registerForm.name}
                  onChange={updateRegisterField}
                  placeholder="Tu nombre"
                  required
                />
              </label>
              <label>
                Correo
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={updateRegisterField}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={updateRegisterField}
                  placeholder="Crea tu password"
                  required
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="soft-button secondary" onClick={closeRegisterModal} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="soft-button primary" disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrarse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
