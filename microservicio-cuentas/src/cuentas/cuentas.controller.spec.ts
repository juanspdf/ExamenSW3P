import { Test, TestingModule } from '@nestjs/testing';
import { CuentasController } from './cuentas.controller';
import { CuentasService } from './cuentas.service';
import { CuentaRequestDto } from './dto/cuenta-request.dto';
import { CuentaResponseDto } from './dto/cuenta-response.dto';

describe('CuentasController', () => {
  let controller: CuentasController;
  let service: CuentasService;

  const mockCuentaResponse: CuentaResponseDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    socioId: 'socio-123',
    numeroCuenta: '001-123456789',
    saldo: 1000.0,
    estado: 'ACTIVA',
    tipoCuenta: 'AHORRO',
    fechaCreacion: new Date('2024-01-15'),
    fechaActualizacion: new Date('2024-01-15'),
  };

  const mockCuentasService = {
    crearCuenta: jest.fn(),
    actualizarCuenta: jest.fn(),
    obtenerCuenta: jest.fn(),
    obtenerTodasCuentas: jest.fn(),
    obtenerCuentasPorSocio: jest.fn(),
    eliminarCuenta: jest.fn(),
    realizarRetiro: jest.fn(),
    realizarDeposito: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuentasController],
      providers: [
        {
          provide: CuentasService,
          useValue: mockCuentasService,
        },
      ],
    }).compile();

    controller = module.get<CuentasController>(CuentasController);
    service = module.get<CuentasService>(CuentasService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('crearCuenta', () => {
    const requestDto: CuentaRequestDto = {
      socioId: 'socio-123',
      numeroCuenta: '001-123456789',
      saldo: 1000.0,
      tipoCuenta: 'AHORRO',
    };

    it('debe crear una cuenta exitosamente', async () => {
      mockCuentasService.crearCuenta.mockResolvedValue(mockCuentaResponse);

      const result = await controller.crearCuenta(requestDto);

      expect(service.crearCuenta).toHaveBeenCalledWith(requestDto);
      expect(service.crearCuenta).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCuentaResponse);
    });

    it('debe propagar excepciones del servicio', async () => {
      const error = new Error('Error al crear cuenta');
      mockCuentasService.crearCuenta.mockRejectedValue(error);

      await expect(controller.crearCuenta(requestDto)).rejects.toThrow(error);
    });
  });

  describe('actualizarCuenta', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const requestDto: CuentaRequestDto = {
      socioId: 'socio-123',
      numeroCuenta: '001-987654321',
      saldo: 2000.0,
      tipoCuenta: 'CORRIENTE',
    };

    it('debe actualizar una cuenta exitosamente', async () => {
      const updatedResponse = { ...mockCuentaResponse, ...requestDto };
      mockCuentasService.actualizarCuenta.mockResolvedValue(updatedResponse);

      const result = await controller.actualizarCuenta(id, requestDto);

      expect(service.actualizarCuenta).toHaveBeenCalledWith(id, requestDto);
      expect(service.actualizarCuenta).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedResponse);
    });

    it('debe propagar excepciones del servicio', async () => {
      const error = new Error('Cuenta no encontrada');
      mockCuentasService.actualizarCuenta.mockRejectedValue(error);

      await expect(
        controller.actualizarCuenta(id, requestDto),
      ).rejects.toThrow(error);
    });
  });

  describe('obtenerCuenta', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';

    it('debe obtener una cuenta por ID', async () => {
      mockCuentasService.obtenerCuenta.mockResolvedValue(mockCuentaResponse);

      const result = await controller.obtenerCuenta(id);

      expect(service.obtenerCuenta).toHaveBeenCalledWith(id);
      expect(service.obtenerCuenta).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCuentaResponse);
    });

    it('debe propagar excepciones del servicio', async () => {
      const error = new Error('Cuenta no encontrada');
      mockCuentasService.obtenerCuenta.mockRejectedValue(error);

      await expect(controller.obtenerCuenta(id)).rejects.toThrow(error);
    });
  });

  describe('obtenerTodas', () => {
    it('debe obtener todas las cuentas activas', async () => {
      const mockCuentas = [
        mockCuentaResponse,
        { ...mockCuentaResponse, id: 'cuenta-2', numeroCuenta: '001-987654321' },
      ];
      mockCuentasService.obtenerTodasCuentas.mockResolvedValue(mockCuentas);

      const result = await controller.obtenerTodas();

      expect(service.obtenerTodasCuentas).toHaveBeenCalled();
      expect(service.obtenerTodasCuentas).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCuentas);
      expect(result).toHaveLength(2);
    });

    it('debe retornar un array vacío si no hay cuentas', async () => {
      mockCuentasService.obtenerTodasCuentas.mockResolvedValue([]);

      const result = await controller.obtenerTodas();

      expect(result).toEqual([]);
    });
  });

  describe('obtenerPorSocio', () => {
    const socioId = 'socio-123';

    it('debe obtener todas las cuentas de un socio', async () => {
      const mockCuentas = [
        mockCuentaResponse,
        { ...mockCuentaResponse, id: 'cuenta-2', numeroCuenta: '001-987654321' },
      ];
      mockCuentasService.obtenerCuentasPorSocio.mockResolvedValue(mockCuentas);

      const result = await controller.obtenerPorSocio(socioId);

      expect(service.obtenerCuentasPorSocio).toHaveBeenCalledWith(socioId);
      expect(service.obtenerCuentasPorSocio).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCuentas);
      expect(result).toHaveLength(2);
    });

    it('debe retornar un array vacío si el socio no tiene cuentas', async () => {
      mockCuentasService.obtenerCuentasPorSocio.mockResolvedValue([]);

      const result = await controller.obtenerPorSocio(socioId);

      expect(result).toEqual([]);
    });
  });

  describe('eliminarCuenta', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';

    it('debe eliminar una cuenta exitosamente', async () => {
      mockCuentasService.eliminarCuenta.mockResolvedValue(undefined);

      await controller.eliminarCuenta(id);

      expect(service.eliminarCuenta).toHaveBeenCalledWith(id);
      expect(service.eliminarCuenta).toHaveBeenCalledTimes(1);
    });

    it('debe propagar excepciones del servicio', async () => {
      const error = new Error('Cuenta no encontrada');
      mockCuentasService.eliminarCuenta.mockRejectedValue(error);

      await expect(controller.eliminarCuenta(id)).rejects.toThrow(error);
    });
  });

  describe('realizarRetiro', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const monto = 500;

    it('debe realizar un retiro exitosamente', async () => {
      const cuentaActualizada = { ...mockCuentaResponse, saldo: 500 };
      mockCuentasService.realizarRetiro.mockResolvedValue(cuentaActualizada);

      const result = await controller.realizarRetiro(id, monto);

      expect(service.realizarRetiro).toHaveBeenCalledWith(id, monto);
      expect(service.realizarRetiro).toHaveBeenCalledTimes(1);
      expect(result.saldo).toBe(500);
    });

    it('debe propagar excepciones del servicio', async () => {
      const error = new Error('Saldo insuficiente');
      mockCuentasService.realizarRetiro.mockRejectedValue(error);

      await expect(controller.realizarRetiro(id, monto)).rejects.toThrow(
        error,
      );
    });
  });

  describe('realizarDeposito', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const monto = 500;

    it('debe realizar un depósito exitosamente', async () => {
      const cuentaActualizada = { ...mockCuentaResponse, saldo: 1500 };
      mockCuentasService.realizarDeposito.mockResolvedValue(cuentaActualizada);

      const result = await controller.realizarDeposito(id, monto);

      expect(service.realizarDeposito).toHaveBeenCalledWith(id, monto);
      expect(service.realizarDeposito).toHaveBeenCalledTimes(1);
      expect(result.saldo).toBe(1500);
    });

    it('debe propagar excepciones del servicio', async () => {
      const error = new Error('Cuenta no activa');
      mockCuentasService.realizarDeposito.mockRejectedValue(error);

      await expect(controller.realizarDeposito(id, monto)).rejects.toThrow(
        error,
      );
    });
  });

  describe('Validación de inyección de dependencias', () => {
    it('debe tener inyectado el servicio correctamente', () => {
      expect(service).toBeDefined();
      expect(service).toBe(mockCuentasService);
    });
  });
});
