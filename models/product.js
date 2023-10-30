const mongoose = require('mongoose');

const Schema = mongoose.Schema;


// esqueleto del objeto
const productSchema = new Schema ({
    name: {type: String, required:true},
    description:{ type:String, required:true},
    //image:{ type:String, required:true},
    price:{ type:Number, required:true},
             // para relacionarlo con la otra tabla, uso el types, y referencia se la paso con el nombre de la tabla
    category: { type: mongoose.Types.ObjectId, required:true, ref: 'Category'} 
    
});

// exporto el esqqueleto del product...(Modelo) // es con minuscula!!!!!
module.exports = mongoose.model('Product',productSchema); // con esto exporto el schema, y va a ser una tabla que se escribe en minuscula y singular