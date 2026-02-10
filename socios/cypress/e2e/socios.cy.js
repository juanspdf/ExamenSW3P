describe('Sistema de Gestión de Socios - Flujo Completo', () => {
  
  beforeEach(() => {
    // Limpiar la base de datos antes de cada prueba
    cy.request('DELETE', `${Cypress.env('apiUrl')}/limpiar-todo`)
    
    // Visitar la página principal
    cy.visit('/')
    
    // Verificar que la página cargue correctamente
    cy.contains('Sistema de Gestión de Socios').should('be.visible')
  })

  describe('Crear Socio', () => {
    it('Debe crear un nuevo socio exitosamente', () => {
      // Llenar el formulario
      cy.get('#tipoIdentificacion').select('CEDULA')
      cy.get('#identificacion').type('1712345678')
      cy.get('#nombres').type('Juan Carlos')
      cy.get('#apellidos').type('Pérez García')
      cy.get('#email').type('juan.perez@test.com')
      cy.get('#telefono').type('0987654321')
      cy.get('#direccion').type('Av. Principal 123, Quito')

      // Enviar el formulario
      cy.get('#socioForm').submit()

      // Verificar mensaje de éxito
      cy.contains('Socio creado exitosamente').should('be.visible')

      // Verificar que el socio aparezca en la tabla
      cy.contains('1712345678').should('be.visible')
      cy.contains('Juan Carlos').should('be.visible')
      cy.contains('Pérez García').should('be.visible')

      // Verificar estadísticas
      cy.get('#totalSocios').should('contain', '1')
      cy.get('#sociosActivos').should('contain', '1')
    })

    it('Debe mostrar error al crear socio con identificación duplicada', () => {
      // Crear primer socio
      cy.get('#identificacion').type('1712345678')
      cy.get('#nombres').type('Juan')
      cy.get('#apellidos').type('Pérez')
      cy.get('#socioForm').submit()
      cy.wait(500)

      // Limpiar formulario
      cy.contains('Limpiar').click()

      // Intentar crear socio con misma identificación
      cy.get('#identificacion').type('1712345678')
      cy.get('#nombres').type('María')
      cy.get('#apellidos').type('López')
      cy.get('#socioForm').submit()

      // Verificar mensaje de error
      cy.contains('Ya existe un socio con esta identificación').should('be.visible')
    })

    it('Debe validar campos requeridos', () => {
      // Intentar enviar formulario vacío
      cy.get('#socioForm').submit()

      // Verificar que los campos requeridos tengan validación HTML5
      cy.get('#identificacion:invalid').should('exist')
      cy.get('#nombres:invalid').should('exist')
      cy.get('#apellidos:invalid').should('exist')
    })

    it('Debe crear socio con tipo RUC', () => {
      cy.get('#tipoIdentificacion').select('RUC')
      cy.get('#identificacion').type('1791234567001')
      cy.get('#nombres').type('María')
      cy.get('#apellidos').type('López')
      cy.get('#email').type('maria.lopez@test.com')
      cy.get('#socioForm').submit()

      cy.contains('Socio creado exitosamente').should('be.visible')
      cy.contains('1791234567001').should('be.visible')
    })
  })

  describe('Buscar Socio', () => {
    beforeEach(() => {
      // Crear socios de prueba
      const socios = [
        { identificacion: '1712345678', nombres: 'Juan', apellidos: 'Pérez' },
        { identificacion: '1723456789', nombres: 'María', apellidos: 'López' },
        { identificacion: '1734567890', nombres: 'Carlos', apellidos: 'García' }
      ]

      socios.forEach(socio => {
        cy.request('POST', Cypress.env('apiUrl'), {
          ...socio,
          tipoIdentificacion: 'CEDULA',
          email: `${socio.nombres.toLowerCase()}@test.com`
        })
      })

      cy.reload()
    })

    it('Debe buscar socio por identificación exitosamente', () => {
      // Buscar por identificación
      cy.get('#buscarIdentificacion').type('1712345678')
      cy.contains('🔍 Buscar').click()

      // Verificar que solo aparezca el socio buscado
      cy.get('#tablaSocios tr').should('have.length', 1)
      cy.contains('Juan').should('be.visible')
      cy.contains('Pérez').should('be.visible')
    })

    it('Debe mostrar error al buscar socio inexistente', () => {
      cy.get('#buscarIdentificacion').type('9999999999')
      cy.contains('🔍 Buscar').click()

      cy.contains('Socio no encontrado').should('be.visible')
    })

    it('Debe mostrar todos los socios al hacer clic en "Mostrar Todos"', () => {
      // Primero buscar uno
      cy.get('#buscarIdentificacion').type('1712345678')
      cy.contains('🔍 Buscar').click()
      cy.get('#tablaSocios tr').should('have.length', 1)

      // Luego mostrar todos
      cy.contains('📋 Mostrar Todos').click()
      cy.get('#tablaSocios tr').should('have.length', 3)
    })
  })

  describe('Editar Socio', () => {
    beforeEach(() => {
      // Crear un socio de prueba
      cy.request('POST', Cypress.env('apiUrl'), {
        identificacion: '1712345678',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan.perez@test.com',
        telefono: '0987654321',
        direccion: 'Dirección original',
        tipoIdentificacion: 'CEDULA'
      })
      cy.reload()
    })

    it('Debe editar un socio exitosamente', () => {
      // Hacer clic en el botón de editar
      cy.contains('tr', '1712345678').find('button').contains('✏️').click()

      // Verificar que el formulario se llene con los datos del socio
      cy.get('#identificacion').should('have.value', '1712345678')
      cy.get('#nombres').should('have.value', 'Juan')

      // Verificar mensaje de modo edición
      cy.contains('Modo edición activado').should('be.visible')

      // Modificar datos
      cy.get('#nombres').clear().type('Juan Carlos')
      cy.get('#direccion').clear().type('Nueva dirección actualizada')

      // Guardar cambios
      cy.get('#socioForm').submit()

      // Verificar mensaje de éxito
      cy.contains('Socio actualizado exitosamente').should('be.visible')

      // Verificar cambios en la tabla
      cy.contains('Juan Carlos').should('be.visible')
    })
  })

  describe('Eliminar Socio', () => {
    beforeEach(() => {
      // Crear un socio de prueba
      cy.request('POST', Cypress.env('apiUrl'), {
        identificacion: '1712345678',
        nombres: 'Juan',
        apellidos: 'Pérez',
        tipoIdentificacion: 'CEDULA'
      })
      cy.reload()
    })

    it('Debe eliminar un socio después de confirmación', () => {
      // Stub del confirm para aceptar
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true)
      })

      // Verificar que el socio existe
      cy.contains('1712345678').should('be.visible')

      // Hacer clic en eliminar
      cy.contains('tr', '1712345678').find('button').contains('🗑️').click()

      // Verificar mensaje de éxito
      cy.contains('Socio eliminado exitosamente').should('be.visible')

      // Verificar que el socio ya no aparezca
      cy.contains('1712345678').should('not.exist')
      cy.get('#totalSocios').should('contain', '0')
    })

    it('No debe eliminar si se cancela la confirmación', () => {
      // Stub del confirm para rechazar
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false)
      })

      // Hacer clic en eliminar
      cy.contains('tr', '1712345678').find('button').contains('🗑️').click()

      // Verificar que el socio siga existiendo
      cy.contains('1712345678').should('be.visible')
      cy.get('#totalSocios').should('contain', '1')
    })
  })

  describe('Estadísticas', () => {
    it('Debe actualizar las estadísticas correctamente', () => {
      // Crear varios socios
      const socios = [
        { identificacion: '1712345678', nombres: 'Juan', apellidos: 'Pérez' },
        { identificacion: '1723456789', nombres: 'María', apellidos: 'López' },
        { identificacion: '1734567890', nombres: 'Carlos', apellidos: 'García' }
      ]

      socios.forEach((socio, index) => {
        cy.get('#identificacion').clear().type(socio.identificacion)
        cy.get('#nombres').clear().type(socio.nombres)
        cy.get('#apellidos').clear().type(socio.apellidos)
        cy.get('#socioForm').submit()
        cy.wait(500)
        
        if (index < socios.length - 1) {
          cy.contains('Limpiar').click()
        }
      })

      // Verificar estadísticas
      cy.get('#totalSocios').should('contain', '3')
      cy.get('#sociosActivos').should('contain', '3')
      cy.get('#sociosInactivos').should('contain', '0')
    })
  })

  describe('Limpiar Formulario', () => {
    it('Debe limpiar todos los campos del formulario', () => {
      // Llenar el formulario
      cy.get('#identificacion').type('1712345678')
      cy.get('#nombres').type('Juan')
      cy.get('#apellidos').type('Pérez')
      cy.get('#email').type('juan@test.com')

      // Limpiar
      cy.contains('Limpiar').click()

      // Verificar que los campos estén vacíos
      cy.get('#identificacion').should('have.value', '')
      cy.get('#nombres').should('have.value', '')
      cy.get('#apellidos').should('have.value', '')
      cy.get('#email').should('have.value', '')
    })
  })

  describe('Flujo Completo E2E', () => {
    it('Debe completar el flujo completo: crear, buscar, editar y eliminar', () => {
      // 1. CREAR
      cy.get('#identificacion').type('1712345678')
      cy.get('#nombres').type('Juan')
      cy.get('#apellidos').type('Pérez')
      cy.get('#email').type('juan.perez@test.com')
      cy.get('#socioForm').submit()
      cy.contains('Socio creado exitosamente').should('be.visible')
      cy.get('#totalSocios').should('contain', '1')

      // 2. BUSCAR
      cy.get('#buscarIdentificacion').type('1712345678')
      cy.contains('🔍 Buscar').click()
      cy.contains('Juan').should('be.visible')

      // 3. EDITAR
      cy.contains('📋 Mostrar Todos').click()
      cy.contains('tr', '1712345678').find('button').contains('✏️').click()
      cy.get('#nombres').clear().type('Juan Carlos')
      cy.get('#socioForm').submit()
      cy.contains('Socio actualizado exitosamente').should('be.visible')
      cy.contains('Juan Carlos').should('be.visible')

      // 4. ELIMINAR
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true)
      })
      cy.contains('tr', '1712345678').find('button').contains('🗑️').click()
      cy.contains('Socio eliminado exitosamente').should('be.visible')
      cy.get('#totalSocios').should('contain', '0')
    })
  })

  describe('Responsividad y UI', () => {
    it('Debe ser responsivo en diferentes tamaños de pantalla', () => {
      // Crear un socio
      cy.request('POST', Cypress.env('apiUrl'), {
        identificacion: '1712345678',
        nombres: 'Juan',
        apellidos: 'Pérez',
        tipoIdentificacion: 'CEDULA'
      })
      cy.reload()

      // Vista móvil
      cy.viewport(375, 667)
      cy.contains('Sistema de Gestión de Socios').should('be.visible')
      cy.contains('Juan').should('be.visible')

      // Vista tablet
      cy.viewport(768, 1024)
      cy.contains('Sistema de Gestión de Socios').should('be.visible')

      // Vista desktop
      cy.viewport(1920, 1080)
      cy.contains('Sistema de Gestión de Socios').should('be.visible')
    })

    it('Debe mostrar badges de estado correctamente', () => {
      cy.request('POST', Cypress.env('apiUrl'), {
        identificacion: '1712345678',
        nombres: 'Juan',
        apellidos: 'Pérez',
        tipoIdentificacion: 'CEDULA'
      })
      cy.reload()

      // Verificar badge de activo
      cy.contains('tr', '1712345678')
        .find('.badge-success')
        .should('contain', 'Activo')
    })
  })
})
