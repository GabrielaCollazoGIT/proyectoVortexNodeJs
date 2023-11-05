const express = require('express');
const productController = require('../controllers/product-controller');
const {check} = require('express-validator');
const router = express.Router();

router.get('/:id',productController.getProductById); 

router.get('/',productController.getProducts);

router.get('/category/:id', productController.getProductsByCategory); 

router.post('/new',
        
                [check('name')
                    .not()
                    .isEmpty(),
                check('description')
                    .isLength({min:5}),
                check('price')
                    .not()
                    .isEmpty(), check('category')
                    ] , productController.createProduct);// con el check q paso por parametro valido y l oconfiguro como quiera

router.patch('/:id',[check('name')
                        .not()
                        .isEmpty(),
                    check('description')
                        .isLength({min:5}),
                    check('price')
                        .not()
                        .isEmpty(),check('category')
                        ], productController.updateProduct);

router.delete('/:id',productController.deleteProduct);

module.exports = router; 