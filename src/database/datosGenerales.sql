-- Insertar datos de prueba
/*INSERT INTO roles (nombre) VALUES ('Administrador'), ('Profesor'), ('Auxiliar');
*/
/*INSERT INTO users (nombre, email, password_hash, role_id)
VALUES ('Roberto', 'roberto@mail.com', '1234', 1),
       ('Juan Pérez', 'juan@mail.com', '1234', 2);*/

/*INSERT INTO estudiantes (nombre, email, curso)
VALUES ('Carlos Gómez', 'carlos@mail.com', '5to A'),
       ('Ana López', 'ana@mail.com', '5to B');
*/
/*
INSERT INTO herramientas (nombre, categoria, cantidad, estado)
VALUES ('Martillo', 'Manuales', 10, 'Disponible'),
       ('Taladro', 'Eléctricas', 5, 'Disponible'),
       ('Llave Inglesa', 'Manuales', 8, 'Disponible');
*/
/*
INSERT INTO prestamos (id,estudiante_id, profesor_encargado,fecha_prestamo,fecha_devolucion_estimada,fecha_devolucion_real,estado,observaciones)
VALUES (default, 1, 'Profesor Díaz', '2025-09-01 23:00', '2025-09-05 12:00', "2025-09-05 15:00",'Pendiente',null),
       (default, 2, 'Profesor López', '2025-09-02 11:00', '2025-09-06 12:00', "2025-09-07 19:00" ,'Devuelto',null);
    */   
-- Archivo: prestamo_items.sql
-- Insertar datos de prueba en la tabla prestamo_items

-- Datos de ejemplo para herramientas
/*
INSERT INTO herramientas (id, nombre, descripcion, stock, estado)
VALUES
(1, 'Martillo', 'Martillo de acero', 10, 'Disponible'),
(2, 'Destornillador', 'Juego de destornilladores', 15, 'Disponible'),
(3, 'Taladro', 'Taladro eléctrico', 5, 'Disponible'),
(4, 'Llave Inglesa', 'Llave inglesa ajustable', 8, 'Disponible'),
(5, 'Sierra', 'Sierra manual', 12, 'Disponible');*/
