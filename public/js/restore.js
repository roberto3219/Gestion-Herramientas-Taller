function openRestoreDialog() {
  const modal = new bootstrap.Modal(document.getElementById("restoreModal"));
  modal.show();
}

function submitRestore(mode) {
  document.getElementById("modeInput").value = mode;
  document.getElementById("restoreForm").submit();
}
