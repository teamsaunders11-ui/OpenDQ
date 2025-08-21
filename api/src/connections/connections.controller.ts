import { Body, Controller, Get, Post, Put, Delete, Param } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { Client } from 'pg';
import { CreateConnectionDto } from './dto/create-connection.dto';

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

  @Put(':id')
  async update(@Param('id') id: string, @Body() connection: CreateConnectionDto) {
    await this.connectionsService.update(+id, connection);
    return { message: 'Connection updated' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.connectionsService.remove(+id);
    return { message: 'Connection deleted' };
  }

  @Post('catalog/:connectionId')
  async catalogTables(
    @Param('connectionId') connectionId: string,
    @Body() body: { tables: string[] }
  ) {
    // Simulate sending table metadata to Apache Atlas
    const simulateAtlasCatalog = (tables: string[], connection: any) => {
      return tables.map(table => ({
        table,
        status: 'sent',
        atlasId: `atlas-${table}`
      }));
    };
    const connections = await this.connectionsService.findAll();
    const connection = connections.find((c: any) => c.id?.toString() === connectionId);
    if (!connection) {
      return { error: 'Connection not found' };
    }
    const result = simulateAtlasCatalog(body.tables, connection);
    return { result };
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
