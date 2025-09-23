# Ventas ColGemelli

**Ventas ColGemelli** es una aplicación de gestión de ventas y emisión de tickets para el Colegio Franciscano Agustín Gemelli. Está construida con **Next.js** y desplegada en **Firebase**, integrando autenticación, Firestore.

---

## 📑 Tabla de contenidos

- [Características](#-características)  
- [Tecnologías usadas](#-tecnologías-usadas)  
- [Instalación y ejecución local](#-instalación-y-ejecución-local)  
- [Variables de entorno](#-variables-de-entorno)  
- [Estructura del proyecto](#-estructura-del-proyecto)  
- [Despliegue](#-despliegue)  
- [Reglas de Firestore y seguridad](#-reglas-de-firestore-y-seguridad)  
- [Contribuciones](#-contribuciones)  
- [Licencia](#-licencia)  
- [Contacto](#-contacto)

---

## ✨ Características

- Gestión de ventas con registro y seguimiento.  
- Emisión de tickets o comprobantes digitales.  
- Autenticación de usuarios con Firebase.  
- Panel administrativo para control de operaciones.  
- Hospedaje en Firebase (Hosting + Firestore).  
- Reglas de seguridad configuradas en Firestore.  
- Interfaz moderna con **Next.js** y **Tailwind CSS**.  

---

## 🛠 Tecnologías usadas

- [Next.js](https://nextjs.org/) (TypeScript)  
- [Firebase](https://firebase.google.com/)  
  - Firestore 
- [Tailwind CSS](https://tailwindcss.com/)  

---

## ⚙️ Instalación y ejecución local

Sigue estos pasos para correr la aplicación en tu entorno local:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/JMontes1986/ventasColgemelli.git
   cd ventasColgemelli
Instala las dependencias:

bash
Copiar código
npm install
Configura las variables de entorno (ver sección siguiente).

Inicia el servidor de desarrollo:

bash
Copiar código
npm run dev
Abre tu navegador en http://localhost:3000.

🔑 Variables de entorno
Crea un archivo .env.local en la raíz del proyecto con las siguientes variables (ejemplo):

env
Copiar código
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxxxxx
⚠️ Nota: Nunca subas este archivo a GitHub. Contiene credenciales sensibles.

📂 Estructura del proyecto
lua
Copiar código
├── .firebaserc
├── firebase.json
├── firestore.rules
├── apphosting.yaml
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── src/
│   ├── components/
│   ├── pages/  (o app/ según la versión de Next.js)
│   ├── styles/
│   └── utils/
firestore.rules: reglas de seguridad para Firestore.

apphosting.yaml: configuración de hosting en Firebase.

.firebaserc: configuración del proyecto Firebase.

src/: contiene componentes, páginas y estilos.

🚀 Despliegue
Autentícate en Firebase:

bash
Copiar código
firebase login
Compila la aplicación:

bash
Copiar código
npm run build
Despliega en Firebase Hosting:

bash
Copiar código
firebase deploy
🔒 Reglas de Firestore y seguridad
El archivo firestore.rules define las reglas de acceso a la base de datos.
Ejemplo recomendado:

txt
Copiar código
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ventas/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
Ajusta las reglas según los roles y niveles de acceso de tu institución.

🤝 Contribuciones
Haz un fork del proyecto.

Crea una rama con tu funcionalidad:

bash
Copiar código
git checkout -b feature/nueva-funcionalidad
Haz commit de tus cambios:

bash
Copiar código
git commit -m "Agregada nueva funcionalidad"
Sube la rama:

bash
Copiar código
git push origin feature/nueva-funcionalidad
Abre un Pull Request.

📜 Licencia
Este proyecto se distribuye bajo la licencia MIT.
Consulta el archivo LICENSE para más detalles.

📧 Contacto
Autor: Julián Montes

GitHub: JMontes1986

Colegio Franciscano Agustín Gemelli – Manizales
