const { Trip } = require('../config/database');

exports.createOrder = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'В сессии нет пользователя', status: 'fail' });
    }

    const { point_start, point_final, cost } = req.body;
    try {
        const newTrip = await Trip.create({
            customer: req.session.userId,
            point_start,
            point_final,
            cost,
            status: 1,
            time_create: new Date().toISOString()
        });

        res.json({ message: `Заказ №${newTrip.id} создан. Ожидайте.`, status: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Ошибка: ${error}`, status: 'fail' });
    }
};

