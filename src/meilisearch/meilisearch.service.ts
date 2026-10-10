import { Injectable, OnModuleInit } from '@nestjs/common';
import { Meilisearch } from 'meilisearch';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MeilisearchService implements OnModuleInit {
  private client: Meilisearch;

  constructor() {
    this.client = new Meilisearch({
      host: process.env.MEILISEARCH_HOST as string,
      apiKey: process.env.MEILISEARCH_API_KEY,
    });
  }

  async onModuleInit() {
    await this.setupCoursesIndex();
  }

  async setupCoursesIndex() {
    const index = this.client.index('courses');

    await index.updateFilterableAttributes([
      'category',
      'level',
      'price',
      'rating',
    ]);

    await index.updateSortableAttributes(['price', 'rating', 'createdAt']);

    await index.updateSearchableAttributes([
      'title',
      'description',
      'instructer_name',
    ]);
  }

  async setupUsersIndex() {
    const index = this.client.index('users');
    await index.updateSearchableAttributes(['name', 'email', 'role']);
    await index.updateFilterableAttributes(['role']);
  }

  getIndex(indexName: string) {
    return this.client.index(indexName);
  }

  async addDocument(indexName: string, document: any) {
    return this.client.index(indexName).addDocuments([document]);
  }

  async updateDocument(indexName: string, document: any) {
    return this.client.index(indexName).updateDocuments([document]);
  }

  async deleteDocument(indexName: string, id: string | number) {
    return this.client.index(indexName).deleteDocument(id);
  }

  async search(indexName: string, query: string, options: any = {}) {
    return this.client.index(indexName).search(query, options);
  }
}
