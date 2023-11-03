const express = require('express'); 
const {check} = require('express-validator');
const saleOrderController = require('../controllers/saleOrder-controller');


const router = express.Router();

router.get('/',saleOrderController.getOrders);

router.get('/:id',saleOrderController.getOrderById);
                
router.post('/new', [check('client')
                            .notEmpty(),
                            ], saleOrderController.createOrder);

router.post('/addProduct/:id',[check('product')
                            .notEmpty(),
                            ], saleOrderController.addProduct);
                            
router.patch('/updateProduct/:id',[check('product')
                            .notEmpty(),
                            check('quantity').notEmpty()], saleOrderController.updateProduct);

router.delete('/deleteProduct/:id',[check('product')
                            .notEmpty(),
                            ],saleOrderController.deleteProduct);

router.delete('/:id',saleOrderController.deleteOrder); 


module.exports = router;