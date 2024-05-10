require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); // Добавляем импорт модуля session
const path = require('path');
const { User } = require('./config/database');
const { Trip } = require('./config/database'); // Импортируем модель Trip
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


const userRoutes = require('./routes/userRoutes');
const costRoutes = require('./routes/costRoutes')
app.use(userRoutes);
app.use(costRoutes);

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.render('about', { user: req.session.userId });
});

app.get('/map', async (req, res) => {
    const userId = req.session.userId; // Получение идентификатора пользователя из сессии

    // Проверка наличия пользователя в сессии
    if (!userId) {
        return res.redirect('/login?message=Вы+не+вошли+в+систему!&status=fail'); // Пользователь не авторизован
    }

    try {
        const user = await User.findByPk(userId); // Получение данных о пользователе из БД
        // res.locals.message = req.session.message;
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

// Пример обработчика для создания заказа
app.post('/create-order', async (req, res) => {
    const { point_start, point_final } = req.body;
    // const userId = req.session.userId; // Получаем идентификатор текущего пользователя

    try {
        // Ваш код для сохранения заказа в базе данных
        // Например, используя модели и методы Sequelize
        const newTrip = await Trip.create({
            point_start,
            point_final,
            // userId,
            // Другие данные заказа, такие как время, стоимость и т.д.
        });

        res.status(201).json({ message: 'Order created successfully', trip: newTrip });
    } catch (error) {
        console.error("Ошибка при создании заказа:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(3000, (error) => {
    if (error) {
        return console.log('Ошибка:' + error);
    }
    console.log(new Date().toLocaleTimeString());
    console.log('Сервер запущен на http://localhost:3000');
});