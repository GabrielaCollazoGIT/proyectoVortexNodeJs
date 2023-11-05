const HttpError = require('../models/http-error'); // la importo y por convencion empieza con mayuscula
const Product = require('../models/product');
const Order = require('../models/order');
const { default: mongoose } = require("mongoose");
const {validationResult} = require('express-validator');
const DetailOrder = require('../models/deatil-order');
const order = require('../models/order');





///// ALL Orders//// --- listo
const getOrders = async (request,response,next) =>{
    let orders;
    try {
        orders = await Order.find().populate('detailOrders');      
        console.log(orders);
} catch (error) {
    console.log(error);
    const err = new HttpError('Find orders failed, please try again later', 500);
        return next(err);
    }
    response.json({orders: orders.map(order => order.toObject({getters : true}))});
}
///// Order BY Id --- listo
const getOrderById = async (request,response,next) =>{
    const orderId = request.params.id;
    console.log(orderId);
    let order;                        
        try {
            order = await Order.findById(orderId).populate('detailOrders');
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
        detailOrder: [],
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
/// Update Carrito

const updateProduct  = async(request, response, next) =>{ // anda, ver si refatorizo.....
    console.log('Update request en updateProduct');
    const order = request.params.id; 
    const detailOrder = request.body.detail;
    const product = request.body.product;
    const newQuantity = request.body.quantity;

let productFind;                           
        try {
            productFind = await Product.findById(product).populate('category');
            console.log(productFind);
        } catch (error) {
            console.log(error);
            const err = new HttpError('Something went wrong, couldn´t not find a product', 500);
            return next(err);
        }

    let detailFind;                           
    try {
        detailFind = await DetailOrder.findById(detailOrder).populate('product');
        console.log('detealle en detail find'+detailFind);
    } catch (error) {
        console.log(error);
        const err = new HttpError('Something went wrong, couldn´t not find a detail', 500);
        return next(err);
    }
    let orderSale 
    try {
        orderSale = await Order.findById(order).populate('detailOrders')
        console.log(orderSale);
    } catch (error) {
        console.log(error);
        const err = new HttpError('Something went wrong, couldn´t not find a order', 500);
        return next(err);
    }
    
    let newChar = [];
    const {detailOrders} = orderSale; // obtengo el carrito, la cantidad y el total
    newChar = [...detailOrders];// me traigo lo que tiene la ordeb de venta ya
    let finalAmount = 0;
    let finalQuantity = 0;
    const exist = orderSale.detailOrders.some( detail => detail.id == detailFind.id);
    console.log('exist....: '+exist);
    if(exist){
               // Actualizar cantidad con map(es como un foreach pero me hace una copia nva del carrito)!!
                newChar = detailOrders.map(detail => {
                if(detail.id != detailFind.id){
                    finalAmount += detail.amount * detail.quantity;
                    finalQuantity += detail.quantity;
                    console.log('Datos a calcular'+ detail.amount + '--------'+detail.quantity);

                    return detail;
                    
                     // retorna los objetos actualizados
                }else{
                    detail.quantity = newQuantity;
                

                    finalAmount += detail.amount * detail.quantity;
                    finalQuantity += detail.quantity;
                    console.log('Datos a calcular'+ finalQuantity);
                    console.log('detail.find.ID:'+detailFind.id);
                    console.log('detail.ID:'+detail.id);
                    console.log('detail amount:'+detail.amount);
                    console.log(detail);
                    return detail; // retorna los objetos que no son los duplicados
                
                }
            
        });

        orderSale.quantity = finalQuantity;
        orderSale.amount = finalAmount;
        console.log(`amount en el si existe = false ${orderSale.quantity}`);
         // copia la actualizacion de cursos, que es una copia nueva de carrito con el map que lo va a crear y lo va a actualizar
    
        newChar = [...newChar]; 
        orderSale.detail = newChar;
    }
    

    console.log(orderSale.products);
    console.log(orderSale.quantity);
    console.log(orderSale.amount);
    console.log(orderSale);
    
    try {
        // es para crear una sesion para una transaccion...
const session =  await mongoose.startSession();                              
            session.startTransaction();
            await  orderSale.save({session: session});                                    
            await detailOrder.save({session:session});
            await session.commitTransaction();
        } catch (err) {
        console.log(err);
        
        const error = new HttpError('add product faild please try again2...',500);

    return next(error); 
    }

response.status(200).json({order: orderSale.toObject({getters: true})});
}



const addProduct  = async(request, response, next) =>{ // falta validar si viene un producto q ya esta, que no se pueda agregar... porq es lo hacemos en el update
        console.log('Post request en AddProduct');
        const orderId = request.params.id; 
        const productId = request.body.product; 
        const quantity = request.body.quantity;
    
        let product;                           
            try {
                product = await Product.findById(productId).populate('category');
                console.log(product);
            } catch (error) {
                console.log(error);
                const err = new HttpError('Something went wrong, couldn´t not find a product', 500);
                return next(err);
            }
        let orderSale;
        try {
            orderSale = await Order.findById(orderId).populate('detailOrders');
            console.log(orderSale);
        } catch (error) {
            console.log(error);
            const err = new HttpError('Something went wrong, couldn´t not find a order', 500);
            return next(err);
        }
        const {detailOrders} = orderSale;
        const exist = detailOrders.some( detail => detail.product == product);
        
        if(exist){
            console.log(exist);
            const err = new HttpError('The product already is in this Order, please try another', 404);
            return next(err);
        }
        
        
        const {price} = product;

        const detailOrder = new DetailOrder();
         // obtengo el carrito, la cantidad y el total
    
        detailOrder.product = product;
        detailOrder.quantity = quantity;
        detailOrder.amount = price *quantity;
    
        orderSale.amount += price * quantity;
        orderSale.quantity+= quantity;
        
        try {
            // es para crear una sesion para una transaccion...
    const session =  await mongoose.startSession();                              
                session.startTransaction();
                orderSale.detailOrders.push(detailOrder); 
                await  orderSale.save({session: session});
                await detailOrder.save({session:session});
                await session.commitTransaction();
            } catch (err) {
            console.log(err);
            
            const error = new HttpError('add product faild please try again2...',500);

        return next(error); 
        }

    response.status(200).json({order: orderSale.toObject({getters: true})});
};







// //// Delete Product..... elimina de a 1, deberia eliminar todo el que tenga ese id...., me puede servir para el update
// const deleteProduct  = async(request, response, next) =>{
//     console.log('Delete request en deleteProduct');
//     const order = request.params.id; 
//     const product = request.body.product

//     let productFind;                           
//         try {
//             productFind = await Product.findById(product).populate('category');
//             console.log(productFind);
//         } catch (error) {
//             console.log(error);
//             const err = new HttpError('Something went wrong, couldn´t not find a product', 500);
//             return next(err);
//         }
//     let orderSale 
//     try {
//         orderSale = await Order.findById(order).populate('products')
//         console.log(orderSale);
//     } catch (error) {
//         console.log(error);
//         const err = new HttpError('Something went wrong, couldn´t not find a order', 500);
//         return next(err);
//     }
//     const {price} = orderSale
// console.log(price);

//     orderSale.amount -= price;
//     orderSale.quantity -= 1;
//     orderSale.products = orderSale.products.pop(product => product.id === productFind.id);

//     console.log(orderSale.products);
//     console.log(orderSale.quantity);
//     console.log(orderSale.amount);
//     try {
//         await orderSale.save();
//         } catch (error) {
//             console.log(error);
//             const err = new HttpError('Something went wrong, could not delete the product',500);        
//             return next(err); 
//         }        
                            
//         response.status(200).json({order: orderSale.toObject({getters: true})});
// }



const deleteProduct = async (request,response, next) =>{ /// el detalle con los productos que viene x id
    console.log('Delete request en DeleteProduct2');
        const orderId = request.params.id; 
        const productId = request.body.product; 


        let product;                           
            try {
                product = await Product.findById(productId).populate('category');
                console.log(product);
            } catch (error) {
                console.log(error);
                const err = new HttpError('Something went wrong, couldn´t not find a product', 500);
                return next(err);
            }

        let orderSale; 
        try {
            orderSale = await Order.findById(orderId).populate('detailOrders');
            console.log(orderSale);
        } catch (error) {
            console.log(error);
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
            if(detail.product == productId){
                finalAmount = detail.amount; 
                finalQuantity = detail.quantity;
                console.log('Datos a calcular'+ detail.amount + '--------'+detail.quantity);
                detailNvo = detail;
                console.log(detailNvo);
            
            }
        });
            
        
        orderSale.quantity-= finalQuantity;
        orderSale.amount -= finalAmount;
        console.log(`amount en el si existe = false ${orderSale.quantity}`);
        // copia la actualizacion de cursos, que es una copia nueva de carrito con el map que lo va a crear y lo va a actualizar
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
            console.log(err);
            
            const error = new HttpError('delete product faild please try again...',500);
            return next(error); 
        }

    response.status(200).json({order: orderSale.toObject({getters: true})});
}


const updateProduct2  = async(request, response, next) =>{ // anda, ver si refatorizo.....
    console.log('Update request en updateProduct');
    const order = request.params.id; 
    const product = request.body.product;
    console.log(product);
    const newQuantity = request.body.quantity;

    //users = await User.find({},'-password'); traigo lo que quiero menos ese atributo...
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
        orderSale = await Order.findById(order).populate('detailOrders')
        console.log(orderSale);
    } catch (error) {
        console.log(error);
        const err = new HttpError('Something went wrong, couldn´t not find a order', 500);
        return next(err);
    }
    
    let newDetail = [];
    const detailOrder = new DetailOrder();
    const {detailOrders} = orderSale; // obtengo el carrito, la cantidad y el total
    newDetail = [...detailOrders];// me traigo lo que tiene la ordeb de venta ya
    let finalAmount = 0;
    let finalQuantity = 0;
    const exist = orderSale.detailOrders.some( detail => detail.product == productFind);
    console.log('exist....: '+exist);
    if(exist){
               // Actualizar cantidad con map(es como un foreach pero me hace una copia nva del carrito)!!
                newDetail = detailOrders.map(detail => {
                if(detail.id != detailFind.id){
                    finalAmount += detail.amount * detail.quantity;
                    finalQuantity += detail.quantity;
                    console.log(detail.product);
                    console.log('Datos a calcular'+ detail.amount + '--------'+detail.quantity);

                    return detail;
                    
                     // retorna los objetos actualizados
                }else{
                    detail.quantity = newQuantity;
                

                    finalAmount += detail.amount * detail.quantity;
                    finalQuantity += detail.quantity;
                    console.log('Datos a calcular'+ finalQuantity);
                    console.log('detail.find.ID:'+detailFind.id);
                    console.log('detail.ID:'+detail.id);
                    console.log('detail amount:'+detail.amount);
                    console.log(detail);
                    return detail; // retorna los objetos que no son los duplicados
                
                }
            
        });

        orderSale.quantity = finalQuantity;
        orderSale.amount = finalAmount;
        console.log(`amount en el si existe = false ${orderSale.quantity}`);
         // copia la actualizacion de cursos, que es una copia nueva de carrito con el map que lo va a crear y lo va a actualizar
    
        newDetail = [...newDetail]; 
        orderSale.detail = newDetail;

    }
    
    
    console.log(orderSale.products);
    console.log(orderSale.quantity);
    console.log(orderSale.amount);
    console.log(orderSale);
    
    try {
        // es para crear una sesion para una transaccion...
const session =  await mongoose.startSession();                              
            session.startTransaction();
            await  orderSale.save({session: session});                                    
            await newDetail.save({session:session});
            await session.commitTransaction();
        } catch (err) {
        console.log(err);
        
        const error = new HttpError('add product faild please try again2...',500);

    return next(error); 
    }

response.status(200).json({order: orderSale.toObject({getters: true})});
}


///// ALL Details//// --- listo
const getDetailsOrder = async (request,response,next) =>{

    let details;
    try {
        details = await DetailOrder.find().populate('product');      
        console.log(details);
} catch (error) {
    console.log(error);
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
        // es para crear una sesion para una transaccion...
    const session =  await mongoose.startSession();                              
            session.startTransaction();
            await order.deleteOne({session: session});                                 
            await DetailOrder.deleteMany({_id:{$in:order.detailOrders}},{session:session}); // busco la orden con todas las de los detalles
            await session.commitTransaction();
        } catch (err) {
        console.log(err);
        
        const error = new HttpError('delete Order faild please try again...',500);
    
    return next(error); 
    }
            
    response.status(200).json({message:'Delete order...'});
    
};


exports.getOrders = getOrders; // ok
exports.getOrderById = getOrderById; // ok
exports.getDetailsOrder = getDetailsOrder; // ok
exports.createOrder = createOrder;// ok
exports.addProduct = addProduct; // ok // ver de si puedo mostrar el producto en el detalle
exports.updateProduct = updateProduct; // modifico, agrego, elimino, 
exports.deleteOrder = deleteOrder;//ok transaccion con detalle
exports.deleteProduct= deleteProduct; // funcionando oK---- ver lo de si existe
exports.updateProduct2 = updateProduct2; // modifico, agrego, elimino, cambio cliente, etc


