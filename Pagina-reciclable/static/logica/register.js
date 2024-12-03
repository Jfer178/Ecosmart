document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Función para validar cédula (solo números y longitud específica)
    function validarCedula(cedula) {
        const regex = /^\d{10}$/; // Asume que la cédula debe tener 10 dígitos
        return regex.test(cedula);
    }

    // Función para validar email
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Función para validar contraseña
    function validarPassword(password) {
        return password.length >= 6; // Mínimo 6 caracteres
    }

    // Manejador para mostrar/ocultar contraseña
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const inputField = this.previousElementSibling;
            if (inputField.type === 'password') {
                inputField.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                inputField.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    // Manejador del formulario de registro
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const cedula = document.getElementById('registerCedula').value.trim();
        const nombre = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validaciones
        if (!validarCedula(cedula)) {
            alert('Por favor, ingrese una cédula válida de 10 dígitos');
            return;
        }

        if (nombre.length < 3) {
            alert('El nombre debe tener al menos 3 caracteres');
            return;
        }

        if (!validarEmail(email)) {
            alert('Por favor, ingrese un correo electrónico válido');
            return;
        }

        if (!validarPassword(password)) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cedula: cedula,
                    nombre: nombre,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registro exitoso');
                window.location.href = '/login'; // Redirige al login después del registro exitoso
            } else {
                alert(data.error || 'Error en el registro');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error en el registro. Por favor, intente nuevamente.');
        }
    });

    // Validación en tiempo real de la cédula (solo permite números)
    document.getElementById('registerCedula').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });
});
