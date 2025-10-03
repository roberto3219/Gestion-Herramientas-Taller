// seeders/20231002010000-demo-estudiantes.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Estudiantes", [
      {
        nombre: "Juan Pérez",
        curso: "5to A",
        dni: "12345678",
        email: "roberto@gmail.com",
        telefono: "3884177539",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Ana Gómez",
        curso: "5to B",
        dni: "87654321",
        email: "oscar@gmail.com",
        telefono: "3884174432",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Estudiantes", null, {});
  },
};
