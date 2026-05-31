/* =========================================
   AUTH.JS
   Sistema de Login CE Digital
========================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ===== FORM =====
  const form = document.getElementById('loginForm');

  if (!form) return;

  // ===== SUBMIT LOGIN =====
  form.addEventListener('submit', async (e) => {

    e.preventDefault();

    // ===== CAMPOS =====
    const usuario = document
      .getElementById('usuario')
      .value
      .trim();

    const password = document
      .getElementById('password')
      .value
      .trim();

    const rol = document
      .getElementById('rol')
      .value;

    // ===== VALIDACION SIMPLE =====
    if (!usuario || !password || !rol) {

      alert('Completar todos los campos');

      return;
    }

    try {

      // ===== LEER JSON =====
      const response = await fetch('../../api/usuarios.json');

      if (!response.ok) {
        throw new Error('No se pudo cargar usuarios.json');
      }

      const usuarios = await response.json();

      // ===== BUSCAR USUARIO =====
      const usuarioEncontrado = usuarios.find(user => {

        return (
          user.usuario === usuario &&
          user.password === password &&
          user.rol === rol
        );

      });

      // ===== LOGIN OK =====
      if (usuarioEncontrado) {

        // ===== GUARDAR SESION =====
        localStorage.setItem(
          'usuarioActivo',
          JSON.stringify(usuarioEncontrado)
        );

        // ===== MENSAJE =====
        alert(`Bienvenido ${usuarioEncontrado.nombre}`);

        // ===== REDIRECCION =====
        window.location.href = '../../home.html';

      }

      // ===== LOGIN ERROR =====
      else {

        alert('Usuario, contraseña o perfil incorrecto');

      }

    }

    // ===== ERROR GENERAL =====
    catch (error) {

      console.error(error);

      alert('Error al iniciar sesión');

    }

  });

});