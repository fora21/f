// src/controller/AuthController.ts
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from "../data-source";

export class AuthController {

    async register (req: Request, res: Response): Promise<void> {
        const { username, password, firstName } = req.body; // Добавлено firstName

        if (!(username && password && firstName)) { // Обновлена проверка
            res.status(400).json({ message: "Необходимо указать имя пользователя, пароль и имя." });
            return;
        }

        // Простая валидация (можно улучшить)
        if (username.length < 3) {
            res.status(400).json({ message: "Имя пользователя должно содержать не менее 3 символов." });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({ message: "Пароль должен содержать не менее 8 символов." });
            return;
        }

        const userRepository = getRepository(User);
        try {
            const existingUser = await userRepository.findOne({ where: { username } });
            if (existingUser) {
                res.status(409).json({ message: "Пользователь с таким именем уже существует." });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = new User();
            user.username = username;
            user.password = hashedPassword;
            user.firstName = firstName; // Добавлено firstName

            await userRepository.save(user);

            const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET || "секретный_ключ", { expiresIn: "1h" }); // Используем переменную окружения

            res.status(201).json({ message: "Пользователь успешно зарегистрирован.", token });
        } catch (error) {
            console.error("Ошибка при регистрации:", error);
            res.status(500).json({ message: "Ошибка при регистрации пользователя." });
        }
    }

    async login (req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;

        if (!(username && password)) {
            res.status(400).json({ message: "Необходимо указать имя пользователя и пароль." });
            return;
        }

        console.log(username, password)

        const userRepository = AppDataSource.getRepository(User);
        try {
            const user = await userRepository.findOne({ where: { username } });
            console.log(user)
            if (!user) {
                res.status(401).json({ message: "Неверное имя пользователя или пароль." });
                return;
            }

            const passwordMatch = password == user.password

            if (passwordMatch) {
                const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET || "секретный_ключ", { expiresIn: "1h" });
                user.mobToken = token
                await userRepository.save(user)
                res.status(200).json({ message: "Авторизация прошла успешно.", token });
            } else {
                res.status(401).json({ message: "Неверное имя пользователя или пароль." });
            }
        } catch (error) {
            console.error("Ошибка при авторизации:", error);
            res.status(500).json({ message: "Ошибка при авторизации." });
        }
    }
    async auth (req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;

        if (!(username && password)) {
            res.status(400).json({ message: "Необходимо указать имя пользователя и пароль." });
            return;
        }

        const userRepository = getRepository(User);
        try {
            const user = await userRepository.findOne({ where: { username } });

            if (!user) {
                res.status(401).json({ message: "Неверное имя пользователя или пароль." });
                return;
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // 1. Генерация mobToken (JWT)
                const mobToken = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET || "секретный_ключ", { expiresIn: "7d" }); // Срок действия 7 дней

                // 2. Сохранение mobToken в базе данных
                user.mobToken = mobToken;
                await userRepository.save(user);

                // 3. Отправка mobToken в ответе
                res.status(200).json({ message: "Авторизация прошла успешно.", mobToken });
            } else {
                res.status(401).json({ message: "Неверное имя пользователя или пароль." });
            }
        } catch (error) {
            console.error("Ошибка при авторизации:", error);
            res.status(500).json({ message: "Ошибка при авторизации." });
        }
    }
}
