require('dotenv').config();
const { expect } = require('chai');
const sinon = require('sinon');
const { Trip, User, sequelize } = require('../config/database');
const tripController = require('../controllers/tripController');

describe('Проверка механизма создания поездки', function () {
    this.timeout(10000);
    let req, res;
    let pointStart = 'Начальная точка';
    let pointEnd = 'Конечная точка';
    let costRoute = 100;
    let routeData = 'some'

    beforeEach(() => {
        req = {
            body: {
                point_start: pointStart,
                point_final: pointEnd,
                cost: costRoute,
                route_data: routeData,
            },
            session: {
                userId: 1,
            },
        };
        res = {
            redirect: sinon.spy(),
            json: sinon.spy(),
            status: sinon.stub().returnsThis(),
        };

        sinon.stub(Trip, 'create').resolves({
            id: 1,
            customer: req.session.userId,
            driver: 2,
            point_start: pointStart,
            point_final: pointEnd,
            cost: costRoute,
            status: 1,
            route_data: routeData,
            time_create: new Date().toISOString(),
        });

        sinon.stub(User, 'findOne').resolves({
            id: 2,
            user_type: 1,
        });

        sinon.stub(sequelize, 'random').returns('RANDOM()');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('Создана поездка с верными данными', async function () {
        try {
            await tripController.createOrder(req, res);
            expect(Trip.create.calledOnce).to.be.true;
            const tripData = Trip.create.getCall(0).args[0];
            expect(tripData.point_start).to.equal(pointStart);
            expect(tripData.point_final).to.equal(pointEnd);
            expect(tripData.cost).to.equal(costRoute);
            expect(tripData.route_data).to.equal(routeData);
            console.log('Создана поездка:')
            console.log(tripData);
        } catch (error) {
            expect.fail(error.message);
        }
    });

    it('Поездка не создана, так как пользователь не авторизирован', async function () {
        req.session.userId = null;
        await tripController.createOrder(req, res);
        try {
            console.log(`Ответ: ${res.redirect.getCall(0).args[0]}`);
            expect(res.redirect.getCall(0).args[0]).to.include('/login?message=Вы+не+авторизованы&status=fail');
            expect(Trip.create.called).to.be.false;
        } catch (error) {
            console.log('ID пользователя: ' + req.session.userId)
            expect.fail(error.message);
        }
    });
});
