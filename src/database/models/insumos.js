module.exports = (sequelize, DataTypes) => {
  const Insumo = sequelize.define('Insumo', {
    id_insumo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "disponible",
    },
  }, { tableName: 'insumos',  timestamps: false });

  Insumo.associate = function(models) {
    Insumo.hasMany(models.Asignacion, {
      as: "asignaciones",
      foreignKey: "insumo_id",
        timestamps: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    });
  }

    return Insumo;
};