import { Pool, CreatePoolRequest } from '../../core/domain/pooling';
import { PoolingRepository } from '../../core/ports/outbound/pooling.repository';
import { apiClient } from '../infrastructure/api-client';

export class HttpPoolingRepository implements PoolingRepository {
  async createPool(request: CreatePoolRequest): Promise<Pool> {
    return apiClient.post<Pool>('/pools', request);
  }
}
