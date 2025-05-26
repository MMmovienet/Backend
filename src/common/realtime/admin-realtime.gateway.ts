import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/common/redis/redis.service';
import { PartiesAdminService } from 'src/parties/admin/parties-admin.service';
import { Party } from 'src/parties/entities/party.entity';
  
@WebSocketGateway({ cors: true })
export class AdminRealtimeGateway
implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;

    constructor(
        private readonly redisService: RedisService,
        private readonly partiesService: PartiesAdminService,
    ) {}
  
    afterInit(server: Server) {
    }
  
    handleConnection(client: Socket) {
      this.server.emit('conn', 'payload');
    }
  
    handleDisconnect(client: Socket) {
    }

    @SubscribeMessage('joinAdminRoom')
    async handleJoinRoom(client: Socket, room: string) {
        client.join(room);
        const parties = await this.getPartiesFromDB();
        client.emit('onParty', parties);
    }

    async getPartiesFromDB(): Promise<Party[]> {
        const ids = await this.redisService.getPartyIds();
        return this.partiesService.findByPartyIds(ids)
    }
}