const { expect } = require('chai');
const sinon = require('sinon');
const { Trip, User, sequelize } = require('../config/database');
const tripController = require('../controllers/tripController');

describe('Trip Controller - createOrder with validation', function () {
    this.timeout(10000);
    let req, res;

    beforeEach(() => {
        // Подготовка запроса и ответа
        req = {
            body: {
                point_start: 'Starting point',
                point_final: 'Final destination',
                cost: 100,
                route_data: 'Route data',
            },
            session: {
                userId: 1, // Имитируем, что пользователь авторизован
            },
        };
        res = {
            redirect: sinon.spy(),
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
        };

        // Подменяем методы модели Trip и User
        sinon.stub(Trip, 'create').resolves({
            id: 1,
            customer: 1,
            driver: 2,
            point_start: 'Starting point',
            point_final: 'Final destination',
            cost: 100,
            status: 1,
            route_data: 'Route data',
            time_create: new Date().toISOString(),
        });

        sinon.stub(User, 'findOne').resolves({
            id: 2,
            user_type: 1,
        });

        sinon.stub(sequelize, 'random').returns('RANDOM()');
    });

    afterEach(() => {
        // Восстанавливаем оригинальные методы
        sinon.restore();
    });

    it('should create a new trip with valid data', async function () {
        // Вызываем метод создания поездки
        await tripController.createOrder(req, res);

        // Проверяем, что поездка была создана
        expect(Trip.create.calledOnce).to.be.true;
        const tripData = Trip.create.getCall(0).args[0];
        expect(tripData.point_start).to.equal('Starting point');
        expect(tripData.point_final).to.equal('Final destination');
        expect(tripData.cost).to.equal(100);
        expect(tripData.route_data).to.equal('Route data');
    });

    it('should handle errors and return a fail status', async function () {
        // Устанавливаем некорректные данные для создания поездки
        req.session.userId = null; // Удаляем userId для симуляции неавторизованного пользователя

        await tripController.createOrder(req, res);

        // Проверяем, что была выполнена перенаправление
        expect(res.redirect.calledOnce).to.be.true;
        expect(res.redirect.getCall(0).args[0]).to.include('/login?message=Вы+не+авторизованы&status=fail');

        // Проверяем, что поездка не была создана
        expect(Trip.create.called).to.be.false;
    });
});
