const express = require('express');
const productController = require('../controllers/product-controller');
const {check} = require('express-validator');
const router = express.Router();

router.get('/:id',productController.getProductById); 

router.get('/',productController.getProducts);// le paso el controlador que necesito... para cada ruta

router.get('/category/:id', productController.getProductsByCategory); 

router.post('/new',
            //fileUpload.single('image'), /// con esto extraigo la imagen desde el front
                [check('name')
                    .not()
                    .isEmpty(),
                check('description')
                    .isLength({min:5}),
                check('price')
                    .not()
                    .isEmpty(), check('category')
                    .not()
                    .isEmpty()] , productController.createProduct);// con el check q paso por parametro valido y l oconfiguro como quiera

router.patch('/:id',[check('name')
                        .not()
                        .isEmpty(),
                    check('description')
                        .isLength({min:5}),
                        check('price')
                    .not()
                    .isEmpty()], productController.updateProduct);

router.delete('/:id',productController.deleteProduct);

module.exports = router; // con esto exporto el router a app.js para cuando se inicie la app se utilice