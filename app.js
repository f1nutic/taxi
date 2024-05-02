require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
// const { Pool } = require('pg');
// const jwt = require('jsonwebtoken');
const path = require('path');


const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('dist'));
app.use(express.static('public'));
// app.use(express.static('validations'));

const userController = require('./controllers/userController');

const userRoutes = require('./routes/userRoutes');
app.use(userRoutes);




app.post('/user', userController.createUser);
app.get('/user', userController.getAllUsers);
app.get('/user/:id', userController.getUserById);
app.put('/user/:id', userController.updateUser);
app.delete('/user/:id', userController.deleteUser);

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/map', (req, res) => {
    res.render('map', {
        YANDEX_STATIC_API_KEY: process.env.YANDEX_STATIC_API_KEY,
        YANDEX_SUGGEST_API_KEY: process.env.YANDEX_SUGGEST_API_KEY
    });
});

app.get('/registration', (req, res) => {
    res.render('registration');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.listen(3000, (error) => {
    if (error) {
        return console.log('Ошибка:' + error);
    }

    console.log('Сервер запущен на http://localhost:3000');
});