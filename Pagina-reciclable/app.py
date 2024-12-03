from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template, session, redirect, url_for 
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
import os
from flask_cors import CORS 
import random  # Añade esto al inicio del archivo con los otros imports
from functools import wraps

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Genera una clave secreta aleatoria para las sesiones
CORS(app) 


db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'ecosmart',
    'port': 3306
}

app.secret_key = os.urandom(24)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Rutas principales
@app.route('/')
def index():
    return render_template('index.html')
    

@app.route('/contacto')
@login_required
def contacto():
    user_name = session.get('user_name')
    return render_template('contacto.html', user_name=user_name)

@app.route('/problema')
def problema():
    return render_template('problema.html')

# Rutas de autenticación
@app.route('/login')
def login():
    return render_template('Login.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/formulario')
def formulario():
    if 'user_logged_in' in session:
        user_name = session.get('user_name')
        return render_template('formulario.html', user_name=user_name)
    return redirect(url_for('login'))




@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/api/register', methods=['POST'])
def api_register():
    try:
        data = request.get_json()
        
        # Obtener los datos del request
        cedula = data.get('cedula')
        nombre = data.get('nombre')
        email = data.get('email')
        password = data.get('password')  # Ahora usaremos la contraseña directamente
        
        # Validar que todos los campos necesarios estén presentes
        if not all([cedula, nombre, email, password]):
            return jsonify({'error': 'Todos los campos son requeridos'}), 400
        
        # Obtener la fecha actual
        fecha_registro = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Conectar a la base de datos
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Verificar si la cédula ya existe
        cursor.execute("SELECT * FROM usuarios WHERE idUsuario = %s", (cedula,))
        if cursor.fetchone():
            return jsonify({'error': 'Esta cédula ya está registrada'}), 400
            
        # Verificar si el email ya existe
        cursor.execute("SELECT * FROM usuarios WHERE Correo = %s", (email,))
        if cursor.fetchone():
            return jsonify({'error': 'El correo electrónico ya está registrado'}), 400
        
        # Insertar el nuevo usuario usando la contraseña en texto plano
        insert_query = """
            INSERT INTO usuarios (idUsuario, Nombre, Correo, Contraseña, FechaRegistro)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (cedula, nombre, email, password, fecha_registro))
        
        # Confirmar la transacción
        conn.commit()
        
        return jsonify({'message': 'Usuario registrado exitosamente'}), 201
        
    except mysql.connector.Error as err:
        print(f"Error de base de datos: {err}")
        return jsonify({'error': 'Error en el servidor'}), 500
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Error en el servidor'}), 500
        
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
            

@app.route('/api/login', methods=['POST'])
def api_login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        remember_me = data.get('remember_me', False)

        if not all([email, password]):
            return jsonify({'error': 'Todos los campos son requeridos'}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # Buscar usuario por email
        cursor.execute("SELECT * FROM usuarios WHERE Correo = %s", (email,))
        user = cursor.fetchone()

        if user and user['Contraseña'] == password:  # Comparación directa ya que no usamos hash
            session['user_logged_in'] = True
            session['user_id'] = user['idUsuario']
            session['user_name'] = user['Nombre']
            
            if not remember_me:
                # Configurar la sesión para que expire cuando se cierre el navegador
                session.permanent = False
            else:
                # Configurar la sesión para que dure 30 días
                session.permanent = True
                app.permanent_session_lifetime = timedelta(days=30)

            return jsonify({
                'message': 'Login exitoso',
                'user': {
                    'id': user['idUsuario'],
                    'name': user['Nombre'],
                    'email': user['Correo']
                }
            }), 200
        else:
            return jsonify({'error': 'Credenciales inválidas'}), 401

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Error en el servidor'}), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@app.route('/guardar_recolecta', methods=['POST'])
def guardar_recolecta():
    try:
        data = request.get_json()
        
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Usuario no autenticado'}), 401

        # Mapeo de materiales a sus IDs
        material_ids = {
            'Baterías': 1,
            'Cobre': 2,
            'Madera': 3,
            'Vidrio': 4,
            'Papel': 5,
            'Plástico': 6
        }

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        try:
            # Iniciar transacción
            conn.start_transaction()

            # Generar código aleatorio para la recolecta
            codigo_recolecta = 'R' + ''.join(random.choices('0123456789', k=3))

            # Insertar en la tabla recolecta
            insert_recolecta = """
                INSERT INTO recolecta (
                    Direccion, Material, CantidadMaterial, 
                    FechaRecoleccion, Cod_Recolecta, Estado, idUsuario_FK
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            
            values_recolecta = (
                data['direccion'],
                data['materiales'],
                data['cantidadTotal'],
                data['fechaRecoleccion'],
                codigo_recolecta,
                'Pendiente',
                session['user_id']
            )

            cursor.execute(insert_recolecta, values_recolecta)
            
            # Obtener el ID de la recolecta recién insertada
            id_recolecta = cursor.lastrowid

            # Insertar en la tabla material
            insert_material = """
                INSERT INTO material (
                    idMaterial, Nombre, Categoria, 
                    Unidad_Medida, CantidadMat, idRecolecta
                ) VALUES (%s, %s, %s, %s, %s, %s)
            """

            # Procesar cada material
            for material, cantidad in data['materiales_detallados'].items():
                if cantidad > 0:  # Solo insertar si hay cantidad
                    values_material = (
                        material_ids[material],  # ID del material
                        material,                # Nombre del material
                        material.upper(),        # Categoría (nombre en mayúsculas)
                        'Kg',                    # Unidad de medida
                        cantidad,                # Cantidad
                        id_recolecta            # ID de la recolecta
                    )
                    cursor.execute(insert_material, values_material)

            # Confirmar la transacción
            conn.commit()

            return jsonify({
                'success': True,
                'message': 'Recolecta guardada exitosamente',
                'codigo': codigo_recolecta
            })

        except Exception as e:
            # Si hay error, hacer rollback
            conn.rollback()
            raise e

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            'success': False,
            'message': 'Error al guardar la recolecta'
        }), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@app.route('/enviar-contacto', methods=['POST'])
def enviar_contacto():
    try:
        data = request.get_json()
        
        # Validar que todos los campos estén presentes
        if not all([data.get('nombre'), data.get('correo'), data.get('descripcion')]):
            return jsonify({
                'success': False,
                'message': 'Todos los campos son requeridos'
            }), 400

        # Conectar a la base de datos
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        try:
            # Insertar en la tabla contactanos
            insert_query = """
                INSERT INTO contactanos (
                    Nombre, Correo, idUsuario_FK
                ) VALUES (%s, %s, %s)
            """
            
            # Si el usuario está logueado, usar su ID, si no, usar NULL
            user_id = session.get('user_id', None)
            
            values = (
                data['nombre'],
                data['correo'],
                user_id
            )

            cursor.execute(insert_query, values)
            conn.commit()

            return jsonify({
                'success': True,
                'message': 'Mensaje enviado exitosamente'
            })

        except Exception as e:
            conn.rollback()
            raise e

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            'success': False,
            'message': 'Error al enviar el mensaje'
        }), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


# Iniciar la aplicación
if __name__ == '__main__':
    app.run(debug=True)
    