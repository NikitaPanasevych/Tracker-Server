import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])], // Registers Expense entity
  controllers: [], // Add controllers here if needed later
  providers: [], // Add services here if needed later
})
export class ExpenseModule {}
