const express = require('express'); 
const {check} = require('express-validator');
const categoryController = require('../controllers/category-controller');


const router = express.Router();

router.get('/',categoryController.getCategories);

router.get('/:id',categoryController.getCategoryById);
                
router.post('/new',[check('name')
                            .notEmpty(),
                        check('description')
                            .notEmpty(),
                            ], categoryController.createCategory);

router.patch('/:id',[check('name')
                            .notEmpty(),
                        check('description')
                            .notEmpty(),
                            ], categoryController.updateCategory);  
                        
router.delete('/:id',categoryController.deleteCategory);
router.delete('/delete2/:id',categoryController.deleteCategory2);

module.exports = router;