# Proyecto JWT con React, Node.js y MongoDB Atlas

Arquitectura cliente-servidor con:

- Cliente: React + Vite
- Servidor: Node.js + Express
- Base de datos: MongoDB Atlas
- Autenticación: JWT

## Funcionalidad

- Formulario de registro
- Formulario de login
- Validación de credenciales contra MongoDB
- Generación y verificación de JWT
- Mensaje de éxito: `Ingreso validado`
- Consola del servidor con el token y los datos usados en la validación

## Estructura

- `client/`: interfaz en React
- `server/`: API, conexión a MongoDB y autenticación JWT

## Variables de entorno

### Servidor

Crear `server/.env` con:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<base>?retryWrites=true&w=majority
JWT_SECRET=una_clave_larga_y_segura
CORS_ORIGIN=http://localhost:5173
```

### Cliente

Crear `client/.env` con:

```env
VITE_API_URL=http://localhost:5000
```

## Instalación

Desde la raíz del proyecto:

```bash
npm install
```

Luego:

```bash
npm run dev
```

## Notas

- El registro guarda el usuario en MongoDB.
- El login valida email y contraseña.
- Al autenticar, el servidor genera un JWT y lo imprime junto con los datos de validación.
