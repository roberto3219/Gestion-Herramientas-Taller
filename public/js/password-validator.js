// Validador de contraseñas para formulario de registro

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const passwordInput = document.getElementById('password');
    const repeatPasswordInput = document.getElementById('repeat_password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleRepeatPasswordBtn = document.getElementById('toggleRepeatPassword');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    const requirementList = document.getElementById('requirementList');
    const passwordMatchMessage = document.getElementById('passwordMatchMessage');
    const generatePasswordBtn = document.getElementById('generatePassword');
    const submitBtn = document.getElementById('submitBtn');
    const registerForm = document.getElementById('registerForm');

    // Requisitos de seguridad
    const requirements = [
        { id: 'length', text: 'Al menos 12 caracteres', validator: (pwd) => pwd.length >= 12 },
        { id: 'uppercase', text: 'Al menos una letra mayúscula (A-Z)', validator: (pwd) => /[A-Z]/.test(pwd) },
        { id: 'lowercase', text: 'Al menos una letra minúscula (a-z)', validator: (pwd) => /[a-z]/.test(pwd) },
        { id: 'number', text: 'Al menos un número (0-9)', validator: (pwd) => /[0-9]/.test(pwd) },
        { id: 'special', text: 'Al menos un símbolo (!@#$%^&*)', validator: (pwd) => /[!@#$%^&*]/.test(pwd) },
        { id: 'noSpaces', text: 'Sin espacios', validator: (pwd) => !/\s/.test(pwd) }
    ];

    // Contraseñas comunes
    const commonPasswords = [
        '123456', 'password', '12345678', 'qwerty', '123456789',
        '12345', '1234', '111111', '1234567', 'dragon',
        '123123', 'baseball', 'abc123', 'football', 'monkey',
        'letmein', 'shadow', 'master', '666666', 'qwertyuiop',
        '123321', 'mustang', '1234567890', 'michael', 'superman'
    ];

    // Inicializar la interfaz
    function init() {
        // Crear lista de requisitos
        createRequirementList();
        
        // Configurar eventos
        setupEventListeners();
        
        // Validación inicial
        updatePasswordValidation();
    }

    // Crear la lista de requisitos en el DOM
    function createRequirementList() {
        requirements.forEach(req => {
            const li = document.createElement('li');
            li.className = 'requirement-item';
            li.id = `req-${req.id}`;
            
            const icon = document.createElement('span');
            icon.className = 'requirement-icon invalid';
            icon.textContent = '✗';
            
            const text = document.createElement('span');
            text.textContent = req.text;
            
            li.appendChild(icon);
            li.appendChild(text);
            requirementList.appendChild(li);
        });
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Mostrar/ocultar contraseña
        togglePasswordBtn.addEventListener('click', function() {
            togglePasswordVisibility(passwordInput, this);
        });
        
        toggleRepeatPasswordBtn.addEventListener('click', function() {
            togglePasswordVisibility(repeatPasswordInput, this);
        });
        
        // Validar en tiempo real
        passwordInput.addEventListener('input', function() {
            updatePasswordValidation();
            checkPasswordMatch();
        });
        
        repeatPasswordInput.addEventListener('input', checkPasswordMatch);
        
        // Generar contraseña
        generatePasswordBtn.addEventListener('click', generateSecurePassword);
        
        // Validar formulario antes de enviar
        registerForm.addEventListener('submit', function(e) {
            if (!validateForm()) {
                e.preventDefault();
                alert('Por favor, corrige los errores en el formulario antes de enviar.');
            }
        });
    }

    // Cambiar visibilidad de la contraseña
    function togglePasswordVisibility(input, button) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        // Cambiar icono
        const icon = button.querySelector('i');
        if (type === 'password') {
            icon.className = 'bi bi-eye';
        } else {
            icon.className = 'bi bi-eye-slash';
        }
    }

    // Calcular fortaleza de la contraseña
    function calculateStrength(password) {
        if (!password) return 0;
        
        let strength = 0;
        
        // Longitud
        if (password.length >= 8) strength += 10;
        if (password.length >= 12) strength += 15;
        if (password.length >= 16) strength += 10;
        
        // Diversidad de caracteres
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[a-z]/.test(password)) strength += 10;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[!@#$%^&*]/.test(password)) strength += 20;
        
        // Penalización por contraseñas comunes
        if (isCommonPassword(password)) strength = Math.max(5, strength - 30);
        
        // Penalización por patrones simples
        if (/(.)\1{2,}/.test(password)) strength -= 10;
        if (/^(123|abc|qwe)/i.test(password)) strength -= 15;
        
        return Math.min(100, Math.max(0, strength));
    }

    // Verificar si es una contraseña común
    function isCommonPassword(password) {
        return commonPasswords.includes(password.toLowerCase());
    }

    // Obtener texto de fortaleza
    function getStrengthText(strength) {
        if (strength === 0) return 'No ingresada';
        if (strength < 30) return 'Muy débil';
        if (strength < 50) return 'Débil';
        if (strength < 70) return 'Moderada';
        if (strength < 85) return 'Fuerte';
        return 'Muy fuerte';
    }

    // Obtener color de fortaleza
    function getStrengthColor(strength) {
        if (strength === 0) return '#6c757d';
        if (strength < 30) return '#dc3545';
        if (strength < 50) return '#fd7e14';
        if (strength < 70) return '#ffc107';
        if (strength < 85) return '#20c997';
        return '#198754';
    }

    // Actualizar validación de contraseña
    function updatePasswordValidation() {
        const password = passwordInput.value;
        const strength = calculateStrength(password);
        
        // Actualizar barra de fortaleza
        strengthFill.style.width = `${strength}%`;
        strengthFill.style.backgroundColor = getStrengthColor(strength);
        strengthText.textContent = getStrengthText(strength);
        strengthText.style.color = getStrengthColor(strength);
        
        // Actualizar lista de requisitos
        requirements.forEach(req => {
            const li = document.getElementById(`req-${req.id}`);
            const icon = li.querySelector('.requirement-icon');
            const isValid = req.validator(password);
            
            if (isValid) {
                icon.className = 'requirement-icon valid';
                icon.textContent = '✓';
            } else {
                icon.className = 'requirement-icon invalid';
                icon.textContent = '✗';
            }
        });
        
        // Actualizar estado del botón de envío
        updateSubmitButtonState();
    }

    // Verificar coincidencia de contraseñas
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const repeatPassword = repeatPasswordInput.value;
        
        if (!repeatPassword) {
            passwordMatchMessage.textContent = '';
            passwordMatchMessage.className = '';
            return;
        }
        
        if (password === repeatPassword) {
            passwordMatchMessage.textContent = '✓ Las contraseñas coinciden';
            passwordMatchMessage.className = 'password-match';
        } else {
            passwordMatchMessage.textContent = '✗ Las contraseñas no coinciden';
            passwordMatchMessage.className = 'password-mismatch';
        }
        
        updateSubmitButtonState();
    }

    // Generar contraseña segura
    function generateSecurePassword() {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*';
        
        let password = '';
        
        // Asegurar al menos un carácter de cada tipo
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        // Completar hasta 16 caracteres
        const allChars = lowercase + uppercase + numbers + symbols;
        for (let i = password.length; i < 16; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Mezclar los caracteres
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        
        // Actualizar campos
        passwordInput.value = password;
        repeatPasswordInput.value = password;
        
        // Cambiar tipo a texto para mostrar la contraseña generada
        passwordInput.setAttribute('type', 'text');
        repeatPasswordInput.setAttribute('type', 'text');
        
        // Actualizar iconos
        togglePasswordBtn.querySelector('i').className = 'bi bi-eye-slash';
        toggleRepeatPasswordBtn.querySelector('i').className = 'bi bi-eye-slash';
        
        // Actualizar validación
        updatePasswordValidation();
        checkPasswordMatch();
    }

    // Validar formulario completo
    function validateForm() {
        const password = passwordInput.value;
        const repeatPassword = repeatPasswordInput.value;
        
        // Verificar requisitos de contraseña
        let allRequirementsMet = true;
        requirements.forEach(req => {
            if (!req.validator(password)) {
                allRequirementsMet = false;
            }
        });
        
        // Verificar coincidencia de contraseñas
        const passwordsMatch = password === repeatPassword;
        
        return allRequirementsMet && passwordsMatch;
    }

    // Actualizar estado del botón de envío
    function updateSubmitButtonState() {
        const isValid = validateForm();
        submitBtn.disabled = !isValid;
    }

    // Inicializar
    init();
});