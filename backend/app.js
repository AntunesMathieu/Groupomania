const express = require('express');
const dotenv = require ('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const helmet = require("helmet");
const rateLimit = require('express-rate-limit');

const MONGODB = process.env.MONGODB
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');

mongoose.connect(MONGODB,
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true 
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: false }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 150, //Limitez chaque ip à 100 requêtes par windowMs
    message: 'Trop de requête ont été effectuées !'
});

//Appliquer à toutes les demandes
app.use(limiter); //app.use('/api/, limiter)


app.use('/api/auth', userRoutes);
app.use('/api/post', postRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;