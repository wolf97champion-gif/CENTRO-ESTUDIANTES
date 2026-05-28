# Centro de Estudiantes Digital — Instituto N°57

Proyecto Integrador — Tecnicatura Superior en Ciencia de Datos e IA  
Materias: Técnicas de Programación + Aproximación al Campo Laboral

---

## Descripción 


Plataforma web para centralizar la comunicación y gestión académica del instituto.  
Permite publicar novedades, consultar el calendario, inscribirse a eventos y acceder a reglamentos, con acceso diferenciado según el rol del usuario.

---

## Estructura del proyecto

```
centro-estudiantes/
├── api/                  ← Datos mock en JSON (reemplaza la DB en el 1er semestre)
├── css/                  ← Estilos globales (variables, reset, componentes, layout)
├── js/                   ← Lógica JavaScript
│   ├── auth.js           ← Login, logout, sesión
│   ├── router.js         ← Control de acceso por rol y navbar dinámica
│   ├── api.js            ← Funciones para leer los JSON mock
│   ├── utils.js          ← Helpers: fechas, validaciones, DOM
│   └── modules/          ← Lógica específica de cada módulo
├── pages/
│   ├── auth/             ← Login (acceso público)
│   ├── admin/            ← Solo administrador
│   ├── delegado/         ← Delegado + Admin
│   ├── docente/          ← Docente + Admin
│   └── shared/           ← Todos los roles
├── assets/
│   ├── img/              ← Imágenes y logos
│   └── docs/             ← PDFs de reglamentos
├── index.html            ← Punto de entrada (redirige según sesión)
└── README.md
```

---

## Cómo correr el proyecto

### Opción 1 — VS Code + Live Server (recomendado)
1. Instalar la extensión **Live Server** en VS Code
2. Clic derecho en `index.html` → **Open with Live Server**
3. Se abre en `http://127.0.0.1:5500`

### Opción 2 — http-server (Node.js)
```bash
npm install -g http-server
cd centro-estudiantes
http-server -p 5500
```

> ⚠️ **No abrir los archivos directamente** como `file://`. El fetch() para leer los JSON requiere un servidor HTTP local.

---

## Usuarios de prueba

| Rol       | Email                          | Contraseña   |
|-----------|--------------------------------|--------------|
| Admin     | admin@instituto57.edu.ar       | admin123     |
| Delegado  | delegado@instituto57.edu.ar    | delegado123  |
| Docente   | garcia@instituto57.edu.ar      | docente123   |
| Alumno    | juan@instituto57.edu.ar        | alumno123    |

---

## Jerarquía de roles

| Rol      | Páginas accesibles                          |
|----------|---------------------------------------------|
| Admin    | Todo: /admin/ + /delegado/ + /docente/ + /shared/ |
| Delegado | /delegado/ + /shared/                       |
| Docente  | /docente/ + /shared/                        |
| Alumno   | /shared/ solo                               |

---

## Tecnologías (1er semestre)

- HTML5 semántico
- CSS3 puro (Flexbox + Grid)
- JavaScript vanilla ES6+
- JSON como fuente de datos mock
- Git + GitHub para versionado

---

## Convenciones de código

- Commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`
- Ramas: `main` (estable) → `develop` → `feature/nombre-feature`
- Pull Requests obligatorios con al menos 1 revisor
