document.addEventListener('DOMContentLoaded', function() {
    const materiales = {
        'Baterías': 5000,
        'Cobre': 23000,
        'Madera': 1500,
        'Vidrio': 500,
        'Papel': 1500,
        'Plástico': 3500
    };

    const inputs = document.querySelectorAll('input[type="number"]');
    const totalSpan = document.getElementById('total');
    const form = document.getElementById('reciclarForm');

    inputs.forEach(input => {
        input.setAttribute('step', 'any');
        
        input.addEventListener('input', function(e) {
            if (e.target.value.includes(',')) {
                e.target.value = e.target.value.replace(',', '.');
            }
        });
        
        input.addEventListener('input', calcularTotal);
    });

    function calcularTotal() {
        let total = 0;
        inputs.forEach(input => {
            const cantidad = parseFloat(input.value) || 0;
            const precio = materiales[input.id];
            total += cantidad * precio;
        });
        totalSpan.textContent = total.toFixed(2);
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Recoger datos del formulario
        const nombre = document.getElementById('nombre').value;
        const direccion = document.getElementById('direccion').value;
        const telefono = document.getElementById('telefono').value;
        const fechaRecoleccion = document.getElementById('fecha').value;
        
        // Preparar datos de materiales para la base de datos
        let materialesSeleccionados = [];
        let cantidadTotal = 0;
        
        for (const [material, precio] of Object.entries(materiales)) {
            const cantidad = parseFloat(document.getElementById(material).value) || 0;
            if (cantidad > 0) {
                materialesSeleccionados.push(material);
                cantidadTotal += cantidad;
            }
        }

        // Validar que haya al menos un material seleccionado
        if (materialesSeleccionados.length === 0) {
            alert('Por favor, ingrese al menos un material para reciclar');
            return;
        }

        // Enviar datos a la base de datos
        try {
            const response = await fetch('/guardar_recolecta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: nombre,
                    direccion: direccion,
                    telefono: telefono,
                    materiales: materialesSeleccionados.join(', '),
                    cantidadTotal: cantidadTotal,
                    fechaRecoleccion: fechaRecoleccion,
                    materiales_detallados: Object.fromEntries(
                        Object.entries(materiales).map(([material, _]) => [
                            material,
                            parseFloat(document.getElementById(material).value) || 0
                        ])
                    )
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Llenar el ticket
                document.getElementById('ticket-name').textContent = nombre;
                document.getElementById('ticket-address').textContent = direccion;
                document.getElementById('ticket-phone').textContent = telefono;
                document.getElementById('ticket-date').textContent = new Date().toLocaleDateString();
                document.getElementById('ticket-pickup-date').textContent = fechaRecoleccion;
                
                // Añadir el código de recolecta al ticket
                document.getElementById('ticket-code').textContent = result.codigo;
                
                // Llenar tabla de materiales
                const tbody = document.getElementById('ticket-materials-body');
                tbody.innerHTML = '';
                let total = 0;
                
                for (const [material, precio] of Object.entries(materiales)) {
                    const cantidad = parseFloat(document.getElementById(material).value) || 0;
                    if (cantidad > 0) {
                        const subtotal = cantidad * precio;
                        total += subtotal;
                        
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${material}</td>
                            <td>${cantidad}</td>
                            <td>$${precio.toFixed(2)}</td>
                            <td>$${subtotal.toFixed(2)}</td>
                        `;
                        tbody.appendChild(tr);
                    }
                }
                
                document.getElementById('ticket-total').textContent = total.toFixed(2);
                
                // Mostrar el ticket
                document.getElementById('ticketOverlay').style.display = 'block';

                // Limpiar el formulario
                form.reset();
                totalSpan.textContent = "0.00";
            } else {
                alert('Error al guardar la recolecta: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar la solicitud');
        }
    });

    // Cerrar ticket
    document.querySelector('.close-ticket').addEventListener('click', function() {
        document.getElementById('ticketOverlay').style.display = 'none';
    });

    // Cerrar ticket si se hace clic fuera
    document.getElementById('ticketOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });

    // Validar que la fecha de recolección no sea anterior a hoy
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date();
    const dd = String(hoy.getDate()).padStart(2, '0');
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const yyyy = hoy.getFullYear();
    const fechaMinima = yyyy + '-' + mm + '-' + dd;
    fechaInput.setAttribute('min', fechaMinima);
});