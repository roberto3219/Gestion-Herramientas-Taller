module.exports = (sequelize, DataTypes) => {
    Alias = "PrestamoItem"
    cols = {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        prestamo_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        herramienta_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cantidad:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        estado_item:{
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Bueno"
        }
    }
    config = {
        tableName : "prestamo_items",
        timestamps: false
    }
    const PrestamoItem = sequelize.define(Alias,cols,config);   
    return PrestamoItem;
}