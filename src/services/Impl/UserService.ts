import { IUserService } from '../IUserService';
import { IUserRepository } from '../../repositories/IUserRepository';
import { UserType } from '../../models/users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

export class UserService implements IUserService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async registerUser(userData: Omit<UserType, 'id' | 'name' | 'phone' |'created_at' | 'has_subscription' | 'role'>): Promise<UserType> {
        try {
            this.validateUserData(userData);

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const newUser = await this.userRepository.createUser({
                ...userData,
                password: hashedPassword,
            });

            return newUser;
        } catch (error) {
            console.error('Error registering user:', error);
            throw new Error('Failed to register user. Please try again later.');
        }
    }

    async login(email: string, password: string): Promise<{ token: string } | null> {
        try {
            const user = await this.userRepository.getUserByEmail(email);

            if (!user) {
                return null;
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return null;
            }

            const token = jwt.sign(
                { userId: user.id, role: user.role, hasSubscription: user.has_subscription },
                process.env.JWT_SECRET!,
                { expiresIn: '1h' }
            );

            return { token };
        } catch (error) {
            console.error('Error during login:', error);
            throw new Error('Login failed. Please try again later.');
        }
    }

    async getUserById(id: number): Promise<UserType | null> {
        try {
            return await this.userRepository.getUserById(id);
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            throw new Error('Failed to fetch user. Please try again later.');
        }
    }

    async getUserByEmail(email: string): Promise<UserType | null> {
        try {
            return await this.userRepository.getUserByEmail(email);
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw new Error('Failed to fetch user. Please try again later.');
        }
    }

    async updateUser(id: number, updates: Partial<Omit<UserType, 'id' | 'created_at'>>): Promise<UserType | null> {
        try {
            this.validateUpdateData(updates);

            if (updates.password) {
                updates.password = await bcrypt.hash(updates.password, 10);
            }
            
            return await this.userRepository.updateUser(id, updates);
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('Failed to update user. Please try again later.');
        }
    }

    async deleteUser(id: number): Promise<boolean> {
        try {
            return await this.userRepository.deleteUser(id);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Failed to delete user. Please try again later.');
        }
    }

    async getAllUsers(): Promise<UserType[]> {
        try {
            return await this.userRepository.getAllUsers();
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw new Error('Failed to fetch users. Please try again later.');
        }
    }

    async subscribeUser(userId: number): Promise<boolean> {
        try {
            const user = await this.userRepository.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const updatedUser = await this.userRepository.updateUser(userId, { has_subscription: true });
            return updatedUser !== null;
        } catch (error) {
            console.error('Error subscribing user:', error);
            throw new Error('Failed to subscribe user. Please try again later.');
        }
    }

    async isUserSubscribed(userId: number): Promise<boolean> {
        try {
            const user = await this.userRepository.getUserById(userId);
            return user ? user.has_subscription : false;
        } catch (error) {
            console.error('Error checking user subscription:', error);
            throw new Error('Failed to check subscription status. Please try again later.');
        }
    }

    async changeUserRole(userId: number, newRole: string): Promise<UserType | null> {
        try {
            return await this.userRepository.updateUser(userId, { role: newRole });
        } catch (error) {
            console.error('Error changing user role:', error);
            throw new Error('Failed to change user role. Please try again later.');
        }
    }

    private validateUserData(userData: Omit<UserType, 'id' | 'name' |  'phone' | 'created_at' | 'has_subscription' | 'role'>) {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required(),
            //name: Joi.string().required(),
            //phone: Joi.string().required(),
        });

        const { error } = schema.validate(userData);
        if (error) {
            throw new Error(`Validation error: ${error.message}`);
        }
    }

    private validateUpdateData(updates: Partial<Omit<UserType, 'id' | 'created_at'>>): void {
        const schema = Joi.object({
            email: Joi.string().email(),
            name: Joi.string().min(3),
            phone: Joi.string().min(10),
            password: Joi.string().min(8),
        }).or('email', 'name', 'phone', 'password');

        const { error } = schema.validate(updates);
        if (error) {
            throw new Error(`Validation error: ${error.message}`);
        }
    }
}
