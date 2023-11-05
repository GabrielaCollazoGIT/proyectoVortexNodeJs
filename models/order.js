const mongoose = require('mongoose');

const Schema = mongoose.Schema;


// esqueleto del objeto // 
const saleOrderSchema = new Schema ({
    date:{type: Date, required:true},
    client:{type:String, required:true},
    amount: {type:Number, required: false},
    quantity:{type: Number,required:false},
    detailOrders:[
    { type: mongoose.Types.ObjectId, required:true, ref: 'DetailOrder' }]
});

module.exports = mongoose.model('Order',saleOrderSchema); 