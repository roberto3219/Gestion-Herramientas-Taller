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
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    
    // Validación de nombre de usuario
    usernameInput.addEventListener('blur', function() {
        const username = this.value.trim();
        
        if (username.length < 3) {
            showFieldError(this, 'El nombre de usuario debe tener al menos 3 caracteres');
        } else if (username.length > 20) {
            showFieldError(this, 'El nombre de usuario no puede exceder los 20 caracteres');
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showFieldError(this, 'Solo se permiten letras, números y guiones bajos');
        } else {
            clearFieldError(this);
        }
    });
    
    // Validación de email
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            showFieldError(this, 'Por favor ingresa un correo electrónico válido');
        } else {
            clearFieldError(this);
        }
    });
    
    // Función para mostrar error en campo
    function showFieldError(input, message) {
        // Limpiar error anterior
        clearFieldError(input);
        
        // Crear elemento de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'errorText mt-1';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.textContent = message;
        
        // Insertar después del campo
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
        
        // Añadir clase de error al campo
        input.classList.add('is-invalid');
    }
    
    // Función para limpiar error de campo
    function clearFieldError(input) {
        const errorDiv = input.parentNode.querySelector('.errorText');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.classList.remove('is-invalid');
    }
});