
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { ConnectionEntity } from './connection.entity';

@Injectable()
export class ConnectionsService {
  constructor(
    @InjectRepository(ConnectionEntity)
    private readonly connectionRepo: Repository<ConnectionEntity>
  ) {}

  async create(connection: CreateConnectionDto): Promise<ConnectionEntity> {
    const entity = this.connectionRepo.create(connection);
    return this.connectionRepo.save(entity);
  }

  findAll(): Promise<ConnectionEntity[]> {
    return this.connectionRepo.find();
  }

  async update(id: number, connection: CreateConnectionDto): Promise<ConnectionEntity | null> {
    await this.connectionRepo.update(id, connection);
    return this.connectionRepo.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.connectionRepo.delete(id);
  }
}
