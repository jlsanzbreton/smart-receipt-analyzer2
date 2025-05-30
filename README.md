# Smart Receipt Analyzer

Una aplicación web progresiva (PWA) que analiza tus recibos para proporcionar insights de ahorro y ayudarte a gestionar tus gastos de manera más inteligente.

## Características

- 📸 Escanea recibos mediante carga de imágenes
- 💰 Analiza gastos y categoriza automáticamente
- 📊 Visualiza gastos por categoría
- 💡 Recibe sugerencias personalizadas para ahorrar dinero
- 🔄 Funciona offline (PWA)
- 🔒 Datos almacenados localmente para mayor privacidad

## Tecnologías utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI API
- IndexedDB (Dexie.js)
- PWA (Progressive Web App)

## Requisitos previos

- Node.js (v16 o superior)
- API Key de Google Gemini

## Instalación y uso

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tuusuario/smart-receipt-analyzer.git
   cd smart-receipt-analyzer
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env.local` con tu API key de Google Gemini:
   ```
   GEMINI_API_KEY=tu_api_key_aquí
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abre tu navegador en http://localhost:5173

## Compilación para producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

Los archivos generados estarán en la carpeta `dist/` y puedes servirlos con cualquier servidor web estático.

## Instalación como PWA

Esta aplicación se puede instalar como una PWA en dispositivos móviles y de escritorio:

1. Visita la aplicación en un navegador compatible
2. En Chrome/Edge: Haz clic en el icono de instalación en la barra de direcciones
3. En Safari: Comparte > Añadir a Pantalla de Inicio

## Licencia

MIT
