# ============================================
# Stage 1: Build
# ============================================
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copiar archivos Maven
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Descargar dependencias (cacheado si pom.xml no cambia)
RUN mvn dependency:go-offline -B

# Copiar código fuente
COPY src ./src

# Build (skip tests para velocidad, se asume que ya pasaron en CI/local)
RUN mvn clean package -DskipTests -B

# ============================================
# Stage 2: Production
# ============================================
FROM eclipse-temurin:21-jre-alpine AS production

# Instalar curl para healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copiar JAR desde stage anterior
COPY --from=builder /build/target/*.jar app.jar

# Usuario no-root para seguridad
RUN addgroup -g 1001 spring && \
    adduser -D -u 1001 -G spring spring && \
    chown -R spring:spring /app

USER spring

# Puerto de la aplicación
EXPOSE 8080

# Variables de entorno por defecto
ENV SPRING_PROFILES_ACTIVE=docker \
    JAVA_OPTS="-Xmx512m -Xms256m -XX:MaxMetaspaceSize=128m -XX:+UseG1GC"

# Health check usando actuator
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Comando de inicio
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
