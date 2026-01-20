import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphNode } from './entities/graph-node.entity';
import { GraphEdge } from './entities/graph-edge.entity';
import { GraphController } from './graph.controller';
import { GraphService } from './graph.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([GraphNode, GraphEdge]), AuthModule],
  controllers: [GraphController],
  providers: [GraphService],
  exports: [TypeOrmModule],
})
export class GraphModule {}
