# Lab3 Frontend – Vite React TypeScript

This is the frontend application for the **Lab3** worldbuilding platform, built with [Vite](https://vitejs.dev/), [React](https://reactjs.org/), and TypeScript. It uses SCSS for styling and Firebase for authentication and data storage.

---

## 🚀 Getting Started

### 1. Clonar el repositorio

```bash
$ git clone git@github.com:austral-worldbuilding-lab/front.git
$ cd front
```

### 2. Configurar los Git Hooks

Para asegurarte de que el código cumpla con los estándares antes de subirlo, configuraremos los git hooks. Ejecuta el script de inicialización:

```bash
$ bash git-hooks/init.sh
```

### 3. Instalar las Dependencias

A continuación, instala todas las dependencias necesarias para el proyecto utilizando npm:

```bash
$ npm install
```

### 4. Configurar las Variables de Entorno

Crea el archivo `.env` en la raíz del proyecto basándote en el template `.env.template` y configura las variables de entorno necesarias:

```bash
$ cp .env.template .env
```

Luego, edita el archivo `.env` con las credenciales correspondientes.

### 5. Iniciar el Proyecto en Modo Desarrollo

Para iniciar el servidor de desarrollo:

```bash
$ npm run dev
```

La aplicación estará disponible en [http://localhost:5173](http://localhost:5173) por defecto.

### 6. Compilar para Producción

Cuando estés listo para desplegar la aplicación:

```bash
$ npm run build
```

Esto generará la versión optimizada de la aplicación en el directorio `dist/`.

Para previsualizar la versión compilada localmente:

```bash
$ npm run preview
```

## 🧪 Testing

Para ejecutar los tests:

```bash
# Ejecutar todos los tests
$ npm run test

# Ejecutar tests con watch mode
$ npm run test:watch

# Ver cobertura de tests
$ npm run test:coverage
```
