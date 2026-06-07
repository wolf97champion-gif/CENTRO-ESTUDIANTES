// @ts-nocheck
/* =============================================
   api.js — Capa de acceso a los datos mock (JSON)
   Centro de Estudiantes Digital — Instituto N°57

   En el 2do semestre, estas funciones se reemplazan
   por llamadas reales a la API de CodeIgniter 4.
============================================= */

const API = {

  /**
   * Calcula la ruta base hacia /api/ desde cualquier subcarpeta.
   * Compatible con Live Server tanto en raíz como en subcarpetas.
   */
  getBase() {

    const ruta = window.location.pathname;

    // HOME / INDEX
    if (
      ruta.endsWith('home.html') ||
      ruta.endsWith('index.html') ||
      ruta.endsWith('/')
    ) {

      return (
        ruta.substring(
          0,
          ruta.lastIndexOf('/') + 1
        ) + 'api'
      );

    }

    // PAGES
    const match =
      ruta.match(/^(.*\/)pages\//);

    if (match) {

      return match[1] + 'api';

    }

    // FALLBACK
    return '/api';

  },

  // =============================================
  // USUARIOS
  // =============================================

  async getUsuarios() {

    try {

      // Buscar primero en localStorage
      const usuariosGuardados =
        localStorage.getItem('usuarios');

      // Si existen → usar esos
      if (usuariosGuardados) {

        return JSON.parse(
          usuariosGuardados
        );

      }

      // Si no existen → cargar JSON original
      const res =
        await fetch(
          `${API.getBase()}/usuarios.json`
        );

      if (!res.ok) {

        throw new Error(
          'No se pudo cargar usuarios.json'
        );

      }

      const data =
        await res.json();

      // Asegurar estructura correcta
      const usuarios =
        Array.isArray(data)
          ? data
          : [];

      // Agregar "activo" si no existe
      usuarios.forEach(u => {

        if (u.activo === undefined) {

          u.activo = true;

        }

      });

      // Guardar copia local
      localStorage.setItem(
        'usuarios',
        JSON.stringify(usuarios)
      );

      return usuarios;

    } catch (error) {

      console.error(
        '[API] Error getUsuarios:',
        error
      );

      return [];

    }

  },

  async getUsuarioPorId(id) {

    const usuarios =
      await API.getUsuarios();

    return usuarios.find(
      u => u.id === parseInt(id)
    ) || null;

  },

  guardarUsuarios(usuarios) {

    localStorage.setItem(
      'usuarios',
      JSON.stringify(usuarios)
    );

  },

  limpiarUsuarios() {

    localStorage.removeItem(
      'usuarios'
    );

  },

  // =============================================
  // NOVEDADES
  // =============================================

  async getNovedades() {

    const res =
      await fetch(
        `${API.getBase()}/novedades.json`
      );

    const data =
      await res.json();

    return data.novedades || [];

  },

  async getCategorias() {

    const res =
      await fetch(
        `${API.getBase()}/novedades.json`
      );

    const data =
      await res.json();

    return data.categorias || [];

  },

  async getNovedadesFiltradas({
    categoria = null,
    carrera_id = null,
    soloDestacadas = false
  } = {}) {

    let novedades =
      await API.getNovedades();

    if (categoria) {

      novedades =
        novedades.filter(
          n => n.categoria === categoria
        );

    }

    if (carrera_id) {

      novedades =
        novedades.filter(
          n =>
            n.carrera_id === carrera_id ||
            n.carrera_id === null
        );

    }

    if (soloDestacadas) {

      novedades =
        novedades.filter(
          n => n.destacada
        );

    }

    return novedades.sort(
      (a, b) =>
        new Date(b.fecha) -
        new Date(a.fecha)
    );

  },

  // =============================================
  // EVENTOS
  // =============================================

  async getEventos() {

    const res =
      await fetch(
        `${API.getBase()}/eventos.json`
      );

    const data =
      await res.json();

    return data.eventos || [];

  },

  async getInscripciones() {

    const res =
      await fetch(
        `${API.getBase()}/eventos.json`
      );

    const data =
      await res.json();

    return data.inscripciones || [];

  },

  async estaInscripto(
    eventoId,
    usuarioId
  ) {

    const inscripciones =
      await API.getInscripciones();

    return inscripciones.some(

      i =>
        i.evento_id === eventoId &&
        i.usuario_id === usuarioId

    );

  },

  async getInscriptosDeEvento(
    eventoId
  ) {

    const inscripciones =
      await API.getInscripciones();

    const inscritos =
      inscripciones.filter(
        i => i.evento_id === eventoId
      );

    const usuarios =
      await API.getUsuarios();

    return inscritos.map(i => ({

      ...i,

      usuario:
        usuarios.find(
          u => u.id === i.usuario_id
        )

    }));

  },

  // =============================================
  // CALENDARIO
  // =============================================

  async getFechas() {

    const res =
      await fetch(
        `${API.getBase()}/calendario.json`
      );

    const data =
      await res.json();

    return data.fechas || [];

  },

  async getTiposCalendario() {

    const res =
      await fetch(
        `${API.getBase()}/calendario.json`
      );

    const data =
      await res.json();

    return data.tipos || [];

  },

  // =============================================
  // CARRERAS
  // =============================================

  async getCarreras() {

    const res =
      await fetch(
        `${API.getBase()}/carreras.json`
      );

    const data =
      await res.json();

    return data.carreras || [];

  },

  async getCarreraPorId(id) {

    const carreras =
      await API.getCarreras();

    return carreras.find(
      c => c.id === parseInt(id)
    ) || null;

  },

  // =============================================
  // REGLAMENTOS
  // =============================================

  async getReglamentos() {

    const res =
      await fetch(
        `${API.getBase()}/reglamentos.json`
      );

    const data =
      await res.json();

    return data.reglamentos || [];

  },

  async getFAQ() {

    const res =
      await fetch(
        `${API.getBase()}/reglamentos.json`
      );

    const data =
      await res.json();

    return data.faq || [];

  },

  async getCategoriasReglamentos() {

    const res =
      await fetch(
        `${API.getBase()}/reglamentos.json`
      );

    const data =
      await res.json();

    return data.categorias || [];

  }

};

// =============================================
// GLOBAL
// =============================================

window.API = API;