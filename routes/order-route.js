const express = require('express'); 
const {check} = require('express-validator');
const saleOrderController = require('../controllers/saleOrder-controller');


const router = express.Router();

router.get('/',saleOrderController.getOrders);

router.get('/:id',saleOrderController.getOrderById);
                
router.post('/new', [check('client')
                            .notEmpty(),
                            ], saleOrderController.createOrder);

router.post('/addProducts',[check('products')
                            .notEmpty(),
                        check('cantidad')
                            .notEmpty(),
                            ], saleOrderController.addProducts);
                            

router.delete('/:id',saleOrderController.deleteOrder); 


module.exports = router;