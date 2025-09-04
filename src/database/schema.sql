-- schema.sql
-- Roles (para usuarios)
CREATE TABLE roles (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Usuarios (para login)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Alumnos (separados de "users")
CREATE TABLE estudiantes (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  dni VARCHAR(50),
  email VARCHAR(150) UNIQUE,
  curso VARCHAR(100),
  telefono VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Herramientas
CREATE TABLE herramientas (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(100),
  descripcion TEXT,
  cantidad INTEGER DEFAULT 1,
  estado VARCHAR(50) DEFAULT 'Disponible',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Prestamos (cabecera)
CREATE TABLE prestamos (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  estudiante_id INTEGER NOT NULL,
  profesor_encargado VARCHAR(150),
  fecha_prestamo DATETIME NOT NULL,
  fecha_devolucion_estimada DATETIME,
  fecha_devolucion_real DATETIME,
  estado VARCHAR(50) DEFAULT 'Pendiente', -- Pendiente | Devuelto | Retrasado
  observaciones TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE
);

-- Items del préstamo (para múltiples herramientas por préstamo)
CREATE TABLE prestamo_items (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  prestamo_id INTEGER NOT NULL,
  herramienta_id INTEGER NOT NULL,
  cantidad INTEGER DEFAULT 1,
  estado_item VARCHAR(50) DEFAULT 'Prestado',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prestamo_id) REFERENCES prestamos(id) ON DELETE CASCADE,
  FOREIGN KEY (herramienta_id) REFERENCES herramientas(id) ON DELETE RESTRICT
);

-- Log de acciones (archivo también, pero guardamos referencia)
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  usuario_id INTEGER,
  usuario_nombre VARCHAR(150),
  accion VARCHAR(255),
  ruta VARCHAR(255),
  ip VARCHAR(50),
  datos TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE SET NULL
);
