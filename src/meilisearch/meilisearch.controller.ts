import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MeilisearchService } from './meilisearch.service';

@Controller('meilisearch')
export class MeilisearchController {
  constructor(private readonly meilisearchService: MeilisearchService) {}


}
