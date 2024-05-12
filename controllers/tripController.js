const { Trip, User,sequelize } = require('../config/database');

exports.createOrder = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'В сессии нет пользователя', status: 'fail' });
    }

    const { point_start, point_final, cost, route_data } = req.body;
    console.log(route_data);
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

        res.json({ message: `Заказ №${newTrip.id} создан. Ожидайте.`, status: 'success' });        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Ошибка: ${error}`, status: 'fail' });
    }
};

exports.getTripById = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'В сессии нет пользователя', status: 'fail' });
    }

    try {
        const trip = await Trip.findOne({
            where: {
                id: req.params.id,
                customer: req.session.userId
            }
        });

        if (!trip) {
            return res.status(404).json({ message: 'Поездка не найдена', status: 'fail' });
        }

        const user = await User.findByPk(req.session.userId); // Получаем информацию о пользователе

        const renderOptions = {
            trip,
            user, // Добавляем пользователя для доступа в шаблоне
            YANDEX_STATIC_API_KEY: process.env.YANDEX_STATIC_API_KEY,
            YANDEX_SUGGEST_API_KEY: process.env.YANDEX_SUGGEST_API_KEY
        };

        res.render('tripInfo', renderOptions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Ошибка: ${error}`, status: 'fail' });
    }
};




