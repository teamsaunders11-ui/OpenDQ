import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { Client } from 'pg';
import { CreateConnectionDto } from './dto/create-connection.dto';

import { Param } from '@nestjs/common';

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}


  @Post()
  async create(@Body() connection: CreateConnectionDto) {
    await this.connectionsService.create(connection);
    return { message: 'Connection saved' };
  }

  @Get()
  async findAll() {
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

  @Get('schema/:connectionId')
  async getSchema(@Param('connectionId') connectionId: string) {
    // Find the connection by ID in the database
    const connections = await this.connectionsService.findAll();
    const connection = connections.find((c: any) => c.id?.toString() === connectionId);
    if (!connection) {
      return { error: 'Connection not found' };
    }
    const client = new Client({
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.user,
      password: connection.password,
    });
    try {
      await client.connect();
      const res = await client.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
      );
      await client.end();
      return { tables: res.rows.map((row: any) => row.table_name) };
    } catch (error) {
      return { error: error.message };
    }
  }
}
