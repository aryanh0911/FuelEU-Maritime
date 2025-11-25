import { CreatePoolUseCase } from '../../application/pooling.use-cases';
import { PoolingRepository } from '../../ports/outbound/pooling.repository';
import { Pool, PoolMember } from '../../domain/pooling';

describe('CreatePoolUseCase', () => {
  let useCase: CreatePoolUseCase;
  let mockPoolingRepository: jest.Mocked<PoolingRepository>;

  beforeEach(() => {
    mockPoolingRepository = {
      createPool: jest.fn(),
      addMembers: jest.fn(),
      findPoolById: jest.fn(),
      findMembersByPoolId: jest.fn(),
    };

    useCase = new CreatePoolUseCase(mockPoolingRepository);
  });

  it('should create a valid pool with surplus and deficit ships', async () => {
    const mockPool: Pool = {
      id: 'pool-1',
      year: 2025,
      createdAt: new Date(),
    };

    const mockMembers: PoolMember[] = [
      {
        id: 'member-1',
        poolId: 'pool-1',
        shipId: 'ship-1',
        cbBefore: 1000,
        cbAfter: 500,
        createdAt: new Date(),
      },
      {
        id: 'member-2',
        poolId: 'pool-1',
        shipId: 'ship-2',
        cbBefore: -500,
        cbAfter: 0,
        createdAt: new Date(),
      },
    ];

    mockPoolingRepository.createPool.mockResolvedValue(mockPool);
    mockPoolingRepository.addMembers.mockResolvedValue(mockMembers);

    const result = await useCase.execute({
      year: 2025,
      members: [
        { shipId: 'ship-1', cbBefore: 1000 },
        { shipId: 'ship-2', cbBefore: -500 },
      ],
    });

    expect(result.valid).toBe(true);
    expect(result.poolId).toBe('pool-1');
    expect(result.members).toHaveLength(2);
    expect(mockPoolingRepository.createPool).toHaveBeenCalledWith(2025);
  });

  it('should reject pool with negative total CB', async () => {
    await expect(
      useCase.execute({
        year: 2025,
        members: [
          { shipId: 'ship-1', cbBefore: 100 },
          { shipId: 'ship-2', cbBefore: -500 },
        ],
      })
    ).rejects.toThrow('Sum of compliance balances must be non-negative');
  });

  it('should allocate surplus to deficit ships using greedy algorithm', async () => {
    const mockPool: Pool = {
      id: 'pool-2',
      year: 2025,
      createdAt: new Date(),
    };

    mockPoolingRepository.createPool.mockResolvedValue(mockPool);
    mockPoolingRepository.addMembers.mockResolvedValue([]);

    const result = await useCase.execute({
      year: 2025,
      members: [
        { shipId: 'ship-1', cbBefore: 1000 },
        { shipId: 'ship-2', cbBefore: -300 },
        { shipId: 'ship-3', cbBefore: -200 },
      ],
    });

    expect(result.valid).toBe(true);
    
    // Verify allocations
    const ship1 = result.members.find((m) => m.shipId === 'ship-1');
    const ship2 = result.members.find((m) => m.shipId === 'ship-2');
    const ship3 = result.members.find((m) => m.shipId === 'ship-3');

    expect(ship1?.cbAfter).toBe(500); // Gave away 500
    expect(ship2?.cbAfter).toBe(0); // Received 300
    expect(ship3?.cbAfter).toBe(0); // Received 200
  });
});
