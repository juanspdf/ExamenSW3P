import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CuentaRequestDto } from './cuenta-request.dto';

describe('CuentaRequestDto', () => {
  describe('Validaciones', () => {
    it('debe validar correctamente un DTO válido', async () => {
      const dto = plainToClass(CuentaRequestDto, {
        socioId: '123e4567-e89b-12d3-a456-426614174000',
        numeroCuenta: '001-123456789',
        saldo: 1000.0,
        tipoCuenta: 'AHORRO',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    describe('socioId', () => {
      it('debe rechazar si socioId no es un string', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: 12345,
          numeroCuenta: '001-123456789',
          saldo: 1000.0,
          tipoCuenta: 'AHORRO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('socioId');
      });

      it('debe rechazar si socioId está vacío', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '',
          numeroCuenta: '001-123456789',
          saldo: 1000.0,
          tipoCuenta: 'AHORRO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    describe('numeroCuenta', () => {
      it('debe rechazar si numeroCuenta no es un string', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: 12345,
          saldo: 1000.0,
          tipoCuenta: 'AHORRO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('numeroCuenta');
      });

      it('debe rechazar si numeroCuenta está vacío', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: '',
          saldo: 1000.0,
          tipoCuenta: 'AHORRO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    describe('saldo', () => {
      it('debe aceptar saldos positivos', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: '001-123456789',
          saldo: 5000.50,
          tipoCuenta: 'AHORRO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('debe rechazar saldos negativos', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: '001-123456789',
          saldo: -100,
          tipoCuenta: 'AHORRO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        const saldoError = errors.find(e => e.property === 'saldo');
        expect(saldoError).toBeDefined();
      });

      it('debe rechazar saldo cero', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: '001-123456789',
          saldo: 0,
          tipoCuenta: 'AHORRO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        const saldoError = errors.find(e => e.property === 'saldo');
        expect(saldoError).toBeDefined();
      });

      it('debe rechazar si saldo no es un número', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: '001-123456789',
          saldo: 'mil pesos',
          tipoCuenta: 'AHORRO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    describe('tipoCuenta', () => {
      it('debe aceptar AHORRO como tipo de cuenta', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: '001-123456789',
          saldo: 1000.0,
          tipoCuenta: 'AHORRO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('debe aceptar CORRIENTE como tipo de cuenta', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: '001-123456789',
          saldo: 1000.0,
          tipoCuenta: 'CORRIENTE',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('debe aceptar PLAZO_FIJO como tipo de cuenta', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: '001-123456789',
          saldo: 1000.0,
          tipoCuenta: 'PLAZO_FIJO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('debe rechazar tipos de cuenta inválidos', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: '001-123456789',
          saldo: 1000.0,
          tipoCuenta: 'INVALIDO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        const tipoCuentaError = errors.find(e => e.property === 'tipoCuenta');
        expect(tipoCuentaError).toBeDefined();
      });

      it('debe rechazar si tipoCuenta está vacío', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: '001-123456789',
          saldo: 1000.0,
          tipoCuenta: '',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    describe('Campos faltantes', () => {
      it('debe rechazar si faltan todos los campos', async () => {
        const dto = plainToClass(CuentaRequestDto, {});

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.length).toBeGreaterThanOrEqual(4); // Debe tener al menos 4 errores
      });

      it('debe rechazar si falta socioId', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          numeroCuenta: '001-123456789',
          saldo: 1000.0,
          tipoCuenta: 'AHORRO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('debe rechazar si falta numeroCuenta', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          saldo: 1000.0,
          tipoCuenta: 'AHORRO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('debe rechazar si falta saldo', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: '001-123456789',
          tipoCuenta: 'AHORRO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('debe rechazar si falta tipoCuenta', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: '001-123456789',
          saldo: 1000.0,
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    describe('Casos extremos', () => {
      it('debe aceptar saldos decimales', async () => {
        const dto = plainToClass(CuentaRequestDto, {
          socioId: '123e4567-e89b-12d3-a456-426614174000',
          numeroCuenta: '001-123456789',
          saldo: 1234.56,
          tipoCuenta: 'AHORRO',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('debe aceptar números de cuenta con diferentes formatos', async () => {
        const formats = [
          '001-123456789',
          '12345678901234567890',
          'ACC-001-2024',
          '123',
        ];

        for (const numeroCuenta of formats) {
          const dto = plainToClass(CuentaRequestDto, {
            socioId: '123e4567-e89b-12d3-a456-426614174000',
            numeroCuenta,
            saldo: 1000.0,
            tipoCuenta: 'AHORRO',
          });

          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        }
      });
    });
  });
});
