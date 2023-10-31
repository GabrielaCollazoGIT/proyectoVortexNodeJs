const HttpError = require('../models/http-error'); // la importo y por convencion empieza con mayuscula
const Category = require('../models/category');
const {validationResult} = require('express-validator');


const getCategories = async (request,response,next) =>{
    let categories;
    try {
    categories = await Category.find({});          

} catch (error) {
    const err = new HttpError('Find categories failed, please try again later', 500);
        return next(err);
    }
    response.json({categories: categories.map(category => category.toObject({getters : true}))}); 
};

const createCategory = async (request,response,next) =>{
    const errors = validationResult(request); 
    console.log(errors);
    if(!errors.isEmpty()){

        return next (new HttpError('Invalid input passed, please check your data.', 422));
    } 

    const  {name,description} = request.body;  
let existingCategorie;

    try {                           
        existingCategorie = await Category.findOne({name: name});
    } catch (error) {
        const err = new HttpError('failed, please try again later', 500);
        return next(err);
    }      
    
        if(existingCategorie){
            const error = new HttpError('Categorie exist already, please choose another instead',422);
            return next(error);
        }
        
    const createCategory = new Category({
        name,
        description,
        products: []
    });
    console.log(createCategory);
    try {
        await createCategory.save(); 
    } catch (err) {
        const error = new HttpError('Save Category failded please try again...',500);

        return next(error);
    }
                            
    response.status(201).json({categoryId:  createCategory.id, name:createCategory.name, description: createCategory.description});
};


const updateCategory = async (request,response,next) =>{
    const errors = validationResult(request); 
    if(!errors.isEmpty()){
        return next( new HttpError('Invalid input passed, please check your data.', 422));
    }
    
    const { name, description}= request.body;
    const categoryId = request.param.id; 
    
    let category;                                               
        try {
            category = await Category.findById(categoryId);  
            } catch (error) {
            const err = new HttpError('Something went wrong, could not update category',500);        
            return next(err);    
        }                                

    category.name = name; // las variables que tengo en la request.body
    category.description = description;
                                                

    try {
        await category.save();
    } catch (error) {
        const err = new HttpError('Something went wrong, could not update category',500);        
            return next(err); 
    }
    response.status(200).json({category: category.toObject({getters: true}) });
};

const deleteCategory = async (request,response,next) =>{
    const categoryId = request.param.id;

    let category;                                    
    try {                                           
        category = await Category.findById(categoryId).populate('product'); 

    } catch (error) {
        const err = new HttpError('Something went wrong, could not delete category',500);        
            return next(err); 
    } 

    if(!category){
        const err = new HttpError('Could not find category for this id',404);        
        return next(err);
    }

    if(product.category.id !== request.categoryData.categoryId){   // /// deberia buscar todos los productos que tienen esa categoria y setearlos en null

        const err = new HttpError('You re not allowed to delete this category',401); // es un error de autorizacion el 401        
        return next(err);
    }
    //const imagePath = product.image; // asigno la variable para eliminar la imagen de mi disco

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await product.remove({session: sess}); // primero deberia elimina la categoria del producto
        product.category.products.pull(product); // elimino el product(product id) de la tabla de la category, porque al usar populate() puedo acceder a el
        await product.category.save({session: sess});
        await sess.commitTransaction();
    } catch (error) {
        const err = new HttpError('Something went wrong, could not delete category',500);        
        return next(err); 
    }        
}

exports.getCategories = getCategories;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;