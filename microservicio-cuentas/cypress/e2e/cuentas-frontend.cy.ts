describe('Microservicio de Cuentas - Pruebas Frontend', () => {
  let cuentaId: string;
  const numeroCuenta = `TEST-${Date.now()}`;
  const socioId = 'cypress-socio-123';

  beforeEach(() => {
    // Visitar la página principal
    cy.visit('/');
    cy.wait(500);
  });

  describe('1. Interfaz de Usuario', () => {
    it('Debe cargar la página correctamente', () => {
      cy.contains('h1', 'Microservicio de Cuentas - Cooperativa').should('be.visible');
      cy.contains('API en ejecución').should('be.visible');
    });

    it('Debe mostrar todos los formularios', () => {
      cy.contains('h2', 'Crear Cuenta').should('be.visible');
      cy.contains('h2', 'Buscar Cuenta por ID').should('be.visible');
      cy.contains('h2', 'Buscar Cuentas por Socio').should('be.visible');
      cy.contains('h2', 'Listar Todas las Cuentas').should('be.visible');
      cy.contains('h2', 'Realizar Depósito').should('be.visible');
      cy.contains('h2', 'Realizar Retiro').should('be.visible');
      cy.contains('h2', 'Actualizar Cuenta').should('be.visible');
      cy.contains('h2', 'Eliminar Cuenta').should('be.visible');
    });

    it('Debe mostrar el área de resultados', () => {
      cy.contains('h2', 'Resultados').should('be.visible');
      cy.get('#output').should('be.visible');
      cy.get('#output').should('contain', 'Esperando operación...');
    });
  });

  describe('2. Flujo Completo: Crear Cuenta', () => {
    it('Debe crear una cuenta exitosamente', () => {
      // Llenar el formulario
      cy.get('#createSocioId').type(socioId);
      cy.get('#createNumeroCuenta').type(numeroCuenta);
      cy.get('#createTipoCuenta').select('AHORRO');
      cy.get('#createSaldo').type('1500');

      // Enviar formulario
      cy.get('#createForm').submit();

      // Verificar resultado
      cy.get('#output', { timeout: 10000 })
        .should('contain', 'SUCCESS')
        .and('contain', numeroCuenta)
        .and('contain', socioId);

      // Extraer y guardar el ID de la cuenta
      cy.get('#output table tbody tr td:first small').invoke('text').then((text) => {
        cuentaId = text;
        cy.log('Cuenta creada con ID:', cuentaId);
      });
    });

    it('No debe permitir crear cuenta con número duplicado', () => {
      // Intentar crear con el mismo número
      cy.get('#createSocioId').clear().type(socioId);
      cy.get('#createNumeroCuenta').clear().type(numeroCuenta);
      cy.get('#createTipoCuenta').select('AHORRO');
      cy.get('#createSaldo').clear().type('1000');

      cy.get('#createForm').submit();

      // Verificar error - el mensaje puede estar en el JSON
      cy.get('#output', { timeout: 10000 })
        .should('contain', 'ERROR');
      
      // El mensaje de error puede variar, verificar que al menos diga algo sobre cuenta o duplicado
      cy.get('#output').invoke('text').then((text) => {
        const lowerText = text.toLowerCase();
        // Puede decir "el número de cuenta ya está en uso" o alguna variación
        expect(lowerText).to.match(/cuenta.*uso|duplica|ya existe/);
      });
    });

    it('Debe validar campos requeridos', () => {
      cy.get('#createForm button[type="submit"]').click();
      
      // HTML5 validation should prevent submission
      cy.get('#createSocioId:invalid').should('exist');
    });
  });

  describe('3. Listar y Consultar Cuentas', () => {
    it('Debe listar todas las cuentas', () => {
      cy.contains('button', 'Ver Todas las Cuentas').click();

      cy.get('#output', { timeout: 10000 })
        .should('contain', 'SUCCESS');

      // Verificar que hay una tabla con datos
      cy.get('#output table').should('be.visible');
      cy.get('#output table thead th').should('have.length.at.least', 5);
      cy.get('#output table tbody tr').should('have.length.at.least', 1);
    });

    it('Debe buscar cuentas por socio', () => {
      cy.get('#getSocioId').type(socioId);
      cy.get('#getBySocioForm').submit();

      cy.get('#output', { timeout: 10000 })
        .should('contain', 'SUCCESS')
        .and('contain', socioId);

      cy.get('#output table tbody tr').should('have.length.at.least', 1);
    });

    it('Debe retornar vacío para socio sin cuentas', () => {
      cy.get('#getSocioId').type('socio-inexistente-999');
      cy.get('#getBySocioForm').submit();

      cy.get('#output', { timeout: 10000 })
        .should('contain', 'No se encontraron resultados');
    });
  });

  describe('4. Operaciones Bancarias', () => {
    beforeEach(() => {
      // Crear una cuenta para las pruebas
      const testNumber = `OP-${Date.now()}`;
      cy.request('POST', '/cuentas', {
        socioId: 'cypress-ops-test',
        numeroCuenta: testNumber,
        tipoCuenta: 'AHORRO',
        saldo: 5000
      }).then((response) => {
        cuentaId = response.body.id;
      });
    });

    it('Debe realizar un depósito exitosamente', () => {
      cy.wait(1000); // Esperar a que el beforeEach termine
      cy.get('#depositCuentaId').clear().type(cuentaId);
      cy.get('#depositMonto').clear().type('1000');
      cy.get('#depositForm').submit();

      cy.get('#output', { timeout: 10000 })
        .should('contain', 'SUCCESS');
      
      // Verificar que la tabla muestre el saldo actualizado (6000 = 5000 + 1000)
      cy.get('#output table', { timeout: 5000 }).should('be.visible');
      
      // Esperar y verificar que se muestre 6000 o 6,000
      cy.wait(500);
      cy.get('#output').invoke('text').then((text) => {
        // El saldo debe ser 6000 o mostrar 6,000.00 o 6000.00
        expect(text).to.match(/6000|6,000/);
      });
    });

    it('Debe realizar un retiro exitosamente', () => {
      cy.get('#withdrawCuentaId').type(cuentaId);
      cy.get('#withdrawMonto').type('500');
      cy.get('#withdrawForm').submit();

      cy.get('#output', { timeout: 10000 })
        .should('contain', 'SUCCESS');
      
      // Verificar que la tabla muestre el saldo actualizado (4500 = 5000 - 500)
      cy.get('#output table').should('be.visible');
      cy.get('#output').should(($output) => {
        const text = $output.text();
        // Verificar que contenga 4500 o 4,500
        expect(text).to.match(/4[,.]?500/);
      });
    });

    it('No debe permitir retiro con saldo insuficiente', () => {
      cy.get('#withdrawCuentaId').type(cuentaId);
      cy.get('#withdrawMonto').type('10000');
      cy.get('#withdrawForm').submit();

      cy.get('#output', { timeout: 10000 })
        .should('contain', 'ERROR')
        .and('contain', 'Saldo insuficiente');
    });
  });

  describe('5. Actualizar Cuenta', () => {
    beforeEach(() => {
      // Crear cuenta para actualizar
      const testNumber = `UPD-${Date.now()}`.substring(0, 20);
      cy.request('POST', '/cuentas', {
        socioId: 'cypress-update-test',
        numeroCuenta: testNumber,
        tipoCuenta: 'AHORRO',
        saldo: 2000
      }).then((response) => {
        cuentaId = response.body.id;
      });
    });

    it('Debe actualizar una cuenta exitosamente', () => {
      cy.wait(1000); // Esperar a que el beforeEach termine
      cy.get('#updateCuentaId').clear().type(cuentaId);
      cy.get('#updateSocioId').clear().type('cypress-update-test');
      cy.get('#updateNumeroCuenta').clear().type(`UPDM-${Date.now()}`.substring(0, 20));
      cy.get('#updateTipoCuenta').select('CORRIENTE');
      cy.get('#updateSaldo').clear().type('3500');
      cy.get('#updateForm').submit();

      cy.get('#output', { timeout: 10000 })
        .should('contain', 'SUCCESS');
      
      // Verificar que la tabla muestre los datos actualizados
      cy.get('#output table', { timeout: 5000 }).should('be.visible');
      
      // Verificar CORRIENTE y saldo 3500
      cy.wait(500);
      cy.get('#output').invoke('text').then((text) => {
        expect(text).to.contain('CORRIENTE');
        expect(text).to.match(/3500|3,500/);
      });
    });
  });

  describe('6. Eliminar Cuenta', () => {
    beforeEach(() => {
      // Crear cuenta para eliminar
      const testNumber = `DEL-${Date.now()}`;
      cy.request('POST', '/cuentas', {
        socioId: 'cypress-delete-test',
        numeroCuenta: testNumber,
        tipoCuenta: 'AHORRO',
        saldo: 100
      }).then((response) => {
        cuentaId = response.body.id;
      });
    });

    it('Debe eliminar una cuenta con confirmación', () => {
      cy.get('#deleteCuentaId').type(cuentaId);
      
      // Stub del confirm para aceptar
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });

      cy.get('#deleteForm').submit();

      // Verificar que muestre SUCCESS y el mensaje de cuenta eliminada
      cy.get('#output', { timeout: 10000 })
        .should('contain', 'SUCCESS');
      
      cy.get('#output').should('contain', 'Cuenta eliminada exitosamente');
    });

    it('No debe eliminar si se cancela la confirmación', () => {
      cy.get('#deleteCuentaId').type(cuentaId);
      
      // Stub del confirm para cancelar
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false);
      });

      cy.get('#deleteForm').submit();

      // No debería hacer la petición
      cy.get('#output').should('contain', 'Esperando operación...');
    });
  });

  describe('7. Validación y Manejo de Errores', () => {
    it('Debe mostrar error para cuenta inexistente', () => {
      cy.get('#getCuentaId').type('00000000-0000-0000-0000-000000000000');
      cy.get('#getByIdForm').submit();

      cy.get('#output', { timeout: 10000 })
        .should('contain', 'ERROR')
        .and('contain', 'no encontrada');
    });

    it('Debe validar montos negativos', () => {
      cy.get('#depositMonto').invoke('val', '-100').trigger('input');
      cy.get('#depositForm button[type="submit"]').click();
      
      // HTML5 validation
      cy.get('#depositMonto:invalid').should('exist');
    });

    it('Debe mostrar la tabla correctamente con datos', () => {
      cy.contains('button', 'Ver Todas las Cuentas').click();

      cy.get('#output table', { timeout: 10000 }).within(() => {
        // Verificar encabezados
        cy.get('thead th').should('contain', 'ID');
        cy.get('thead th').should('contain', 'ID Socio');
        cy.get('thead th').should('contain', 'Número de Cuenta');
        cy.get('thead th').should('contain', 'Saldo');
        cy.get('thead th').should('contain', 'Estado');

        // Verificar que hay datos en la tabla
        cy.get('tbody tr').should('have.length.at.least', 1);
        
        // Verificar formato de datos en cualquier fila que contenga saldo
        cy.get('tbody tr').first().within(() => {
          // Verificar que al menos una celda tenga el símbolo $
          cy.get('td').should(($tds) => {
            const text = $tds.text();
            expect(text).to.include('$');
          });
        });
      });
    });
  });

  describe('8. Responsive y UI/UX', () => {
    it('Debe ser responsive en móvil', () => {
      cy.viewport('iphone-x');
      cy.contains('h1', 'Microservicio de Cuentas').should('be.visible');
      cy.get('.card').should('be.visible');
    });

    it('Debe ser responsive en tablet', () => {
      cy.viewport('ipad-2');
      cy.contains('h1', 'Microservicio de Cuentas').should('be.visible');
      cy.get('.grid').should('be.visible');
    });

    it('Debe tener efectos hover en botones', () => {
      cy.get('button').first().trigger('mouseover');
      cy.get('button').first().should('have.css', 'cursor', 'pointer');
    });
  });
});
