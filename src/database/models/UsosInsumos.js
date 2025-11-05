module.exports = (sequelize, DataTypes) => {
  const UsosInsumos = sequelize.define("UsosInsumos", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    insumo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estudiante_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    profesor_encargado: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cantidad_usada: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    fecha_uso: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "usos_insumos",
    timestamps: false,
  });

  UsosInsumos.associate = (models) => {
    UsosInsumos.belongsTo(models.Insumo, {
      as: "insumos",
      foreignKey: "insumo_id",
    });
    UsosInsumos.belongsTo(models.Estudiante, {
      as: "estudiantes",
      foreignKey: "estudiante_id",
    });
  };

  return UsosInsumos;
};
