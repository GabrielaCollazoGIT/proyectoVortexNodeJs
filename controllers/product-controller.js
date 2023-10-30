const HttpError = require('../models/http-error');
const Product = require('../models/product');
const Category = require('../models/category');

const getProductById = async (request,response,next) => { // luego de la ruta de la app le paso la
    console.log('Get request en Product');
    const productId = request.params.id;// obtengo el id de la request {id:'1'}
                                 // DUMMY_Productfind(p => { // puedo usar el find porq es un array y filtrar
    let product;                            ///return p.id === productId; // si lo que esta en el array es igual a lo que me devuelve la request
        try {
            product = await Product.findById(productId);
        } catch (error) {
            const err = new HttpError('Somthing went wrong, couldn´t not find a product', 500);
            return next(err);
        }
    if(!product){
        const error = new HttpError('Could not find a product for the provided id',404); // aca construyo el objeto error
           return next(error); // el throw me sirve solo para sincronismo, cuando uso async va el next(); ej ir a la DB
    }

                    // convierto el product a javascript object y agrego getters, porque mongoose tiene metodos geters para acceder al id, como un string sin el _id                                                               // si el nombre de la variable es igua al de la propiedad lo invoco directamente {place} =>{place:place}       //.Json lo manda a los headers  como Content-Type: application/json
    response.json({product: product.toObject( {getters: true} )} ); // es un metodo Json en el objeto de respuesta(toma cualquier data que  pueda ser connvertida a un Json valido
                     // como un objeto, un array , un numero , un bool o un string) en este caso pase un objeto con la propiedad de mensaje
                     // Esta respuesta se devuelve automaticamente cuanfo se llama a este Json
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
        category: request.categoryData.categoryId // extraigo el id del check middleware
    });      

let category; 

    try {
      category = await Category.findById(request.categoryData.categoryId); // accedemos a la propiedad de la categoria(el id), para saber si ya esta guardada en la bd(si existe ya)
        console.log(category);
    } catch (error) {
        console.log(error);
        const err = new HttpError('Creating place failed, please try again',500);        
            return next(err); 
    }

   if(!category){ // si la category no esta en la base de datos
       category = null  //return next( new HttpError('Could not find the category for provided id', 404));
    }

        try {
           // es para crear una sesion para una transaccion...
       const session =   await mongoose.startSession();                              
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


exports.getProductById = getProductById;
exports.createProduct = createProduct;