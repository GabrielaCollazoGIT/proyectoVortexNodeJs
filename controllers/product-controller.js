const HttpError = require('../models/http-error');
const Product = require('../models/product');
const Category = require('../models/category');
const {validationResult} = require('express-validator');

const getProductById = async (request,response,next) => { 
    console.log('Get request en Product');
    const productId = request.params.id; 

    let product;                           
        try {
            product = await Product.findById(productId);
        } catch (error) {
            const err = new HttpError('Somthing went wrong, couldn´t not find a product', 500);
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
    products = await Product.find();          

} catch (error) {
    const err = new HttpError('Find products failed, please try again later', 500);
        return next(err);
    }
    response.json({products: products.map(product => product.toObject({getters : true}))});       
}; 


const getProductsByCategory = async (request,response,next)=>{
    let products;
    const categoryId = request.params.id;
try {
    products = await Product.find({ category: categoryId});     
} catch (error) {
    const err = new HttpError('find products failed, please try again later',500);
    return next(err);
}

    if(!products || products.length === 0){
    return next( new HttpError('Could not find  products for the provided category id',404));
    } 

response.json({products: products.map(product=> product.toObject({getters: true}))}); // ruta de categories: product/category/1

};


const createProduct = async (request,response,next)=>{
    const errors = validationResult(request); // agrego la funcion para que el objeto de la request vea si alguna validacion que tenga que pasar
    if(!errors.isEmpty()){
     return next(new HttpError('Invalid input passed, please check your data.', 422)); // cuando trabajo con async es next() imp
   } // con los next() hay que poner el return porque sino se sigue ejecutando el siguiente bloque

 // extraigo los datos de la request
const { name, description,price} = request.body; // creo las variables(lo que espero de la request con destructuring)
   //es igual a const name = request.body.name;

   // armo el objeto
   const createdProduct = new Product({ // armo el objeto con el model de Schema que creee para este product, mismos atributos sino da error
        
        name,
        description,
        //image: request.file.path,
        price,
        category:request.category.id // extraigo el id del check middleware
    });      

let category; 

    try {
      category = await Category.findById(request.category.id); // accedemos a la propiedad de la categoria(el id), para saber si ya esta guardada en la bd(si existe ya)
        console.log(category);
    } catch (error) {
        console.log(error);
        const err = new HttpError('Creating product failed, please try again',500);        
            return next(err); 
    }

   if(!category){ // si la category no esta en la base de datos
       category = null  //return next( new HttpError('Could not find the category for provided id', 404));
    }

        try {
           // es para crear una sesion para una transaccion...
    const session =  await mongoose.startSession();                              
                session.startTransaction();
                await  createdProduct.save({session: session});  
                category.products.push(createdProduct); // no es el push de agregar a una lista, sino que tambien guarda en la bd la relacion entre los 2 modelos(solo agrega el id )                                                
                await category.save({session:session});
                await session.commitTransaction();// si algo sale mal me asegura que hace un rollBack, es decir o se guarda todo o no se guarda nada
                                               // asi creo el nuevo producto y actualizo las categorias
                                     // Tambien tengo que crear la coleccion(tabla) manualmente en la bd(products).. si no la tengo creada previamente...
            } catch (err) {
            
            
            const error = new HttpError('Creating product faild please try again2...',500);

           return next(error); /// retornamos next() para parar la ejecucion del codigo en caso de que tengamos un error...
        }

    response.status(201).json({product: createdProduct});// 201 es codigo de creado por convencion// y devuelvo el objeto que tiene una propiedad place
};


const updateProduct = async (request,response,next) =>{
    const errors = validationResult(request); // agrego la funcion para que el objeto de la request vea si alguna validacion que tenga que pasar
    if(!errors.isEmpty()){
        return next( new HttpError('Invalid input passed, please check your data.', 422));
    }
    
    const { name, description}= request.body; // creo las variables que quiero modificar(pueden mandar mas datos para modificar pero sera considerados)
    const productId = request.param.id; // el parametro que yo defini en la ruta(IMP!!)
    
    let product;                                               
        try {
            product = await Product.findById(productId);  
            } catch (error) {
            const err = new HttpError('Something went wrong, could not update product',500);        
            return next(err);    
        }                                
        
    product.name = name; // las variables que tengo en la request.body
    product.description = description;
                                                

    try {
        await product.save();
    } catch (error) {
        const err = new HttpError('Something went wrong, could not update product',500);        
            return next(err); 
    }
    response.status(200).json({product: product.toObject({getters: true}) });
};

const deleteProduct = async (request,response,next) =>{
    const productId = request.param.id;

    let product;                                    
    try {                                           
         product = await Product.findById(productId).populate('category'); /// populate me permite acceder a los datos de la otra tabla y trabajar con esos datos solo si hay conexion entre ellos                                                                     //DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId); //es un array nuevo... filtro para que me traiga el q quiero */
                                        // accedo al id de la category, mongoose toma ese id, pero busca toda la informacion de esa category (en esa tabla) me trae todo el objeto
    } catch (error) {
        const err = new HttpError('Something went wrong, could not delete product',500);        
            return next(err); 
    } 

    if(!product){
        const err = new HttpError('Could not find product for this id',404);        
        return next(err);
    }
    if(product.category.id !== request.categoryData.categoryId){
        const err = new HttpError('You re not allowed to delete this product',401); // es un error de autorizacion el 401        
        return next(err);
    }
    //const imagePath = peoduct.image; // asigno la variable para eliminar la imagen de mi disco
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await product.remove({session: sess});
        product.category.products.pull(product); // elimino el product(product id) de la tabla de la category, porque al usar populate() puedo acceder a el
        await product.category.save({session: sess});
        await sess.commitTransaction();
    } catch (error) {
        const err = new HttpError('Something went wrong, could not delete product',500);        
        return next(err); 
    }        
    /*  fs.unlink(imagePath, error =>{
        console.log(error);
    });  */                        
    response.status(200).json({message:'Deleted product...'});
    
};





exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.getProducts = getProducts;
exports.getProductsByCategory = getProductsByCategory;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;