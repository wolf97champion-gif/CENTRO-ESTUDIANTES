// @ts-nocheck
/* =============================================
   router.js — Control de acceso por rol
   Centro de Estudiantes Digital — Instituto N°57
============================================= */

const Router = {

  // =============================================
  // PAGINAS DE INICIO
  // =============================================

  INICIO: {

  administrador: 'pages/admin/dashboard.html',

  delegado: 'pages/shared/novedades.html',

  docente: 'pages/shared/novedades.html',

  estudiante: 'pages/shared/novedades.html'

},

  // =============================================
  // PERMISOS
  // =============================================

  PERMISOS: {

  'pages/admin/': ['administrador'],

  'pages/delegado/': ['administrador', 'delegado'],

  'pages/docente/': ['administrador', 'docente'],

  'pages/shared/': ['administrador', 'delegado', 'docente', 'estudiante']

},

  // =============================================
  // DETECTAR RAIZ
  // =============================================

  getRaiz() {

    const ruta = window.location.pathname;

    // HOME / INDEX
    if (
      ruta.endsWith('home.html') ||
      ruta.endsWith('index.html') ||
      ruta.endsWith('/')
    ) {

      return ruta.substring(
        0,
        ruta.lastIndexOf('/') + 1
      );

    }

    // PAGES
    const match = ruta.match(/^(.*\/)pages\//);

    if (match) {

      return match[1];

    }

    // FALLBACK
    return '/';

  },

  // =============================================
  // CREAR URL
  // =============================================

  url(relativa) {

    return Router.getRaiz() + relativa;

  },

// =============================================
// IR AL INICIO (flujo común)
// =============================================
irAlInicio() {

  const usuario = JSON.parse(
    localStorage.getItem('usuarioActivo')
  );

  // SIN SESION
  if (!usuario) {

    window.location.href =
      Router.getRaiz() +
      'pages/auth/login.html';

    return;

  }

  const perfil = usuario.rol;

  // DESTINO SEGUN ROL
  const destino =
    Router.INICIO[perfil];

  // SI EXISTE DESTINO
  if (destino) {

    window.location.href =
      Router.getRaiz() +
      destino;

  } else {

    // FALLBACK
    window.location.href =
      Router.getRaiz() +
      'home.html';

  }

},

  // =============================================
  // VERIFICAR ACCESO
  // =============================================

  verificarAcceso() {

    const usuario = JSON.parse(
      localStorage.getItem('usuarioActivo')
    );

    // SI NO ESTA LOGUEADO
    if (!usuario) {

      window.location.href =
        Router.getRaiz() + 'pages/auth/home.html';

      return false;

    }

    const perfil = usuario.rol;

    const ruta = window.location.pathname;

    // RECORRER PERMISOS
    for (const [carpeta, perfiles] of Object.entries(Router.PERMISOS)) {

      if (ruta.includes(carpeta)) {

        // NO TIENE PERMISO
        if (!perfiles.includes(perfil)) {

          console.warn(
            `[Router] Acceso denegado: ${perfil}`
          );

          Router.irAlInicio();

          return false;

        }

      }

    }

    return true;

  },

  // =============================================
  // NAVBAR
  // =============================================

  renderNavbar() {

    // USUARIO
    const usuario = JSON.parse(
      localStorage.getItem('usuarioActivo')
    );

    // SI NO EXISTE
    if (!usuario) return;

    const perfil = usuario.rol;

    const raiz = Router.getRaiz();

    // =============================================
    // LINKS COMUNES
    // =============================================

    const linksComunes = [

      {
        href: raiz + 'pages/shared/novedades.html',
        texto: 'Novedades'
      },

      {
        href: raiz + 'pages/shared/calendario.html',
        texto: 'Calendario'
      },

      {
        href: raiz + 'pages/shared/eventos.html',
        texto: 'Eventos'
      },

      {
        href: raiz + 'pages/shared/reglamentos.html',
        texto: 'Reglamentos'
      }

    ];

    // =============================================
    // DOCENTE
    // =============================================

    const linksDocente = [

      {
        href: raiz + 'pages/docente/novedades-materia.html',
        texto: 'Publicar aviso'
      },

      {
        href: raiz + 'pages/docente/fechas-examen.html',
        texto: 'Fechas examen'
      }

    ];

    // =============================================
    // DELEGADO
    // =============================================

    const linksDelegado = [

      {
        href: raiz + 'pages/delegado/novedades-admin.html',
        texto: 'Nueva novedad'
      },

      {
        href: raiz + 'pages/delegado/eventos-admin.html',
        texto: 'Gestionar eventos'
      }

    ];

    // =============================================
    // ADMINISTRADOR
    // =============================================

    const linksAdmin = [

      {
        href: raiz + 'pages/admin/dashboard.html',
        texto: 'Dashboard'
      },

      {
        href: raiz + 'pages/admin/usuarios.html',
        texto: 'Usuarios'
      }

    ];

    // =============================================
    // LINKS SEGUN PERFIL
    // =============================================

    let linksExtras = [];

    if (perfil === 'administrador') {

  linksExtras = linksAdmin;

}

    if (perfil === 'delegado') {

      linksExtras = linksDelegado;

    }

    if (perfil === 'docente') {

      linksExtras = linksDocente;

    }

    // =============================================
    // TODOS LOS LINKS
    // =============================================

    const todosLinks = [

      ...linksComunes,

      ...linksExtras

    ];

    const rutaActual =
      window.location.pathname;

    // =============================================
    // HTML LINKS
    // =============================================

    const linksHTML = todosLinks.map(link => {

      const activo =
        rutaActual.includes(
          link.href.split('/').pop()
        )
          ? 'navbar__link--active'
          : '';

      return `
        <a
          href="${link.href}"
          class="navbar__link ${activo}"
        >
          ${link.texto}
        </a>
      `;

    }).join('');

    // =============================================
    // BADGE PERFIL
    // =============================================

    const badgePerfil = `
      <span class="badge badge--${perfil}">
        ${perfil}
      </span>
    `;

    // =============================================
    // AVATAR
    // =============================================

    const inicial = usuario.nombre
      ? usuario.nombre.charAt(0).toUpperCase()
      : 'U';

    // =============================================
    // NAVBAR HTML
    // =============================================

    const navbarHTML = `

      <nav class="navbar">

        <!-- LOGO -->
        <a
          class="navbar__logo"
          href="${raiz}home.html"
          style="text-decoration:none;"
        >
          🎓 CE Digital
        </a>

        <!-- LINKS -->
        <div class="navbar__links">

          ${linksHTML}

        </div>

        <!-- USER -->
        <div class="navbar__user">

          ${badgePerfil}

          <span class="navbar__username">

            ${usuario.nombre}

          </span>

          <div
            class="navbar__avatar"
            title="Cerrar sesión"
            onclick="logout()"
          >

            ${inicial}

          </div>

        </div>

      </nav>

    `;

    // =============================================
    // INSERTAR NAVBAR
    // =============================================

    const contenedor =
      document.getElementById('navbar');

    if (contenedor) {

      contenedor.innerHTML =
        navbarHTML;

    }

  }

};

// =============================================
// LOGOUT
// =============================================

function logout() {

  localStorage.removeItem(
    'usuarioActivo'
  );

  window.location.href =
    Router.getRaiz() +
    'pages/auth/login.html';

}

window.Router = Router;