module.exports = (sequelize, DataTypes) => {
    alias = "Rol";
    cols = {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, 
        nombre:{
            type: DataTypes.STRING,
            allowNull: false
        },
        descripcion:{
            type: DataTypes.STRING,
            allowNull: true
        }
    };
    config = {
        tableName: "roles",
        timestamps: false
    }
    const Rol = sequelize.define(alias, cols, config);
    Rol.associate = function(models){
        Rol.hasMany(models.Usuario, {
            as: "usuarios",
            foreignKey: "role_id"
        });
    }

    return Rol;
}