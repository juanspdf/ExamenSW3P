package ec.fin.coacandes.socios.service.impl;

import ec.fin.coacandes.socios.dto.SocioRequestDTO;
import ec.fin.coacandes.socios.dto.SocioResponseDTO;
import ec.fin.coacandes.socios.entity.Socio;
import ec.fin.coacandes.socios.repository.SocioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SocioServiceImpl - Pruebas Unitarias")
class SocioServiceImplTest {

    @Mock
    private SocioRepository socioRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private SocioServiceImpl socioService;

    private SocioRequestDTO socioRequest;
    private Socio socio;
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

        socio = new Socio();
        socio.setId(socioId);
        socio.setIdentificacion("1712345678");
        socio.setNombres("Juan");
        socio.setApellidos("Pérez");
        socio.setEmail("juan.perez@test.com");
        socio.setTelefono("0987654321");
        socio.setDireccion("Av. Principal 123");
        socio.setTipoIdentificacion("CEDULA");
        socio.setActivo(true);

        socioResponse = new SocioResponseDTO();
        socioResponse.setId(socioId);
        socioResponse.setIdentificacion("1712345678");
        socioResponse.setNombres("Juan");
        socioResponse.setApellidos("Pérez");
        socioResponse.setEmail("juan.perez@test.com");
        socioResponse.setActivo(true);
    }

    @Test
    @DisplayName("Crear socio - Exitoso")
    void crearSocio_Exitoso() {
        // Arrange
        when(socioRepository.existsByIdentificacion(socioRequest.getIdentificacion())).thenReturn(false);
        when(modelMapper.map(socioRequest, Socio.class)).thenReturn(socio);
        when(socioRepository.save(any(Socio.class))).thenReturn(socio);
        when(modelMapper.map(socio, SocioResponseDTO.class)).thenReturn(socioResponse);

        // Act
        SocioResponseDTO resultado = socioService.crearSocio(socioRequest);

        // Assert
        assertNotNull(resultado);
        assertEquals(socioRequest.getIdentificacion(), resultado.getIdentificacion());
        assertEquals(socioRequest.getNombres(), resultado.getNombres());
        verify(socioRepository).existsByIdentificacion(socioRequest.getIdentificacion());
        verify(socioRepository).save(any(Socio.class));
    }

    @Test
    @DisplayName("Crear socio - Identificación duplicada")
    void crearSocio_IdentificacionDuplicada() {
        // Arrange
        when(socioRepository.existsByIdentificacion(socioRequest.getIdentificacion())).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> socioService.crearSocio(socioRequest)
        );

        assertEquals("Ya existe un socio con esta identificación", exception.getMessage());
        verify(socioRepository).existsByIdentificacion(socioRequest.getIdentificacion());
        verify(socioRepository, never()).save(any(Socio.class));
    }

    @Test
    @DisplayName("Actualizar socio - Exitoso")
    void actualizarSocio_Exitoso() {
        // Arrange
        socio.setIdentificacion(socioRequest.getIdentificacion()); // Asegurar que sean iguales
        when(socioRepository.findById(socioId)).thenReturn(Optional.of(socio));
        when(socioRepository.save(any(Socio.class))).thenReturn(socio);
        when(modelMapper.map(socio, SocioResponseDTO.class)).thenReturn(socioResponse);
        doNothing().when(modelMapper).map(socioRequest, socio);

        // Act
        SocioResponseDTO resultado = socioService.actualizarSocio(socioId, socioRequest);

        // Assert
        assertNotNull(resultado);
        assertEquals(socioId, resultado.getId());
        verify(socioRepository).findById(socioId);
        verify(socioRepository).save(any(Socio.class));
    }

    @Test
    @DisplayName("Actualizar socio - Socio no encontrado")
    void actualizarSocio_SocioNoEncontrado() {
        // Arrange
        when(socioRepository.findById(socioId)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> socioService.actualizarSocio(socioId, socioRequest)
        );

        assertEquals("Socio no encontrado", exception.getMessage());
        verify(socioRepository).findById(socioId);
        verify(socioRepository, never()).save(any(Socio.class));
    }

    @Test
    @DisplayName("Actualizar socio - Nueva identificación duplicada")
    void actualizarSocio_NuevaIdentificacionDuplicada() {
        // Arrange
        socioRequest.setIdentificacion("1798765432");
        when(socioRepository.findById(socioId)).thenReturn(Optional.of(socio));
        when(socioRepository.existsByIdentificacion("1798765432")).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> socioService.actualizarSocio(socioId, socioRequest)
        );

        assertEquals("La nueva identificación ya está registrada", exception.getMessage());
        verify(socioRepository).findById(socioId);
        verify(socioRepository, never()).save(any(Socio.class));
    }

    @Test
    @DisplayName("Obtener socio por ID - Exitoso")
    void obtenerSocioPorId_Exitoso() {
        // Arrange
        when(socioRepository.findById(socioId)).thenReturn(Optional.of(socio));
        when(modelMapper.map(socio, SocioResponseDTO.class)).thenReturn(socioResponse);

        // Act
        SocioResponseDTO resultado = socioService.obtenerSocioPorId(socioId);

        // Assert
        assertNotNull(resultado);
        assertEquals(socioId, resultado.getId());
        verify(socioRepository).findById(socioId);
    }

    @Test
    @DisplayName("Obtener socio por ID - No encontrado")
    void obtenerSocioPorId_NoEncontrado() {
        // Arrange
        when(socioRepository.findById(socioId)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> socioService.obtenerSocioPorId(socioId)
        );

        assertEquals("Socio no encontrado", exception.getMessage());
        verify(socioRepository).findById(socioId);
    }

    @Test
    @DisplayName("Obtener todos los socios - Exitoso")
    void obtenerTodosLosSocios_Exitoso() {
        // Arrange
        Socio socio2 = new Socio();
        socio2.setId(UUID.randomUUID());
        socio2.setIdentificacion("1723456789");
        socio2.setNombres("María");
        socio2.setApellidos("López");

        SocioResponseDTO response2 = new SocioResponseDTO();
        response2.setId(socio2.getId());
        response2.setIdentificacion("1723456789");

        List<Socio> socios = Arrays.asList(socio, socio2);

        when(socioRepository.findAll()).thenReturn(socios);
        when(modelMapper.map(socio, SocioResponseDTO.class)).thenReturn(socioResponse);
        when(modelMapper.map(socio2, SocioResponseDTO.class)).thenReturn(response2);

        // Act
        List<SocioResponseDTO> resultado = socioService.obtenerTodosLosSocios();

        // Assert
        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        verify(socioRepository).findAll();
    }

    @Test
    @DisplayName("Obtener todos los socios - Lista vacía")
    void obtenerTodosLosSocios_ListaVacia() {
        // Arrange
        when(socioRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<SocioResponseDTO> resultado = socioService.obtenerTodosLosSocios();

        // Assert
        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
        verify(socioRepository).findAll();
    }

    @Test
    @DisplayName("Eliminar socio - Exitoso")
    void eliminarSocio_Exitoso() {
        // Arrange
        when(socioRepository.findById(socioId)).thenReturn(Optional.of(socio));
        doNothing().when(socioRepository).deleteById(socioId);

        // Act
        socioService.eliminarSocio(socioId);

        // Assert
        verify(socioRepository).findById(socioId);
        verify(socioRepository).deleteById(socioId);
    }

    @Test
    @DisplayName("Eliminar socio - No encontrado")
    void eliminarSocio_NoEncontrado() {
        // Arrange
        when(socioRepository.findById(socioId)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> socioService.eliminarSocio(socioId)
        );

        assertEquals("Socio no encontrado", exception.getMessage());
        verify(socioRepository).findById(socioId);
        verify(socioRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Obtener socio por identificación - Exitoso")
    void obtenerSocioPorIdentificacion_Exitoso() {
        // Arrange
        String identificacion = "1712345678";
        when(socioRepository.findByIdentificacion(identificacion)).thenReturn(Optional.of(socio));
        when(modelMapper.map(socio, SocioResponseDTO.class)).thenReturn(socioResponse);

        // Act
        SocioResponseDTO resultado = socioService.obtenerSocioPorIdentificacion(identificacion);

        // Assert
        assertNotNull(resultado);
        assertEquals(identificacion, resultado.getIdentificacion());
        verify(socioRepository).findByIdentificacion(identificacion);
    }

    @Test
    @DisplayName("Obtener socio por identificación - No encontrado")
    void obtenerSocioPorIdentificacion_NoEncontrado() {
        // Arrange
        String identificacion = "1712345678";
        when(socioRepository.findByIdentificacion(identificacion)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> socioService.obtenerSocioPorIdentificacion(identificacion)
        );

        assertEquals("Socio no encontrado", exception.getMessage());
        verify(socioRepository).findByIdentificacion(identificacion);
    }
}
