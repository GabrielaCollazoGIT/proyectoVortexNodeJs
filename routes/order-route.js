const express = require('express'); 
const {check} = require('express-validator');
const saleOrderController = require('../controllers/saleOrder-controller');


const router = express.Router();

router.get('/',saleOrderController.getOrders);

router.get('/:id',saleOrderController.getOrderById);

router.get('/details/:id', saleOrderController.getDetailsOrder);
                
router.post('/new', [check('client')
                            .notEmpty(),
                            ], saleOrderController.createOrder);

router.patch('/addProduct/:id',[check('product')
                            .notEmpty(),
                            ], saleOrderController.addProduct);
                            
router.patch('/updateProduct/:id',[check('product')
                            .notEmpty(),
                            check('quantity').notEmpty()], saleOrderController.updateProduct);

router.patch('/deleteProduct/:id',[check('product')
                            .notEmpty(),
                            ],saleOrderController.deleteProduct);

router.delete('/:id',saleOrderController.deleteOrder); 


module.exports = router;