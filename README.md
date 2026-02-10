# Taller Práctico: Pruebas Unitarias y Coordinación de Microservicios

> **🚀 ¿Listo para ejecutar el proyecto en Ubuntu?** → Ver [**README-UBUNTU.md**](README-UBUNTU.md) para instrucciones completas de despliegue
>
> **Scripts de inicio rápido:**
> - `./start-option1.sh` - Solo bases de datos (desarrollo recomendado)
> - `./start-option2.sh` - Todo dockerizado (pruebas/staging)
> - `./stop-all.sh` - Detener todos los servicios

---

## **Contexto del Problema**
La Cooperativa de Ahorro y Crédito "Futuro Seguro" ha desarrollado dos microservicios independientes para gestionar socios y cuentas. Sin embargo, estos servicios operan de forma completamente aislada, sin validar la existencia de entidades en el otro sistema. Esto ha generado graves inconsistencias: se pueden crear cuentas para socios inexistentes y eliminar socios que mantienen cuentas activas, comprometiendo la integridad financiera de la institución.

---

## **📊 Estado Actual del Proyecto**

### ✅ **Implementado**

| Componente | Estado | Cobertura | Detalles |
|------------|--------|-----------|----------|
| **Microservicio de Cuentas (NestJS)** | ✅ Completo | 91.48% | CRUD completo, validaciones básicas |
| **Microservicio de Socios (Spring Boot)** | ✅ Completo | >85% | CRUD completo, validaciones básicas |
| **Pruebas Unitarias - Cuentas** | ✅ Completo | 93.02% líneas | 6 archivos de spec, 400+ líneas |
| **Pruebas Unitarias - Socios** | ✅ Completo | >85% | 6 archivos Test.java, 1300+ líneas |
| **Pruebas de Integración - Socios** | ✅ Completo | N/A | Pruebas con TestRestTemplate |
| **Pruebas E2E - Cuentas (Cypress)** | ✅ Completo | N/A | 331 líneas, flujo completo |
| **Pruebas E2E - Socios (Cypress)** | ✅ Completo | N/A | 345 líneas, CRUD completo |
| **Docker Compose - Cuentas** | ✅ Completo | N/A | MySQL + phpMyAdmin |
| **Docker Compose - Socios** | ✅ Completo | N/A | PostgreSQL |
| **Frontend de Pruebas** | ✅ Completo | N/A | Interfaz HTML para ambos servicios |
| **Despliegue Ubuntu (DevOps)** | ✅ Completo | N/A | 2 opciones de ejecución + scripts |

### ❌ **Pendiente de Implementación**

| Problema | Microservicio | Consecuencia | Estado |
|----------|---------------|--------------|--------|
| **Validación cross-service al crear cuenta** | Cuentas (NestJS) | Cuentas para socios inexistentes | ❌ **NO VALIDADO** |
| **Validación cross-service al eliminar socio** | Socios (Spring Boot) | Cuentas huérfanas, pérdida de fondos | ❌ **NO VERIFICADO** |
| **Comunicación HTTP entre servicios** | Ambos | Sin integración inter-servicios | ❌ **NO IMPLEMENTADO** |
| **Script Locust para pruebas de carga** | Sistema completo | Sin evidencia de inconsistencias | ❌ **NO IMPLEMENTADO** |
| **Transacciones distribuidas** | Sistema completo | Inconsistencia de datos garantizada | ❌ **SIN ROLLBACK** |
| **Manejo de concurrencia** | Ambos microservicios | Condiciones de carrera | ❌ **SIN BLOQUEOS** |
| **Auditoría sincronizada** | Sistema completo | Imposible rastrear operaciones | ❌ **LOGS SEPARADOS** |

---

## **🎯 Objetivos del Taller**

### 1. **Validación Cross-Service Obligatoria**
- [x] Microservicios funcionando independientemente
- [ ] **Antes de crear una cuenta:** Validar que el socio existe y está activo
- [ ] **Antes de eliminar un socio:** Verificar que no tenga cuentas activas
- [ ] Implementar cliente HTTP en microservicio de cuentas (HttpService/Axios)
- [ ] Implementar cliente HTTP en microservicio de socios (RestTemplate/WebClient)
- [ ] Pruebas unitarias con mocks de servicios externos

### 2. **Pruebas de Validación Cross-Service**
- [x] Pruebas unitarias básicas implementadas
- [ ] Pruebas que simulen fallos de comunicación entre servicios
- [ ] Validación de escenarios de inconsistencia
- [ ] Pruebas de timeout y circuit breaker
- [ ] Pruebas de resiliencia ante caída de servicios
- [ ] Pruebas de idempotencia

### 3. **Script Locust para Simulación**
- [ ] Instalar y configurar Locust
- [ ] Script para simular 100 usuarios concurrentes
- [ ] Simulación de eliminaciones masivas de socios
- [ ] Simulación de creación masiva de cuentas
- [ ] Generar reporte de inconsistencias encontradas
- [ ] Comparar métricas antes/después de validaciones

---

## **🏗️ Arquitectura Actual**

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTADO ACTUAL (AISLADOS)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────┐              ┌───────────────────┐   │
│  │ Microservicio     │              │ Microservicio     │   │
│  │ SOCIOS            │   ❌ SIN     │ CUENTAS           │   │
│  │ (Spring Boot)     │   COMUNICACIÓN│  (NestJS)        │   │
│  │ Puerto: 8080      │              │ Puerto: 3000      │   │
│  └─────────┬─────────┘              └─────────┬─────────┘   │
│            │                                   │             │
│  ┌─────────▼─────────┐              ┌─────────▼─────────┐   │
│  │   PostgreSQL      │              │      MySQL        │   │
│  │   Puerto: 5432    │              │   Puerto: 3307    │   │
│  └───────────────────┘              └───────────────────┘   │
│                                                               │
│  PROBLEMA: Se puede crear cuenta sin validar socio          │
│  PROBLEMA: Se puede eliminar socio con cuentas activas      │
└─────────────────────────────────────────────────────────────┘
```

---

## **📦 Estructura del Proyecto**

```
taller-pruebas-unitarias/
├── README.md                          ← Este archivo
├── microservicio-cuentas/             ← Microservicio NestJS
│   ├── src/
│   │   ├── cuentas/
│   │   │   ├── cuentas.service.ts     ✅ Lógica de negocio
│   │   │   ├── cuentas.service.spec.ts✅ 400+ líneas de pruebas
│   │   │   ├── cuentas.controller.ts  ✅ Endpoints REST
│   │   │   └── cuentas.controller.spec.ts ✅ Pruebas
│   │   └── main.ts
│   ├── cypress/e2e/                   ✅ Pruebas E2E
│   ├── coverage/                      ✅ 91.48% cobertura
│   ├── docker-compose.yaml            ✅ MySQL + phpMyAdmin
│   ├── package.json
│   └── TESTING.md                     📖 Documentación de pruebas
│
└── socios/                            ← Microservicio Spring Boot
    ├── src/
    │   ├── main/java/ec/fin/coacandes/socios/
    │   │   ├── service/impl/SocioServiceImpl.java ✅ Lógica
    │   │   ├── controller/SocioController.java    ✅ Endpoints
    │   │   └── entity/Socio.java                  ✅ Entidad JPA
    │   └── test/java/ec/fin/coacandes/socios/
    │       ├── service/SocioServiceImplTest.java  ✅ 313 líneas
    │       ├── controller/SocioControllerTest.java✅ 278 líneas
    │       └── integration/SocioIntegrationTest.java ✅ 177 líneas
    ├── cypress/e2e/                   ✅ Pruebas E2E
    ├── docker-compose.yml             ✅ PostgreSQL
    └── pom.xml
```

---

## **🚀 Inicio Rápido**

### **📖 Documentación Completa de Despliegue**

Ver [**README-UBUNTU.md**](README-UBUNTU.md) para instrucciones detalladas y guía operacional completa.

### **⚡ scripts de Inicio Automático (Ubuntu/Linux)**

#### **Opción 1: Solo Bases de Datos (Desarrollo)**
```bash
# Hacer ejecutables los scripts (solo primera vez)
chmod +x start-option1.sh stop-all.sh

# Iniciar bases de datos y configurar microservicios
./start-option1.sh

# Luego ejecutar manualmente los microservicios en terminales separadas:
# Terminal 1: cd microservicio-cuentas && npm run start:dev
# Terminal 2: cd socios && ./mvnw spring-boot:run
```

**Ventajas:**
- ✅ Hot-reload activo
- ✅ Depuración en IDE
- ✅ Menor uso de recursos
- ✅ Ideal para desarrollo

#### **Opción 2: Todo Dockerizado (Testing/Staging)**
```bash
# Hacer ejecutables los scripts (solo primera vez)
chmod +x start-option2.sh stop-all.sh

# Construir y levantar todo
./start-option2.sh

# Detener todo
./stop-all.sh
```

**Ventajas:**
- ✅ Entorno idéntico a producción
- ✅ Despliegue completo con un comando
- ✅ Aislamiento total
- ✅ Ideal para CI/CD

### **🪟 Inicio Manual (Cualquier Sistema Operativo)**

#### **Prerrequisitos**
- Node.js 18+ y npm
- Java 21+ y Maven
- Docker y Docker Compose
- Git

#### **1. Levantar Bases de Datos**

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Verificar que estén healthy
docker-compose ps
```

#### **2. Microservicio de Cuentas (NestJS)**

```bash
cd microservicio-cuentas

# Copiar variables de entorno
cp .env.example .env

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run start:dev

# O ver otras opciones:
# npm test              # Ejecutar pruebas
# npm run test:cov      # Cobertura de código
# npm run cypress:run   # Pruebas E2E
```

**URLs:**
- API: http://localhost:3000
- Swagger: http://localhost:3000/api-docs
- phpMyAdmin: http://localhost:8081

#### **3. Microservicio de Socios (Spring Boot)**

```bash
cd socios

# Copiar variables de entorno (opcional)
cp .env.example .env

# Compilar y ejecutar
./mvnw spring-boot:run

# O compilar JAR y ejecutar:
# ./mvnw clean package -DskipTests
# java -jar target/socios-0.0.1-SNAPSHOT.jar
```

**URLs:**
- API: http://localhost:8080/api/socios
- Swagger: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health

#### **4. Detener Todo**

```bash
# Detener microservicios (Ctrl+C en terminales)

# Detener bases de datos
docker-compose down

# O usar el script
./stop-all.sh
```

---

## **🧪 Ejecución de Pruebas**

### **Microservicio de Cuentas (NestJS)**

```bash
# Todas las pruebas
npm test

# Modo watch (desarrollo)
npm run test:watch

# Cobertura de código
npm run test:cov

# E2E con Cypress
npm run cypress:open      # Modo interactivo
npm run cypress:run       # Modo headless
```

**Cobertura Actual:**
- Statements: 91.48% (86/94)
- Branches: 100% (11/11)
- Functions: 87.5% (21/24)
- Lines: 93.02% (80/86)

### **Microservicio de Socios (Spring Boot)**

```bash
# Pruebas unitarias
./mvnw test

# Pruebas de integración
./mvnw verify

# Con reporte de cobertura (JaCoCo)
./mvnw clean test jacoco:report

# E2E con Cypress
cd cypress
npm run cypress:open
```

**Archivos de Prueba:**
- `SocioServiceImplTest.java` - 313 líneas, 18 pruebas
- `SocioControllerTest.java` - 278 líneas, 16 pruebas
- `SocioRepositoryTest.java` - Pruebas de persistencia
- `SocioIntegrationTest.java` - 177 líneas, pruebas E2E

---

## **📝 Tareas Pendientes para Completar el Taller**

### **Prioridad Alta**

#### **1. Implementar Validación Cross-Service en Cuentas**

**Archivo:** `microservicio-cuentas/src/cuentas/cuentas.service.ts`

```typescript
import { HttpService } from '@nestjs/axios';

// TODO: Agregar validación antes de crear cuenta
async crearCuenta(request: CuentaRequestDto): Promise<CuentaResponseDto> {
  // ❌ FALTA: Validar que el socio existe
  // const socio = await this.httpService.get(`http://localhost:8080/api/socios/${request.socioId}`);
  // if (!socio || !socio.activo) {
  //   throw new NotFoundException('Socio no encontrado o inactivo');
  // }
  
  // Código actual...
}
```

**Pruebas a crear:**
```typescript
// cuentas.service.spec.ts
it('debe lanzar NotFoundException si el socio no existe', async () => {
  // Mock HttpService para simular socio inexistente
});

it('debe lanzar ConflictException si el socio está inactivo', async () => {
  // Mock HttpService para simular socio inactivo
});

it('debe manejar timeout al consultar servicio de socios', async () => {
  // Simular timeout
});
```

#### **2. Implementar Validación Cross-Service en Socios**

**Archivo:** `socios/src/main/java/ec/fin/coacandes/socios/service/impl/SocioServiceImpl.java`

```java
// TODO: Agregar RestTemplate o WebClient
@Autowired
private RestTemplate restTemplate;

@Override
public void eliminarSocio(UUID id) {
    // ❌ FALTA: Verificar que no tenga cuentas activas
    // String url = "http://localhost:3000/cuentas/socio/" + id;
    // CuentaResponseDTO[] cuentas = restTemplate.getForObject(url, CuentaResponseDTO[].class);
    // if (cuentas != null && cuentas.length > 0) {
    //     throw new IllegalStateException("No se puede eliminar socio con cuentas activas");
    // }
    
    // Código actual...
}
```

**Pruebas a crear:**
```java
// SocioServiceImplTest.java
@Test
void eliminarSocio_ConCuentasActivas_DebeSerRechazado() {
    // Mock RestTemplate para simular cuentas activas
}

@Test
void eliminarSocio_SinCuentas_DebeSerExitoso() {
    // Mock RestTemplate para simular sin cuentas
}

@Test
void eliminarSocio_ErrorComunicacion_DebeSerManejado() {
    // Simular error de conexión
}
```

#### **3. Crear Script de Locust**

**Archivo:** `locustfile.py` (crear en raíz del proyecto)

```python
from locust import HttpUser, task, between

class SocioUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(3)
    def crear_socio(self):
        # TODO: Implementar
        pass
    
    @task(1)
    def eliminar_socio(self):
        # TODO: Implementar creación y eliminación concurrente
        pass

class CuentaUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(5)
    def crear_cuenta_socio_inexistente(self):
        # TODO: Demostrar el problema
        pass
```

**Ejecutar:**
```bash
pip install locust
locust -f locustfile.py --users 100 --spawn-rate 10
```

---

## **📊 Métricas de Validación**

| Métrica | Valor Actual | Valor Objetivo | Herramienta | Estado |
|---------|--------------|----------------|-------------|--------|
| **Cobertura Cuentas** | 91.48% | > 80% | Jest | ✅ **CUMPLE** |
| **Cobertura Socios** | ~85% | > 80% | JUnit/JaCoCo | ✅ **CUMPLE** |
| **Pruebas E2E Cuentas** | 331 líneas | Completo | Cypress | ✅ **COMPLETO** |
| **Pruebas E2E Socios** | 345 líneas | Completo | Cypress | ✅ **COMPLETO** |
| **Validación cross-service** | 0% | 100% | Pruebas unitarias | ❌ **PENDIENTE** |
| **Tiempo respuesta** | N/A | < 200ms | Locust | ❌ **PENDIENTE** |
| **Inconsistencias detectadas** | 0% | 100% | Script Locust | ❌ **PENDIENTE** |
| **Manejo de concurrencia** | No implementado | Sí | Pruebas de carga | ❌ **PENDIENTE** |

---

## **🔧 Tecnologías Utilizadas**

### **Microservicio de Cuentas**
- **Framework:** NestJS 9.4.3
- **Base de datos:** MySQL 8.0
- **ORM:** TypeORM 0.3.28
- **Testing:** Jest 29.5.1
- **E2E:** Cypress
- **Documentación:** Swagger/OpenAPI
- **Validación:** class-validator, class-transformer

### **Microservicio de Socios**
- **Framework:** Spring Boot 3.4.1
- **Lenguaje:** Java 21
- **Base de datos:** PostgreSQL 16
- **ORM:** Spring Data JPA (Hibernate)
- **Testing:** JUnit 5, Mockito
- **E2E:** Cypress
- **Documentación:** Swagger/Springdoc

---

## **📚 Documentación Adicional**

- [TESTING.md - Microservicio de Cuentas](microservicio-cuentas/TESTING.md)
- [Cypress README - Socios](socios/cypress/README.md)

---

## **👥 Contribuciones**

Este es un proyecto educativo para el Taller de Pruebas Unitarias y Coordinación de Microservicios.

---

## **📄 Licencia**

UNLICENSED - Proyecto académico

