module.exports = (sequelize, DataTypes) => {
  const Backups = sequelize.define('Backups', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    filename: DataTypes.STRING,
    fecha_create: DataTypes.DATE,
  }, {
    tableName: 'backups',  timestamps: false
  });
    return Backups;
};