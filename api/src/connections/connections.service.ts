
import { Injectable } from '@nestjs/common';
import { CreateConnectionDto } from './dto/create-connection.dto';

@Injectable()
export class ConnectionsService {
  private connections: CreateConnectionDto[] = [];

  create(connection: CreateConnectionDto) {
    this.connections.push(connection);
  }

  findAll(): CreateConnectionDto[] {
    return this.connections;
  }
}
