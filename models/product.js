const mongoose = require('mongoose');

const Schema = mongoose.Schema;


// esqueleto del objeto
const productSchema = new Schema ({
    name: {type: String, required:true},
    description:{ type:String, required:true},
    quantity:{type: Number,},
    //image:{ type:String, required:true},
    price:{ type:Number, required:true}, 
    category: { type: mongoose.Types.ObjectId, required:false, ref: 'Category'} 
    
});


module.exports = mongoose.model('Product',productSchema); 