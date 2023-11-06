const HttpError = require('../models/http-error');
const Product = require('../models/product');
const Category = require('../models/category');
const { default: mongoose } = require("mongoose");
const {validationResult} = require('express-validator');

const getProductById = async (request,response,next) => { 
    console.log('Get request en Product');
    const productId = request.params.id; 

    let product;                           
        try {
            product = await Product.findById(productId).populate('category');  
        } catch (error) {
            console.log(error);
            const err = new HttpError('Something went wrong, couldn´t not find a product', 500);
            return next(err);
        }
    if(!product){
        const error = new HttpError('Could not find a product for the provided id',404); // aca construyo el objeto error
        return next(error);  
    }

                    
    response.json({product: product.toObject( {getters: true} )} ); 
}; 
const getProducts = async (request,response,next) => { 
    console.log('Get request en Products');
    let products;
    try {
    products = await Product.find().populate('category');  
} catch (error) {
    const err = new HttpError('Find products failed, please try again later', 500);
    console.log(error);
    return next(err);
    }
    response.json({products: products.map(product => product.toObject({getters : true}))});       
}; 


const getProductsByCategory = async (request,response,next)=>{
    let products;
    const categoryId = request.params.id;
try {
    products = await Product.find({ category: categoryId}).populate('category');     
} catch (error) {
    console.log(error);
    const err = new HttpError('find products failed, please try again later',500);
    return next(err);
}


response.json({products: products.map(product=> product.toObject({getters: true}))}); // ruta de categories: product/category/1

};


const createProduct = async (request,response,next)=>{
    const errors = validationResult(request); // agrego la funcion para que el objeto de la request vea si alguna validacion que tenga que pasar
    if(!errors.isEmpty()){
    return next(new HttpError('Invalid input passed, please check your data.', 422)); 
} 

 // extraigo los datos de la request
    const { name, description,price,category} = request.body; 
    let categoryFind; 
    if(category === ""){
        categoryFind = null;
    }else{
    try {
        categoryFind= await Category.findById(category); // accedemos a la propiedad de la categoria(el id), para saber si ya esta guardada en la bd(si existe ya)
        console.log(categoryFind);
    } catch (error) {
        console.log(error);
        const err = new HttpError('Creating product failed, please try again',500);        
            return next(err); 
    }
}

   // armo el objeto
    const createdProduct = new Product({ 
        
        name,
        description,
        price,
        category:categoryFind// extraigo el id del check middleware
    });      


        try {
           // es para crear una sesion para una transaccion...
                await  createdProduct.save();  
                
            } catch (err) {
            console.log(err);
            
            const error = new HttpError('Creating product faild please try again2...',500);

            return next(error); 
        }

    response.status(201).json({product: createdProduct});// 201 es codigo de creado por convencion// y devuelvo el objeto que tiene una propiedad place
};


const updateProduct = async (request,response,next) =>{
    const errors = validationResult(request); 
    if(!errors.isEmpty()){
        return next( new HttpError('Invalid input passed, please check your data.', 422));
    }
    
    const { name, description, price, category}= request.body; 
    const productId = request.params.id; 
    
    let product;                                               
        try {
            product = await Product.findById(productId).populate('category');  
            } catch (error) {
            const err = new HttpError('Something went wrong, could not update product',500);        
            return next(err);    
        }                                
        
    product.name = name; // las variables que tengo en la request.body
    product.description = description;
    product.price = price;
    product.category = category;


    try {
        await product.save();
    } catch (error) {
        const err = new HttpError('Something went wrong, could not update product',500);        
            return next(err); 
    }
    response.status(200).json({product: product.toObject({getters: true}) });
};

const deleteProduct = async (request,response,next) =>{
    const productId = request.params.id;

    let product;                                    
    try {                                           
        product = await Product.findById(productId).populate('category'); 
        console.log(product);                         
    } catch (error) {
        console.log(error);
        const err = new HttpError('Something went wrong, could not delete product',500);        
            return next(err); 
    } 

    if(!product){
        const err = new HttpError('Could not find product for this id',404);        
        return next(err);
    }

    try {
        
        await product.deleteOne();
    } catch (error) {
        const err = new HttpError('Something went wrong, could not delete product',500);        
        return next(err); 
    }        
                        
    response.status(200).json({message:'Deleted product...'});
    
};





exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.getProducts = getProducts;
exports.getProductsByCategory = getProductsByCategory;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;