require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const path = require('path');

const userController = require('./controllers/userController');


const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static('public'));


app.post('/users', userController.createUser);
app.get('/users', userController.getAllUsers);
app.get('/users/:id', userController.getUserById);
app.put('/users/:id', userController.updateUser);
app.delete('/users/:id', userController.deleteUser);

app.get('/registration', (req, res) => {
    res.render('registration');
});

app.get('/map', (req, res) => {
    res.render('map', {
        YANDEX_STATIC_API_KEY: process.env.YANDEX_STATIC_API_KEY,
        YANDEX_SUGGEST_API_KEY: process.env.YANDEX_SUGGEST_API_KEY
    });
});


app.post('/auth/login', (req, res) => {
    // TO-DO
});

app.listen(3000, (error) => {
    if (error) {
        return console.log('Ошибка:' + error);
    }

    console.log('Сервер запущен на http://localhost:3000');
});