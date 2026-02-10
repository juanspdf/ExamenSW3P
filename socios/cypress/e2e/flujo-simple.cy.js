describe('Pruebas Simplificadas - Flujo Básico', () => {
  
  beforeEach(() => {
    cy.limpiarSocios()
    cy.visit('/')
  })

  it('Flujo simple: Crear y verificar socio', () => {
    // Llenar formulario
    cy.llenarFormularioSocio({
      tipoIdentificacion: 'CEDULA',
      identificacion: '1712345678',
      nombres: 'Juan',
      apellidos: 'Pérez',
      email: 'juan@test.com'
    })

    // Enviar formulario
    cy.get('#socioForm').submit()

    // Verificar creación exitosa
    cy.contains('Socio creado exitosamente').should('be.visible')
    cy.verificarSocioEnTabla('1712345678')
  })

  it('Flujo simple: Buscar socio', () => {
    // Crear socio usando la API
    cy.crearSocio({
      identificacion: '1723456789',
      nombres: 'María',
      apellidos: 'López'
    })

    cy.reload()

    // Buscar el socio
    cy.get('#buscarIdentificacion').type('1723456789')
    cy.contains('🔍 Buscar').click()

    // Verificar resultado
    cy.contains('María').should('be.visible')
    cy.contains('López').should('be.visible')
  })

  it('Flujo simple: Editar socio', () => {
    // Crear socio
    cy.crearSocio({
      identificacion: '1734567890',
      nombres: 'Carlos',
      apellidos: 'García'
    })

    cy.reload()

    // Editar
    cy.contains('tr', '1734567890').find('button').contains('✏️').click()
    cy.get('#nombres').clear().type('Carlos Alberto')
    cy.get('#socioForm').submit()

    // Verificar actualización
    cy.contains('Socio actualizado exitosamente').should('be.visible')
    cy.contains('Carlos Alberto').should('be.visible')
  })
})
