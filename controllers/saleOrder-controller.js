const HttpError = require('../models/http-error'); // la importo y por convencion empieza con mayuscula
const Product = require('../models/product');
const Order = require('../models/order');
const { default: mongoose } = require("mongoose");
const {validationResult} = require('express-validator');
const DetailOrder = require('../models/deatil-order');




///// ALL Orders//// --- listo
const getOrders = async (request,response,next) =>{
    let orders;
    try {
        orders = await Order.find().populate('detailOrders');      

} catch (error) {
    
    const err = new HttpError('Find orders failed, please try again later', 500);
        return next(err);
    }
    response.json({orders: orders.map(order => order.toObject({getters : true}))});
}
///// Order BY Id --- listo
const getOrderById = async (request,response,next) =>{
    const orderId = request.params.id;
    let order;                        
        try {
            order = await Order.findById(orderId).populate('detailOrders');
        } catch (error) {
            const err = new HttpError('Somthing went wrong, couldn´t not find a Order', 500);
            return next(err);
        }
    if(!order){
        const error = new HttpError('Could not find a order for the provided id',404); 
        return next(error); 
    }

                
    response.json({order: order.toObject( {getters: true} )} ); 

};
////// Create Order--- listo
const createOrder = async (request,response,next) =>{
    const errors = validationResult(request); 
    if(!errors.isEmpty()){

        return next (new HttpError('Invalid input passed, please check your data.', 422));
    } 

    const {client} = request.body;  

    const createOrder = new Order({
        date: new Date(),
        client,
        detailOrder:[],
        quantity:0,
        amount: 0
    });
    try {
        await createOrder.save(); 
    } catch (err) {
        const error = new HttpError('Save Order failded please try again...',500);

        return next(error);
    }
                            
    response.status(201).json({order: createOrder.toObject({getters: true}) });
};

const addProduct  = async(request, response, next) => { 
        console.log('Post request en AddProduct');
        const orderId = request.params.id; 
        const productId = request.body.product; 
        
        let orderSale;
        try {
            orderSale = await Order.findById(orderId).populate('detailOrders');
            
        } catch (error) {
            const err = new HttpError('Something went wrong, couldn´t not find a order', 500);
            return next(err);
        }
    
        let product;                           
            try {
                product = await Product.findById(productId).populate('category');
                
            } catch (error) {
            
                const err = new HttpError('Something went wrong, couldn´t not find a product', 500);
                return next(err);
            }
    
        const {price} = product;

        
        orderSale.detailOrders.forEach( detail => {
            if(detail.product.id === product.id.toString()){
                const err = new HttpError('The product already is in this Order, please try another', 404);
                return next(err);
            }
            }); 
            const detailOrder = new DetailOrder();
            detailOrder.product = product;
            detailOrder.quantity = 1;
            detailOrder.amount = price;
        
            orderSale.amount += detailOrder.amount;
            orderSale.quantity+= 1;
            orderSale.detailOrders.push(detailOrder);
        
        
        try {
            // es para crear una sesion para una transaccion...
    const session =  await mongoose.startSession();                              
                session.startTransaction();
                await detailOrder.save({session:session});
                //orderSale.detailOrders.push(detailOrder); 
                await  orderSale.save({session: session});
            
                await session.commitTransaction();
            } catch (err) {
            const error = new HttpError('add product faild please try again...',500);
            return next(error); 
        }

    response.status(200).json({order: orderSale.toObject({getters: true})});
}


const deleteProduct = async (request,response, next) =>{ /// el detalle con los productos que viene x id
        const orderId = request.params.id; 
        const productId = request.body.product; 


        let product;                           
            try {
                product = await Product.findById(productId).populate('category');
            } catch (error) {
                const err = new HttpError('Something went wrong, couldn´t not find a product', 500);
                return next(err);
            }

        let orderSale; 
        try {
            orderSale = await Order.findById(orderId).populate('detailOrders');
        } catch (error) {
            const err = new HttpError('Something went wrong, couldn´t not find a order', 500);
            return next(err);
        }

    
        const {detailOrders} = orderSale; // obtengo el carrito, la cantidad y el total
    
        let finalQuantity = 0;
        let finalAmount = 0;
        const dontExist = detailOrders.some( detail => detail.product !== product);
        let detailNvo;

    if(dontExist){

            detailOrders.forEach( (detail) => {
            if(detail.product !== productId){
                finalAmount = detail.amount; 
                finalQuantity = detail.quantity;
                detailNvo = detail;
        
            
            }
        });
            
        
        orderSale.quantity-= finalQuantity;
        orderSale.amount -= finalAmount;
    
        orderSale.detailOrders = detailOrders;
    }else{
        const error = new HttpError('this product no exist in this order...',500);
        return next(error);
    }
        
        
        
        try {
            // es para crear una sesion para una transaccion...
    const session =  await mongoose.startSession();                              
                session.startTransaction();
                await  orderSale.save({session: session});
                orderSale.detailOrders.pop(detailNvo);                                     
                await detailNvo.deleteOne({session:session});
                await session.commitTransaction();
            } catch (err) {
            
            const error = new HttpError('delete product faild please try again...',500);
            return next(error); 
        }

    response.status(200).json({order: orderSale.toObject({getters: true})});
}

/// Update Carrito
const updateProduct  = async(request, response, next) =>{ // anda y guarda ver porque no calcula bien el total y la cantidad en la orden
    console.log('Update request en updateProduct');
    const order = request.params.id; 
    const product = request.body.product;
    const newQuantity = request.body.quantity;

    //users = await User.find({},'-password'); traigo lo que quiero menos ese atributo...
    let productFind;                           
        try {
            productFind = await Product.findById(product).populate('category');
        } catch (error) {
            const err = new HttpError('Something went wrong, couldn´t not find a product', 500);
            return next(err);
        }
    
    let orderSale 
    try {
        orderSale = await Order.findById(order).populate('detailOrders')
    } catch (error) {
        const err = new HttpError('Something went wrong, couldn´t not find a order', 500);
        return next(err);
    }
    if(newQuantity < 1){
        const err = new HttpError('The quantity must be almost 1', 404);
        return next(err);
    }
    
    const {detailOrders} = orderSale; // obtengo el carrito, la cantidad y el total
    const {price} = productFind;

    let finalQuantity = 0;
    let finalAmount = 0;
    const exist = detailOrders.some( detail => detail.product !== product); /// me devuelve al menos uno que cumpla la condicion
    let detailNvo;

if(exist){

        detailOrders.forEach( (detail) => {
        if(detail.product == product){
            orderSale.amount -= detail.amount;
            orderSale.quantity -= detail.quantity;
            detail.quantity = newQuantity; 
            detail.amount = price * newQuantity;
            finalAmount = detail.amount;
            finalQuantity = detail.quantity;
            
            
            detailNvo = detail;
        
        
        }
    });
        
    
    orderSale.quantity += finalQuantity;
    orderSale.amount += finalAmount;
    orderSale.detailOrders = detailOrders;
}else{
    const error = new HttpError('this product no exist in this order...',500);
    return next(error);
}
    
    
    
    try {
        // es para crear una sesion para una transaccion...
const session =  await mongoose.startSession();                              
            session.startTransaction();
            await  orderSale.save({session: session});                                    
            await detailNvo.save({session:session});
            await session.commitTransaction();
        } catch (err) {
        console.log(err);
        
        const error = new HttpError('update product faild please try again...',500);
        return next(error); 
    }

response.status(200).json({order: orderSale.toObject({getters: true})});
}


///// ALL Details//// --- listo
const getDetailsOrder = async (request,response,next) =>{
const orderId = request.params.order
    let details;
    try {
        details = await DetailOrder.find({detailOrders: orderId}).populate('product');      
        
} catch (error) {
    
    const err = new HttpError('Find details failed, please try again later', 500);
        return next(err);
    }
    response.json({details: details.map(detail => detail.toObject({getters : true}))}); 
};



const deleteOrder = async (request,response,next) =>{ // transaccion con detalles funcionando!!!
    const orderId = request.params.id;

    let order;                                    
    try {                                           
        order = await Order.findById(orderId); 
                        
    } catch (error) {
    
        const err = new HttpError('Something went wrong, could not delete order',500);        
        return next(err); 
    } 

    if(!order){
        const err = new HttpError('Could not find order for this id',404);        
        return next(err);
    }


    try {
        // es para crear una sesion para una transaccion...
    const session =  await mongoose.startSession();                              
            session.startTransaction();
            await order.deleteOne({session: session});                                 
            await DetailOrder.deleteMany({_id:{$in:order.detailOrders}},{session:session}); // busco la orden con todas las de los detalles
            await session.commitTransaction();
        } catch (err) {
    
        
        const error = new HttpError('delete Order faild please try again...',500);
    
    return next(error); 
    }
            
    response.status(200).json({message:'Delete order...'});
    
};

exports.getOrders = getOrders; // ok
exports.getOrderById = getOrderById; // ok
exports.getDetailsOrder = getDetailsOrder; // ok
exports.createOrder = createOrder;// ok
exports.addProduct = addProduct; // ok 
exports.updateProduct = updateProduct; //ok!!!
exports.deleteOrder = deleteOrder;//ok transaccion con detalle
exports.deleteProduct= deleteProduct; // funcionando oK-


