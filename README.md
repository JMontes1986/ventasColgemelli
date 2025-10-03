# 📦 Ventas ColGemelli

Aplicación web para **gestión de ventas y emisión de tickets** del Colegio Franciscano Agustín Gemelli. Construida con **Next.js + TypeScript** en el frontend y **Firebase (Auth, Firestore, Hosting/Storage, App Check)** en el backend.

---

## ✨ Características
- Registro de **ventas** con productos, cantidades y medios de pago.
- Emisión y validación de **tickets** (con código/QR).
- Búsqueda y filtros por fecha, estado o usuario.
- Roles básicos de usuario (**admin / operador**).
- UI con **Tailwind CSS**.
- Preparado para despliegue en **Firebase Hosting** o **Netlify**.

---

## 🧱 Arquitectura
- **Next.js (TypeScript):** Rutas, páginas y componentes UI.
- **Firebase:**
  - **Auth:** Autenticación de usuarios.
  - **Firestore:** Base de datos NoSQL.
  - **Storage:** Archivos y comprobantes (opcional).
  - **App Check:** Protección contra abuso.
- **Reglas de seguridad:** Definidas en `firestore.rules`.

---

## 📁 Estructura del proyecto
```bash
├── .firebaserc
├── apphosting.yaml
├── firestore.rules
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── components/
    ├── pages/    # o app/ según versión de Next.js
    ├── styles/
    └── utils/
```

---

## ⚙️ Requisitos
- **Node.js** 18+ (LTS recomendado)
- **npm** o **pnpm**
- **Proyecto Firebase** con Firestore habilitado

---

## 🔐 Variables de entorno
Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxx
```

> ⚠️ **Importante:** No subas este archivo al repositorio.

---

## 🚀 Primeros pasos
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir en navegador
http://localhost:3000
```

---

## 🗃️ Modelo de datos sugerido

### `ventas/{ventaId}`
- `fecha`: Timestamp
- `vendedorId`: string
- `items`: array `{ productoId, nombre, cantidad, precioUnitario, subtotal }`
- `total`: number
- `medioPago`: string
- `estado`: `registrada | anulada`
- `ticketId`: string

### `tickets/{ticketId}`
- `ventaId`: string
- `codigo`: string | QR
- `estado`: `emitido | validado | anulado`
- `emitidoEn`: Timestamp
- `validadoEn`: Timestamp

### `productos/{productoId}`
- `nombre`: string
- `precio`: number
- `categoria`: string
- `activo`: boolean
- `stock`: number

### `usuarios/{uid}`
- `displayName`: string
- `role`: `admin | operador`
- `activo`: boolean

---

## 🔒 Reglas de seguridad Firestore (ejemplo)
```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /usuarios/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    match /ventas/{docId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role in ['admin','operador'];
    }

    match /tickets/{docId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role in ['admin','operador'];
      allow delete: if request.auth != null
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role == 'admin';
    }

    match /productos/{docId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 🧪 Scripts de npm
```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## ☁️ Despliegue

### Firebase Hosting
```bash
firebase login
npm run build
firebase deploy
```

### Netlify
1. Conectar repositorio.
2. **Build command:** `npm run build`
3. **Publish directory:** `.next`

---

## 📸 Capturas de pantalla

> Agrega tus imágenes en `/docs/screenshots/` y actualiza las rutas:

- Pantalla de inicio
  ![Inicio](docs/screenshots/inicio.png)

- Panel de ventas
  ![Panel de ventas](docs/screenshots/panel-ventas.png)

- Emisión de ticket
  ![Ticket](docs/screenshots/ticket.png)

---

## 🐛 Solución de problemas
- **Pantalla en blanco:** revisa variables de entorno.
- **PERMISSION_DENIED:** revisa `firestore.rules` y roles de usuario.
- **Límites Firestore:** usa paginación e índices compuestos.

---

## 🤝 Contribuir
1. Haz un fork.
2. Crea una rama:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Envía un PR.

---

## 📄 Licencia
MIT

---

## 📫 Contacto
**Autor:** Julián Montes — Colegio Franciscano Agustín Gemelli (Manizales
