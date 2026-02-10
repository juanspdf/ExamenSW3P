import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CuentasModule } from './cuentas.module';
import { CuentasController } from './cuentas.controller';
import { CuentasService } from './cuentas.service';
import { Cuenta } from './entities/cuenta.entity';

describe('CuentasModule', () => {
  let module: TestingModule;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [CuentasController],
      providers: [
        CuentasService,
        {
          provide: getRepositoryToken(Cuenta),
          useValue: mockRepository,
        },
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('debe tener el controlador CuentasController', () => {
    const controller = module.get<CuentasController>(CuentasController);
    expect(controller).toBeDefined();
  });

  it('debe tener el servicio CuentasService', () => {
    const service = module.get<CuentasService>(CuentasService);
    expect(service).toBeDefined();
  });

  it('debe exportar el servicio CuentasService', () => {
    const service = module.get<CuentasService>(CuentasService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(CuentasService);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });
});
