const { Trip, User,sequelize, Car } = require('../config/database');
const moment = require('moment');

exports.createOrder = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect(`/login?message=Вы+не+авторизованы&status=fail`);
    }

    const { point_start, point_final, cost, route_data } = req.body;
    try {  
        // Поиск случайного водителя
        const randomDriver = await User.findOne({
            where: { user_type: 1 }, // Выбираем пользователей с типом 1 (водители)
            order: sequelize.random(), // Случайная сортировка
            limit: 1 // Ограничение выборки одним пользователем
        });

        // Проверка на наличие водителя
        if (!randomDriver) {
            return res.status(404).json({ message: 'Водитель не найден', status: 'fail' });
        }

       

        const newTrip = await Trip.create({
            customer: req.session.userId,
            driver: randomDriver.id, // Сохраняем ID водителя в заказе (может быть полезно для дальнейшего отслеживания)
            point_start,
            point_final,
            cost,
            status: 1,
            route_data,
            time_create: new Date().toISOString()
        });

        // успешный ответ с ID нового заказа
        res.json({
            message: `Заказ №${newTrip.id} успешно создан. Перенаправление на страницу заказа...`,
            status: 'success',
            tripId: newTrip.id
        });

    } catch (error) {
        console.error(error); // TODO loger
        res.status(500).send('Ошибка сервера при создании заказа');
    }
};

exports.getTripById = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect(`/login?message=Вы+не+авторизованы&status=fail`);
    }

    try {
        const trip = await Trip.findOne({
            where: {
                id: req.params.id,
                customer: req.session.userId
            }
        });

        if (!trip) {
            return res.redirect(`/map?message=Поездка+№${req.params.id}+не+найдена&status=fail`);
        }

        const user = await User.findByPk(req.session.userId); // Получаем информацию о пользователе
        const driver = await User.findByPk(trip.driver);
        

        if (!driver) {
            return res.redirect(`/map?message=Водитель+не+найден&status=fail`);
        }
        const car=await Car.findOne({
            where: {
                user: driver.id,
                
            }
        })
        if (!car) {
            return res.redirect(`/map?message=Машина+не+найдена&status=fail`);
        }
        console.log(trip.time_create);

        const renderOptions = {
            trip,
            driver,
            car,
            user,
            YANDEX_STATIC_API_KEY: process.env.YANDEX_STATIC_API_KEY,
            YANDEX_SUGGEST_API_KEY: process.env.YANDEX_SUGGEST_API_KEY,
            moment,
        };
        res.render('tripInfo', renderOptions);
    } catch (error) {
        console.error(error); // TODO loger
        window.showNotification('Ошибка сервера','fail')
    }
};




