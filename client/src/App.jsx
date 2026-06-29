import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialRegisterState = {
  name: '',
  email: '',
  password: ''
};

const initialLoginState = {
  email: '',
  password: ''
};

export default function App() {
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const updateRegisterField = (event) => {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
  };

  const updateLoginField = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
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
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
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
        throw new Error(loginData.message || 'No se pudo iniciar sesión');
      }

      const verifyResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${loginData.token}`
        }
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || 'No se pudo validar el token');
      }

      setMessage('Ingreso validado');
      setLoginForm(initialLoginState);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">React + Node.js + MongoDB Atlas + JWT</p>
          <h1>Registro e ingreso con validación segura</h1>
          <p className="subtitle">
            Una interfaz pastel, intuitiva y clara para registrar usuarios y validar su acceso
            con un token JWT.
          </p>
          {message ? (
            <div className={`status-box ${message === 'Ingreso validado' ? 'success' : ''}`}>
              {message}
            </div>
          ) : null}
        </div>

        <div className="forms-grid">
          <form className="panel" onSubmit={handleLogin}>
            <h2>Login</h2>
            <label>
              Correo
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
              Contraseña
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={updateLoginField}
                placeholder="Ingresa tu contraseña"
                required
              />
            </label>
            <div className="action-row">
              <button
                type="button"
                className="register-cta"
                onClick={() => setIsRegisterOpen(true)}
                disabled={loading}
              >
                Registro
              </button>
              <button type="submit" disabled={loading}>
                {loading ? 'Validando...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {isRegisterOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsRegisterOpen(false)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Nuevo usuario</p>
                <h2 id="register-title">Registro</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsRegisterOpen(false)}
                aria-label="Cerrar modal de registro"
              >
                ×
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
                Contraseña
                <input
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={updateRegisterField}
                  placeholder="Crea una contraseña"
                  required
                />
              </label>
              <div className="action-row modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsRegisterOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button type="submit" className="register-cta" disabled={loading}>
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
