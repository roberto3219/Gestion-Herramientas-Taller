document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".bloquear-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const tr = e.target.closest("tr");
      const id = tr.dataset.id;

      const res = await fetch(`/usuarios/${id}/bloquear`, { method: "PUT" });
      const data = await res.json();
      alert(data.msg);
      location.reload();
    });
  });

  document.querySelectorAll(".eliminar-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const tr = e.target.closest("tr");
      const id = tr.dataset.id;

      if (confirm("¿Seguro que deseas marcar este usuario para eliminar en 2 días?")) {
        const res = await fetch(`/usuarios/${id}/eliminar`, { method: "DELETE" });
        const data = await res.json();
        alert(data.msg);
        location.reload();
      }
    });
  });
});
