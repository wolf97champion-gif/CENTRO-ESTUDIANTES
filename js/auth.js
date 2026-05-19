// =====================================
// LOGIN CE DIGITAL
// =====================================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (e) {

  e.preventDefault();

  // =========================
  // OBTENER DATOS
  // =========================

  const usuario = document.getElementById("usuario").value.trim();

  const password = document.getElementById("password").value.trim();

  const rol = document.getElementById("rol").value;

  // =========================
  // VALIDACIONES
  // =========================

  if (usuario === "" || password === "" || rol === "") {

    alert("Completa todos los campos.");

    return;
  }

  // =========================
  // REDIRECCIONES
  // =========================

  switch (rol) {

    case "estudiante":
      window.location.href = "home-estudiante.html";
      break;

    case "docente":
      window.location.href = "home-docente.html";
      break;

    case "delegado":
      window.location.href = "home-delegado.html";
      break;

    case "admin":
      window.location.href = "home-admin.html";
      break;

    default:
      alert("Rol no válido.");
  }

});