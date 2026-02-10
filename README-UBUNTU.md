# 🐧 Guía de Despliegue en Ubuntu Desktop

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Opción 1: Solo Bases de Datos en Docker](#opción-1-solo-bases-de-datos-en-docker-recomendado)
4. [Opción 2: Todo Dockerizado](#opción-2-todo-dockerizado)
5. [Verificación y Pruebas](#verificación-y-pruebas)
6. [Comandos Útiles](#comandos-útiles)
7. [Troubleshooting](#troubleshooting)
8. [Acceso desde Otra Máquina (Kali)](#acceso-desde-otra-máquina-kali)

---

## Prerequisitos

### Software Requerido

```bash
# 1. Docker y Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER  # Reiniciar sesión después

# 2. Node.js 18+ y npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar versiones
node --version    # Debe ser >= 18.x
npm --version     # Debe ser >= 9.x

# 3. Java 21 y Maven
sudo apt install -y openjdk-21-jdk maven

# Verificar versiones
java -version     # Debe ser 21.x
mvn -version      # Debe ser >= 3.8
```

### Verificar Instalación

```bash
docker --version
docker-compose --version
node --version
npm --version
java -version
mvn -version
```

### Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd taller-pruebas-unitarias
```

---

## Arquitectura del Sistema

### Puertos Utilizados

| Servicio | Puerto Host | Puerto Interno | URL |
|----------|-------------|----------------|-----|
| **Microservicio Cuentas (NestJS)** | 3000 | 3000 | http://localhost:3000 |
| **Microservicio Socios (Spring Boot)** | 8080 | 8080 | http://localhost:8080 |
| **MySQL** | 3307 | 3306 | localhost:3307 |
| **phpMyAdmin** | 8081 | 80 | http://localhost:8081 |
| **PostgreSQL** | 5432 | 5432 | localhost:5432 |

**⚠️ Importante:** Asegúrate de que estos puertos estén libres antes de iniciar.

```bash
# Verificar puertos en uso
sudo netstat -tulpn | grep -E ':(3000|8080|3307|8081|5432)'
```

---

## Opción 1: Solo Bases de Datos en Docker (RECOMENDADO)

**Ventajas:**
- Hot-reload activo para desarrollo
- Depuración directa en IDE
- Menor uso de recursos
- Cambios en código visibles instantáneamente

### 1️⃣ Levantar Bases de Datos

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Esperar a que estén healthy (30-60 segundos)
docker-compose ps
```

**Servicios levantados:**
- ✅ MySQL en puerto 3307
- ✅ phpMyAdmin en puerto 8081
- ✅ PostgreSQL en puerto 5432

### 2️⃣ Configurar y Ejecutar Microservicio de Cuentas (NestJS)

```bash
cd microservicio-cuentas

# Copiar variables de entorno
cp .env.example .env

# Editar .env si es necesario (ya está configurado para localhost)
# nano .env

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (con hot-reload)
npm run start:dev

# O en modo producción
# npm run build
# npm run start:prod
```

**Consola debe mostrar:**
```
Microservicio de Cuentas ejecutándose en http://localhost:3000
Formulario web disponible en http://localhost:3000
Swagger disponible en http://localhost:3000/api-docs
```

### 3️⃣ Configurar y Ejecutar Microservicio de Socios (Spring Boot)

**Abrir NUEVA terminal:**

```bash
cd socios

# Opcional: Copiar .env.example (Spring Boot lee application.properties por defecto)
cp .env.example .env

# Compilar y ejecutar con Maven
./mvnw clean spring-boot:run

# O compilar JAR y ejecutar
# ./mvnw clean package -DskipTests
# java -jar target/socios-0.0.1-SNAPSHOT.jar
```

**Consola debe mostrar:**
```
Started SociosApplication in X.XXX seconds
Tomcat started on port(s): 8080 (http)
```

### 4️⃣ Verificación Rápida

```bash
# En otra terminal

# Verificar Cuentas (NestJS)
curl http://localhost:3000/cuentas

# Verificar Socios (Spring Boot)
curl http://localhost:8080/api/socios

# Verificar bases de datos
docker-compose ps
```

### 5️⃣ Detener Todo

```bash
# Detener microservicios (Ctrl+C en cada terminal)

# Detener bases de datos (sin perder datos)
docker-compose stop

# Detener y eliminar contenedores (SIN perder datos)
docker-compose down

# Detener y eliminar TODO (incluyendo datos)
docker-compose down -v
```

---

## Opción 2: Todo Dockerizado

**Ventajas:**
- Entorno idéntico a producción
- Fácil despliegue completo
- Aislamiento total
- Ideal para pruebas de integración

### 1️⃣ Construir Imágenes

```bash
# Desde la raíz del proyecto

# Construir imagen de Cuentas (NestJS)
docker build -t cooperativa/cuentas-service:latest ./microservicio-cuentas

# Construir imagen de Socios (Spring Boot) - tarda más
docker build -t cooperativa/socios-service:latest ./socios

# Verificar imágenes creadas
docker images | grep cooperativa
```

### 2️⃣ Levantar Todo el Sistema

```bash
# Levantar todos los servicios
docker-compose -f docker-compose.full.yml up -d

# Ver logs en tiempo real
docker-compose -f docker-compose.full.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.full.yml logs -f cuentas-service
docker-compose -f docker-compose.full.yml logs -f socios-service

# Esperar a que todos estén healthy (60-120 segundos)
docker-compose -f docker-compose.full.yml ps
```

**Todos los servicios deben estar "Up (healthy)"**

### 3️⃣ Verificación

```bash
# Verificar salud de servicios
curl http://localhost:3000/api-docs
curl http://localhost:8080/actuator/health

# Ver estado de contenedores
docker ps
```

### 4️⃣ Reconstruir Después de Cambios

```bash
# Si modificaste código, reconstruir:
docker-compose -f docker-compose.full.yml up -d --build

# O reconstruir servicio específico:
docker-compose -f docker-compose.full.yml up -d --build cuentas-service
```

### 5️⃣ Detener Todo

```bash
# Detener sin perder datos
docker-compose -f docker-compose.full.yml stop

# Detener y eliminar contenedores (sin perder datos de BDs)
docker-compose -f docker-compose.full.yml down

# Detener y eliminar TODO (incluyendo volúmenes)
docker-compose -f docker-compose.full.yml down -v
```

---

## Verificación y Pruebas

### URLs de Acceso

#### Microservicio de Cuentas (NestJS)
- **Frontend:** http://localhost:3000
- **Swagger:** http://localhost:3000/api-docs
- **API:** http://localhost:3000/cuentas

#### Microservicio de Socios (Spring Boot)
- **Swagger:** http://localhost:8080/swagger-ui.html
- **API:** http://localhost:8080/api/socios
- **Health:** http://localhost:8080/actuator/health

#### Bases de Datos
- **phpMyAdmin:** http://localhost:8081
  - Server: `mysql-cuentas`
  - User: `root`
  - Password: `root123`
- **PostgreSQL:** `localhost:5432`
  - Database: `cooperativa_socios`
  - User: `postgres`
  - Password: `postgres`

### Pruebas con curl

#### Listar Cuentas
```bash
curl -X GET http://localhost:3000/cuentas
```

#### Crear Cuenta
```bash
curl -X POST http://localhost:3000/cuentas \
  -H "Content-Type: application/json" \
  -d '{
    "socioId": "123e4567-e89b-12d3-a456-426614174000",
    "numeroCuenta": "001-1234567",
    "tipoCuenta": "AHORRO",
    "saldo": 1000.00
  }'
```

#### Listar Socios
```bash
curl -X GET http://localhost:8080/api/socios
```

#### Crear Socio
```bash
curl -X POST http://localhost:8080/api/socios \
  -H "Content-Type: application/json" \
  -d '{
    "identificacion": "1712345678",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "email": "juan.perez@test.com",
    "telefono": "0987654321",
    "direccion": "Av. Principal 123",
    "tipoIdentificacion": "CEDULA"
  }'
```

### Verificar Bases de Datos

#### MySQL (Cuentas)
```bash
# Conectar desde línea de comandos
docker exec -it cooperativa-mysql mysql -uroot -proot123 cooperativa_cuentas

# Listar tablas
mysql> SHOW TABLES;
mysql> SELECT * FROM cuenta;
mysql> exit;
```

#### PostgreSQL (Socios)
```bash
# Conectar desde línea de comandos
docker exec -it cooperativa-postgres psql -U postgres -d cooperativa_socios

# Listar tablas
postgres=# \dt
postgres=# SELECT * FROM socio;
postgres=# \q
```

---

## Comandos Útiles

### Docker Compose

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f mysql-cuentas
docker-compose logs -f postgres-socios

# Ver estado de servicios
docker-compose ps

# Reiniciar un servicio
docker-compose restart mysql-cuentas

# Ver uso de recursos
docker stats

# Inspeccionar red
docker network inspect cooperativa-network

# Ver volúmenes
docker volume ls | grep cooperativa
```

### Docker General

```bash
# Ver todos los contenedores (incluso detenidos)
docker ps -a

# Ver imágenes
docker images

# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes no usadas
docker image prune

# Limpiar todo (CUIDADO: elimina todo lo no usado)
docker system prune -a

# Ver uso de espacio
docker system df
```

### Logs de Aplicaciones

```bash
# Opción 1 (servicios en terminal)
# Los logs se ven directamente en la terminal

# Opción 2 (dockerizado)
docker logs -f cooperativa-cuentas-service
docker logs -f cooperativa-socios-service

# Ver últimas 100 líneas
docker logs --tail 100 cooperativa-cuentas-service

# Logs con timestamp
docker logs -t cooperativa-socios-service
```

---

## Troubleshooting

### Problema: Puerto en uso

```bash
# Error: "address already in use"

# Identificar proceso usando el puerto
sudo lsof -i :3000
sudo lsof -i :8080
sudo lsof -i :3307
sudo lsof -i :5432

# Matar proceso específico
sudo kill -9 <PID>
```

### Problema: Contenedor no arranca (Unhealthy)

```bash
# Ver logs del contenedor
docker logs cooperativa-mysql
docker logs cooperativa-postgres

# Ver inspect del contenedor
docker inspect cooperativa-mysql

# Reiniciar contenedor
docker restart cooperativa-mysql

# Si persiste, recrear
docker-compose down
docker-compose up -d
```

### Problema: No se conecta a base de datos

```bash
# Verificar que el contenedor esté healthy
docker-compose ps

# Verificar conectividad
docker exec -it cooperativa-mysql mysqladmin ping -uroot -proot123
docker exec -it cooperativa-postgres pg_isready -U postgres

# Verificar variables de entorno en .env
cat microservicio-cuentas/.env

# Para Opción 1: asegurarse de usar localhost:3307 (no 3306)
# Para Opción 2: usar nombres de contenedor (mysql-cuentas, postgres-socios)
```

### Problema: Error al compilar Maven (Socios)

```bash
# Limpiar cache de Maven
./mvnw clean

# Descargar dependencias de nuevo
./mvnw dependency:purge-local-repository

# Compilar sin tests
./mvnw clean package -DskipTests

# Aumentar memoria de Maven si falla
export MAVEN_OPTS="-Xmx1024m"
./mvnw clean package
```

### Problema: Error al instalar dependencias npm (Cuentas)

```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Si persisten errores de permisos
sudo chown -R $USER:$USER .
npm install
```

### Problema: Volúmenes llenos o corruptos

```bash
# Ver volúmenes
docker volume ls

# Eliminar volúmenes (PERDERÁS LOS DATOS)
docker-compose down -v

# Listar volúmenes huérfanos
docker volume ls -qf dangling=true

# Eliminar volúmenes huérfanos
docker volume prune
```

### Problema: Firewall bloquea puertos

```bash
# Verificar firewall
sudo ufw status

# Abrir puertos necesarios
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 8081/tcp

# O deshabilitar temporalmente (NO RECOMENDADO para producción)
sudo ufw disable
```

---

## Acceso desde Otra Máquina (Kali)

### En Ubuntu (Servidor)

#### 1. Obtener IP de Ubuntu

```bash
# IP de la interfaz de red
ip addr show

# O más simple
hostname -I
```

Ejemplo de salida: `192.168.1.100`

#### 2. Configurar Firewall

```bash
# Permitir acceso desde red local
sudo ufw allow from 192.168.1.0/24 to any port 3000
sudo ufw allow from 192.168.1.0/24 to any port 8080
sudo ufw allow from 192.168.1.0/24 to any port 8081
sudo ufw allow from 192.168.1.0/24 to any port 3307
sudo ufw allow from 192.168.1.0/24 to any port 5432

# Recargar firewall
sudo ufw reload

# Verificar reglas
sudo ufw status numbered
```

#### 3. Verificar que Docker expone en todas las interfaces

```bash
# Verificar binding
sudo netstat -tulpn | grep -E ':(3000|8080|8081|3307|5432)'

# Debe mostrar 0.0.0.0:PUERTO (no 127.0.0.1:PUERTO)
```

**Si muestra 127.0.0.1:** los servicios solo escuchan en localhost.

**Solución para Opción 1 (NestJS):**
```typescript
// En src/main.ts, cambiar:
await app.listen(3000);
// Por:
await app.listen(3000, '0.0.0.0');
```

**Solución para Opción 1 (Spring Boot):**
```properties
# En application.properties, agregar:
server.address=0.0.0.0
```

**Opción 2 (Docker):** Ya está configurado correctamente.

### En Kali (Cliente)

#### 1. Verificar conectividad

```bash
# Ping a Ubuntu
ping 192.168.1.100

# Verificar puertos abiertos
nmap -p 3000,8080,8081,3307,5432 192.168.1.100

# Prueba con telnet
telnet 192.168.1.100 3000
```

#### 2. Acceder a servicios

```bash
# Microservicio de Cuentas
curl http://192.168.1.100:3000/cuentas
firefox http://192.168.1.100:3000/api-docs

# Microservicio de Socios
curl http://192.168.1.100:8080/api/socios
firefox http://192.168.1.100:8080/swagger-ui.html

# phpMyAdmin
firefox http://192.168.1.100:8081

# Conectar a MySQL desde Kali
mysql -h 192.168.1.100 -P 3307 -u root -proot123 cooperativa_cuentas

# Conectar a PostgreSQL desde Kali
psql -h 192.168.1.100 -p 5432 -U postgres -d cooperativa_socios
```

#### 3. Pruebas de carga con herramientas de Kali

```bash
# Instalar Apache Bench
sudo apt install apache2-utils

# Prueba de carga simple
ab -n 1000 -c 10 http://192.168.1.100:3000/cuentas

# Sqlmap para pruebas de seguridad
sqlmap -u "http://192.168.1.100:3000/cuentas/1" --batch

# Nikto para escaneo web
nikto -h http://192.168.1.100:3000
```

---

## Monitoreo y Performance

### Ver Uso de Recursos

```bash
# CPU y memoria de contenedores
docker stats

# Uso detallado de un contenedor
docker stats cooperativa-mysql --no-stream

# Top de procesos en un contenedor
docker top cooperativa-cuentas-service
```

### Limitar Recursos (ya configurado en docker-compose.full.yml)

Los límites actuales:
- **MySQL:** 512MB RAM, 1 CPU
- **PostgreSQL:** 256MB RAM, 0.5 CPU
- **Cuentas Service:** 512MB RAM, 1 CPU
- **Socios Service:** 768MB RAM, 1.5 CPU

Para equipos con menos recursos, editar `docker-compose.full.yml`:
```yaml
deploy:
  resources:
    limits:
      memory: 256M  # Reducir
      cpus: '0.5'   # Reducir
```

---

## Notas Finales

### Buenas Prácticas

1. **Desarrollo:** Usar Opción 1 para hot-reload y debugging
2. **Testing/Staging:** Usar Opción 2 para entorno controlado
3. **Backups:** Exportar datos regularmente
   ```bash
   # MySQL
   docker exec cooperativa-mysql mysqldump -uroot -proot123 cooperativa_cuentas > backup_cuentas.sql
   
   # PostgreSQL
   docker exec cooperativa-postgres pg_dump -U postgres cooperativa_socios > backup_socios.sql
   ```
4. **Logs:** Revisar logs regularmente para detectar errores
5. **Actualizaciones:** Mantener imágenes Docker actualizadas
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

### Limpieza Periódica

```bash
# Limpiar logs de Docker
sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log

# Limpiar sistema (libera espacio)
docker system prune -a --volumes

# Limpiar builds de Maven
cd socios && ./mvnw clean

# Limpiar node_modules (si no desarrollas)
cd microservicio-cuentas
rm -rf node_modules dist coverage
```

---

## 📞 Soporte

Si encuentras problemas:
1. Revisar sección de [Troubleshooting](#troubleshooting)
2. Ver logs: `docker-compose logs -f`
3. Verificar documentación del README principal
4. Verificar issues en el repositorio

---

**¡Sistema listo para usar! 🚀**
