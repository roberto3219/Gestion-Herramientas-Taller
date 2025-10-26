document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal-editar");
  const form = document.getElementById("formEditarInsumo");

  document.querySelectorAll(".editar-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      const id = tr.dataset.id;
      const nombre = tr.children[1].textContent;
      const descripcion = tr.children[2].textContent;
      const cantidad = tr.children[3].textContent;
      const estado = tr.children[4].textContent;

      document.getElementById("editarId").value = id;
      document.getElementById("editarNombre").value = nombre;
      document.getElementById("editarDescripcion").value = descripcion;
      document.getElementById("editarCantidad").value = cantidad;
      document.getElementById("editarEstado").value = estado;

      modal.style.display = "block";
    });
  });

  document.getElementById("cancelarEdicion").addEventListener("click", () => {
    modal.style.display = "none";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editarId").value;
    const data = {
      nombre: document.getElementById("editarNombre").value,
      descripcion: document.getElementById("editarDescripcion").value,
      cantidad: document.getElementById("editarCantidad").value,
      estado: document.getElementById("editarEstado").value,
    };

    const res = await fetch(`/insumos/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      alert("Insumo actualizado ✅");
      location.reload();
    }
  });

  document.querySelectorAll(".eliminar-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const tr = e.target.closest("tr");
      const id = tr.dataset.id;

      if (confirm("¿Seguro que deseas eliminar este insumo?")) {
        await fetch(`/insumos/${id}`, { method: "DELETE" });
        tr.remove();
      }
    });
  });
});
