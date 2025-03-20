import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
  
@WebSocketGateway({ cors: true })
export class ChatGateway
implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
  
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
    handleJoinRoom(client: Socket, room: string) {
        client.join(room);
        client.emit('joinedRoom', room);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(client: Socket, room: string) {
        client.leave(room);
        client.emit('leftRoom', room);
    }

    @SubscribeMessage('sendMessageToRoom')
    handleMessage(client: Socket, data: { room: string; username: string, message: string }) {
        this.server.to(data.room).emit('message', data);
    }
}