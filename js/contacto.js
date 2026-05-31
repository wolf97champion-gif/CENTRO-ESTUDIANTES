// ========================================
// CONTACTO - CENTRO DE ESTUDIANTES
// ========================================

document.addEventListener("DOMContentLoaded", () => {

  // ========================================
  // FORMULARIO
  // ========================================

  const contactForm =
    document.getElementById("contactForm");

  // VALIDAR EXISTENCIA

  if (!contactForm) {

    console.error(
      "Formulario de contacto no encontrado"
    );

    return;
  }

  // ========================================
  // EVENTO SUBMIT
  // ========================================

  contactForm.addEventListener("submit", (e) => {

    e.preventDefault();

    // ========================================
    // OBTENER DATOS
    // ========================================

    const nombre =
      document.getElementById("nombre").value;

    // ========================================
    // MENSAJE
    // ========================================

    alert(
      `Gracias ${nombre}, tu mensaje fue enviado correctamente`
    );

    // ========================================
    // LIMPIAR FORMULARIO
    // ========================================

    contactForm.reset();

  });

});