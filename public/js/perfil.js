
  document.getElementById('btnGenerarPDF').addEventListener('click', async () => {
    const res = await fetch('/users/generate-pdfs', { method: 'POST' });
    const data = await res.json();
    alert(data.message);
  });

  document.addEventListener("DOMContentLoaded", () => {
  const btnToggle = document.getElementById("btnTogglePassword");
  const formPassword = document.getElementById("formPassword");
  const btnEditarPerfil = document.getElementById("btnEditarPerfil");
  const formEditarPerfil = document.getElementById("formEditarPerfil");
  const formChangePassword = document.getElementById("formChangePassword");

  btnToggle.addEventListener("click", () => {
    if (formPassword.style.display === "none") {
      formPassword.style.display = "block";
      btnToggle.textContent = "Cancelar";
    } else {
      formPassword.style.display = "none";
      btnToggle.textContent = "Cambiar Contraseña";
    }
  });
  btnEditarPerfil.addEventListener("click", (e) => {
    e.preventDefault();
    formEditarPerfil.style.display =
      formEditarPerfil.style.display === "none" ? "block" : "none";
    // Si abro este, cierro el de cambiar contraseña
    formChangePassword.style.display = "none";
  });
});
