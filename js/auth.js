/* =========================================
   AUTH.JS
   Sistema de Login CE Digital
========================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  // Si no existe el formulario, no ejecuta login
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value.trim();

    // ===== VALIDACIÓN CAMPOS =====
    if (!usuario || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos.'
      });
      return;
    }

    try {

      // ===== CARGAR USUARIOS =====
      const response = await fetch('../../api/usuarios.json');

      if (!response.ok) {
        throw new Error('No se pudo cargar usuarios.json');
      }

      const usuarios = await response.json();

      // ===== BUSCAR USUARIO =====
      const usuarioEncontrado = usuarios.find(user =>
        user.usuario === usuario &&
        user.password === password
      );

      // ===== LOGIN EXITOSO =====
      if (usuarioEncontrado) {

        // Guardar sesión
        localStorage.setItem(
          'usuarioActivo',
          JSON.stringify(usuarioEncontrado)
        );

        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: `Hola ${usuarioEncontrado.nombre} (Rol: ${usuarioEncontrado.rol})`,
          showConfirmButton: false,
          timer: 2000
        }).then(() => {

          // Redirección principal
          window.location.href = '../../home.html';

        });

      } else {

        // ===== LOGIN INCORRECTO =====
        Swal.fire({
          icon: 'error',
          title: 'Error de acceso',
          text: 'Usuario o contraseña incorrectos.'
        });

      }

    } catch (error) {

      console.error('Error de login:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo iniciar sesión. Intenta nuevamente.'
      });

    }
  });
});


/* =========================================
   OBJETO AUTH GLOBAL
========================================= */

const Auth = {

  // ===== OBTENER USUARIO =====
  getUsuario() {

    try {
      return JSON.parse(localStorage.getItem('usuarioActivo'));
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }

  },

  // ===== VERIFICAR LOGIN =====
  estaLogueado() {
    return !!this.getUsuario();
  },

  // ===== OBTENER PERFIL =====
  getPerfil() {

    const usuario = this.getUsuario();

    return usuario ? usuario.rol : null;

  },

// ===== VERIFICAR UNO O VARIOS ROLES =====
requiereRol(...roles) {

  const usuario = this.getUsuario();

  if (!usuario) {

    Swal.fire({
      icon: 'warning',
      title: 'Sesión expirada',
      text: 'Debes iniciar sesión.'
    }).then(() => {

      window.location.href = "../../index.html";

    });

    return false;
  }

  if (!roles.includes(usuario.rol)) {

    Swal.fire({
      icon: 'error',
      title: 'Acceso denegado',
      text: `Roles permitidos: ${roles.join(', ')}`
    }).then(() => {

      window.location.href = "../../home.html";

    });

    return false;
  }

  return true;
},

  // ===== CERRAR SESIÓN =====
  logout() {

    Swal.fire({
      icon: 'question',
      title: 'Cerrar sesión',
      text: '¿Seguro que deseas cerrar sesión?',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {

      if (result.isConfirmed) {

        // Limpiar datos
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('token');
        sessionStorage.clear();

        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente.',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {

          // Volver al inicio
          window.location.href = "../../index.html";

        });

      }

    });

  }

};


/* =========================================
   HACER GLOBAL EL OBJETO AUTH
========================================= */

window.Auth = Auth;