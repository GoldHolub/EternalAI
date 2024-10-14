import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/Impl/UserRepository.js';
import { AiChatController } from '../controllers/AiChatController.js';
import { AiChatService } from './Impl/AiChatService.js';
export class WebSocketService {
    io;
    constructor(httpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });
        this.setupMiddleware();
        this.setupConnectionEvents();
    }
    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication error'));
                }
                jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                    if (err)
                        return next(new Error('Authentication error'));
                    const userRepository = new UserRepository();
                    const user = await userRepository.getUserById(decoded.userId);
                    if (!user || !user.isVerified) {
                        return next(new Error('Authentication error'));
                    }
                    socket.request.user = user;
                    next();
                });
            }
            catch (error) {
                next(new Error('Authentication error'));
            }
        });
    }
    setupConnectionEvents() {
        this.io.on('connection', (socket) => {
            console.log('A user connected via WebSocket');
            socket.on('userChat', async (data) => {
                try {
                    const aiChatController = new AiChatController(new AiChatService());
                    await aiChatController.userChat(socket, data);
                }
                catch (error) {
                    socket.emit('error', { message: error.message });
                }
            });
            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        });
    }
    getIo() {
        return this.io;
    }
}
//# sourceMappingURL=WebSocketService.js.map