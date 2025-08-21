import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { Client } from 'pg';
import { CreateConnectionDto } from './dto/create-connection.dto';

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post()

  create(@Body() connection: CreateConnectionDto) {
    this.connectionsService.create(connection);
    return { message: 'Connection saved' };
  }

  @Get()
  findAll() {
    return this.connectionsService.findAll();
  }

  @Post('validate')
  async validate(@Body() connection: CreateConnectionDto) {
    const client = new Client({
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.user,
      password: connection.password,
    });
    try {
      await client.connect();
      await client.end();
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}
