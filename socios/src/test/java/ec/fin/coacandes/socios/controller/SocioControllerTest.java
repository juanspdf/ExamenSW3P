package ec.fin.coacandes.socios.controller;

import ec.fin.coacandes.socios.dto.SocioRequestDTO;
import ec.fin.coacandes.socios.dto.SocioResponseDTO;
import ec.fin.coacandes.socios.service.SocioService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SocioController - Pruebas Unitarias")
class SocioControllerTest {

    @Mock
    private SocioService socioService;

    @InjectMocks
    private SocioController socioController;

    private SocioRequestDTO socioRequest;
    private SocioResponseDTO socioResponse;
    private UUID socioId;

    @BeforeEach
    void setUp() {
        socioId = UUID.randomUUID();

        socioRequest = new SocioRequestDTO();
        socioRequest.setIdentificacion("1712345678");
        socioRequest.setNombres("Juan");
        socioRequest.setApellidos("Pérez");
        socioRequest.setEmail("juan.perez@test.com");
        socioRequest.setTelefono("0987654321");
        socioRequest.setDireccion("Av. Principal 123");
        socioRequest.setTipoIdentificacion("CEDULA");

        socioResponse = new SocioResponseDTO();
        socioResponse.setId(socioId);
        socioResponse.setIdentificacion("1712345678");
        socioResponse.setNombres("Juan");
        socioResponse.setApellidos("Pérez");
        socioResponse.setEmail("juan.perez@test.com");
        socioResponse.setTelefono("0987654321");
        socioResponse.setDireccion("Av. Principal 123");
        socioResponse.setTipoIdentificacion("CEDULA");
        socioResponse.setActivo(true);
    }

    @Test
    @DisplayName("Crear socio - Exitoso - Debe retornar 201 CREATED")
    void crearSocio_Exitoso() {
        // Arrange
        when(socioService.crearSocio(any(SocioRequestDTO.class))).thenReturn(socioResponse);

        // Act
        ResponseEntity<SocioResponseDTO> response = socioController.crearSocio(socioRequest);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(socioResponse.getId(), response.getBody().getId());
        assertEquals(socioResponse.getIdentificacion(), response.getBody().getIdentificacion());
        verify(socioService, times(1)).crearSocio(any(SocioRequestDTO.class));
    }

    @Test
    @DisplayName("Crear socio - Error identificación duplicada")
    void crearSocio_IdentificacionDuplicada() {
        // Arrange
        when(socioService.crearSocio(any(SocioRequestDTO.class)))
                .thenThrow(new IllegalArgumentException("Ya existe un socio con esta identificación"));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> socioController.crearSocio(socioRequest)
        );

        assertEquals("Ya existe un socio con esta identificación", exception.getMessage());
        verify(socioService, times(1)).crearSocio(any(SocioRequestDTO.class));
    }

    @Test
    @DisplayName("Actualizar socio - Exitoso - Debe retornar 200 OK")
    void actualizarSocio_Exitoso() {
        // Arrange
        when(socioService.actualizarSocio(eq(socioId), any(SocioRequestDTO.class)))
                .thenReturn(socioResponse);

        // Act
        ResponseEntity<SocioResponseDTO> response = socioController.actualizarSocio(socioId, socioRequest);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(socioResponse.getId(), response.getBody().getId());
        verify(socioService, times(1)).actualizarSocio(eq(socioId), any(SocioRequestDTO.class));
    }

    @Test
    @DisplayName("Actualizar socio - Socio no encontrado")
    void actualizarSocio_NoEncontrado() {
        // Arrange
        when(socioService.actualizarSocio(eq(socioId), any(SocioRequestDTO.class)))
                .thenThrow(new EntityNotFoundException("Socio no encontrado"));

        // Act & Assert
        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> socioController.actualizarSocio(socioId, socioRequest)
        );

        assertEquals("Socio no encontrado", exception.getMessage());
        verify(socioService, times(1)).actualizarSocio(eq(socioId), any(SocioRequestDTO.class));
    }

    @Test
    @DisplayName("Obtener socio por ID - Exitoso")
    void obtenerSocio_Exitoso() {
        // Arrange
        when(socioService.obtenerSocioPorId(socioId)).thenReturn(socioResponse);

        // Act
        ResponseEntity<SocioResponseDTO> response = socioController.obtenerSocio(socioId);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(socioId, response.getBody().getId());
        verify(socioService, times(1)).obtenerSocioPorId(socioId);
    }

    @Test
    @DisplayName("Obtener socio por ID - No encontrado")
    void obtenerSocio_NoEncontrado() {
        // Arrange
        when(socioService.obtenerSocioPorId(socioId))
                .thenThrow(new EntityNotFoundException("Socio no encontrado"));

        // Act & Assert
        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> socioController.obtenerSocio(socioId)
        );

        assertEquals("Socio no encontrado", exception.getMessage());
        verify(socioService, times(1)).obtenerSocioPorId(socioId);
    }

    @Test
    @DisplayName("Obtener todos los socios - Exitoso")
    void obtenerTodos_Exitoso() {
        // Arrange
        SocioResponseDTO socio2 = new SocioResponseDTO();
        socio2.setId(UUID.randomUUID());
        socio2.setIdentificacion("1723456789");
        socio2.setNombres("María");

        List<SocioResponseDTO> socios = Arrays.asList(socioResponse, socio2);
        when(socioService.obtenerTodosLosSocios()).thenReturn(socios);

        // Act
        ResponseEntity<List<SocioResponseDTO>> response = socioController.obtenerTodos();

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        verify(socioService, times(1)).obtenerTodosLosSocios();
    }

    @Test
    @DisplayName("Obtener todos los socios - Lista vacía")
    void obtenerTodos_ListaVacia() {
        // Arrange
        when(socioService.obtenerTodosLosSocios()).thenReturn(Arrays.asList());

        // Act
        ResponseEntity<List<SocioResponseDTO>> response = socioController.obtenerTodos();

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
        verify(socioService, times(1)).obtenerTodosLosSocios();
    }

    @Test
    @DisplayName("Eliminar socio - Exitoso - Debe retornar 204 NO CONTENT")
    void eliminarSocio_Exitoso() {
        // Arrange
        doNothing().when(socioService).eliminarSocio(socioId);

        // Act
        ResponseEntity<Void> response = socioController.eliminarSocio(socioId);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
        verify(socioService, times(1)).eliminarSocio(socioId);
    }

    @Test
    @DisplayName("Eliminar socio - Socio no encontrado")
    void eliminarSocio_NoEncontrado() {
        // Arrange
        doThrow(new EntityNotFoundException("Socio no encontrado"))
                .when(socioService).eliminarSocio(socioId);

        // Act & Assert
        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> socioController.eliminarSocio(socioId)
        );

        assertEquals("Socio no encontrado", exception.getMessage());
        verify(socioService, times(1)).eliminarSocio(socioId);
    }

    @Test
    @DisplayName("Buscar por identificación - Exitoso")
    void buscarPorIdentificacion_Exitoso() {
        // Arrange
        String identificacion = "1712345678";
        when(socioService.obtenerSocioPorIdentificacion(identificacion)).thenReturn(socioResponse);

        // Act
        ResponseEntity<SocioResponseDTO> response = socioController.buscarPorIdentificacion(identificacion);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(identificacion, response.getBody().getIdentificacion());
        verify(socioService, times(1)).obtenerSocioPorIdentificacion(identificacion);
    }

    @Test
    @DisplayName("Buscar por identificación - No encontrado")
    void buscarPorIdentificacion_NoEncontrado() {
        // Arrange
        String identificacion = "1712345678";
        when(socioService.obtenerSocioPorIdentificacion(identificacion))
                .thenThrow(new EntityNotFoundException("Socio no encontrado"));

        // Act & Assert
        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> socioController.buscarPorIdentificacion(identificacion)
        );

        assertEquals("Socio no encontrado", exception.getMessage());
        verify(socioService, times(1)).obtenerSocioPorIdentificacion(identificacion);
    }
}
