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
    if (texto.length <= max) return texto;
    return texto.slice(0, max).trimEnd() + '…';
  },

  /**
   * Convierte "nombre apellido" a iniciales "NA"
   */
  iniciales(nombre) {
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
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // ---- Validaciones ----

  validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  },

  validarDNI(dni) {
    return /^\d{7,8}$/.test(dni.trim());
  },

  validarPassword(password) {
    return password.length >= 6;
  },

  // ---- DOM ----

  /**
   * Muestra un mensaje de error bajo un campo de formulario
   */
  mostrarError(inputId, mensaje) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add('form-input--error');
    let err = input.parentElement.querySelector('.form-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'form-error';
      input.parentElement.appendChild(err);
    }
    err.textContent = mensaje;
  },

  limpiarError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.remove('form-input--error');
    const err = input.parentElement.querySelector('.form-error');
    if (err) err.textContent = '';
  },

  /**
   * Muestra un alert global en el elemento con id="alert-global"
   */
  mostrarAlerta(mensaje, tipo = 'info') {
    const el = document.getElementById('alert-global');
    if (!el) return;
    el.className = `alert alert--${tipo}`;
    el.textContent = mensaje;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  },

  /**
   * Muestra / oculta el spinner de carga
   */
  mostrarSpinner(contenedorId) {
    const el = document.getElementById(contenedorId);
    if (el) el.innerHTML = '<div class="spinner"></div>';
  },

  /**
   * Genera un ID incremental simple (para mock)
   */
  nuevoId(lista) {
    if (!lista || lista.length === 0) return 1;
    return Math.max(...lista.map(i => i.id)) + 1;
  }
};
