require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); // Добавляем импорт модуля session
const path = require('path');
const { User } = require('./config/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Настройка сессии
app.use(session({
    secret: 'secret-key', // Секретный ключ для подписи куки-идентификатора сессии
    resave: false,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('dist'));
app.use(express.static('public'));

const userController = require('./controllers/userController');

const userRoutes = require('./routes/userRoutes');
app.use(userRoutes);

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.render('about', { user: req.session.userId });
});

app.get('/map', async (req, res) => {
    // Получение идентификатора пользователя из сессии
    const userId = req.session.userId;
    // console.log(userId)
    // Проверка наличия пользователя в сессии
    if (!userId) {
        // Пользователь не авторизован, выполните необходимые действия, например, перенаправление на страницу авторизации
        return res.redirect('/login');
    }

    try {
        // Получение данных о пользователе из базы данных
        const user = await User.findByPk(userId);
        res.locals.message = req.session.message;
        // Отображение информации о текущем пользователе на странице
        res.render('map', {
            user: user,
            YANDEX_STATIC_API_KEY: process.env.YANDEX_STATIC_API_KEY,
            YANDEX_SUGGEST_API_KEY: process.env.YANDEX_SUGGEST_API_KEY,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Int Server Error' });
    }
});

// Добавление маршрута для выхода из сессии
app.get('/logout', (req, res) => {
    // Удаление идентификатора пользователя из сессии
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Int Server Error' });
        } else {
            // После успешного выхода из сессии выполнить перенаправление на главную страницу или другую страницу

            res.redirect('/about?message=Успешный+выход!&status=success');
        }
    });
});


app.get('/registration', (req, res) => {
    res.render('registration', { user: req.user });
});

app.get('/login', (req, res) => {
    res.locals.message = req.session.message;
    res.render('login', { user: req.user }); // Предположим, что пользователь определен в объекте запроса req
});

app.listen(3000, (error) => {
    if (error) {
        return console.log('Ошибка:' + error);
    }
    console.log(new Date().toLocaleTimeString());
    console.log('Сервер запущен на http://localhost:3000');
});