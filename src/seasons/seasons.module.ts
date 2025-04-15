import { Module } from '@nestjs/common';
import { SeasonsService } from './seasons.service';
import { SeasonsController } from './seasons.controller';
import { SeasonsAdminController } from './admin/seasons-admin.controller';
import { SeasonsAdminService } from './admin/seasons-admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './entities/season.entity';
import { AdminsModule } from 'src/admins/admins.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Season]),
    AdminsModule,
  ],
  controllers: [SeasonsController, SeasonsAdminController],
  providers: [SeasonsService, SeasonsAdminService],
  exports: [SeasonsAdminService]
})
export class SeasonsModule {}
