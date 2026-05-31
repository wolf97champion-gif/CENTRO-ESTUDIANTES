/* =============================================
   utils.js — Funciones de utilidad globales
   ============================================= */

const Utils = {

  // ---- Fechas ----

  /**
   * Formatea una fecha ISO a "15 de abril de 2025"
   */
  formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  },

  /**
   * Formatea una fecha ISO a "15/04/2025"
   */
  formatearFechaCorta(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR');
  },

  /**
   * Devuelve "hace 2 horas", "hace 3 días", etc.
   */
  tiempoRelativo(fechaISO) {
    const ahora = new Date();
    const fecha = new Date(fechaISO);
    const diff = ahora - fecha;

    const minutos = Math.floor(diff / 60000);
    const horas   = Math.floor(diff / 3600000);
    const dias    = Math.floor(diff / 86400000);

    if (minutos < 1)  return 'ahora mismo';
    if (minutos < 60) return `hace ${minutos} min`;
    if (horas < 24)   return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    if (dias < 7)     return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    return Utils.formatearFechaCorta(fechaISO);
  },

  // ---- Texto ----

  /**
   * Trunca un texto a un máximo de caracteres
   */
  truncar(texto, max = 120) {
    if (!texto || typeof texto !== "string") return "";
    if (texto.length <= max) return texto;
    return texto.slice(0, max).trimEnd() + '…';
  },

  /**
   * Convierte "nombre apellido" a iniciales "NA"
   */
  iniciales(nombre) {
    if (!nombre || typeof nombre !== "string") return "";
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');
  },

  /**
   * Capitaliza la primera letra de un string
   */
  capitalizar(str) {
    if (!str || typeof str !== "string") return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // ---- Validaciones ----

  validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};
