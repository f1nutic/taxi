const bcrypt = require('bcrypt');
const { User } = require('../config/database');

exports.loginUser = async (req, res) => {
    let { phone, password } = req.body;
    try {
        // Проверка на существующего пользователя по телефону
        phone = phone.slice(1);  // Удаление знака '+' в начале телефона, если он есть
        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.redirect(`/login?message=Пользователь+не+найден&status=fail`);
        }

        // Сравнение введенного пароля с хешированным паролем в базе данных
        const isMatch = await bcrypt.compare(password, user.hashed_password);
        if (!isMatch) {
            return res.redirect(`/login?message=Неверный+пароль&status=fail`);
        }

        req.session.userId = user.id; // Успешная авторизация, создание сессии
        res.redirect(`/map?message=Приветствуем,+${user.name}!&status=success`);

    } catch (error) {
        console.error(error);
        res.redirect(`/login?message=Внутренняя+ошибка+сервера&status=fail`);
    }
};

exports.createUser = async (req, res) => {
    const { name, phone, birthday, password } = req.body;
    const formattedPhone = phone.replace(/^\+/, '');
    try {
        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            phone: formattedPhone,
            birthday,
            user_type: 2,
            hashed_password: hashedPassword,
        });

        // Создание сессии
        req.session.userId = newUser.id;

        res.redirect('/map?message=Успешная+регистрация!&status=success');
    } catch (error) {
        res.redirect(`/registration?message=Ошибка:+${error}&status=fail`);
        return error;
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


