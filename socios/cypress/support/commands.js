// ***********************************************
// Custom commands for Socios application
// ***********************************************

/**
 * Comando personalizado para crear un socio usando la API
 * @param {Object} socio - Datos del socio
 */
Cypress.Commands.add('crearSocio', (socio) => {
  const socioCompleto = {
    tipoIdentificacion: 'CEDULA',
    ...socio
  }
  
  return cy.request('POST', `${Cypress.env('apiUrl')}`, socioCompleto)
})

/**
 * Comando personalizado para limpiar todos los socios
 */
Cypress.Commands.add('limpiarSocios', () => {
  return cy.request('DELETE', `${Cypress.env('apiUrl')}/limpiar-todo`)
})

/**
 * Comando personalizado para obtener todos los socios
 */
Cypress.Commands.add('obtenerSocios', () => {
  return cy.request('GET', Cypress.env('apiUrl'))
})

/**
 * Comando personalizado para llenar el formulario de socio
 */
Cypress.Commands.add('llenarFormularioSocio', (socio) => {
  if (socio.tipoIdentificacion) {
    cy.get('#tipoIdentificacion').select(socio.tipoIdentificacion)
  }
  if (socio.identificacion) {
    cy.get('#identificacion').clear().type(socio.identificacion)
  }
  if (socio.nombres) {
    cy.get('#nombres').clear().type(socio.nombres)
  }
  if (socio.apellidos) {
    cy.get('#apellidos').clear().type(socio.apellidos)
  }
  if (socio.email) {
    cy.get('#email').clear().type(socio.email)
  }
  if (socio.telefono) {
    cy.get('#telefono').clear().type(socio.telefono)
  }
  if (socio.direccion) {
    cy.get('#direccion').clear().type(socio.direccion)
  }
})

/**
 * Comando personalizado para verificar que exista un socio en la tabla
 */
Cypress.Commands.add('verificarSocioEnTabla', (identificacion) => {
  return cy.contains('tr', identificacion).should('be.visible')
})
