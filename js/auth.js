/* =========================================
   AUTH.JS
   Sistema de Login CE Digital
========================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!usuario || !password) {
      alert('Completar todos los campos');
      return;
    }

    try {
      const response = await fetch('../../api/usuarios.json');
      if (!response.ok) throw new Error('No se pudo cargar usuarios.json');

      const usuarios = await response.json();

      // Buscar usuario solo por usuario y contraseña
      const usuarioEncontrado = usuarios.find(user =>
        user.usuario === usuario && user.password === password
      );

      if (usuarioEncontrado) {
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioEncontrado));
        alert(`Bienvenido ${usuarioEncontrado.nombre} (Rol: ${usuarioEncontrado.rol})`);
        window.location.href = '../../home.html';
      } else {
        alert('Usuario o contraseña incorrectos');
      }

    } catch (error) {
      console.error(error);
      alert('Error al iniciar sesión');
    }
  });
});

// ===== OBJETO AUTH PARA TODAS LAS PÁGINAS =====
const Auth = {
  getUsuario() {
    return JSON.parse(localStorage.getItem('usuarioActivo'));
  },

  requiereRol(rol) {
    const usuario = this.getUsuario();
    if (!usuario || usuario.rol !== rol) {
      alert("Acceso denegado. Se requiere rol " + rol);
      window.location.href = "../../pages/login.html";
    }
  },

  estaLogueado() {
    return !!this.getUsuario();
  },

  getPerfil() {
    const usuario = this.getUsuario();
    return usuario ? usuario.rol : null;
  }
};

