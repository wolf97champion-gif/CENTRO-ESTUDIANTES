/* =============================================
   chatbot.js — Widget de chat sin API key
   Centro de Estudiantes Digital — Instituto N°57
   Sistema de respuestas por palabras clave
   ============================================= */

const Chatbot = {

  conversacion: [],
  abierto: false,
  escribiendo: false,

  // ---- BASE DE CONOCIMIENTO ----
  // Cada entrada tiene palabras clave y una o más respuestas posibles
  conocimiento: [

    // SALUDOS
    {
      claves: ['hola', 'buenas', 'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'hi'],
      respuestas: [
        '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
        '¡Buenas! Estoy acá para ayudarte. ¿Qué necesitás?',
        '¡Hola! ¿Tenés alguna consulta sobre el instituto o el sistema?'
      ]
    },

    // DESPEDIDAS
    {
      claves: ['chau', 'adios', 'hasta luego', 'nos vemos', 'bye', 'gracias', 'muchas gracias'],
      respuestas: [
        '¡Hasta luego! 👋 Cualquier consulta, acá estoy.',
        '¡Chau! Que te vaya bien. 😊',
        '¡De nada! Si necesitás algo más, avisame.'
      ]
    },

    // LOGIN / ACCESO
    {
      claves: ['login', 'entrar', 'iniciar sesion', 'ingresar', 'no puedo entrar', 'no me deja entrar', 'contrasena', 'password', 'olvide', 'olvide mi contrasena'],
      respuestas: [
        'Para iniciar sesión usás tu correo institucional (@instituto57.edu.ar) y tu contraseña. Si la olvidaste, podés cambiarla desde "Mi Perfil" una vez que entres, o contactar al administrador del sistema. 🔐',
        'El acceso es con tu correo del instituto y contraseña. Si tenés problemas, contactá al admin para que restablezca tu contraseña.'
      ]
    },

    // ROLES Y PERMISOS
    {
      claves: ['rol', 'roles', 'permiso', 'permisos', 'cambiar rol', 'cambio de rol', 'admin', 'administrador', 'quien puede', 'acceso'],
      respuestas: [
        'El sistema tiene 4 roles:\n👑 <b>Admin</b> — acceso total, gestiona usuarios\n🗣 <b>Delegado</b> — publica novedades y eventos\n📚 <b>Docente</b> — carga avisos de materias y fechas\n🎒 <b>Alumno</b> — consulta toda la información\n\nSolo el Admin puede cambiar el rol de alguien, desde la sección "Gestión de Usuarios".',
        'Los roles los asigna únicamente el Administrador. Si necesitás un cambio de rol, contactalo directamente o hablá con la dirección del instituto.'
      ]
    },

    // NOVEDADES
    {
      claves: ['novedad', 'novedades', 'noticias', 'aviso', 'avisos', 'publicar', 'publicar novedad', 'anuncio'],
      respuestas: [
        'Las novedades las podés ver en la sección "Novedades" del menú. Están organizadas por categoría: 📚 Académico, 🎉 Social, 🏫 Institucional y 🔴 Urgente.\n\nSi sos Delegado o Admin, podés publicar novedades desde "Nueva novedad".',
        'En la sección Novedades encontrás todos los avisos del instituto. Podés filtrarlos por categoría o buscar por palabra clave. 📰'
      ]
    },

    // CALENDARIO
    {
      claves: ['calendario', 'fechas', 'parcial', 'parciales', 'final', 'finales', 'examen', 'examenes', 'cuando', 'cuándo'],
      respuestas: [
        'El calendario académico está en la sección "Calendario" del menú. Ahí vas a ver todas las fechas importantes: parciales, finales, feriados y eventos. 📅\n\nLos docentes cargan las fechas de sus materias desde su panel.',
        'Para ver fechas de parciales y finales, entrá a la sección "Calendario". Podés navegar mes por mes y hacer clic en cada evento para ver los detalles. 🗓️'
      ]
    },

    // EVENTOS
    {
      claves: ['evento', 'eventos', 'inscribir', 'inscripcion', 'inscribirme', 'actividad', 'actividades', 'hackathon', 'taller', 'charla', 'jornada'],
      respuestas: [
        'Los eventos del Centro de Estudiantes los encontrás en la sección "Eventos". Para inscribirte, hacé clic en el evento y luego en "Inscribirse". 🎟️\n\nFijate en el cupo disponible, ¡algunos eventos se llenan rápido!',
        'Para inscribirte a un evento: Eventos → elegís el que te interesa → botón "Inscribirse". Podés cancelar tu inscripción en cualquier momento desde el mismo lugar.'
      ]
    },

    // REGLAMENTOS / DOCUMENTOS
    {
      claves: ['reglamento', 'reglamentos', 'documento', 'documentos', 'regimen', 'normas', 'estatuto', 'beca', 'becas', 'convivencia'],
      respuestas: [
        'Todos los documentos oficiales están en la sección "Reglamentos". Ahí encontrás:\n📄 Régimen Académico\n📄 Reglamento de Convivencia\n📄 Régimen de Becas\n📄 Estatuto del Centro de Estudiantes',
        'Los reglamentos y documentos oficiales están en la sección "Reglamentos" del menú. También hay una sección de preguntas frecuentes que puede ayudarte. 📚'
      ]
    },

    // BECAS
    {
      claves: ['beca', 'becas', 'solicitar beca', 'ayuda economica', 'ayuda económica'],
      respuestas: [
        'Para solicitar una beca tenés que presentar la documentación indicada en el "Régimen de Becas" (lo encontrás en Reglamentos).\n\n📅 Plazos:\n• 1er cuatrimestre: antes del 31 de marzo\n• 2do cuatrimestre: antes del 31 de julio\n\nCualquier duda, consultá en la secretaría del instituto.'
      ]
    },

    // ASISTENCIA / FALTAS
    {
      claves: ['falta', 'faltas', 'asistencia', 'inasistencia', 'perder regularidad', 'regular', 'porcentaje'],
      respuestas: [
        'El régimen académico establece un máximo del <b>25% de inasistencias</b> por materia. Si superás ese límite, perdés la condición de alumno regular en esa materia. ⚠️\n\nPara más detalles, consultá el Régimen Académico en la sección Reglamentos.'
      ]
    },

    // PERFIL
    {
      claves: ['perfil', 'mi perfil', 'datos', 'cambiar datos', 'editar', 'nombre', 'email', 'correo'],
      respuestas: [
        'Podés ver y editar tu información personal desde "Mi Perfil" en la esquina superior derecha (tu avatar). Ahí podés cambiar tu nombre, correo y contraseña. 👤'
      ]
    },

    // CARRERAS
    {
      claves: ['carrera', 'carreras', 'tecnicatura', 'ciencia de datos', 'inteligencia artificial', 'redes', 'comunicaciones', 'materias', 'plan de estudios'],
      respuestas: [
        'El instituto ofrece dos carreras:\n\n🎓 <b>Tecnicatura en Ciencia de Datos e IA</b> (TSCDIAI)\n🎓 <b>Tecnicatura en Redes y Comunicaciones</b> (TSRC)\n\nPara consultar el plan de estudios completo, hablá con la secretaría académica.',
        'Actualmente hay dos tecnicaturas: Ciencia de Datos e IA, y Redes y Comunicaciones. ¿Sobre cuál necesitás información? 🎓'
      ]
    },

    // SECRETARIA / CONTACTO
    {
      claves: ['secretaria', 'secretaría', 'contacto', 'consulta presencial', 'horario', 'horarios', 'donde queda', 'direccion', 'dirección'],
      respuestas: [
        'Para consultas que no puedo resolver desde acá, te recomiendo ir directamente a la secretaría del instituto. Ellos pueden ayudarte con trámites, inscripciones y cualquier gestión administrativa. 🏫',
        'La secretaría del instituto es el lugar indicado para consultas administrativas, inscripciones y trámites presenciales.'
      ]
    },

    // CENTRO DE ESTUDIANTES
    {
      claves: ['centro de estudiantes', 'ce', 'delegado', 'que hace el ce', 'para que sirve'],
      respuestas: [
        'El Centro de Estudiantes representa a todos los alumnos del instituto. Se encarga de:\n🎉 Organizar eventos y actividades\n📢 Publicar novedades importantes\n📋 Gestionar el calendario académico\n🤝 Ser el nexo entre alumnos y la institución\n\n¡Cualquier inquietud podés hacérsela llegar al delegado!',
      ]
    },

    // SISTEMA / TECNOLOGÍA
    {
      claves: ['sistema', 'plataforma', 'web', 'pagina', 'página', 'app', 'como funciona', 'que es esto'],
      respuestas: [
        'Esta es la plataforma digital del Centro de Estudiantes del Instituto N°57. Te permite:\n📰 Ver novedades y avisos\n📅 Consultar el calendario\n🎟️ Inscribirte a eventos\n📄 Acceder a reglamentos\n\nTodo en un solo lugar, desde cualquier dispositivo. 💻'
      ]
    },

    // NO ENTIENDO / AYUDA GENERAL
    {
      claves: ['ayuda', 'help', 'no entiendo', 'no se', 'no sé', 'que puedo preguntar', 'sobre que me podés ayudar'],
      respuestas: [
        'Puedo ayudarte con:\n📅 Fechas de parciales y finales\n🎟️ Inscripción a eventos\n📰 Novedades del instituto\n📄 Reglamentos y becas\n👤 Tu perfil y contraseña\n🎓 Información sobre carreras\n\n¿Sobre qué querés saber?',
        '¡Claro! Podés preguntarme sobre el calendario, eventos, novedades, reglamentos, roles del sistema o cualquier duda sobre el instituto. ¿Por dónde empezamos? 😊'
      ]
    }
  ],

  // ---- RESPUESTAS CUANDO NO ENTIENDE ----
  respuestasNoEntiendo: [
    'Mmm, no estoy seguro de entender bien tu consulta. ¿Podés reformularla? También podés preguntarme sobre el calendario, eventos, novedades o reglamentos. 🤔',
    'No tengo información sobre eso. Para consultas específicas, te recomiendo hablar con la secretaría del instituto o con el delegado. 😊',
    'Esa consulta está fuera de mi alcance por ahora. ¿Puedo ayudarte con algo sobre el calendario, eventos, novedades o reglamentos?',
    'No encontré una respuesta para eso. Probá preguntarme de otra forma, o contactá directamente a la secretaría del instituto. 🏫'
  ],

  // ---- LÓGICA DE BÚSQUEDA ----
  buscarRespuesta(mensaje) {
    const texto = mensaje.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[¿?¡!.,;:]/g, '');                      // quitar puntuación

    let mejorCoincidencia = null;
    let maxCoincidencias = 0;

    for (const entrada of this.conocimiento) {
      let coincidencias = 0;
      for (const clave of entrada.claves) {
        if (texto.includes(clave)) coincidencias++;
      }
      if (coincidencias > maxCoincidencias) {
        maxCoincidencias = coincidencias;
        mejorCoincidencia = entrada;
      }
    }

    if (mejorCoincidencia && maxCoincidencias > 0) {
      const respuestas = mejorCoincidencia.respuestas;
      return respuestas[Math.floor(Math.random() * respuestas.length)];
    }

    // No encontró nada
    return this.respuestasNoEntiendo[
      Math.floor(Math.random() * this.respuestasNoEntiendo.length)
    ];
  },

  // ---- SALUDO SEGÚN ROL ----
  getMensajeBienvenida(usuario) {
    if (!usuario) {
      return '¡Hola! 👋 Soy el asistente del CE Digital del Instituto N°57. ¿Tenés alguna pregunta sobre el sistema o el instituto?';
    }
    const nombre = usuario.nombre.split(' ')[0];
    const saludos = {
      admin:    `¡Hola, ${nombre}! 👑 Como admin tenés acceso a todo. ¿En qué puedo ayudarte hoy?`,
      delegado: `¡Hola, ${nombre}! 🗣 ¿Necesitás ayuda para publicar novedades o gestionar eventos?`,
      docente:  `¡Hola, ${nombre}! 📚 ¿Querés publicar un aviso o cargar fechas de examen?`,
      alumno:   `¡Hola, ${nombre}! 🎒 ¿Buscás info sobre el calendario, eventos o reglamentos?`
    };
    return saludos[usuario.perfil] || `¡Hola, ${nombre}! ¿En qué puedo ayudarte?`;
  },

  // ---- SUGERENCIAS SEGÚN ROL ----
  getSugerencias(usuario) {
    const comunes = ['¿Cómo me inscribo a un evento?', '¿Dónde veo el calendario?', '¿Cuántas faltas puedo tener?'];
    if (!usuario) return comunes;
    const porRol = {
      admin:    ['¿Cómo cambio el rol de un usuario?', '¿Qué puede hacer cada rol?'],
      delegado: ['¿Cómo publico una novedad?', '¿Cómo creo un evento?'],
      docente:  ['¿Cómo cargo un parcial al calendario?', '¿Cómo publico un aviso?'],
      alumno:   ['¿Dónde están los reglamentos?', '¿Cómo solicito una beca?']
    };
    return [...(porRol[usuario.perfil] || []), comunes[0]];
  },

  // ---- RENDER DEL WIDGET ----
  render() {
    if (document.getElementById('chatbot-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'chatbot-widget';
    widget.innerHTML = `
      <style>
        #chatbot-widget * { box-sizing: border-box; }
        #chatbot-btn {
          position: fixed; bottom: 28px; right: 28px;
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #1A3A5C, #4A9FDB);
          border: none; cursor: pointer;
          box-shadow: 0 4px 16px rgba(26,58,92,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; z-index: 1000;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        #chatbot-btn:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(26,58,92,0.45); }
        #chatbot-btn .cb-badge {
          position: absolute; top: -2px; right: -2px;
          width: 16px; height: 16px; background: #2ECC71;
          border-radius: 50%; border: 2px solid white;
          animation: cb-pulse 2s infinite;
        }
        @keyframes cb-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        #chatbot-panel {
          position: fixed; bottom: 96px; right: 28px;
          width: 360px; height: 520px; background: #fff;
          border-radius: 18px; box-shadow: 0 8px 40px rgba(0,0,0,0.18);
          display: flex; flex-direction: column; overflow: hidden;
          z-index: 999; opacity: 0; pointer-events: none;
          transform: translateY(16px) scale(0.97);
          transition: opacity 0.22s ease, transform 0.22s ease;
        }
        #chatbot-panel.cb-open { opacity: 1; pointer-events: all; transform: translateY(0) scale(1); }
        #cb-header {
          background: linear-gradient(135deg, #1A3A5C 0%, #2a5f8f 100%);
          padding: 16px 18px; display: flex; align-items: center;
          gap: 12px; flex-shrink: 0;
        }
        #cb-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        #cb-header-info { flex: 1; }
        #cb-header-name { color: #fff; font-weight: 600; font-size: 14px; font-family: 'Segoe UI', system-ui, sans-serif; }
        #cb-header-status {
          color: rgba(255,255,255,0.7); font-size: 11px;
          font-family: 'Segoe UI', system-ui, sans-serif;
          display: flex; align-items: center; gap: 4px; margin-top: 1px;
        }
        .cb-status-dot { width: 7px; height: 7px; background: #2ECC71; border-radius: 50%; }
        #cb-close {
          background: rgba(255,255,255,0.15); border: none; color: #fff;
          width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
          font-size: 16px; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        #cb-close:hover { background: rgba(255,255,255,0.25); }
        #cb-messages {
          flex: 1; overflow-y: auto; padding: 16px 14px;
          display: flex; flex-direction: column; gap: 10px;
          background: #F8FAFC; scroll-behavior: smooth;
        }
        #cb-messages::-webkit-scrollbar { width: 4px; }
        #cb-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
        .cb-msg { display: flex; gap: 8px; align-items: flex-end; animation: cb-fadeup 0.2s ease; }
        @keyframes cb-fadeup { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .cb-msg--bot { flex-direction: row; }
        .cb-msg--user { flex-direction: row-reverse; }
        .cb-msg-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #1A3A5C, #4A9FDB);
          color: #fff; font-size: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-bottom: 2px;
        }
        .cb-bubble {
          max-width: 78%; padding: 10px 14px; border-radius: 16px;
          font-size: 13px; line-height: 1.6;
          font-family: 'Segoe UI', system-ui, sans-serif; word-break: break-word;
        }
        .cb-msg--bot .cb-bubble {
          background: #fff; color: #1a2a3a; border-bottom-left-radius: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        }
        .cb-msg--user .cb-bubble {
          background: linear-gradient(135deg, #1A3A5C, #2a5f8f);
          color: #fff; border-bottom-right-radius: 4px;
        }
        #cb-sugerencias { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 14px 10px; background: #F8FAFC; }
        .cb-sugerencia {
          background: #EAF4FB; color: #1A6FA0; border: 1px solid #c5e0f5;
          border-radius: 20px; padding: 5px 12px; font-size: 11.5px;
          cursor: pointer; font-family: 'Segoe UI', system-ui, sans-serif;
          transition: background 0.15s; white-space: nowrap;
        }
        .cb-sugerencia:hover { background: #d0eaf8; }
        .cb-typing { display: flex; align-items: center; gap: 4px; padding: 10px 14px;
          background: #fff; border-radius: 16px; border-bottom-left-radius: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07); width: fit-content;
        }
        .cb-typing span { width: 7px; height: 7px; background: #9CA3AF; border-radius: 50%; animation: cb-bounce 1.2s infinite; }
        .cb-typing span:nth-child(2) { animation-delay: 0.2s; }
        .cb-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes cb-bounce { 0%,60%,100% { transform:translateY(0); } 30% { transform:translateY(-5px); } }
        #cb-footer {
          padding: 12px 14px; background: #fff; border-top: 1px solid #E8EDF2;
          display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0;
        }
        #cb-input {
          flex: 1; border: 1.5px solid #E0E4EA; border-radius: 12px;
          padding: 9px 13px; font-size: 13px;
          font-family: 'Segoe UI', system-ui, sans-serif;
          resize: none; max-height: 90px; min-height: 38px;
          line-height: 1.4; color: #1a2a3a; background: #F8FAFC;
          transition: border-color 0.15s;
        }
        #cb-input:focus { outline: none; border-color: #4A9FDB; background: #fff; }
        #cb-input::placeholder { color: #9CA3AF; }
        #cb-send {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #1A3A5C, #4A9FDB);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: opacity 0.15s, transform 0.15s;
        }
        #cb-send:hover { opacity: 0.88; transform: scale(1.05); }
        #cb-send svg { width: 17px; height: 17px; fill: #fff; }
        @media (max-width: 480px) {
          #chatbot-panel { right: 12px; left: 12px; width: auto; bottom: 84px; }
          #chatbot-btn { right: 16px; bottom: 16px; }
        }
      </style>

      <button id="chatbot-btn" title="Asistente virtual" onclick="Chatbot.toggle()">
        🎓
        <div class="cb-badge"></div>
      </button>

      <div id="chatbot-panel">
        <div id="cb-header">
          <div id="cb-avatar">🤖</div>
          <div id="cb-header-info">
            <div id="cb-header-name">Asistente CE</div>
            <div id="cb-header-status">
              <div class="cb-status-dot"></div>
              En línea · Instituto N°57
            </div>
          </div>
          <button id="cb-close" onclick="Chatbot.toggle()" title="Cerrar">✕</button>
        </div>

        <div id="cb-messages"></div>
        <div id="cb-sugerencias"></div>

        <div id="cb-footer">
          <textarea id="cb-input" placeholder="Escribí tu consulta..." rows="1"
            onkeydown="Chatbot.onKeyDown(event)"
            oninput="Chatbot.autoResize(this)"></textarea>
          <button id="cb-send" onclick="Chatbot.enviar()" title="Enviar">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(widget);
  },

  agregarMensaje(texto, tipo = 'bot') {
    const contenedor = document.getElementById('cb-messages');
    const div = document.createElement('div');
    div.className = `cb-msg cb-msg--${tipo}`;
    if (tipo === 'bot') {
      div.innerHTML = `<div class="cb-msg-avatar">🤖</div><div class="cb-bubble">${texto.replace(/\n/g, '<br>')}</div>`;
    } else {
      div.innerHTML = `<div class="cb-bubble">${texto.replace(/\n/g, '<br>')}</div>`;
    }
    contenedor.appendChild(div);
    contenedor.scrollTop = contenedor.scrollHeight;
  },

  mostrarEscribiendo() {
    const contenedor = document.getElementById('cb-messages');
    const div = document.createElement('div');
    div.className = 'cb-msg cb-msg--bot';
    div.id = 'cb-typing-indicator';
    div.innerHTML = `<div class="cb-msg-avatar">🤖</div><div class="cb-typing"><span></span><span></span><span></span></div>`;
    contenedor.appendChild(div);
    contenedor.scrollTop = contenedor.scrollHeight;
  },

  quitarEscribiendo() {
    document.getElementById('cb-typing-indicator')?.remove();
  },

  renderSugerencias(usuario) {
    const contenedor = document.getElementById('cb-sugerencias');
    const sugerencias = this.getSugerencias(usuario);
    contenedor.innerHTML = sugerencias.map(s =>
      `<button class="cb-sugerencia" onclick="Chatbot.enviarSugerencia('${s.replace(/'/g, "\\'")}')">${s}</button>`
    ).join('');
  },

  toggle() {
    this.abierto = !this.abierto;
    document.getElementById('chatbot-panel').classList.toggle('cb-open', this.abierto);
    if (this.abierto) setTimeout(() => document.getElementById('cb-input')?.focus(), 250);
  },

  enviarSugerencia(texto) {
    document.getElementById('cb-input').value = texto;
    document.getElementById('cb-sugerencias').innerHTML = '';
    this.enviar();
  },

  async enviar() {
    const input = document.getElementById('cb-input');
    const texto = input.value.trim();
    if (!texto || this.escribiendo) return;

    input.value = '';
    input.style.height = 'auto';
    this.escribiendo = true;

    this.agregarMensaje(texto, 'user');
    this.mostrarEscribiendo();

    // Simular tiempo de "escritura" para que se sienta natural (600ms–1200ms)
    const delay = 600 + Math.random() * 600;
    await new Promise(r => setTimeout(r, delay));

    this.quitarEscribiendo();
    const respuesta = this.buscarRespuesta(texto);
    this.agregarMensaje(respuesta, 'bot');

    this.escribiendo = false;
    document.getElementById('cb-input').focus();
  },

  onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.enviar(); }
  },

  autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 90) + 'px';
  },

  init() {
    this.render();
    const usuario = typeof Auth !== 'undefined' ? Auth.getUsuario() : null;
    setTimeout(() => {
      this.agregarMensaje(this.getMensajeBienvenida(usuario), 'bot');
      this.renderSugerencias(usuario);
    }, 400);
  }
};
