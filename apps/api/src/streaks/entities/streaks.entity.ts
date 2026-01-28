import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['userId', 'activityDate'])
export class Streaks {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'acitivity_date', type: 'date' })
  activityDate: Date;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;
}
