// models/estudiante.js
module.exports = (sequelize, DataTypes) => {
  const Estudiante = sequelize.define('Estudiante', {
    nombre: DataTypes.STRING,
    dni: DataTypes.INTEGER,
    email: DataTypes.STRING,
    curso: DataTypes.STRING,
    telefono: DataTypes.INTEGER
  }, {
    tableName: 'estudiantes'
  });

  Estudiante.associate = function(models) {
    Estudiante.hasMany(models.Prestamo, { foreignKey: 'estudiante_id', as: 'prestamos' });
  };

  return Estudiante;
};
