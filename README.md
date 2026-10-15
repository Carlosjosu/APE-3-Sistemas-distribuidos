# APE-3-Sistemas-distribuidos

Práctica 3 de Sistemas Distribuidos: sincronización de procesos con Java,
Spring Boot, React y Vite.

Actualmente el ejercicio 1, **Estacionamiento**, cuenta con una simulación
funcional. Los ejercicios 2–5 tienen su espacio preparado para futuras
implementaciones.

## Requisitos

Instalar las siguientes herramientas antes de clonar o ejecutar el proyecto:

- Git.
- Java JDK 21.
- Maven 3.9 o superior.
- Node.js 20 LTS o superior.
- npm, incluido con Node.js.

Verificar las versiones:

```bash
java -version
mvn -version
node --version
npm --version
```

## Instalación

Clonar el repositorio y entrar en la carpeta del proyecto:

```bash
git clone <URL_DEL_REPOSITORIO>
cd APE-3-Sistemas-distribuidos
```

Instalar las dependencias del frontend:

```bash
cd frontend
npm ci
cd ..
```

`npm ci` utiliza el archivo `frontend/package-lock.json` para instalar las
versiones exactas y reproducir el entorno del proyecto.

## Ejecución

La aplicación requiere dos procesos: el backend y el frontend.

### Backend

En una terminal:

```bash
cd backend
mvn spring-boot:run
```

El backend se inicia en <http://localhost:8080>.

### Frontend

En otra terminal, desde la raíz del proyecto:

```bash
cd frontend
npm run dev
```

Abrir <http://localhost:5173>.

El frontend utiliza el proxy de Vite para enviar las solicitudes `/api` al
backend en el puerto 8080. Por eso ambos procesos deben estar ejecutándose.

## Verificación

Ejecutar las pruebas del backend:

```bash
cd backend
mvn test
```

Verificar que el frontend compile para producción:

```bash
cd frontend
npm run build
```

## Ejercicio 1: Estacionamiento

La simulación se ejecuta desde la interfaz o mediante el endpoint:

```text
GET http://localhost:8080/api/ejercicios/1/estacionamiento
```

Parámetros opcionales:

```text
?vehiculos=10&permisosSemaforo=4&estadiaMs=20
```

Ejemplo con `curl`:

```bash
curl "http://localhost:8080/api/ejercicios/1/estacionamiento?vehiculos=10&permisosSemaforo=4&estadiaMs=20"
```

Escenarios de referencia:

- `permisosSemaforo=4`: respeta la capacidad física de cuatro vehículos.
- `permisosSemaforo=1`: permite un vehículo a la vez.
- `permisosSemaforo=10`: permite observar la violación de la capacidad física.

## Estructura principal

```text
backend/    API Spring Boot y servicios de sincronización
frontend/   Interfaz React/Vite
ESTRUCTURA.md
GUIA_EJERCICIOS.md
README.md
```

Consulta [ESTRUCTURA.md](./ESTRUCTURA.md) para conocer los paquetes,
endpoints y responsabilidades del proyecto. La guía de implementación se
encuentra en [GUIA_EJERCICIOS.md](./GUIA_EJERCICIOS.md).

## Archivos que no se suben al repositorio

El [`.gitignore`](./.gitignore) excluye dependencias instaladas, compilaciones,
logs, configuraciones locales y archivos del IDE. El archivo
`frontend/package-lock.json` sí debe conservarse porque permite instalar
dependencias con versiones reproducibles.
