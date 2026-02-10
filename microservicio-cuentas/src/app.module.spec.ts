import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from './app.module';
import { CuentasModule } from './cuentas/cuentas.module';

describe('AppModule', () => {
  let appModule: TestingModule;

  beforeAll(async () => {
    appModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('debe estar definido', () => {
    expect(appModule).toBeDefined();
  });

  it('debe tener el módulo ConfigModule importado', () => {
    const configModule = appModule.get(ConfigModule);
    expect(configModule).toBeDefined();
  });

  it('debe tener el módulo CuentasModule importado', () => {
    const cuentasModule = appModule.get(CuentasModule);
    expect(cuentasModule).toBeDefined();
  });

  afterAll(async () => {
    if (appModule) {
      await appModule.close();
    }
  });
});
