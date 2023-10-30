const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const productRoutes = require('./routes/product-route');
const HttpError = require('./models/http-error');


const app = express();

app.use('/api/products',productRoutes);
app.use((request,response,next) =>{ // se crea este middleware que maneje cualquier request que venga despues de las rutas, que solo corra sino enviamos una respuesta en alguna de nuestras rutas
    const error = new HttpError('Could not find this route',404);       //porque si no enviamos una respuesta no llamamaos a next();
    throw error;
});

mongoose.connect('mongodb+srv://proyectoVortex:vortex@cluster0.k7wyhqz.mongodb.net/ecommerce?retryWrites=true&w=majority')
.then(()=>{
    app.listen(5000);
})
.catch(err =>{
    console.log(err);
});
