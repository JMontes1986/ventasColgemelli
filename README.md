# Ventas ColGemelli - Sistema de Gestión

Este es un proyecto Next.js creado con Firebase Studio para la gestión de ventas y tickets del Colegio Gemelli.

## Primeros Pasos

Para ejecutar el proyecto localmente, sigue estos pasos:

1.  **Instalar dependencias:**
    Abre una terminal en la raíz del proyecto y ejecuta:
    ```bash
    npm install
    ```

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
