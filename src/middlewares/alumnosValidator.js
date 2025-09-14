let path = require("path");
const { body } = require("express-validator");
const { Estudiante } = require("../database/models");

const alumnosValidator = [
    body("nombre")
        .notEmpty()
        .withMessage("El nombre es obligatorio.")
        .isLength({ min: 4 })
        .withMessage("El nombre debe tener al menos 4 caracteres."),
    body("dni")
        .notEmpty()
        .withMessage("El DNI es obligatorio.")
        .isLength({ min: 7, max: 8 })
        .withMessage("El DNI debe tener entre 7 y 8 caracteres.")
        .isNumeric()
        .withMessage("El DNI debe contener solo números.")
        .custom(async (value) => {
            const existingEstudiante = await Estudiante.findOne({ where: { dni: value } });
            if (existingEstudiante) {
                throw new Error("El DNI ya está registrado.");
            }
            return true;
        }),
    body("email")
        .notEmpty()
        .withMessage("El email es obligatorio.")
        .isEmail()
        .withMessage("Debe ingresar un email válido.")
        .custom(async (value) => {
            const existingEstudiante = await Estudiante.findOne({ where: { email: value } });
            if (existingEstudiante) {
                throw new Error("El email ya está registrado.");
            }
            return true;
        }),
    body("curso")
        .notEmpty()
        .withMessage("El curso es obligatorio."),
    body("telefono")
        .optional({ checkFalsy: true })
        .isNumeric()
        .withMessage("El teléfono debe contener solo números.")
        .isLength({ min: 10, max: 15 })
        .withMessage("El teléfono debe tener entre 10 y 15 caracteres."),
]
module.exports = alumnosValidator;
        // Aquí puedes agregar la lógica de validación para crear un alumno