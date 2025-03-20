import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/redis/redis.service';
  
@WebSocketGateway({ cors: true })
export class ChatGateway
implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;

    constructor(private readonly redisService: RedisService) {}
  
    afterInit(server: Server) {
      console.log('WebSocket Initialized');
    }
  
    handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
      this.server.emit('conn', 'payload');
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(client: Socket, room: string) {
        client.join(room);
        const messages = await this.redisService.getMessages(room);
        client.emit('joinedRoom', messages);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(client: Socket, room: string) {
        client.leave(room);
        client.emit('leftRoom', room);
    }

    @SubscribeMessage('sendMessageToRoom')
    async handleMessage(client: Socket, data: { room: string; username: string, message: string }) {
        const formattedData = {
            id: Date.now(),
            room: data.room,
            username: data.username,
            message: data.message
        };
        await this.redisService.addMessage(formattedData);
        this.server.to(data.room).emit('message', formattedData);
    }
}