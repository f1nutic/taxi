const { Trip, User } = require('../config/database');
const moment = require('moment');

exports.createOrder = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect(`/login?message=Вы+не+авторизованы&status=fail`);
    }

    const { point_start, point_final, cost, route_data } = req.body;
    try {
        const newTrip = await Trip.create({
            customer: req.session.userId,
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

        console.log(trip.time_create);

        const renderOptions = {
            trip,
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




