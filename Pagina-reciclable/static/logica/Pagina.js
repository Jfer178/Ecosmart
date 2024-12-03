let index = 0;  // Índice de la imagen que se está mostrando actualmente
const images = document.querySelector('.imagenes');  // Seleccionamos el contenedor de imágenes
const totalImages = document.querySelectorAll('.imagenes img').length; // Contamos el número total de imágenes

// Función para mover el carrusel
function moverCarrusel() {
    index++;
    
    // Si hemos llegado al final, reiniciamos el índice
    if (index === totalImages) {
        index = 0;
    }
    
    // Desplazamos las imágenes hacia la izquierda
    images.style.transform = `translateX(-${index * 100}%)`;
}

// Llamamos a la función cada 3 segundos
setInterval(moverCarrusel, 3000);

function moverCarrusel(direccion) {
    if (direccion === 1) {
        index++;
    } else if (direccion === -1) {
        index--;
    }

    if (index === totalImages) {
        index = 0;
    } else if (index < 0) {
        index = totalImages - 1;
    }

    images.style.transform = `translateX(-${index * 100}%)`;
}
// problema redirigir 

function redirigirProblema(event) {
    event.preventDefault();
    
    // Simplificamos la redirección directamente a problema.html
    window.location.href = '/problema';
}

// Agregar evento para el botón de cerrar sesión
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Hacer una petición al endpoint de logout
            fetch('/logout', {
                method: 'POST',
                credentials: 'include'
            })
            .then(response => {
                if (response.ok) {
                    // Redirigir a la página de inicio después del logout
                    window.location.href = '/';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
});