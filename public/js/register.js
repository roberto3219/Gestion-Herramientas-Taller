window.addEventListener('load', function() {
    const form = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const repeatPasswordInput = document.getElementById('repeat_password');
    const passwordError = document.getElementById('passwordError');
    const imageInput = document.getElementById('img');
    const extensiónesPermitidas = ['.jpg', '.jpeg', '.png'];

    // Validar extensión de imagen al seleccionar archivo
    imageInput.addEventListener('change', function() {
        const filePath = imageInput.value;
        const extensión = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
        if (extensión && !extensiónesPermitidas.includes(extensión)) {
            alert('La imagen debe tener una extensión válida (JPG, JPEG, PNG).');
            imageInput.value = ''; // Limpiar el campo de entrada
        }
    });

    form.addEventListener('submit', function(event) {
        // Clear previous error message
        passwordError.textContent = '';
        // Check if passwords match
        if (passwordInput.value !== repeatPasswordInput.value) {
            event.preventDefault(); // Prevent form submission
            passwordError.style.color = 'red';
            passwordError.textContent = 'Las contraseñas no coinciden.';
        }
    });
});