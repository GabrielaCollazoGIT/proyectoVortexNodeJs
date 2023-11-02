const HttpError = require('../models/http-error'); // la importo y por convencion empieza con mayuscula
const Category = require('../models/category');
const { default: mongoose } = require("mongoose");
const {validationResult} = require('express-validator');




///// ALL Categories//// chek
const getCategories = async (request,response,next) =>{
    let categories;
    try {
        categories = await Category.find().populate('products');      
        console.log(categories);
} catch (error) {
    console.log(error);
    const err = new HttpError('Find categories failed, please try again later', 500);
        return next(err);
    }
    response.json({categories: categories.map(category => category.toObject({getters : true}))}); 
};
///// Category BY Id
const getCategoryById = async (request,response,next) =>{
    const categoryId = request.params.id;
    console.log(categoryId);
    let category;                        
        try {
            category = await Category.findById(categoryId).populate('products');
            console.log(category);
        } catch (error) {
            const err = new HttpError('Somthing went wrong, couldn´t not find a Category', 500);
            return next(err);
        }
    if(!category){
        const error = new HttpError('Could not find a category for the provided id',404); 
        return next(error); 
    }

                    // convierto el place a javascript object y agrego getters, porque mongoose tiene metodos geters para acceder al id, como un string sin el _id                                                               // si el nombre de la variable es igua al de la propiedad lo invoco directamente {place} =>{place:place}       //.Json lo manda a los headers  como Content-Type: application/json
    response.json({category: category.toObject( {getters: true} )} ); 

};
////// Create Category
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
                            
    response.status(201).json({category: createCategory });
};
/// Update Category

const updateCategory = async (request,response,next) =>{
    
    const errors = validationResult(request); 
    if(!errors.isEmpty()){
        return next( new HttpError('Invalid input passed, please check your data.', 422));
    }
    console.log('request in Update');

    const categoryId = request.params.id;
    console.log(categoryId);
    const { name, description}= request.body;
    
    let category;                                               
        try {
            category = await Category.findById(categoryId);  
            } catch (error) {
                console.log(error);
            const err = new HttpError('Something went wrong, could not update category',500);        
            return next(err);    
        }                                

    category.name = name;
    category.description = description;
                                                

    try {
        await category.save();
    } catch (error) {
        const err = new HttpError('Something went wrong, could not update category',500);        
            return next(err); 
    }
    response.status(200).json({category: category.toObject({getters: true}) });
};
/////// Delete Category
const deleteCategory = async (request,response,next) =>{
    const categoryId = request.params.id;
    console.log('metodo Delete....');
    console.log(categoryId);

    let category;                                    
    try {                                           
        category = await Category.findById(categoryId)

    } catch (error) {
        const err = new HttpError('Something went wrong, could not delete category',500);        
            return next(err); 
    } 

    if(!category){
        const err = new HttpError('Could not find category for this id',404);        
        return next(err);
    }


    try {
        await category.deleteOne();
        
    } catch (error) {
        console.log(error);
        console.log('en el catchs');
        const err = new HttpError('Something went wrong, could not delete category',500);        
        return next(err); 
    }        
    response.status(200).json({message:'Deleted Category...'});
}

const deleteCategory2 = async (request,response,next) =>{
    const categoryId = request.params.id;
    console.log(categoryId);
                                        
    let category;                                    
    try {                                           
        category = await Category.findById(categoryId).populate('products'); 
        console.log(category);
        let products = category.products.map(p =>{
            if(categoryId === p.category.id){

            }
        })

    } catch (error) {
        
        const err = new HttpError('Something went wrong, could not delete the category',500);        
        
        return next(err); 
    } 

    if(!category){
        const err = new HttpError('Could not find category for this id',404);        
        return next(err);
    }
    

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await category.deleteOne({session: sess});
        category.products.map( p => {
            if(category.id === p.category.id)
            p.category.id = null; 
            //console.log(category.products);
            //console.log(category.category.products);
            console.log(p.category.id);
        });
        products.updateMany();
        await sess.commitTransaction();
    } catch (error) {
        console.log(error);
        const err = new HttpError('Something went wrong, could not delete place',500);        
        return next(err); 
    }        
                        
    response.status(200).json({message:'Deleted place 2...'});
    
};


exports.getCategories = getCategories;
exports.getCategoryById = getCategoryById;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.deleteCategory2 = deleteCategory2;