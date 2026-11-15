# Mis tareas: SPA/PWA con Vue 3

Aplicación de una sola página (SPA) con Vue 3, Vite y Vue Router que consume la API REST de tareas de la Unidad 2. Permite registrarse, iniciar sesión y crear, filtrar, editar, completar y eliminar tareas, con actualización en tiempo real mediante Server-Sent Events (SSE). Se puede instalar como aplicación (PWA) y ofrece una experiencia sin conexión limitada y segura.

Código de la API utilizada: <https://github.com/wtrujillov1/API>. Esta aplicación no incluye backend: necesita la API en ejecución. La demostración pública queda pendiente de despliegue; ejecutar el proyecto localmente no crea una URL pública.

## Requisitos y ejecución

- Node.js 24 o superior y npm (los mismos que exige la API).
- La API de la Unidad 2 en ejecución en `http://127.0.0.1:3000`.

Se usan dos terminales, cada una dentro de la carpeta de su proyecto.

**Terminal 1: la API** (desde la raíz del repositorio de la API):

```sh
npm ci
npm start
```

**Terminal 2: esta aplicación** (desde la raíz de este repositorio):

```sh
npm install
npm run dev
```

Abre <http://localhost:5173>, crea una cuenta y gestiona tus tareas. Para comprobar las actualizaciones en vivo, abre la aplicación en dos pestañas del mismo navegador con la misma sesión: al crear, modificar o eliminar una tarea en una, la otra actualiza su listado.

### Scripts disponibles

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 5173, con recarga automática. El service worker no se registra. |
| `npm run build` | Compila la aplicación en `dist/`. Sirve también para comprobar que todos los componentes son válidos. |
| `npm run preview` | Sirve la versión compilada en el puerto 4173, con el service worker activo. Ejecutar antes `npm run build`. |

### Problemas frecuentes

| Síntoma | Causa y solución |
| --- | --- |
| `Missing script: "start"` | Se ejecutó `npm start` en la carpeta de esta aplicación. Ese comando pertenece a la API; aquí se usa `npm run dev`. |
| `npm.ps1 no se puede cargar` en Windows | PowerShell bloquea scripts. Ejecuta una vez `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, usa `npm.cmd` o abre el Símbolo del sistema. |
| `ECONNREFUSED` o la lista muestra «No se pudo conectar con el servidor.» | La API no está en ejecución o escucha en otro puerto. Inicia la API o ajusta el proxy (ver Configuración). |
| «El origen de la petición no está permitido.» | La API rechaza con `403` las escrituras cuyo `Origin` no coincide con su `Host`. Comprueba que `vite.config.js` conserva el proxy y reinicia `npm run dev` después de editarlo. |
| El service worker no aparece | Solo se registra en la versión compilada: usa `npm run build` y `npm run preview`. |

## Configuración

No hay variables de entorno. Todo el acceso a la API pasa por la ruta relativa `/api`, y el único ajuste es el destino del proxy de Vite en `vite.config.js`:

| Elemento | Valor / uso |
| --- | --- |
| `target` | `http://127.0.0.1:3000`; cámbialo si la API usa otro puerto (por ejemplo, si arrancó con `PORT=3001`). |
| `changeOrigin` y `headers.Origin` | El proxy fija `Host` y `Origin` hacia la API para que coincidan, como exige su validación de origen. |
| `server.proxy` y `preview.proxy` | El mismo proxy se aplica en `npm run dev` y en `npm run preview`. |

La cookie de sesión de la API es `HttpOnly` y `SameSite=Strict`, por lo que el navegador debe hablar siempre con un único origen. Por eso la aplicación no llama a `http://127.0.0.1:3000` directamente: Vite recibe la petición en su propio origen y la reenvía. Vite no recarga `vite.config.js` en caliente; reinicia `npm run dev` tras editarlo.

## Funcionalidades

- **Autenticación:** registro e inicio de sesión con validación en el formulario (usuario de 3 a 40 caracteres alfanuméricos o guion bajo; contraseña de 8 a 128). Las rutas se protegen con una guarda de navegación y la sesión se restaura al recargar.
- **Tareas:** listado, creación, edición, cambio de estado (`pending`, `in_progress`, `completed`), eliminación con confirmación y filtro por estado. El título admite de 1 a 120 caracteres y la descripción hasta 2000.
- **Tiempo real:** el listado se actualiza al recibir `task.created`, `task.updated` o `task.deleted` por SSE, incluidos los cambios hechos desde otra pestaña.
- **Estados de la interfaz:** carga, éxito, vacío y error, descritos más abajo.
- **PWA:** instalable, con manifest, íconos y service worker; sin conexión muestra la aplicación con un aviso.

## Estructura del proyecto

```
public/
  manifest.webmanifest   Datos de instalación de la PWA
  sw.js                  Service worker (caché del esqueleto de la app)
  icons/                 Íconos de 192 y 512 píxeles
src/
  main.js                Arranque de Vue y registro del service worker
  router.js              Rutas y guarda de autenticación
  session.js             Estado compartido: usuario autenticado
  services/api.js        Único punto de acceso HTTP
  composables/useTasks.js  Lista de tareas, acciones, cancelación y eventos SSE
  views/                 LoginView, TasksView
  components/            TaskForm, TaskItem
  App.vue                Cabecera, aviso de conexión y cierre de sesión
  styles.css             Estilos globales
docs/
  Trujillo_Wilmer_AplWeb_U3.pdf   Informe técnico (dos páginas)
```

## Uso de la API

`src/services/api.js` es el único archivo que llama a `fetch`. Envía las cookies de sesión, usa JSON y valida `response.ok` en cada respuesta. Las respuestas correctas siguen el formato `{ "data": ... }` y las `204` no tienen cuerpo; los errores se leen de `{ "error": { "code", "message", "details" } }` y se convierten en un `ApiError` con `status`, `code` y `message`.

| Función | Petición | Uso en la aplicación |
| --- | --- | --- |
| `register`, `login` | `POST /api/auth/register`, `POST /api/auth/login` | Formulario de `LoginView`. |
| `me` | `GET /api/auth/me` | Restaurar la sesión al cargar la aplicación. |
| `logout` | `POST /api/auth/logout` | Botón «Salir». |
| `listTasks` | `GET /api/tasks` | Cargar el listado; admite cancelación. |
| `createTask` | `POST /api/tasks` | Formulario de nueva tarea. |
| `updateTask` | `PATCH /api/tasks/:id` | Editar o cambiar estado; siempre envía `version`. |
| `deleteTask` | `DELETE /api/tasks/:id?version=N` | Eliminar una tarea. |
| `EVENTS_URL` | `GET /api/events` | Flujo SSE abierto con `EventSource`. |

### Manejo de errores

| Situación | Comportamiento |
| --- | --- |
| Fallo de red (`NETWORK`) | Mensaje «No se pudo conectar con el servidor.»; en la lista aparece el botón «Reintentar». |
| `401` | Se cierra la sesión local y se vuelve a `/login`. |
| `409` (versión desactualizada) | Aviso de que la tarea cambió, recarga del listado y posibilidad de reintentar. No se sobrescribe nada automáticamente. |
| `400`, `403`, `404`, `429` y otros | Se muestra el mensaje que devuelve la API. |

### Condiciones de carrera

Cada llamada a `load()` cancela la anterior con `AbortController`, así solo la respuesta más reciente puede actualizar el listado, y las cancelaciones no se tratan como error. Mientras hay una escritura en curso, los botones se deshabilitan y se ignoran nuevas acciones. Los eventos SSE solo provocan una recarga, de modo que la base de datos de la API sigue siendo la fuente de verdad.

## Estados de la interfaz

| Estado | Cuándo aparece |
| --- | --- |
| Carga | Primera consulta de la lista («Cargando tareas…»). |
| Éxito | Crear, editar o eliminar termina bien (aviso verde y lista actualizada). |
| Vacío | No hay tareas o ninguna coincide con el filtro. |
| Error | Falla la consulta o una acción; se muestra el mensaje y, en la lista, «Reintentar». |

## Arquitectura y decisiones

Las vistas (`LoginView`, `TasksView`) organizan cada pantalla; los componentes (`TaskForm`, `TaskItem`) presentan datos, reciben props y comunican cambios con eventos, y no conocen la API. El composable `useTasks` concentra la lógica de la lista y `api.js` la comunicación HTTP. El único estado compartido es el usuario autenticado en `session.js`; el resto del estado vive en el componente que lo necesita. Las listas usan el `id` de cada tarea como clave estable.

Se eligió SSE, como en la API, porque solo se necesitan avisos del servidor al navegador; las acciones del usuario siguen siendo peticiones REST. No se usa una librería de estado global porque con un único dato compartido añadiría complejidad sin beneficio.

## PWA y caché

`public/manifest.webmanifest` declara nombre, colores, modo `standalone` e íconos, lo que permite instalar la aplicación. `public/sw.js` aplica una política distinta según el recurso:

| Recurso | Estrategia | Motivo |
| --- | --- | --- |
| `/api/*` (sesión, tareas, eventos) | No se intercepta: siempre va a la red. | Son datos privados y la API responde con `no-store`. |
| Navegación (HTML) | Red primero; sin conexión se sirve la copia guardada de la aplicación. | Una versión nueva se recibe en cuanto hay red. |
| JS, CSS e íconos | Caché primero, guardado en el primer uso. | Vite incluye un hash en los nombres, por lo que no quedan desactualizados. |

Al activarse una versión nueva se eliminan las cachés antiguas (`shell-v1` y `assets-v1`). Para forzar una actualización tras cambiar `sw.js`, incrementa la constante `VERSION`. La experiencia sin conexión es deliberadamente limitada: se ve la aplicación y un aviso, pero no tareas guardadas, para no mostrar datos desactualizados ni dejar información de una cuenta en un equipo compartido. No existe cola de cambios sin conexión.

Para comprobarlo: ejecuta `npm run build` y `npm run preview`, abre <http://localhost:4173>, y en las herramientas de desarrollo (pestaña Application) verifica el manifest y el service worker; marca *Offline* y recarga la página.

## Verificación y alcance

Se comprobó manualmente la ejecución local contra la API y la versión compilada con su manifest, service worker y modo sin conexión. El proyecto no incluye pruebas automatizadas. `npm run build` confirma que el código compila.

Esta aplicación académica está pensada para ejecutarse junto a la API en local. Un despliegue público requeriría HTTPS (necesario para el service worker fuera de `localhost`) y que la interfaz y la API compartan origen, por ejemplo detrás de un mismo proxy inverso, o bien configurar el acceso entre orígenes y las cookies en el servidor. Los datos y las sesiones pertenecen a la API; esta aplicación no guarda credenciales ni tareas en el navegador.
