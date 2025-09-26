const selectHerramienta = document.getElementById("herramienta");
  const inputCantidad = document.getElementById("cantidad");

  selectHerramienta.addEventListener("change", function () {
    const stock = this.options[this.selectedIndex].getAttribute("data-stock");
    if (stock) {
      inputCantidad.max = stock; // limita máximo
      inputCantidad.value = ""; // limpia valor anterior
    }
  });

  inputCantidad.addEventListener("input", function () {
    if (parseInt(this.value) > parseInt(this.max)) {
      alert("No puedes pedir más herramientas de las disponibles.");
      this.value = this.max;
    }
  });