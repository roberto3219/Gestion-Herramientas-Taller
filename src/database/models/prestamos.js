module.exports = (sequelize, DataTypes) => {
    Alias = "Prestamos"
    cols ={
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        estudiante_id:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        herramientas_id:{
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        cantidad_herramientas:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        profesor_encargado:{
            type: DataTypes.STRING,
            allowNull: false
        },
        fecha_prestamo:{
            type: DataTypes.DATE,
            allowNull: false,
        },
        fecha_devolucion_estimada:{
            type: DataTypes.DATE,
            allowNull: false,
        },
        fecha_devolucion_real:{
            type: DataTypes.DATE,
            allowNull: true,
        },
        estado:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        observaciones:{
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: "Sin observaciones"
        },
    }
    config = {
        tableName : "prestamos",
        timestamps: false,
    }
    const Prestamos = sequelize.define(Alias,cols,config);

    Prestamos.associate = function(models) {
        Prestamos.belongsTo(models.Estudiante, {
            as: "estudiantes",
            foreignKey: "estudiante_id",
            timestamps: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE"
        });
        Prestamos.belongsTo(models.Herramienta, {
            as: "herramientas",
            foreignKey: "herramientas_id",
            timestamps: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE"
        });

    };
    return Prestamos;
}