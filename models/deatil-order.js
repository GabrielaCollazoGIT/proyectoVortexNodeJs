const mongoose = require('mongoose');

const Schema = mongoose.Schema;


// esqueleto del objeto // 
const detailOrderSchema = new Schema ({
    amount: {type:Number, required: false},
    quantity:{type: Number,required:false},
    //order:{type: mongoose.Types.ObjectId, required:true, ref: 'Order' }
    product:
    { type: mongoose.Types.ObjectId, required:true, ref: 'Product' }

});

module.exports = mongoose.model('DetailOrder',detailOrderSchema); 