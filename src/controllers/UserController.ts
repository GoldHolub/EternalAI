import { Request, Response, NextFunction } from 'express';
import { IUserService } from "../services/IUserService";
import { UserType } from "../models/users";
import { UserService } from "../services/Impl/UserService.js";
import { SubscriptionService } from '../services/Impl/SubscriptionService.js';
import { UserRepository } from '../repositories/Impl/UserRepository.js';

export class UserController {
    private userService: IUserService;
    private subscriptionService: SubscriptionService;

    constructor() {
        this.userService = new UserService(new UserRepository);
        this.subscriptionService = new SubscriptionService();
     }

    async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password, googleToken, name, shareToken } = req.body;
            const token = await this.userService.registerUser(email, password, name, googleToken, shareToken);
            if (token) {
                res.status(201).json(token);
            } else {
                res.status(402).json({ error: 'verify your email' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to register user' });
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password, googleToken } = req.body;
            const result = await this.userService.login(email, password, googleToken);
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(400).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            next(error);
        }
    }

    async sendForgottenPasswordEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.body;
            const isSent = await this.userService.sendForgottenPasswordEmail(email);
            if (isSent) {
                res.status(200).json({ isSent: isSent });
            } else if (isSent === false) {
                res.status(401).json({ message: 'please sign up first' });
            }
        } catch (error) {
            next(error);
        }
    }

    async resetForgottenPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token, password } = req.body;
            const isReset = await this.userService.resetForgottenPassword(token, password);

            if (isReset) {
                res.status(200).json({ isReset: isReset });
            } else {
                res.status(401).json({ isReset: isReset });
            }
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // @ts-ignore
            const id = req.user.id;
            const user = await this.userService.getUserById(id);
            const [subscription] = await this.subscriptionService.getSubscriptionsByUserId(id);

            if (user) {
                res.status(200).json({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    isVerified: user.isVerified,
                    hasSubscription: user.has_subscription,
                    isSubscriptionCanceled: user.isSubscriptionCanceled,
                    hasAcceptedPolicy: user.hasAcceptedPolicy,
                    nextBillingDate: subscription?.end_date || null,
                });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            next(error);
        }
    }

    async updateTernsOfPolicy(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user as UserType;
            const { hasAcceptedPolicy } = req.body;
            const updatedUser = await this.userService.updateUser(user, { hasAcceptedPolicy: hasAcceptedPolicy });
            if (updatedUser) {
                res.status(200).json(updatedUser);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            next(error);
        }
    }

    async getUserByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const email = req.params.email;
            const user = await this.userService.getUserByEmail(email);
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // @ts-ignore
            const user = req.user as UserType;
            const { email, name, phone, password } = req.body;
            const updatedUser = await this.userService.updateUser(user, { email, name, phone, password });
            if (updatedUser) {
                res.status(200).json({
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    phone: updatedUser.phone,
                    isVerified: updatedUser.isVerified,
                    hasSubscription: updatedUser.has_subscription,
                    hasAcceptedPolicy: updatedUser.hasAcceptedPolicy,
                    created_at: updatedUser.created_at,
                });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error: any) {
            next(error);
        }
    }

    async verifyUserEmailToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req.query.token as string;
            const result = await this.userService.verifyUserEmailToken(token);
            if (result) {
                res.status(200).json({ message: 'Email verified successfully', email: result });
            } else {
                res.status(404).json({ error: 'Invalid token' });
            }
        } catch (error) {
            next(error);
        }
    }

    async checkToken (req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.status(200).json({ message: 'Token is valid' });
        } catch (error) {
            next(error);
        }
    }
}