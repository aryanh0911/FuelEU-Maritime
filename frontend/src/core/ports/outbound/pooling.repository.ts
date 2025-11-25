import { Pool, CreatePoolRequest } from '../domain/pooling';

export interface PoolingRepository {
  createPool(request: CreatePoolRequest): Promise<Pool>;
}
