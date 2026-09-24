import { Injectable } from '@nestjs/common';
import { Model, ProjectionType, QueryOptions, QueryFilter } from 'mongoose';

export abstract class DBService<T> {
  constructor(private readonly model: Model<T>) {}

  create(document: Partial<T>) {
    return this.model.create(document);
  }
  find(
    filter?: QueryFilter<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions,
  ) {
    return this.model.find(filter, projection, options);
  }
  findOne(
    filter?: QueryFilter<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions,
  ): Promise<T | null> {
    return this.model.findOne(filter, projection, options);
  }
}
