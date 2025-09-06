module.exports = (sequelize, DataTypes) => {
  const Herramienta = sequelize.define('Herramienta', {
    nombre: DataTypes.STRING,
    categoria: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    cantidad: DataTypes.INTEGER,
    estado: DataTypes.STRING
  }, { tableName: 'herramientas',  timestamps: false });

  Herramienta.associate = function(models) {
    Herramienta.belongsToMany(models.Prestamos, {
      through: models.PrestamoItem,
      foreignKey: 'herramienta_id',
      otherKey: 'prestamo_id',
      as: 'prestamos'
    });
  };

  return Herramienta;
};
