import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CuentasService } from './cuentas.service';
import { Cuenta } from './entities/cuenta.entity';
import { CuentaRequestDto } from './dto/cuenta-request.dto';

describe('CuentasService', () => {
  let service: CuentasService;
  let repository: Repository<Cuenta>;

  const mockCuenta: Cuenta = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    socioId: 'socio-123',
    numeroCuenta: '001-123456789',
    saldo: 1000.0,
    estado: 'ACTIVA',
    tipoCuenta: 'AHORRO',
    fechaCreacion: new Date('2024-01-15'),
    fechaActualizacion: new Date('2024-01-15'),
    activo: true,
    generateId: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CuentasService,
        {
          provide: getRepositoryToken(Cuenta),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CuentasService>(CuentasService);
    repository = module.get<Repository<Cuenta>>(getRepositoryToken(Cuenta));

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearCuenta', () => {
    const requestDto: CuentaRequestDto = {
      socioId: 'socio-123',
      numeroCuenta: '001-123456789',
      saldo: 1000.0,
      tipoCuenta: 'AHORRO',
    };

    it('debe crear una cuenta exitosamente', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockCuenta);
      mockRepository.save.mockResolvedValue(mockCuenta);

      const result = await service.crearCuenta(requestDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { numeroCuenta: requestDto.numeroCuenta, activo: true },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        socioId: requestDto.socioId,
        numeroCuenta: requestDto.numeroCuenta,
        saldo: requestDto.saldo,
        tipoCuenta: requestDto.tipoCuenta,
        estado: 'ACTIVA',
        activo: true,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockCuenta.id,
        socioId: mockCuenta.socioId,
        numeroCuenta: mockCuenta.numeroCuenta,
        saldo: mockCuenta.saldo,
        estado: mockCuenta.estado,
        tipoCuenta: mockCuenta.tipoCuenta,
        fechaCreacion: mockCuenta.fechaCreacion,
        fechaActualizacion: mockCuenta.fechaActualizacion,
      });
    });

    it('debe lanzar ConflictException si el número de cuenta ya existe', async () => {
      mockRepository.findOne.mockResolvedValue(mockCuenta);

      await expect(service.crearCuenta(requestDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.crearCuenta(requestDto)).rejects.toThrow(
        'El número de cuenta ya existe',
      );
    });
  });

  describe('actualizarCuenta', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const requestDto: CuentaRequestDto = {
      socioId: 'socio-456',
      numeroCuenta: '001-987654321',
      saldo: 2000.0,
      tipoCuenta: 'CORRIENTE',
    };

    it('debe actualizar una cuenta exitosamente', async () => {
      const cuentaActualizada = { ...mockCuenta, ...requestDto };
      mockRepository.findOne
        .mockResolvedValueOnce(mockCuenta) // Primera llamada: cuenta existente
        .mockResolvedValueOnce(null); // Segunda llamada: verificar número único
      mockRepository.save.mockResolvedValue(cuentaActualizada);

      const result = await service.actualizarCuenta(id, requestDto);

      expect(result.numeroCuenta).toBe(requestDto.numeroCuenta);
      expect(result.tipoCuenta).toBe(requestDto.tipoCuenta);
    });

    it('debe lanzar NotFoundException si la cuenta no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.actualizarCuenta(id, requestDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.actualizarCuenta(id, requestDto)).rejects.toThrow(
        'Cuenta no encontrada',
      );
    });

    it('debe lanzar ConflictException si el nuevo número de cuenta ya existe', async () => {
      const requestDiferenteNumero = { ...requestDto, numeroCuenta: '001-999999999' };
      const otraCuenta = { ...mockCuenta, id: 'otro-id', numeroCuenta: '001-999999999' };
      
      // Primera invocación del test
      mockRepository.findOne
        .mockResolvedValueOnce(mockCuenta) // Primera llamada: cuenta existente
        .mockResolvedValueOnce(otraCuenta); // Segunda llamada: número ya existe

      await expect(service.actualizarCuenta(id, requestDiferenteNumero)).rejects.toThrow(
        ConflictException,
      );
      
      // Resetear y configurar mocks para la segunda invocación del test
      mockRepository.findOne.mockClear();
      mockRepository.findOne
        .mockResolvedValueOnce(mockCuenta) // Primera llamada: cuenta existente
        .mockResolvedValueOnce(otraCuenta); // Segunda llamada: número ya existe
        
      await expect(service.actualizarCuenta(id, requestDiferenteNumero)).rejects.toThrow(
        'El número de cuenta ya está en uso',
      );
    });

    it('debe permitir actualizar con el mismo número de cuenta', async () => {
      const requestMismoNumero = { ...requestDto, numeroCuenta: mockCuenta.numeroCuenta };
      mockRepository.findOne.mockResolvedValue(mockCuenta);
      mockRepository.save.mockResolvedValue(mockCuenta);

      const result = await service.actualizarCuenta(id, requestMismoNumero);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1); // Solo verifica si existe
    });
  });

  describe('obtenerCuenta', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';

    it('debe retornar una cuenta por ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockCuenta);

      const result = await service.obtenerCuenta(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id, activo: true },
      });
      expect(result).toEqual({
        id: mockCuenta.id,
        socioId: mockCuenta.socioId,
        numeroCuenta: mockCuenta.numeroCuenta,
        saldo: mockCuenta.saldo,
        estado: mockCuenta.estado,
        tipoCuenta: mockCuenta.tipoCuenta,
        fechaCreacion: mockCuenta.fechaCreacion,
        fechaActualizacion: mockCuenta.fechaActualizacion,
      });
    });

    it('debe lanzar NotFoundException si la cuenta no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.obtenerCuenta(id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.obtenerCuenta(id)).rejects.toThrow(
        'Cuenta no encontrada',
      );
    });
  });

  describe('obtenerCuentasPorSocio', () => {
    const socioId = 'socio-123';

    it('debe retornar todas las cuentas de un socio', async () => {
      const mockCuentas = [
        { ...mockCuenta, socioId },
        { ...mockCuenta, id: 'cuenta-2', numeroCuenta: '001-987654321', socioId },
      ];
      mockRepository.find.mockResolvedValue(mockCuentas);

      const result = await service.obtenerCuentasPorSocio(socioId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { socioId, activo: true },
        order: { fechaCreacion: 'DESC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].socioId).toBe(socioId);
    });

    it('debe retornar un array vacío si el socio no tiene cuentas', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.obtenerCuentasPorSocio(socioId);

      expect(result).toEqual([]);
    });
  });

  describe('obtenerTodasCuentas', () => {
    it('debe retornar todas las cuentas activas', async () => {
      const mockCuentas = [
        mockCuenta,
        { ...mockCuenta, id: 'cuenta-2', numeroCuenta: '001-987654321' },
      ];
      mockRepository.find.mockResolvedValue(mockCuentas);

      const result = await service.obtenerTodasCuentas();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { activo: true, estado: 'ACTIVA' },
      });
      expect(result).toHaveLength(2);
    });

    it('debe retornar un array vacío si no hay cuentas', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.obtenerTodasCuentas();

      expect(result).toEqual([]);
    });
  });

  describe('eliminarCuenta', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';

    it('debe eliminar una cuenta lógicamente', async () => {
      mockRepository.findOne.mockResolvedValue(mockCuenta);
      mockRepository.save.mockResolvedValue({
        ...mockCuenta,
        activo: false,
        estado: 'CANCELADA',
      });

      await service.eliminarCuenta(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id, activo: true },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockCuenta,
        activo: false,
        estado: 'CANCELADA',
      });
    });

    it('debe lanzar NotFoundException si la cuenta no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.eliminarCuenta(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('realizarRetiro', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const monto = 500;

    it('debe realizar un retiro exitosamente', async () => {
      const cuentaActiva = { ...mockCuenta, estado: 'ACTIVA' };
      mockRepository.findOne.mockResolvedValue(cuentaActiva);
      const cuentaActualizada = { ...cuentaActiva, saldo: 500 };
      mockRepository.save.mockResolvedValue(cuentaActualizada);

      const result = await service.realizarRetiro(id, monto);

      expect(result.saldo).toBe(500);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si la cuenta no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.realizarRetiro(id, monto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar ConflictException si la cuenta no está activa', async () => {
      const cuentaInactiva = { ...mockCuenta, estado: 'SUSPENDIDA' };
      mockRepository.findOne.mockResolvedValue(cuentaInactiva);

      await expect(service.realizarRetiro(id, monto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.realizarRetiro(id, monto)).rejects.toThrow(
        'La cuenta no está activa',
      );
    });

    it('debe lanzar ConflictException si el saldo es insuficiente', async () => {
      const cuentaActiva = { ...mockCuenta, estado: 'ACTIVA' };
      mockRepository.findOne.mockResolvedValue(cuentaActiva);

      await expect(service.realizarRetiro(id, 2000)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.realizarRetiro(id, 2000)).rejects.toThrow(
        'Saldo insuficiente',
      );
    });
  });

  describe('realizarDeposito', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const monto = 500;

    it('debe realizar un depósito exitosamente', async () => {
      const cuentaActiva = { ...mockCuenta, estado: 'ACTIVA' };
      mockRepository.findOne.mockResolvedValue(cuentaActiva);
      const cuentaActualizada = { ...cuentaActiva, saldo: 1500 };
      mockRepository.save.mockResolvedValue(cuentaActualizada);

      const result = await service.realizarDeposito(id, monto);

      expect(result.saldo).toBe(1500);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si la cuenta no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.realizarDeposito(id, monto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar ConflictException si la cuenta no está activa', async () => {
      const cuentaInactiva = { ...mockCuenta, estado: 'CANCELADA' };
      mockRepository.findOne.mockResolvedValue(cuentaInactiva);

      await expect(service.realizarDeposito(id, monto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.realizarDeposito(id, monto)).rejects.toThrow(
        'La cuenta no está activa',
      );
    });
  });

  describe('mapToResponse', () => {
    it('debe mapear correctamente una entidad a DTO de respuesta', async () => {
      mockRepository.findOne.mockResolvedValue(mockCuenta);

      const result = await service.obtenerCuenta(mockCuenta.id);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('socioId');
      expect(result).toHaveProperty('numeroCuenta');
      expect(result).toHaveProperty('saldo');
      expect(result).toHaveProperty('estado');
      expect(result).toHaveProperty('tipoCuenta');
      expect(result).toHaveProperty('fechaCreacion');
      expect(result).toHaveProperty('fechaActualizacion');
      expect(typeof result.saldo).toBe('number');
    });
  });
});
