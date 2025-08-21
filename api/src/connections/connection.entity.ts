import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('connections')
export class ConnectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  host: string;

  @Column()
  port: number;

  @Column()
  database: string;

  @Column()
  user: string;

  @Column()
  password: string;
}
