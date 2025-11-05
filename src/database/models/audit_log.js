const { create } = require("../../controllers/prestamosController");

module.exports = (sequelize, DataTypes) => {
 
    const AuditLog = sequelize.define('AuditLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    usuario_nombre: { type: DataTypes.STRING, allowNull: true },
    accion: { type: DataTypes.STRING, allowNull: false },
    ruta: { type: DataTypes.STRING, allowNull: true },
    ip: { type: DataTypes.STRING, allowNull: true },
    datos: { type: DataTypes.JSON, allowNull: true },
  }, {
    tableName: 'audit_logs',
    timestamps: true, // createdAt guardará la fecha
    createdAt: 'created_at',
    updatedAt: false
  });

  AuditLog.associate = function(models) {
    AuditLog.belongsTo(models.Usuario, {
      as: "usuario",
        foreignKey: "usuario_id",
        timestamps: false,
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    });
  }

  return AuditLog;
};
