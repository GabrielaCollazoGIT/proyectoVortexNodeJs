const mongoose = require('mongoose');

const Schema = mongoose.Schema;


// esqueleto del objeto // 
const categorySchema = new Schema ({
    name: {type: String, required:true},
    description:{ type:String, required:true},
});

// exporto el esqqueleto del product...(Modelo) // es con minuscula!!!!!
module.exports = mongoose.model('Category',categorySchema); // con esto exporto el schema, y va a ser una tabla que se escribe en minuscula y singular