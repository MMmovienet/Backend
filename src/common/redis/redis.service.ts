import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

const oneDayInSeconds = 60 * 60 * 24;
const tenMinutesInSeconds = 60 * 10;

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor(configService: ConfigService) {
    this.redis = new Redis({
      host: configService.get('REDIS_HOST'), 
      port: configService.get('REDIS_PORT'),
    });
  }

  async joinParty(partyId: string) {
    const parties = await this.getParties();
    if(parties[partyId]) {
      await this.redis.hset('parties', partyId, +parties[partyId] + 1)
    }else {
      await this.redis.hset('parties', {[partyId]: 1});
    }
  }

  async leaveParty(partyId: string) {
    const parties = await this.getParties();
    if(parties[partyId] && +parties[partyId] == 1) {
      await this.redis.hdel('parties', partyId)
    }else if(parties[partyId]) {
      await this.redis.hset('parties', partyId, +parties[partyId] - 1)
    }
  }

  async getParties(): Promise<object> { 
    const parties = await this.redis.hgetall('parties');
    return parties
  }

    async getPartyIds(): Promise<string[]> { 
    const ids = await this.redis.hkeys('parties');
    return ids
  }

  async addMessage(data: { id: number; room: string, username: string; message: string }) {
    const key = data.room + "-chat";
    await this.redis.rpush(key, JSON.stringify(data));
    const ttl = await this.redis.ttl(key);
    if (ttl === -1) {
      await this.redis.expire(key, oneDayInSeconds);
    }
  }

  async getMessages(room: string): Promise<{ id: number; room: string, username: string; message: string }[]> {
    const messages = await this.redis.lrange(room + "-chat", 0, -1);
    return messages.map((msg) => JSON.parse(msg));
  }

  async addProgressTime(data: { room: string, time: number }) {
    const key = data.room + "-progress-time";
    await this.redis.set(key, data.time);
    const ttl = await this.redis.ttl(key);
    if (ttl === -1) {
      await this.redis.expire(key, oneDayInSeconds);
    }
  }

  async getProgressTime(room: string): Promise<string | null> {
    const time = await this.redis.get(room + "-progress-time");
    return time;
  }

  async clearMessages(room: string) {
    await this.redis.del(room + "-chat");
  }
}