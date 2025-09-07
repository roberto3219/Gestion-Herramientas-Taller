module.exports = (sequelize, DataTypes) => {
  const Herramienta = sequelize.define('Herramienta', {
    nombre: DataTypes.STRING,
    categoria: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    cantidad: DataTypes.INTEGER,
    estado: DataTypes.STRING
  }, { tableName: 'herramientas',  timestamps: false });
  Herramienta.associate = function(models) {
    Herramienta.hasMany(models.Prestamos, {
      as: "prestamos",
      foreignKey: "herramientas_id",
      timestamps: false,
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
  }

  return Herramienta;
};
