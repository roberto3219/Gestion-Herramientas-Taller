module.exports = (sequelize, DataTypes) => {

    const Asignacion = sequelize.define('Asignacion', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        estudiante_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        herramienta_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        profesor_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        fecha_asignacion: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        fecha_devolucion: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        observaciones: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
    }, { tableName: 'asignaciones', timestamps: false });

    Asignacion.associate = function(models) {
        Asignacion.belongsTo(models.Estudiante, {
            as: "alumno",
            foreignKey: "alumno_id",
            timestamps: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE"
        });
        Asignacion.belongsTo(models.Herramienta, {
            as: "herramienta",
            foreignKey: "herramienta_id",
            timestamps: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE"
        });

        Asignacion.belongsTo(models.Usuario, {
            as: "usuario",
            foreignKey: "usuario_id",
            timestamps: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE"
        });
    }

    return Asignacion;
}