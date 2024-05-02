const bcrypt = require('bcrypt');
const { User } = require('../config/database');
const moment = require('moment');

// Создание нового пользователя
exports.createUser = async (req, res) => {
    // Получите данные из запроса
    const { name, phone, birthday, password } = req.body;

    const formattedPhone = phone.replace(/^\+/, '');

    try {
        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создайте пользователя
        const newUser = await User.create({
            name,
            phone: formattedPhone,
            birthday,
            user_type: 2,
            hashed_password: hashedPassword,
        });

        res.status(201).json({ message: "Пользователь успешно зарегистрирован", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

exports.loginUser = async (req, res) => {
    const { phone, password } = req.body;

    try {
        // Поиск пользователя по телефону
        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(401).json({ message: "Неправильный телефон или пароль" });
        }

        // Сравнение введенного пароля с хешированным паролем в базе данных
        const isMatch = await bcrypt.compare(password, user.hashed_password);
        if (!isMatch) {
            return res.status(401).json({ message: "Неправильный телефон или пароль" });
        }

        // Успешная авторизация, реализация сессии или токена
        res.status(200).json({ message: "Авторизация успешна", user: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
};

// Получение списка всех пользователей
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получение пользователя по ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Обновление пользователя
exports.updateUser = async (req, res) => {
    const { phone, name, user_type, birthday, hashed_password } = req.body;
    try {
        const result = await User.update({ phone, name, user_type, birthday, hashed_password }, {
            where: { id: req.params.id }
        });
        if (result[0] === 1) {
            res.status(200).send('User updated');
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Удаление пользователя
exports.deleteUser = async (req, res) => {
    try {
        const result = await User.destroy({
            where: { id: req.params.id }
        });
        if (result === 1) {
            res.status(200).send('User deleted');
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};