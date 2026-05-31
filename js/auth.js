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
    const rol = document.getElementById('rol').value;

    if (!usuario || !password || !rol) {
      alert('Completar todos los campos');
      return;
    }

    try {
      const response = await fetch('../../api/usuarios.json');
      if (!response.ok) throw new Error('No se pudo cargar usuarios.json');

      const usuarios = await response.json();

      const usuarioEncontrado = usuarios.find(user =>
        user.usuario === usuario &&
        user.password === password &&
        user.rol === rol
      );

      if (usuarioEncontrado) {
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioEncontrado));
        alert(`Bienvenido ${usuarioEncontrado.nombre}`);
        window.location.href = '../../home.html';
      } else {
        alert('Usuario, contraseña o perfil incorrecto');
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
