module.exports = (sequelize, DataTypes) => {
    Alias = "Usuario";
    cols = {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_name:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        nombre:{
            type: DataTypes.STRING,
            allowNull: false
        },
        img_user:{
            type: DataTypes.STRING,
            allowNull: true
        },
        email:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate:{
                isEmail: true
            }
        },
        password_hash:{
            type: DataTypes.STRING,
            allowNull: false
        },
        role_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3,
            references:{
                model: "roles",
                key: "id"
            }
        }
    };
    config = {
        tableName: "users",
        timestamps: false
    }
    const Usuario = sequelize.define(Alias, cols, config);
    Usuario.associate = function(models){
        Usuario.belongsTo(models.Rol, {
            as: "roles",
            foreignKey: "role_id"
        });
    }
    return Usuario;
}