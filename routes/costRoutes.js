const express = require('express');
const router = express.Router();

const costPerKm = 15;
const costPerMinute = 3;
const baseRate = 70;
const trafficCoefficient = 5;

router.post('/calculate-cost', (req, res) => {
    try {
        const { distance, distanceInKM ,duration, trafficScore } = req.body;
        let cost;
        if (distanceInKM === true) {
            // Расчёт стоимости, если КМ пришли
            cost = baseRate
                + (costPerKm * distance)
                + (costPerMinute * duration)
                + (trafficCoefficient * trafficScore * distance);
        } else {
            // Расчёт стоимости, если М пришли
            cost = baseRate
                + 20
                + (costPerMinute * duration)
                + (trafficCoefficient * trafficScore);
        }

        res.json({ cost: cost });
    } catch (error) {
        return res.redirect(`/map?message=Ошибка+сервера&status=fail`);
    }
});

module.exports = router;