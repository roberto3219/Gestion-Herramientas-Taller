const backupSelect = document.getElementById("backupSelect");
const mergeBtn = document.getElementById("mergeBtn");
const replaceBtn = document.getElementById("replaceBtn");

backupSelect.addEventListener("change", function () {
    if (backupSelect.value !== "") {
        mergeBtn.disabled = false;
        replaceBtn.disabled = false;
    } else {
        mergeBtn.disabled = true;
        replaceBtn.disabled = true;
    }
});

function openRestoreDialog() {
    const modal = new bootstrap.Modal(document.getElementById("restoreModal"));
    modal.show();
}

function submitRestore(mode) {
    const file = backupSelect.value;

    if (!file) {
        alert("Selecciona un archivo de backup primero.");
        return;
    }

    document.getElementById("fileInput").value = file;
    document.getElementById("modeInput").value = mode;

    document.getElementById("restoreForm").submit();
}
