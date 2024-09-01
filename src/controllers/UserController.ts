import { Request, Response } from 'express';
import { IUserService } from "../services/IUserService";
import { UserType } from "../models/users";

export class UserController {
    constructor(private userService: IUserService) { }

    async registerUser(req: Request, res: Response): Promise<void> {
        try {
            const userData: Omit<UserType, 'id' | 'phone' | 'created_at' | 'has_subscription' | 'role'> = req.body;
            const newUser = await this.userService.registerUser(userData);

            res.status(201).json({ id: newUser.id, email: newUser.email });
        } catch (error) {
            res.status(500).json({ error: 'Failed to register user' });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await this.userService.login(email, password);
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to login' });
        }
    }

    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const id = req.user.id;
            const user = await this.userService.getUserById(id);
            if (user) {
                res.status(200).json({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    hasSubscription: user.has_subscription,
                    created_at: user.created_at,
                });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve user' });
        }
    }

    async getUserByEmail(req: Request, res: Response): Promise<void> {
        try {
            const email = req.params.email;
            const user = await this.userService.getUserByEmail(email);
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve user' });
        }
    }

    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const id = req.user.id;
            const { email, name, phone, password } = req.body;
            const updatedUser = await this.userService.updateUser(id, { email, name, phone, password });
            if (updatedUser) {
                res.status(200).json({
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    phone: updatedUser.phone,
                    hasSubscription: updatedUser.has_subscription,
                    created_at: updatedUser.created_at,
                });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error: any) {
            res.status(500).json({ error: `Failed to update user.` });
        }
    }
}