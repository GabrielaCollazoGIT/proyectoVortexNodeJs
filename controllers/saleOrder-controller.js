const HttpError = require('../models/http-error'); // la importo y por convencion empieza con mayuscula
const Product = require('../models/product');
const Order = require('../models/order');
const { default: mongoose } = require("mongoose");
const {validationResult} = require('express-validator');
const product = require('../models/product');




///// ALL Orders//// --- listo
const getOrders = async (request,response,next) =>{
    let orders;
    try {
        orders = await Order.find().populate('products');      
        console.log(orders);
} catch (error) {
    console.log(error);
    const err = new HttpError('Find orders failed, please try again later', 500);
        return next(err);
    }
    response.json({orders: orders.map(order => order.toObject({getters : true}))}); 
};
///// Order BY Id --- listo
const getOrderById = async (request,response,next) =>{
    const orderId = request.params.id;
    console.log(orderId);
    let order;                        
        try {
            order = await Order.findById(orderId).populate('products');
            console.log(order);
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
    console.log(errors);
    if(!errors.isEmpty()){

        return next (new HttpError('Invalid input passed, please check your data.', 422));
    } 

    const {client} = request.body;  

    const createOrder = new Order({
        date: new Date(),
        client,
        products: [],
        quantity:0,
        amount: 0
    });
    console.log(createOrder);
    try {
        await createOrder.save(); 
    } catch (err) {
        console.log(err)
        const error = new HttpError('Save Order failded please try again...',500);

        return next(error);
    }
                            
    response.status(201).json({order: createOrder.toObject({getters: true}) });
};
/// Add Carrito

const addProduct  = async(request, response, next) =>{ // anda, ver si refatorizo.....
    console.log('Post request en AddProduct');
    const order = request.params.id; 
    const product = request.body.product

    let productFind;                           
        try {
            productFind = await Product.findById(product).populate('category');
            console.log(productFind);
        } catch (error) {
            console.log(error);
            const err = new HttpError('Something went wrong, couldn´t not find a product', 500);
            return next(err);
        }
    let orderSale 
    try {
        orderSale = await Order.findById(order).populate('products')
        console.log(orderSale);
    } catch (error) {
        console.log(error);
        const err = new HttpError('Something went wrong, couldn´t not find a order', 500);
        return next(err);
    }
    const {price} = productFind;
console.log(price);
    const {products} = orderSale; // obtengo el carrito, la cantidad y el total
    let carritoNvo = [...products,productFind];
    orderSale.amount += price;
    orderSale.quantity += 1;
    orderSale.products = carritoNvo;

    console.log(carritoNvo);
    console.log(orderSale.quantity);
    console.log(orderSale.amount);
    try {
        await orderSale.save();
        } catch (error) {
            console.log(error);
            const err = new HttpError('Something went wrong, could not add the prooduct',500);        
            return next(err); 
        }        
                            
        response.status(200).json({order: orderSale.toObject({getters: true})});
}

//// Delete Product
const deleteProduct  = async(request, response, next) =>{
    console.log('Post request en deleteProduct');
    const order = request.params.id; 
    const product = request.body.product

    let productFind;                           
        try {
            productFind = await Product.findById(product).populate('category');
            console.log(productFind);
        } catch (error) {
            console.log(error);
            const err = new HttpError('Something went wrong, couldn´t not find a product', 500);
            return next(err);
        }
    let orderSale 
    try {
        orderSale = await Order.findById(order).populate('products')
        console.log(orderSale);
    } catch (error) {
        console.log(error);
        const err = new HttpError('Something went wrong, couldn´t not find a order', 500);
        return next(err);
    }
    const {price} = productFind;
console.log(price);

    orderSale.amount -= price;
    orderSale.quantity -= 1;
    orderSale.products = orderSale.products.pop(product => product.id === productFind.id);

    console.log(orderSale.products);
    console.log(orderSale.quantity);
    console.log(orderSale.amount);
    try {
        await orderSale.save();
        } catch (error) {
            console.log(error);
            const err = new HttpError('Something went wrong, could not delete the product',500);        
            return next(err); 
        }        
                            
        response.status(200).json({order: orderSale.toObject({getters: true})});
}







const deleteOrder = async (request,response,next) =>{ // lista....
    const orderId = request.params.id;

    let order;                                    
    try {                                           
        order = await Order.findById(orderId); 
        console.log(order);                         
    } catch (error) {
        console.log(error);
        const err = new HttpError('Something went wrong, could not delete order',500);        
        return next(err); 
    } 

    if(!order){
        const err = new HttpError('Could not find order for this id',404);        
        return next(err);
    }

    try {
    await order.deleteOne();
    } catch (error) {
        console.log(error);
        const err = new HttpError('Something went wrong, could not delete order',500);        
        return next(err); 
    }        
                        
    response.status(200).json({message:'Delete order...'});
    
};


exports.getOrders = getOrders; // ok
exports.getOrderById = getOrderById; // ok
exports.createOrder = createOrder;// ok
exports.addProduct = addProduct;
//exports.updateOrder = updateOrder; // modifico, agrego, elimino, cambio cliente, etc
exports.deleteOrder = deleteOrder;//ok
exports.deleteProduct= deleteProduct;
