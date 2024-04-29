const { User } = require('../config/database');

// Создание нового пользователя
exports.createUser = async (req, res) => {
    const { login, pass } = req.body;
    try {
        const user = await User.create({ login, pass });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получение списка пользователей
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
    const { login, pass } = req.body;
    try {
        const result = await User.update({ login, pass }, {
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