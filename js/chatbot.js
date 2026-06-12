/* =============================================
   chatbot.js — Asistente virtual CE Digital
   Instituto N°57

   - Sin API externa, lógica 100% local
   - Compatible con auth.js y router.js del proyecto
   - Usa localStorage 'usuarioActivo' con campo 'rol'
   - Se activa con Chatbot.init() al final del body
   - Funciona en todas las páginas (pages/**, home.html)
   ============================================= */

const Chatbot = {

  abierto: false,
  datos: null,
  cargando: false,
  inicializado: false,

  /* ── IDs del DOM ── */
  IDS: {
    ROOT:     'chatbot-root',
    BTN:      'chatbot-btn',
    PANEL:    'chatbot-panel',
    MENSAJES: 'chatbot-mensajes',
    INPUT:    'chatbot-input',
    SEND:     'chatbot-send',
    SUGS:     'chatbot-sugs',
  },

  /* ================================================================
     INIT — punto de entrada, llamado desde cada página
     ================================================================ */
  init() {
    if (this.inicializado) return;
    this.inicializado = true;
    this._inyectarHTML();
    this._bindEventos();
    this._cargarDatos();
  },

  /* ================================================================
     USUARIO ACTIVO — lee del localStorage del proyecto
     ================================================================ */
  _getUsuario() {
    try {
      return JSON.parse(localStorage.getItem('usuarioActivo')) || null;
    } catch {
      return null;
    }
  },

  /* ================================================================
     RAÍZ DEL PROYECTO — detecta si estamos en pages/** o en raíz
     ================================================================ */
  _getRaiz() {
    const ruta = window.location.pathname;
    const match = ruta.match(/^(.*\/)pages\//);
    if (match) return match[1];
    if (ruta.endsWith('home.html') || ruta.endsWith('/') || ruta.endsWith('index.html')) {
      return ruta.substring(0, ruta.lastIndexOf('/') + 1);
    }
    return '/';
  },

  /* ================================================================
     CARGA DE DATOS — todos los JSON desde /api/
     ================================================================ */
  async _cargarDatos() {
    if (this.datos || this.cargando) return;
    this.cargando = true;
    const raiz = this._getRaiz();
    try {
      const [novedades, eventos, calendario, reglamentos, carreras] = await Promise.all([
        fetch(raiz + 'api/novedades.json').then(r => r.json()).catch(() => ({ novedades: [], categorias: [] })),
        fetch(raiz + 'api/eventos.json').then(r => r.json()).catch(() => ({ eventos: [], inscripciones: [] })),
        fetch(raiz + 'api/calendario.json').then(r => r.json()).catch(() => ({ fechas: [], tipos: [] })),
        fetch(raiz + 'api/reglamentos.json').then(r => r.json()).catch(() => ({ reglamentos: [], faq: [] })),
        fetch(raiz + 'api/carreras.json').then(r => r.json()).catch(() => ({ carreras: [] })),
      ]);
      this.datos = { novedades, eventos, calendario, reglamentos, carreras };
    } catch (err) {
      console.warn('[Chatbot] Error cargando datos:', err);
      this.datos = {};
    }
    this.cargando = false;
  },

  /* ================================================================
     MOTOR DE RESPUESTAS — detecta intención, responde con datos reales
     ================================================================ */
  _responder(texto, usuario) {
    const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[¿?¡!.,;:]/g, '');
    const rol = usuario?.rol || 'visitante';

    /* Saludos */
    if (/^(hola|buenas|buen dia|buenos dias|buenas tardes|buenas noches|hey|hi|que tal|como estas)/.test(t))
      return this._respSaludo(usuario);

    /* Ayuda general */
    if (/\b(ayuda|que podes|que sabes|opciones|menu|para que sirves|que puedo preguntar)\b/.test(t))
      return this._respAyuda(rol);

    /* Novedades */
    if (/\b(novedad|novedades|noticias|aviso|avisos|comunicado|anuncio)\b/.test(t)) {
      if (/\b(urgente|urgentes|importante)\b/.test(t))   return this._respNovedadesCat('urgente');
      if (/\b(academico|academica|acad)\b/.test(t))      return this._respNovedadesCat('academico');
      if (/\b(social)\b/.test(t))                        return this._respNovedadesCat('social');
      if (/\b(institucional)\b/.test(t))                 return this._respNovedadesCat('institucional');
      if (/\b(mis|publique|publico|cargue)\b/.test(t) && ['docente','delegado','admin'].includes(rol))
        return this._respMisNovedades(usuario);
      return this._respNovedades(usuario);
    }

    /* Eventos */
    if (/\b(evento|eventos|jornada|taller|hackathon|charla|actividad)\b/.test(t)) {
      if (/\b(inscripto|anote|anotado|estoy anotado|mis eventos)\b/.test(t))
        return this._respMisEventos(usuario);
      if (/\b(inscribir|anotarme|como me anoto|como me inscribo|quiero ir)\b/.test(t))
        return this._respComoInscribirse(usuario);
      if (/\b(cupo|lugares|hay lugar|quedan lugares)\b/.test(t))
        return this._respCupos();
      if (/\b(gestionar|cree|cargue|mis eventos)\b/.test(t) && ['delegado','admin'].includes(rol))
        return this._respEventosDelegado(usuario);
      return this._respEventos(usuario);
    }

    /* Calendario */
    if (/\b(calendario|fechas|fecha|cuando|proximas fechas|cronograma)\b/.test(t)) {
      if (/\b(parcial|parciales|examen|examenes|evaluacion)\b/.test(t)) return this._respParciales(usuario);
      if (/\b(final|finales)\b/.test(t))                               return this._respFinales();
      if (/\b(feriado|feriados|libre|no hay clases)\b/.test(t))        return this._respFeriados();
      if (/\b(receso|vacaciones|descanso)\b/.test(t))                  return this._respReceso();
      return this._respCalendario(usuario);
    }

    /* Parciales directos */
    if (/\b(parcial|parciales|examen|instancia|evaluacion)\b/.test(t))
      return this._respParciales(usuario);

    /* Inscripción a cursada */
    if (/\b(inscripcion|inscribirme|cursada|reinscripcion|me anoto a la cursada|anotarme a materias)\b/.test(t))
      return this._respInscripcionCursada(usuario);

    /* Login / acceso */
    if (/\b(login|entrar|iniciar sesion|no puedo entrar|contrasena|password|olvide)\b/.test(t))
      return this._respLogin();

    /* Roles */
    if (/\b(rol|roles|permiso|permisos|cambiar rol|quien puede)\b/.test(t))
      return this._respRoles();

    /* Reglamentos */
    if (/\b(reglamento|reglamentos|norma|normas|estatuto|regimen)\b/.test(t))
      return this._respReglamentos();

    /* Faltas */
    if (/\b(falta|faltas|asistencia|inasistencia|regular|regularidad)\b/.test(t))
      return this._respFaltas();

    /* Becas */
    if (/\b(beca|becas|ayuda economica|subsidio)\b/.test(t))
      return this._respBecas();

    /* Carreras / materias */
    if (/\b(carrera|carreras|materia|materias|plan|tecnicatura)\b/.test(t)) {
      if (/\b(mi carrera|mis materias|mi plan)\b/.test(t)) return this._respMiCarrera(usuario);
      return this._respCarreras();
    }

    /* Mis materias (docente) */
    if (/\b(mis materias|dicto|doy clases|que materias tengo)\b/.test(t) && ['docente','admin'].includes(rol))
      return this._respMisMaterias(usuario);

    /* Inscriptos (delegado/admin) */
    if (/\b(inscriptos|quien se anoto|lista|asistentes)\b/.test(t) && ['delegado','admin'].includes(rol))
      return this._respInscriptos(usuario);

    /* Estadísticas admin */
    if (/\b(estadistica|resumen|reporte|dashboard|total|cuantos hay)\b/.test(t) && rol === 'admin')
      return this._respEstadisticas();

    /* Perfil */
    if (/\b(perfil|mi perfil|mis datos|cambiar datos|editar perfil)\b/.test(t))
      return this._respPerfil(usuario);

    /* Contacto / secretaría */
    if (/\b(secretaria|contacto|telefono|mail|correo|atencion|donde queda)\b/.test(t))
      return this._respContacto();

    /* Centro de estudiantes */
    if (/\b(centro de estudiantes|ce|para que sirve el ce)\b/.test(t))
      return this._respCE();

    /* Conflictos */
    if (/\b(problema|conflicto|queja|reclamo|inconveniente)\b/.test(t))
      return this._respConflictos();

    return this._respFallback(rol);
  },

  /* ================================================================
     RESPUESTAS
     ================================================================ */

  _respSaludo(usuario) {
    if (!usuario) return '¡Hola! 👋 Soy el asistente del CE Digital. Iniciá sesión para ver información personalizada. ¿En qué puedo ayudarte?';
    const nombre = usuario.nombre.split(' ')[0];
    const h = new Date().getHours();
    const momento = h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
    const msgs = {
      admin:      `${momento}, ${nombre}! 👑 Tenés acceso completo al sistema. ¿En qué te ayudo?`,
      delegado:   `${momento}, ${nombre}! 🗣 Puedo mostrarte el estado de tus eventos, inscriptos y novedades. ¿Qué necesitás?`,
      docente:    `${momento}, ${nombre}! 📚 Puedo ayudarte con tus materias, el calendario y las novedades. ¿En qué te ayudo?`,
      estudiante: `${momento}, ${nombre}! 🎒 Puedo ayudarte con parciales, eventos, reglamentos e inscripciones. ¿Qué necesitás?`,
    };
    return msgs[usuario.rol] || `${momento}, ${nombre}! ¿En qué puedo ayudarte?`;
  },

  _respAyuda(rol) {
    const base = 'Puedo ayudarte con:\n📅 Calendario y fechas de parciales\n🎟️ Eventos e inscripciones\n📢 Novedades del instituto\n📄 Reglamentos y becas\n🎓 Información sobre carreras\n🔐 Login y acceso al sistema';
    const extra = {
      docente:  '\n📚 Tus materias asignadas',
      delegado: '\n📋 Estado de inscriptos en tus eventos\n📢 Tus novedades publicadas',
      admin:    '\n📊 Estadísticas y resumen del sistema',
    };
    return base + (extra[rol] || '') + '\n\nEscribime o usá los botones de abajo. 👇';
  },

  _respNovedades(usuario) {
    const novs = this.datos?.novedades?.novedades || [];
    if (!novs.length) return 'No hay novedades cargadas en este momento.';
    let lista = novs;
    // El proyecto no tiene carrera_id por usuario, mostramos todo
    const recientes = lista.slice(0, 4);
    const urgentes = recientes.filter(n => n.destacada);
    let r = urgentes.length
      ? `Hay ${urgentes.length} novedad${urgentes.length > 1 ? 'es' : ''} destacada${urgentes.length > 1 ? 's' : ''}:\n`
      : 'Últimas novedades:\n';
    recientes.forEach(n => {
      const f = new Date(n.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
      r += `\n${n.destacada ? '⭐ ' : ''}[${n.categoria.toUpperCase()}] ${n.titulo}\n   ${f} — ${n.contenido.slice(0, 90)}...\n`;
    });
    return r + '\nEntré a la sección Novedades para verlas todas. 📢';
  },

  _respNovedadesCat(categoria) {
    const novs = (this.datos?.novedades?.novedades || []).filter(n => n.categoria === categoria);
    if (!novs.length) return `No hay novedades de tipo "${categoria}" en este momento.`;
    const nombres = { urgente: 'Urgentes 🚨', academico: 'Académicas 📚', social: 'Sociales 🎉', institucional: 'Institucionales 🏫' };
    let r = `Novedades ${nombres[categoria] || categoria}:\n`;
    novs.slice(0, 4).forEach(n => {
      const f = new Date(n.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
      r += `\n${n.titulo} (${f})\n   ${n.contenido.slice(0, 100)}...\n`;
    });
    return r;
  },

  _respMisNovedades(usuario) {
    const novs = (this.datos?.novedades?.novedades || []).filter(n => n.autor_id === usuario.id);
    if (!novs.length) return 'Todavía no publicaste ninguna novedad. Podés hacerlo desde "Nueva novedad" en el menú.';
    let r = `Tus novedades publicadas (${novs.length}):\n`;
    novs.forEach(n => {
      const f = new Date(n.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
      r += `\n• ${n.titulo}\n  ${f} | ${n.categoria} | ${n.destacada ? '⭐ Destacada' : 'Normal'}\n`;
    });
    return r;
  },

  _respEventos(usuario) {
    const eventos = this.datos?.eventos?.eventos || [];
    const abiertos = eventos.filter(e => e.estado === 'abierto');
    if (!abiertos.length) return 'No hay eventos con inscripción abierta en este momento. 📭';
    const inscs = this.datos?.eventos?.inscripciones || [];
    let r = `Hay ${abiertos.length} evento${abiertos.length > 1 ? 's' : ''} con inscripción abierta:\n`;
    abiertos.forEach(e => {
      const f    = new Date(e.fecha_inicio).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
      const hora = new Date(e.fecha_inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      const cant = inscs.filter(i => i.evento_id === e.id).length;
      const disp = e.cupo - cant;
      const ya   = usuario ? inscs.some(i => i.evento_id === e.id && i.usuario_id === usuario.id) : false;
      r += `\n${ya ? '✅ [Ya inscripto] ' : ''}${e.titulo}\n   📅 ${f} a las ${hora} · 📍 ${e.lugar}\n   👥 ${disp} lugar${disp !== 1 ? 'es' : ''} de ${e.cupo}\n`;
    });
    return r + '\n¿Querés saber cómo inscribirte?';
  },

  _respMisEventos(usuario) {
    if (!usuario) return 'Tenés que iniciar sesión para ver tus eventos.';
    const inscs = (this.datos?.eventos?.inscripciones || []).filter(i => i.usuario_id === usuario.id);
    if (!inscs.length) return `${usuario.nombre.split(' ')[0]}, todavía no estás inscripto en ningún evento. Escribime "ver eventos" para ver los disponibles. 🎟️`;
    const eventos = this.datos?.eventos?.eventos || [];
    let r = `Estás inscripto en ${inscs.length} evento${inscs.length > 1 ? 's' : ''}:\n`;
    inscs.forEach(i => {
      const ev = eventos.find(e => e.id === i.evento_id);
      if (!ev) return;
      const f = new Date(ev.fecha_inicio).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
      const h = new Date(ev.fecha_inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      r += `\n✅ ${ev.titulo}\n   📅 ${f} a las ${h} · 📍 ${ev.lugar}\n`;
    });
    return r;
  },

  _respComoInscribirse(usuario) {
    if (!usuario) return 'Primero tenés que iniciar sesión para inscribirte a un evento. 🔐';
    return 'Para inscribirte a un evento:\n\n1. Andá a la sección "Eventos" en el menú.\n2. Hacé clic en el evento que te interese.\n3. Verificá que haya cupo disponible.\n4. Hacé clic en "Inscribirme".\n\nTu inscripción queda registrada automáticamente. ¿Querés ver los eventos disponibles?';
  },

  _respCupos() {
    const eventos = (this.datos?.eventos?.eventos || []).filter(e => e.estado === 'abierto');
    if (!eventos.length) return 'No hay eventos con inscripción abierta en este momento.';
    const inscs = this.datos?.eventos?.inscripciones || [];
    let r = 'Cupos disponibles:\n';
    eventos.forEach(e => {
      const cant = inscs.filter(i => i.evento_id === e.id).length;
      const disp = e.cupo - cant;
      const st   = disp === 0 ? '🔴 Sin cupo' : disp <= 5 ? '🟡 Últimos lugares' : '🟢 Con lugar';
      r += `\n${st} ${e.titulo}: ${disp} de ${e.cupo}`;
    });
    return r;
  },

  _respEventosDelegado(usuario) {
    const mis   = (this.datos?.eventos?.eventos || []).filter(e => e.autor_id === usuario.id);
    const inscs = this.datos?.eventos?.inscripciones || [];
    if (!mis.length) return 'Todavía no creaste ningún evento. Podés hacerlo desde "Gestionar eventos" en el menú.';
    let r = `Tus eventos (${mis.length}):\n`;
    mis.forEach(e => {
      const cant = inscs.filter(i => i.evento_id === e.id).length;
      r += `\n📋 ${e.titulo}\n   Estado: ${e.estado} | Inscriptos: ${cant}/${e.cupo}\n`;
    });
    return r;
  },

  _respInscriptos(usuario) {
    const eventos = this.datos?.eventos?.eventos || [];
    const inscs   = this.datos?.eventos?.inscripciones || [];
    const mis = usuario?.rol === 'admin' ? eventos : eventos.filter(e => e.autor_id === usuario.id);
    if (!mis.length) return 'No tenés eventos para consultar.';
    let r = 'Inscriptos por evento:\n';
    mis.forEach(e => {
      const cant = inscs.filter(i => i.evento_id === e.id).length;
      r += `\n• ${e.titulo}: ${cant} inscripto${cant !== 1 ? 's' : ''} de ${e.cupo}`;
    });
    return r;
  },

  _respCalendario(usuario) {
    const fechas = this.datos?.calendario?.fechas || [];
    if (!fechas.length) return 'No hay fechas cargadas en el calendario. 📅';
    const hoy = new Date();
    const prox = fechas
      .filter(f => new Date(f.fecha) >= hoy)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(0, 5);
    if (!prox.length) return 'No hay fechas próximas registradas en el calendario.';
    const ico = { parcial: '📝', final: '📋', institucional: '🏫', feriado: '🏖️', receso: '🌙', evento: '🎉' };
    let r = 'Próximas fechas:\n';
    prox.forEach(f => {
      const fecha = new Date(f.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
      r += `\n${ico[f.tipo] || '📌'} ${fecha}\n   ${f.titulo}\n`;
    });
    return r + '\nVé a la sección Calendario para ver todos los detalles. 📅';
  },

  _respParciales(usuario) {
    const parciales = (this.datos?.calendario?.fechas || []).filter(f => f.tipo === 'parcial');
    if (!parciales.length) return 'No hay fechas de parciales cargadas en este momento. Consultá con tu docente o en secretaría. 📝';
    let r = 'Fechas de parciales:\n';
    parciales.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).forEach(f => {
      const fecha = new Date(f.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
      r += `\n📝 ${fecha}\n   ${f.titulo}\n   ${f.descripcion}\n`;
    });
    return r + '\nRevisá el Calendario completo para más detalles.';
  },

  _respFinales() {
    const finales = (this.datos?.calendario?.fechas || []).filter(f => f.tipo === 'final');
    if (!finales.length) return 'No hay fechas de finales cargadas todavía. Se publican en el Calendario cuando estén disponibles. 📋';
    let r = 'Fechas de finales:\n';
    finales.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).forEach(f => {
      const fecha = new Date(f.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
      r += `\n📋 ${fecha}\n   ${f.titulo}\n   ${f.descripcion}\n`;
    });
    return r;
  },

  _respFeriados() {
    const feriados = (this.datos?.calendario?.fechas || []).filter(f => f.tipo === 'feriado' || f.tipo === 'receso');
    if (!feriados.length) return 'No hay feriados o recesos cargados en el calendario.';
    let r = 'Feriados y recesos:\n';
    feriados.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).forEach(f => {
      const fecha = new Date(f.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
      r += `\n${f.tipo === 'feriado' ? '🏖️' : '🌙'} ${fecha}: ${f.titulo}\n`;
    });
    return r;
  },

  _respReceso() {
    const recesos = (this.datos?.calendario?.fechas || []).filter(f => f.tipo === 'receso');
    if (!recesos.length) return 'No hay recesos cargados en el calendario todavía.';
    let r = 'Recesos:\n';
    recesos.forEach(f => {
      const fecha = new Date(f.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
      r += `\n🌙 ${f.titulo} — comienza el ${fecha}\n   ${f.descripcion}\n`;
    });
    return r;
  },

  _respInscripcionCursada(usuario) {
    if (!usuario) return 'Tenés que iniciar sesión para consultar inscripciones a cursadas. 🔐';
    if (usuario.rol === 'docente') return 'Las inscripciones a cursadas se gestionan por Secretaría. Para info sobre alumnos inscriptos en tus materias, consultá directamente allí.';

    const nov = (this.datos?.novedades?.novedades || [])
      .find(n => /inscripci/i.test(n.titulo) || /inscripci/i.test(n.contenido));
    let r = 'Para inscribirte a una cursada:\n\n';
    r += '1. Revisá el Calendario para las fechas de inscripción.\n';
    r += '2. Presentate en Secretaría con DNI y libreta universitaria.\n';
    r += '3. Informá las materias a las que querés inscribirte.\n';
    r += '4. Verificá correlatividades con tu plan de estudios.\n';
    if (nov) {
      const f = new Date(nov.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
      r += `\n📢 Novedad relacionada (${f}):\n${nov.titulo}\n${nov.contenido.slice(0, 150)}...`;
    }
    const inst = (this.datos?.calendario?.fechas || [])
      .filter(f => f.tipo === 'institucional')
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(0, 3);
    if (inst.length) {
      r += '\n\nFechas institucionales próximas:\n';
      inst.forEach(f => {
        const fecha = new Date(f.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
        r += `• ${f.titulo}: ${fecha}\n`;
      });
    }
    return r;
  },

  _respLogin() {
    return 'Para iniciar sesión usás tu usuario y contraseña en la pantalla de login. 🔐\n\nSi olvidaste tu contraseña o tenés problemas de acceso, contactá al administrador del sistema.\n\nDatos de prueba del sistema:\n• admin / 1234\n• delegado / 1234\n• docente / 1234\n• estudiante / 1234';
  },

  _respRoles() {
    return 'El sistema tiene 4 roles:\n\n👑 Admin — acceso total, gestiona usuarios\n🗣 Delegado — publica novedades y eventos\n📚 Docente — carga avisos y fechas de materias\n🎒 Estudiante — consulta toda la información\n\nSolo el Admin puede cambiar el rol de alguien, desde "Gestión de Usuarios".';
  },

  _respReglamentos() {
    const regs = this.datos?.reglamentos?.reglamentos || [];
    if (!regs.length) return 'No hay reglamentos cargados. Podés consultarlos en Secretaría o en la sección Reglamentos.';
    let r = 'Documentos disponibles:\n';
    regs.forEach(reg => {
      r += `\n📄 ${reg.titulo} (v${reg.version})\n   ${reg.descripcion}\n`;
    });
    return r + '\nPodés verlos en la sección Reglamentos del menú. 📁';
  },

  _respFaltas() {
    const faq = (this.datos?.reglamentos?.faq || []).find(f => /falta|asistencia|regular/.test(f.pregunta.toLowerCase()));
    if (faq) return `${faq.pregunta}\n\n${faq.respuesta}\n\nConsultá el Régimen Académico completo en la sección Reglamentos.`;
    return 'El régimen académico permite un máximo del 25% de inasistencias por materia. Si superás ese límite, perdés la condición de alumno regular y debés rendir como libre. ⚠️\n\nMás info en la sección Reglamentos.';
  },

  _respBecas() {
    const faq = (this.datos?.reglamentos?.faq || []).find(f => /beca/.test(f.pregunta.toLowerCase()));
    if (faq) return `${faq.pregunta}\n\n${faq.respuesta}\n\nMás detalles en "Régimen de Becas" en la sección Reglamentos.`;
    return 'Para solicitar una beca:\n\n• 1er cuatrimestre: documentación antes del 31 de marzo.\n• 2do cuatrimestre: antes del 31 de julio.\n\nRequisitos disponibles en la sección Reglamentos o en Secretaría. 📄';
  },

  _respCarreras() {
    const carreras = this.datos?.carreras?.carreras || [];
    if (!carreras.length) return 'No hay información de carreras cargada.';
    let r = 'Carreras del Instituto:\n';
    carreras.forEach(c => {
      r += `\n🎓 ${c.nombre} (${c.codigo})\n   ${c.materias.length} materia${c.materias.length !== 1 ? 's' : ''}\n`;
    });
    return r;
  },

  _respMiCarrera(usuario) {
    if (!usuario) return 'Iniciá sesión para ver información sobre tu carrera.';
    // En este proyecto el usuario no tiene carrera_id, mostramos todas
    return this._respCarreras();
  },

  _respMisMaterias(usuario) {
    if (!usuario) return 'Iniciá sesión para ver tus materias.';
    const carreras = this.datos?.carreras?.carreras || [];
    const mias = [];
    carreras.forEach(c => c.materias.forEach(m => {
      if (m.docente_id === usuario.id) mias.push({ materia: m.nombre, carrera: c.nombre, semestre: m.semestre });
    }));
    if (!mias.length) return 'No tenés materias asignadas en el sistema. Si es un error, contactá a la dirección.';
    let r = `Tus materias asignadas (${mias.length}):\n`;
    mias.forEach(m => { r += `\n📚 ${m.materia}\n   ${m.carrera} — Semestre ${m.semestre}\n`; });
    return r;
  },

  _respEstadisticas() {
    const novs  = this.datos?.novedades?.novedades || [];
    const evts  = this.datos?.eventos?.eventos || [];
    const inscs = this.datos?.eventos?.inscripciones || [];
    const carr  = this.datos?.carreras?.carreras || [];
    const totalM = carr.reduce((a, c) => a + c.materias.length, 0);
    return `Resumen del sistema:\n\n📢 Novedades: ${novs.length} (${novs.filter(n => n.destacada).length} destacadas)\n🎉 Eventos: ${evts.length} (${evts.filter(e => e.estado === 'abierto').length} abiertos)\n👥 Inscripciones: ${inscs.length}\n🎓 Carreras: ${carr.length} (${totalM} materias)`;
  },

  _respPerfil(usuario) {
    if (!usuario) return 'Iniciá sesión para ver tu perfil.';
    return `Tu perfil:\n\n👤 Nombre: ${usuario.nombre}\n🔑 Usuario: ${usuario.usuario}\n🎭 Rol: ${usuario.rol}\n\nPodés editar tus datos desde "Mi Perfil" en la barra superior.`;
  },

  _respCE() {
    return 'El Centro de Estudiantes representa a todos los alumnos del Instituto N°57. Se encarga de:\n\n🎉 Organizar eventos y actividades\n📢 Publicar novedades importantes\n📋 Gestionar el calendario académico\n🤝 Ser el nexo entre alumnos y la institución\n\n¡Cualquier inquietud podés hacérsela llegar al delegado!';
  },

  _respConflictos() {
    const faq = (this.datos?.reglamentos?.faq || []).find(f => /conflicto|docente/.test(f.pregunta.toLowerCase()));
    if (faq) return `${faq.pregunta}\n\n${faq.respuesta}`;
    return 'Ante cualquier conflicto o inconveniente:\n\n1. Podés acudir al Centro de Estudiantes.\n2. O dirigirte a la Dirección del Instituto.\n3. El Reglamento de Convivencia detalla el procedimiento.\n\nEncontrás todo en la sección Reglamentos. 📄';
  },

  _respContacto() {
    return 'Para contactar al Instituto:\n\n🏫 Secretaría: presentate personalmente en el horario de atención.\n💻 CE Digital: desde acá consultás novedades, eventos y reglamentos.\n🚨 Urgente: dirigite directamente a la Dirección.\n\n¿Necesitás ayuda con algún trámite específico?';
  },

  _respFallback(rol) {
    const tips = {
      admin:      '"estadísticas", "eventos", "novedades", "usuarios"',
      delegado:   '"mis eventos", "inscriptos", "novedades", "calendario"',
      docente:    '"mis materias", "calendario", "novedades", "reglamentos"',
      estudiante: '"parciales", "eventos", "inscripción a cursada", "becas", "faltas"',
      visitante:  '"novedades", "eventos", "reglamentos", "carreras"',
    };
    return `Mmm, no entendí bien tu consulta. 🤔\n\nPodés preguntarme sobre: ${tips[rol] || tips.visitante}.\n\nO usá los botones de sugerencias de abajo. 👇`;
  },

  /* ================================================================
     SUGERENCIAS Y BIENVENIDA POR ROL
     ================================================================ */
  _getSugerencias(rol) {
    const s = {
      admin:      ['Estadísticas del sistema', 'Ver todos los eventos', 'Novedades recientes', '¿Qué puede hacer cada rol?'],
      delegado:   ['¿Cómo van mis eventos?', '¿Cuántos inscriptos hay?', 'Ver novedades', '¿Cómo publico una novedad?'],
      docente:    ['Mis materias', '¿Qué novedades publiqué?', 'Ver calendario', '¿Cómo cargo un parcial?'],
      estudiante: ['¿Cuándo tengo parciales?', '¿En qué eventos estoy?', 'Inscripción a cursada', '¿Cuántas faltas puedo tener?'],
      visitante:  ['Ver novedades', 'Ver eventos', 'Reglamentos', '¿Cómo inicio sesión?'],
    };
    return s[rol] || s.visitante;
  },

  _getBienvenida(usuario) {
    if (!usuario) return '¡Hola! 👋 Soy el asistente del CE Digital del Instituto N°57. ¿En qué puedo ayudarte?';
    const n = usuario.nombre.split(' ')[0];
    const m = {
      admin:      `¡Hola, ${n}! 👑 Tenés acceso completo. ¿Qué querés consultar?`,
      delegado:   `¡Hola, ${n}! 🗣 Puedo mostrarte el estado de tus eventos e inscriptos. ¿Arrancamos?`,
      docente:    `¡Hola, ${n}! 📚 Puedo ayudarte con tus materias, el calendario y las novedades.`,
      estudiante: `¡Hola, ${n}! 🎒 Puedo ayudarte con parciales, eventos, inscripciones y reglamentos.`,
    };
    return m[usuario.rol] || `¡Hola, ${n}! ¿En qué puedo ayudarte?`;
  },

  /* ================================================================
     UI — Toggle
     ================================================================ */
  toggle() {
    this.abierto = !this.abierto;
    const panel = document.getElementById(this.IDS.PANEL);
    const btn   = document.getElementById(this.IDS.BTN);
    if (this.abierto) {
      panel.classList.add('cb-open');
      btn.innerHTML = '✕';
      const cont = document.getElementById(this.IDS.MENSAJES);
      if (cont && cont.children.length === 0) {
        const usuario = this._getUsuario();
        this._addMsg('bot', this._getBienvenida(usuario));
        this._renderSugs(usuario?.rol || 'visitante');
      }
      setTimeout(() => document.getElementById(this.IDS.INPUT)?.focus(), 200);
    } else {
      panel.classList.remove('cb-open');
      btn.innerHTML = '🤖';
    }
  },

  _renderSugs(rol) {
    const cont = document.getElementById(this.IDS.SUGS);
    if (!cont) return;
    cont.innerHTML = this._getSugerencias(rol).map(s =>
      `<button class="cb-sug" onclick="Chatbot._onSug('${s.replace(/'/g, "\\'")}')">${s}</button>`
    ).join('');
  },

  _addMsg(tipo, texto) {
    const cont = document.getElementById(this.IDS.MENSAJES);
    if (!cont) return;
    const d = document.createElement('div');
    d.className = `cb-msg cb-msg--${tipo}`;
    const html = texto.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    d.innerHTML = tipo === 'bot'
      ? `<div class="cb-avatar">🤖</div><div class="cb-bubble">${html}</div>`
      : `<div class="cb-bubble">${html}</div>`;
    cont.appendChild(d);
    cont.scrollTop = cont.scrollHeight;
  },

  _showTyping() {
    const cont = document.getElementById(this.IDS.MENSAJES);
    if (!cont) return;
    const el = document.createElement('div');
    el.className = 'cb-msg cb-msg--bot';
    el.id = 'cb-typing';
    el.innerHTML = `<div class="cb-avatar">🤖</div><div class="cb-bubble cb-typing"><span></span><span></span><span></span></div>`;
    cont.appendChild(el);
    cont.scrollTop = cont.scrollHeight;
  },

  _hideTyping() { document.getElementById('cb-typing')?.remove(); },

  _setActive(ok) {
    const inp = document.getElementById(this.IDS.INPUT);
    const btn = document.getElementById(this.IDS.SEND);
    if (inp) inp.disabled = !ok;
    if (btn) btn.disabled = !ok;
  },

  async _send() {
    const inp = document.getElementById(this.IDS.INPUT);
    if (!inp) return;
    const texto = inp.value.trim();
    if (!texto) return;
    inp.value = '';
    this._addMsg('user', texto);
    this._setActive(false);
    this._showTyping();
    if (!this.datos) await this._cargarDatos();
    await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
    const usuario = this._getUsuario();
    const resp = this._responder(texto, usuario);
    this._hideTyping();
    this._addMsg('bot', resp);
    this._setActive(true);
    document.getElementById(this.IDS.INPUT)?.focus();
  },

  _onSug(texto) {
    const inp = document.getElementById(this.IDS.INPUT);
    if (inp) { inp.value = texto; this._send(); }
  },

  _bindEventos() {
    document.getElementById(this.IDS.BTN)?.addEventListener('click', () => this.toggle());
    document.getElementById(this.IDS.SEND)?.addEventListener('click', () => this._send());
    document.getElementById(this.IDS.INPUT)?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._send(); }
    });
    document.addEventListener('click', e => {
      if (!this.abierto) return;
      const panel = document.getElementById(this.IDS.PANEL);
      const btn   = document.getElementById(this.IDS.BTN);
      if (panel && !panel.contains(e.target) && !btn?.contains(e.target)) this.toggle();
    });
  },

  /* ================================================================
     HTML + CSS inyectados en el body
     ================================================================ */
  _inyectarHTML() {
    if (document.getElementById(this.IDS.ROOT)) return;

    const css = `
      #chatbot-root * { box-sizing: border-box; }
      #chatbot-btn {
        position: fixed; bottom: 28px; right: 28px; width: 56px; height: 56px;
        border-radius: 50%; background: linear-gradient(135deg, #1A3A5C, #4A9FDB);
        color: #fff; font-size: 24px; border: none; cursor: pointer;
        box-shadow: 0 4px 18px rgba(26,58,92,.40);
        display: flex; align-items: center; justify-content: center;
        z-index: 9998; transition: transform .2s, box-shadow .2s;
        user-select: none;
      }
      #chatbot-btn:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(26,58,92,.50); }
      #chatbot-btn:active { transform: scale(.95); }
      #chatbot-btn .cb-dot {
        position: absolute; top: -2px; right: -2px; width: 14px; height: 14px;
        background: #2ECC71; border-radius: 50%; border: 2px solid #fff;
        animation: cb-pulse 2s infinite;
      }
      @keyframes cb-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.25)} }

      #chatbot-panel {
        position: fixed; bottom: 96px; right: 28px; width: 360px; max-height: 560px;
        background: #fff; border-radius: 18px;
        box-shadow: 0 8px 40px rgba(0,0,0,.18);
        display: flex; flex-direction: column; overflow: hidden;
        z-index: 9999; opacity: 0; pointer-events: none;
        transform: translateY(14px) scale(.97);
        transition: opacity .22s ease, transform .22s ease;
      }
      #chatbot-panel.cb-open { opacity: 1; pointer-events: all; transform: translateY(0) scale(1); }

      #cb-header {
        background: linear-gradient(135deg, #1A3A5C 0%, #2a5f8f 100%);
        padding: 14px 16px; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
      }
      #cb-hdr-avatar {
        width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,.15);
        display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
      }
      #cb-hdr-nombre { color: #fff; font-weight: 700; font-size: 14px; font-family: 'Segoe UI',system-ui,sans-serif; }
      #cb-hdr-estado {
        color: rgba(255,255,255,.7); font-size: 11px; display: flex; align-items: center; gap: 4px; margin-top: 1px;
        font-family: 'Segoe UI',system-ui,sans-serif;
      }
      #cb-hdr-estado span { width: 7px; height: 7px; background: #2ECC71; border-radius: 50%; }
      #cb-close {
        background: rgba(255,255,255,.12); border: none; color: #fff; width: 28px; height: 28px;
        border-radius: 50%; cursor: pointer; font-size: 14px; margin-left: auto;
        display: flex; align-items: center; justify-content: center; transition: background .15s;
      }
      #cb-close:hover { background: rgba(255,255,255,.24); }

      #chatbot-mensajes {
        flex: 1; overflow-y: auto; padding: 14px;
        display: flex; flex-direction: column; gap: 10px; background: #F8FAFC;
        scroll-behavior: smooth;
      }
      #chatbot-mensajes::-webkit-scrollbar { width: 4px; }
      #chatbot-mensajes::-webkit-scrollbar-thumb { background: #E0E4EA; border-radius: 4px; }

      .cb-msg { display: flex; gap: 8px; align-items: flex-end; animation: cb-pop .2s ease; }
      @keyframes cb-pop { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
      .cb-msg--bot  { flex-direction: row; }
      .cb-msg--user { flex-direction: row-reverse; }
      .cb-avatar {
        width: 28px; height: 28px; border-radius: 50%;
        background: linear-gradient(135deg,#1A3A5C,#4A9FDB);
        color: #fff; font-size: 14px; flex-shrink: 0; margin-bottom: 2px;
        display: flex; align-items: center; justify-content: center;
      }
      .cb-bubble {
        max-width: 78%; padding: 9px 13px; border-radius: 16px;
        font-size: 13px; line-height: 1.6;
        font-family: 'Segoe UI',system-ui,sans-serif; word-break: break-word;
      }
      .cb-msg--bot .cb-bubble {
        background: #fff; color: #1a2a3a; border-bottom-left-radius: 4px;
        box-shadow: 0 1px 4px rgba(0,0,0,.07);
      }
      .cb-msg--user .cb-bubble {
        background: linear-gradient(135deg,#1A3A5C,#2a5f8f);
        color: #fff; border-bottom-right-radius: 4px;
      }

      .cb-typing { display: flex; align-items: center; gap: 4px; }
      .cb-typing span {
        width: 7px; height: 7px; border-radius: 50%; background: #9CA3AF;
        animation: cb-bounce 1.2s infinite;
      }
      .cb-typing span:nth-child(2){animation-delay:.2s}
      .cb-typing span:nth-child(3){animation-delay:.4s}
      @keyframes cb-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

      #chatbot-sugs {
        display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px 6px;
        background: #F8FAFC; border-top: 1px solid #E8EDF2; flex-shrink: 0;
      }
      .cb-sug {
        background: #EAF4FB; color: #1A6FA0; border: 1px solid #c5e0f5;
        border-radius: 999px; padding: 4px 11px; font-size: 11px; cursor: pointer;
        font-family: 'Segoe UI',system-ui,sans-serif;
        transition: background .15s, color .15s; white-space: nowrap;
      }
      .cb-sug:hover { background: #1A3A5C; color: #fff; border-color: #1A3A5C; }

      #cb-footer {
        display: flex; align-items: center; gap: 8px; padding: 10px 12px;
        background: #fff; border-top: 1px solid #E8EDF2; flex-shrink: 0;
      }
      #chatbot-input {
        flex: 1; padding: 9px 13px; border: 1.5px solid #E0E4EA; border-radius: 999px;
        font-size: 13px; font-family: 'Segoe UI',system-ui,sans-serif;
        background: #F8FAFC; color: #1a2a3a; outline: none;
        transition: border-color .18s, box-shadow .18s, background .18s;
      }
      #chatbot-input:focus {
        border-color: #4A9FDB; box-shadow: 0 0 0 3px rgba(74,159,219,.15); background: #fff;
      }
      #chatbot-input:disabled { opacity: .5; cursor: not-allowed; }
      #chatbot-input::placeholder { color: #9CA3AF; }
      #chatbot-send {
        width: 38px; height: 38px; border-radius: 50%;
        background: linear-gradient(135deg,#1A3A5C,#4A9FDB);
        color: #fff; border: none; cursor: pointer; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        transition: opacity .18s, transform .12s;
      }
      #chatbot-send:hover  { opacity: .88; }
      #chatbot-send:active { transform: scale(.9); }
      #chatbot-send:disabled { opacity: .4; cursor: default; }
      #chatbot-send svg { width: 17px; height: 17px; fill: #fff; }

      @media (max-width: 480px) {
        #chatbot-panel { width: calc(100vw - 24px); right: 12px; bottom: 84px; }
        #chatbot-btn   { right: 16px; bottom: 16px; }
      }
    `;

    const html = `
      <style>${css}</style>
      <button id="${this.IDS.BTN}" title="Asistente virtual">
        🤖<div class="cb-dot"></div>
      </button>
      <div id="${this.IDS.PANEL}">
        <div id="cb-header">
          <div id="cb-hdr-avatar">🤖</div>
          <div style="flex:1">
            <div id="cb-hdr-nombre">Asistente CE</div>
            <div id="cb-hdr-estado"><span></span>En línea · Instituto N°57</div>
          </div>
          <button id="cb-close" onclick="Chatbot.toggle()">✕</button>
        </div>
        <div id="${this.IDS.MENSAJES}"></div>
        <div id="${this.IDS.SUGS}"></div>
        <div id="cb-footer">
          <input id="${this.IDS.INPUT}" type="text" placeholder="Escribí tu consulta..." maxlength="400" autocomplete="off"/>
          <button id="${this.IDS.SEND}" title="Enviar">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `;

    const w = document.createElement('div');
    w.id = this.IDS.ROOT;
    w.innerHTML = html;
    document.body.appendChild(w);
  }
};
