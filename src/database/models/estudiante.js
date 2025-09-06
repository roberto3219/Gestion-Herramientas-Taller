// models/estudiante.js
module.exports = (sequelize, DataTypes) => {
  const Estudiante = sequelize.define('Estudiante', {
    nombre: DataTypes.STRING,
    dni: DataTypes.INTEGER,
    email: DataTypes.STRING,
    curso: DataTypes.STRING,
    telefono: DataTypes.INTEGER
  }, {
    tableName: 'estudiantes',  timestamps: false
  });

  Estudiante.associate = function(models) {
    Estudiante.hasMany(models.Prestamos, { foreignKey: 'estudiante_id', as: 'prestamos' });
  };

  return Estudiante;
};
