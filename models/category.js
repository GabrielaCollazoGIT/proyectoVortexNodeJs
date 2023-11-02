const mongoose = require('mongoose');

const Schema = mongoose.Schema;


// esqueleto del objeto // 
const categorySchema = new Schema ({
    name: {type: String, required:true},
    description:{ type:String, required:true},
    products: [{ type: mongoose.Types.ObjectId, required:true, ref: 'Product'}] // una categori puede tener multples productos, por eso es una array
    
});

// exporto el esqqueleto del product...(Modelo) // es con minuscula!!!!!
module.exports = mongoose.model('Category',categorySchema); // con esto exporto el schema, y va a ser una tabla que se escribe en minuscula y singular