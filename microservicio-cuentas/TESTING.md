# Guía de Pruebas Unitarias - Microservicio de Cuentas

## 📋 Descripción

Este documento describe las pruebas unitarias implementadas para el microservicio de cuentas de la cooperativa.

## 🧪 Cobertura de Pruebas

### Archivos de Prueba Creados

1. **cuentas.service.spec.ts** - Pruebas del servicio de cuentas
2. **cuentas.controller.spec.ts** - Pruebas del controlador
3. **cuenta-request.dto.spec.ts** - Pruebas de validación de DTOs
4. **cuenta.entity.spec.ts** - Pruebas de la entidad
5. **cuentas.module.spec.ts** - Pruebas del módulo
6. **app.module.spec.ts** - Pruebas del módulo principal

## 🚀 Ejecutar las Pruebas

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar pruebas en modo watch
```bash
npm run test:watch
```

### Generar reporte de cobertura
```bash
npm run test:cov
```

### Ejecutar pruebas en modo debug
```bash
npm run test:debug
```

## 📊 Casos de Prueba

### CuentasService (cuentas.service.spec.ts)

#### crearCuenta()
- ✅ Debe crear una cuenta exitosamente
- ✅ Debe lanzar ConflictException si el número de cuenta ya existe

#### actualizarCuenta()
- ✅ Debe actualizar una cuenta exitosamente
- ✅ Debe lanzar NotFoundException si la cuenta no existe
- ✅ Debe lanzar ConflictException si el nuevo número de cuenta ya existe
- ✅ Debe permitir actualizar con el mismo número de cuenta

#### obtenerCuenta()
- ✅ Debe retornar una cuenta por ID
- ✅ Debe lanzar NotFoundException si la cuenta no existe

#### obtenerCuentasPorSocio()
- ✅ Debe retornar todas las cuentas de un socio
- ✅ Debe retornar un array vacío si el socio no tiene cuentas

#### obtenerTodasCuentas()
- ✅ Debe retornar todas las cuentas activas
- ✅ Debe retornar un array vacío si no hay cuentas

#### eliminarCuenta()
- ✅ Debe eliminar una cuenta lógicamente
- ✅ Debe lanzar NotFoundException si la cuenta no existe

#### realizarRetiro()
- ✅ Debe realizar un retiro exitosamente
- ✅ Debe lanzar NotFoundException si la cuenta no existe
- ✅ Debe lanzar ConflictException si la cuenta no está activa
- ✅ Debe lanzar ConflictException si el saldo es insuficiente

#### realizarDeposito()
- ✅ Debe realizar un depósito exitosamente
- ✅ Debe lanzar NotFoundException si la cuenta no existe
- ✅ Debe lanzar ConflictException si la cuenta no está activa

### CuentasController (cuentas.controller.spec.ts)

- ✅ Pruebas de todos los endpoints HTTP
- ✅ Verificación de llamadas correctas al servicio
- ✅ Propagación de excepciones del servicio
- ✅ Validación de inyección de dependencias

### CuentaRequestDto (cuenta-request.dto.spec.ts)

#### Validaciones de socioId
- ✅ Debe rechazar si no es un string
- ✅ Debe rechazar si está vacío

#### Validaciones de numeroCuenta
- ✅ Debe rechazar si no es un string
- ✅ Debe rechazar si está vacío

#### Validaciones de saldo
- ✅ Debe aceptar saldos positivos
- ✅ Debe rechazar saldos negativos
- ✅ Debe rechazar saldo cero
- ✅ Debe rechazar si no es un número

#### Validaciones de tipoCuenta
- ✅ Debe aceptar AHORRO, CORRIENTE, PLAZO_FIJO
- ✅ Debe rechazar tipos inválidos
- ✅ Debe rechazar si está vacío

#### Campos faltantes
- ✅ Pruebas para cada campo requerido faltante

### Cuenta Entity (cuenta.entity.spec.ts)

- ✅ Creación de instancia
- ✅ Propiedades requeridas
- ✅ Estados válidos (ACTIVA, SUSPENDIDA, CANCELADA)
- ✅ Tipos de cuenta válidos
- ✅ Operaciones de saldo
- ✅ Hook generateId
- ✅ Valores por defecto

## 🛠️ Configuración

### Jest Configuration (jest.config.js)

```javascript
{
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node'
}
```

### Exclusiones de Cobertura

Los siguientes archivos están excluidos del reporte de cobertura:
- `*.module.ts` - Archivos de módulo
- `main.ts` - Archivo de bootstrap
- `*.interface.ts` - Interfaces
- `*.entity.ts` - Entidades (solo tienen decoradores)
- `*.dto.ts` - DTOs (solo tienen decoradores de validación)

## 📈 Métricas de Cobertura Esperadas

Se espera alcanzar:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## 🔍 Patrones de Prueba Utilizados

### 1. Mocking
```typescript
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};
```

### 2. Arrange-Act-Assert (AAA)
```typescript
// Arrange
mockRepository.findOne.mockResolvedValue(mockCuenta);

// Act
const result = await service.obtenerCuenta(id);

// Assert
expect(result).toEqual(expectedResult);
```

### 3. Test Doubles
- **Mocks**: Para repositorios y servicios
- **Stubs**: Para datos de prueba
- **Spies**: Para verificar llamadas a métodos

## 🐛 Debugging

Para debuggear una prueba específica:

1. Añade un breakpoint en VS Code
2. Ejecuta el comando de debug:
```bash
npm run test:debug
```
3. En Chrome, abre `chrome://inspect`
4. Click en "Open dedicated DevTools for Node"

## ✨ Mejores Prácticas Implementadas

1. **Nombres descriptivos**: Cada test describe claramente qué está probando
2. **Independencia**: Cada test es independiente y puede ejecutarse solo
3. **Limpieza**: Se usa `beforeEach` para limpiar mocks
4. **Coverage completo**: Se prueban casos exitosos y de error
5. **Validaciones exhaustivas**: Se verifican todos los casos límite
6. **Organización**: Tests agrupados por funcionalidad con `describe`

## 📝 Comandos Útiles

```bash
# Ejecutar solo tests de un archivo específico
npm test -- cuentas.service.spec.ts

# Ejecutar tests con verbosidad
npm test -- --verbose

# Actualizar snapshots
npm test -- -u

# Ejecutar tests relacionados con archivos modificados
npm test -- --onlyChanged

# Ver cobertura en el navegador
npm run test:cov
# Luego abrir: coverage/lcov-report/index.html
```

## 🔄 CI/CD

Las pruebas deben ejecutarse en el pipeline de CI/CD antes de cada merge a la rama principal.

```yaml
# Ejemplo para GitHub Actions
- name: Run Tests
  run: npm test

- name: Generate Coverage
  run: npm run test:cov
```

## 📚 Referencias

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [TypeORM Testing](https://typeorm.io/#/testing)

## 🤝 Contribuir

Al añadir nuevas funcionalidades:

1. Escribe las pruebas primero (TDD)
2. Asegúrate de mantener la cobertura > 80%
3. Sigue los patrones establecidos
4. Documenta casos especiales

---

**Última actualización**: Enero 2026
**Mantenido por**: Equipo de Desarrollo
