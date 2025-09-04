-- Insertar datos de prueba
INSERT INTO roles (nombre) VALUES ('Administrador'), ('Profesor'), ('Auxiliar');

INSERT INTO usuarios (nombre, email, password, rol_id)
VALUES ('Roberto', 'roberto@mail.com', '1234', 1),
       ('Juan Pérez', 'juan@mail.com', '1234', 2);

INSERT INTO alumnos (nombre, email, curso)
VALUES ('Carlos Gómez', 'carlos@mail.com', '5to A'),
       ('Ana López', 'ana@mail.com', '5to B');

INSERT INTO herramientas (nombre, categoria, cantidad, estado)
VALUES ('Martillo', 'Manuales', 10, 'Disponible'),
       ('Taladro', 'Eléctricas', 5, 'Disponible'),
       ('Llave Inglesa', 'Manuales', 8, 'Disponible');

INSERT INTO prestamos (alumno_id, herramienta_id, profesor, fecha_prestamo, fecha_devolucion, estado)
VALUES (1, 1, 'Profesor Díaz', '2025-09-01', '2025-09-05', 'Pendiente'),
       (2, 2, 'Profesor López', '2025-09-02', '2025-09-06', 'Devuelto');