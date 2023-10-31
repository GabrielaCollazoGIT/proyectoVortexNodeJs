const express = require('express'); 
const {check} = require('express-validator');
const categoryController = require('../controllers/category-controller');


const router = express.Router();

router.get('/',categoryController.getCategories);
                
router.post('/new',[check('name')
                            .notEmpty(),
                        check('description')
                            .notEmpty(),
                            ], categoryController.createCategory);

module.exports = router;