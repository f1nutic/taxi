const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

router.post('/create-order', async (req, res) => {
    try {
        await tripController.createOrder(req, res);
    } catch (error) {
        console.log(error);
    }
});

router.post('/create-order', tripController.createOrder);

router.get('/trip/:id', tripController.getTripById);

module.exports = router;