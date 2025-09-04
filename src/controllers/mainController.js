// Controlador del index
/* const db = require("../database/models/index.js");
 */
const controller = {
  index: async (req, res) => {
    try{
        res.render("index")
    }catch(e){
        console.log("Error " + e)
    }
}
}

module.exports = controller;
