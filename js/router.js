// @ts-nocheck
/* =============================================
   router.js — Control de acceso por rol
   Centro de Estudiantes Digital — Instituto N°57

   JERARQUÍA DE ACCESO:
     Admin     → todo
     Delegado  → /delegado/ + /shared/
     Docente   → /docente/  + /shared/
     Alumno    → /shared/ solo
   ============================================= */

const Router = {

  // Páginas de inicio según perfil
  INICIO: {
    admin:    'pages/admin/dashboard.html',
    delegado: 'pages/shared/novedades.html',
    docente:  'pages/shared/novedades.html',
    alumno:   'pages/shared/novedades.html'
  },

  // Qué perfiles pueden acceder a cada carpeta
  PERMISOS: {
    'pages/admin/':    ['admin'],
    'pages/delegado/': ['admin', 'delegado'],
    'pages/docente/':  ['admin', 'docente'],
    'pages/shared/':   ['admin', 'delegado', 'docente', 'alumno']
  },

  /**
   * Detecta la raíz del proyecto compatible con Live Server.
   * Funciona tanto si el proyecto está en la raíz del servidor
   * como dentro de una subcarpeta.
   */
  getRaiz() {
    const ruta = window.location.pathname;
    // Desde home.html o index.html → directorio actual es la raíz
    if (ruta.endsWith('home.html') || ruta.endsWith('index.html') || ruta.endsWith('/')) {
      return ruta.substring(0, ruta.lastIndexOf('/') + 1);
    }
    // Desde pages/algo/pagina.html → subimos dos niveles
    const match = ruta.match(/^(.*\/)pages\//);
    if (match) return match[1];
    // Fallback
    return '/';
  },

  /**
   * Construye una URL desde la raíz del proyecto.
   * @param {string} relativa - ej: 'pages/shared/novedades.html'
   */
  url(relativa) {
    return Router.getRaiz() + relativa;
  },

  /**
   * Redirige al usuario a su página de inicio según su rol.
   */
  irAlInicio() {
    const perfil = Auth.getPerfil();
    if (!perfil) {
      window.location.href = Router.getRaiz() + 'home.html';
      return;
    }
    window.location.href = Router.url(Router.INICIO[perfil]);
  },

  /**
   * Verifica si el usuario tiene acceso a la URL actual.
   * Debe llamarse al inicio de cada página protegida.
   * Si no tiene acceso, redirige automáticamente.
   */
  verificarAcceso() {
    // if(typeof(Auth) != undefined){
    //   if (!Auth.estaLogueado()) {
    //     window.location.href = Router.getRaiz() + 'home.html';
    //     return false;
    //   }
    // }

    const ruta   = window.location.pathname;
    // const perfil = Auth.getPerfil();

    // for (const [carpeta, perfilesPermitidos] of Object.entries(Router.PERMISOS)) {
    //   if (ruta.includes(carpeta)) {
    //     if (!perfilesPermitidos.includes(perfil)) {
    //       console.warn(`[Router] Acceso denegado a ${ruta} para perfil: ${perfil}`);
    //       Router.irAlInicio();
    //       return false;
    //     }
    //     return true;
    //   }
    // }

    return true;
  },

  /**
   * Construye y renderiza la navbar según el perfil del usuario.
   * Inyecta el HTML en el elemento con id="navbar".
   */
  renderNavbar() {
    // const usuario = Auth.getUsuario();
    // if (!usuario) return;

    if (typeof usuario == undefined){
      return
    }

    // const perfil = usuario.perfil;
    const raiz   = Router.getRaiz();

    const linksComunes = [
      { href: raiz + 'pages/shared/novedades.html',   texto: 'Novedades'   },
      { href: raiz + 'pages/shared/calendario.html',  texto: 'Calendario'  },
      { href: raiz + 'pages/shared/eventos.html',     texto: 'Eventos'     },
      { href: raiz + 'pages/shared/reglamentos.html', texto: 'Reglamentos' },
    ];

    const linksDocente = [
      { href: raiz + 'pages/docente/novedades-materia.html', texto: 'Publicar aviso'   },
      { href: raiz + 'pages/docente/fechas-examen.html',     texto: 'Fechas de examen' },
    ];

    const linksDelegado = [
      { href: raiz + 'pages/delegado/novedades-admin.html', texto: 'Nueva novedad'     },
      { href: raiz + 'pages/delegado/eventos-admin.html',   texto: 'Gestionar eventos' },
    ];

    const linksAdmin = [
      { href: raiz + 'pages/admin/dashboard.html', texto: 'Dashboard' },
      { href: raiz + 'pages/admin/usuarios.html',  texto: 'Usuarios'  },
    ];

    let linksExtras = [];
    // if (perfil === 'admin')    linksExtras = linksAdmin;
    // if (perfil === 'delegado') linksExtras = linksDelegado;
    // if (perfil === 'docente')  linksExtras = linksDocente;

    const todosLinks = [...linksComunes, ...linksExtras];
    const rutaActual = window.location.pathname;

    const linksHTML = todosLinks.map(link => {
      const activo = rutaActual.includes(link.href) ? 'navbar__link--active' : '';
      return `<a href="${link.href}" class="navbar__link ${activo}">${link.texto}</a>`;
    }).join('');

    // const badgePerfil = `<span class="badge badge--${perfil}">${perfil}</span>`;

    const navbarHTML = `
      <nav class="navbar">
        <a class="navbar__logo" href="${raiz}home.html"
           title="Ir al inicio" style="text-decoration:none; cursor:pointer;">
          🎓 CE Digital
        </a>
        <div class="navbar__links">
          ${linksHTML}
        </div>
        <div class="navbar__user">
          <!--${badgePerfil}
          <span class="navbar__username">${usuario.nombre.split(' ')[0]}</span>
          <div class="navbar__avatar" title="Cerrar sesión" onclick="Auth.logout()">
            ${usuario.avatar}
          </div>-->
        </div>
      </nav>
    `;

    const contenedor = document.getElementById('navbar');
    if (contenedor) contenedor.innerHTML = navbarHTML;
  }
};