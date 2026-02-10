# Cypress E2E Tests

Este directorio contiene las pruebas end-to-end (E2E) del sistema de gestión de socios usando Cypress.

## Estructura de Archivos

```
cypress/
├── e2e/
│   ├── socios.cy.js         # Pruebas completas del CRUD
│   └── flujo-simple.cy.js   # Pruebas de flujos básicos
├── support/
│   ├── commands.js          # Comandos personalizados
│   └── e2e.js              # Configuración global
└── fixtures/               # Datos de prueba (opcional)
```

## Instalación

```bash
npm install
```

## Ejecutar Pruebas

### Modo Interactivo (recomendado para desarrollo)
```bash
npm run cypress:open
```

### Modo Headless (para CI/CD)
```bash
npm run cypress:run
```

### Ejecutar solo pruebas E2E
```bash
npm run test:e2e
```

## Requisitos Previos

1. El servidor Spring Boot debe estar corriendo en `http://localhost:8080`
2. La base de datos PostgreSQL debe estar activa
3. El frontend debe estar accesible en `http://localhost:8080`

## Iniciar el servidor para pruebas

```bash
# En una terminal separada
./mvnw.cmd spring-boot:run
```

## Pruebas Incluidas

### socios.cy.js - Suite Completa
- ✅ Crear socio con validaciones
- ✅ Buscar socio por identificación
- ✅ Editar información del socio
- ✅ Eliminar socio con confirmación
- ✅ Validación de campos requeridos
- ✅ Manejo de errores (duplicados, no encontrados)
- ✅ Actualización de estadísticas
- ✅ Responsividad (móvil, tablet, desktop)

### flujo-simple.cy.js - Flujos Básicos
- ✅ Flujo simple de creación
- ✅ Flujo simple de búsqueda
- ✅ Flujo simple de edición

## Comandos Personalizados

### cy.crearSocio(socio)
Crea un socio usando la API directamente.

```javascript
cy.crearSocio({
  identificacion: '1712345678',
  nombres: 'Juan',
  apellidos: 'Pérez'
})
```

### cy.limpiarSocios()
Elimina todos los socios de la base de datos.

```javascript
cy.limpiarSocios()
```

### cy.llenarFormularioSocio(socio)
Llena el formulario con los datos proporcionados.

```javascript
cy.llenarFormularioSocio({
  identificacion: '1712345678',
  nombres: 'Juan',
  apellidos: 'Pérez',
  email: 'juan@test.com'
})
```

### cy.verificarSocioEnTabla(identificacion)
Verifica que un socio exista en la tabla.

```javascript
cy.verificarSocioEnTabla('1712345678')
```

## Configuración

La configuración de Cypress se encuentra en `cypress.config.js`:

```javascript
{
  baseUrl: 'http://localhost:8080',
  env: {
    apiUrl: 'http://localhost:8080/api/socios'
  }
}
```

## Capturas de Pantalla

Las capturas de pantalla de los fallos se guardan automáticamente en:
```
cypress/screenshots/
```

## Tips para Escribir Pruebas

1. **Usa beforeEach** para limpiar datos antes de cada prueba
2. **Usa comandos personalizados** para operaciones repetitivas
3. **Verifica mensajes de éxito/error** para confirmar operaciones
4. **Usa selectores por ID** cuando sea posible para mayor estabilidad
5. **Espera explícita** con `cy.wait()` solo cuando sea necesario

## Ejemplo de Prueba Básica

```javascript
describe('Mi Prueba', () => {
  beforeEach(() => {
    cy.limpiarSocios()
    cy.visit('/')
  })

  it('Debe crear un socio', () => {
    cy.llenarFormularioSocio({
      identificacion: '1712345678',
      nombres: 'Juan',
      apellidos: 'Pérez'
    })
    
    cy.get('#socioForm').submit()
    
    cy.contains('Socio creado exitosamente').should('be.visible')
    cy.verificarSocioEnTabla('1712345678')
  })
})
```

## Resolución de Problemas

### Error: Cannot visit base URL
- Verifica que el servidor esté corriendo
- Confirma que la URL en `cypress.config.js` sea correcta

### Error: Timeout waiting for element
- Aumenta el timeout en la configuración
- Verifica que el selector sea correcto
- Asegúrate de que el elemento exista en el DOM

### Error: Network request failed
- Verifica que la API esté respondiendo
- Confirma que `apiUrl` en la configuración sea correcta
- Revisa que no haya problemas de CORS
