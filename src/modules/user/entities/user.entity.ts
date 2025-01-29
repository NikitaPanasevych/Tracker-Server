// user.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'nvarchar', length: 255 })
  password: string;

  @Column({ type: 'bit', default: false })
  isVerified: boolean;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  verificationToken: string | null;

  @Column({ type: 'datetime2', nullable: true })
  verificationTokenExpires: Date | null;
}
