import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { time } from 'console';
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
        const time = await this.redisService.getProgressTime(room);
        client.emit('loadProgressTime', time)
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

    @SubscribeMessage('sendMovieAction')
    handleMovieAction(client: Socket, data: {room: string, playingStatus: boolean}) {
      this.server.to(data.room).emit('movieAction', data);
    }

    @SubscribeMessage('sendMovieSeekTime')
    handleMovieSeekTime(client: Socket, data: {room: string, time: number}) {
      this.server.to(data.room).emit('movieSeekTime', data);
    }

    @SubscribeMessage('sendMovieProgressTime')
    async handleMovieProgressTime(client: Socket, data: {room: string, time: number}) {
      console.log('******************', data.time)
      await this.redisService.addProgressTime(data)
    }
}