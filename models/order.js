const mongoose = require('mongoose');

const Schema = mongoose.Schema;


// esqueleto del objeto // 
const saleOrderSchema = new Schema ({
    date:{type: Date, required:true},
    client:{type:String, required:true},
    amount: {type:Number, required: false},
    quantity:{type: Number,required:false},
    products:[
    { type: mongoose.Types.ObjectId, quantity:{type: Number, required:true}, required:true, ref: 'Product' }
]
});

module.exports = mongoose.model('Order',saleOrderSchema); 