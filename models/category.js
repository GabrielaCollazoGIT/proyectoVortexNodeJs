const mongoose = require('mongoose');

const Schema = mongoose.Schema;


// esqueleto del objeto
const categorySchema = new Schema ({
    name: {type: String, required:true},
    description:{ type:String, required:true},

             // para relacionarlo con la otra tabla, uso el types, y referencia se la paso con el nombre de la tabla
    products: { type: mongoose.Types.ObjectId, required:true, ref: 'Product'} 
    
});

// exporto el esqqueleto del product...(Modelo) // es con minuscula!!!!!
module.exports = mongoose.model('Category',categorySchema); // con esto exporto el schema, y va a ser una tabla que se escribe en minuscula y singular