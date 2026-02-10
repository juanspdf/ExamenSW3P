package ec.fin.coacandes.socios.dto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("SocioResponseDTO - Pruebas Unitarias")
class SocioResponseDTOTest {

    private SocioResponseDTO socioResponse;
    private UUID socioId;

    @BeforeEach
    void setUp() {
        socioId = UUID.randomUUID();
        socioResponse = new SocioResponseDTO();
    }

    @Test
    @DisplayName("Crear DTO con valores - Exitoso")
    void crearDTOConValores_Exitoso() {
        // Arrange & Act
        socioResponse.setId(socioId);
        socioResponse.setIdentificacion("1712345678");
        socioResponse.setNombres("Juan");
        socioResponse.setApellidos("Pérez");
        socioResponse.setEmail("juan.perez@test.com");
        socioResponse.setTelefono("0987654321");
        socioResponse.setDireccion("Av. Principal 123");
        socioResponse.setTipoIdentificacion("CEDULA");
        socioResponse.setActivo(true);
        socioResponse.setFechaCreacion(LocalDateTime.now());
        socioResponse.setFechaActualizacion(LocalDateTime.now());

        // Assert
        assertNotNull(socioResponse);
        assertEquals(socioId, socioResponse.getId());
        assertEquals("1712345678", socioResponse.getIdentificacion());
        assertEquals("Juan", socioResponse.getNombres());
        assertEquals("Pérez", socioResponse.getApellidos());
        assertEquals("juan.perez@test.com", socioResponse.getEmail());
        assertEquals("0987654321", socioResponse.getTelefono());
        assertEquals("Av. Principal 123", socioResponse.getDireccion());
        assertEquals("CEDULA", socioResponse.getTipoIdentificacion());
        assertTrue(socioResponse.getActivo());
        assertNotNull(socioResponse.getFechaCreacion());
        assertNotNull(socioResponse.getFechaActualizacion());
    }

    @Test
    @DisplayName("DTO con valores nulos - Permitido")
    void dtoConValoresNulos_Permitido() {
        // Act & Assert
        assertNull(socioResponse.getId());
        assertNull(socioResponse.getIdentificacion());
        assertNull(socioResponse.getNombres());
        assertNull(socioResponse.getApellidos());
        assertNull(socioResponse.getEmail());
        assertNull(socioResponse.getTelefono());
        assertNull(socioResponse.getDireccion());
        assertNull(socioResponse.getTipoIdentificacion());
        assertNull(socioResponse.getActivo());
        assertNull(socioResponse.getFechaCreacion());
        assertNull(socioResponse.getFechaActualizacion());
    }

    @Test
    @DisplayName("Setters y Getters - Funcionan correctamente")
    void settersGetters_FuncionanCorrectamente() {
        // Arrange
        UUID id = UUID.randomUUID();
        LocalDateTime ahora = LocalDateTime.now();

        // Act
        socioResponse.setId(id);
        socioResponse.setIdentificacion("1723456789");
        socioResponse.setNombres("María");
        socioResponse.setApellidos("López");
        socioResponse.setEmail("maria@test.com");
        socioResponse.setTelefono("0991234567");
        socioResponse.setDireccion("Calle Test");
        socioResponse.setTipoIdentificacion("RUC");
        socioResponse.setActivo(false);
        socioResponse.setFechaCreacion(ahora);
        socioResponse.setFechaActualizacion(ahora);

        // Assert
        assertEquals(id, socioResponse.getId());
        assertEquals("1723456789", socioResponse.getIdentificacion());
        assertEquals("María", socioResponse.getNombres());
        assertEquals("López", socioResponse.getApellidos());
        assertEquals("maria@test.com", socioResponse.getEmail());
        assertEquals("0991234567", socioResponse.getTelefono());
        assertEquals("Calle Test", socioResponse.getDireccion());
        assertEquals("RUC", socioResponse.getTipoIdentificacion());
        assertFalse(socioResponse.getActivo());
        assertEquals(ahora, socioResponse.getFechaCreacion());
        assertEquals(ahora, socioResponse.getFechaActualizacion());
    }

    @Test
    @DisplayName("ToString - Genera representación de cadena")
    void toString_GeneraRepresentacion() {
        // Arrange
        socioResponse.setId(socioId);
        socioResponse.setIdentificacion("1712345678");
        socioResponse.setNombres("Juan");

        // Act
        String resultado = socioResponse.toString();

        // Assert
        assertNotNull(resultado);
        assertTrue(resultado.contains("1712345678") || resultado.contains("Juan"));
    }

    @Test
    @DisplayName("Equals - Comparación por valores")
    void equals_ComparacionPorValores() {
        // Arrange
        SocioResponseDTO dto1 = new SocioResponseDTO();
        dto1.setId(socioId);
        dto1.setIdentificacion("1712345678");

        SocioResponseDTO dto2 = new SocioResponseDTO();
        dto2.setId(socioId);
        dto2.setIdentificacion("1712345678");

        // Act & Assert
        assertEquals(dto1, dto2);
    }

    @Test
    @DisplayName("HashCode - Genera código hash")
    void hashCode_GeneraCodigoHash() {
        // Arrange
        socioResponse.setId(socioId);
        socioResponse.setIdentificacion("1712345678");

        // Act
        int hashCode1 = socioResponse.hashCode();
        int hashCode2 = socioResponse.hashCode();

        // Assert
        assertEquals(hashCode1, hashCode2);
    }
}
