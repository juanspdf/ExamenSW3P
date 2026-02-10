package ec.fin.coacandes.socios.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("SocioRequestDTO - Pruebas de Validación")
class SocioRequestDTOTest {

    private Validator validator;
    private SocioRequestDTO socioRequest;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();

        socioRequest = new SocioRequestDTO();
        socioRequest.setIdentificacion("1712345678");
        socioRequest.setNombres("Juan");
        socioRequest.setApellidos("Pérez");
        socioRequest.setEmail("juan.perez@test.com");
        socioRequest.setTelefono("0987654321");
        socioRequest.setDireccion("Av. Principal 123");
        socioRequest.setTipoIdentificacion("CEDULA");
    }

    @Test
    @DisplayName("DTO válido - Sin violaciones")
    void dtoValido_SinViolaciones() {
        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertTrue(violations.isEmpty());
    }

    @Test
    @DisplayName("Identificación nula - Debe fallar")
    void identificacionNula_DebeFallar() {
        // Arrange
        socioRequest.setIdentificacion(null);

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("identificación es obligatoria")));
    }

    @Test
    @DisplayName("Identificación vacía - Debe fallar")
    void identificacionVacia_DebeFallar() {
        // Arrange
        socioRequest.setIdentificacion("");

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertFalse(violations.isEmpty());
    }

    @Test
    @DisplayName("Identificación con formato inválido - Debe fallar")
    void identificacionFormatoInvalido_DebeFallar() {
        // Arrange
        socioRequest.setIdentificacion("123"); // Muy corta

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Identificación inválida")));
    }

    @Test
    @DisplayName("Identificación con letras - Debe fallar")
    void identificacionConLetras_DebeFallar() {
        // Arrange
        socioRequest.setIdentificacion("171234567A");

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertFalse(violations.isEmpty());
    }

    @Test
    @DisplayName("Nombres nulos - Debe fallar")
    void nombresNulos_DebeFallar() {
        // Arrange
        socioRequest.setNombres(null);

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("nombres son obligatorios")));
    }

    @Test
    @DisplayName("Apellidos nulos - Debe fallar")
    void apellidosNulos_DebeFallar() {
        // Arrange
        socioRequest.setApellidos(null);

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("apellidos son obligatorios")));
    }

    @Test
    @DisplayName("Email con formato inválido - Debe fallar")
    void emailFormatoInvalido_DebeFallar() {
        // Arrange
        socioRequest.setEmail("email-invalido");

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Email inválido")));
    }

    @Test
    @DisplayName("Email vacío - Debe ser válido (es opcional)")
    void emailVacio_DebeSerValido() {
        // Arrange
        socioRequest.setEmail(null);

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertTrue(violations.isEmpty());
    }

    @Test
    @DisplayName("Teléfono con formato inválido - Debe fallar")
    void telefonoFormatoInvalido_DebeFallar() {
        // Arrange
        socioRequest.setTelefono("123"); // Muy corto

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Teléfono inválido")));
    }

    @Test
    @DisplayName("Teléfono con letras - Debe fallar")
    void telefonoConLetras_DebeFallar() {
        // Arrange
        socioRequest.setTelefono("098765432A");

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertFalse(violations.isEmpty());
    }

    @Test
    @DisplayName("Teléfono nulo - Debe ser válido (es opcional)")
    void telefonoNulo_DebeSerValido() {
        // Arrange
        socioRequest.setTelefono(null);

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertTrue(violations.isEmpty());
    }

    @Test
    @DisplayName("Tipo identificación nulo - Debe fallar")
    void tipoIdentificacionNulo_DebeFallar() {
        // Arrange
        socioRequest.setTipoIdentificacion(null);

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("tipo de identificación es obligatorio")));
    }

    @Test
    @DisplayName("RUC con 13 dígitos - Debe ser válido")
    void rucCon13Digitos_DebeSerValido() {
        // Arrange
        socioRequest.setIdentificacion("1790123456001");
        socioRequest.setTipoIdentificacion("RUC");

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertTrue(violations.isEmpty());
    }

    @Test
    @DisplayName("Dirección nula - Debe ser válido (es opcional)")
    void direccionNula_DebeSerValido() {
        // Arrange
        socioRequest.setDireccion(null);

        // Act
        Set<ConstraintViolation<SocioRequestDTO>> violations = validator.validate(socioRequest);

        // Assert
        assertTrue(violations.isEmpty());
    }

    @Test
    @DisplayName("Getters y Setters - Funcionan correctamente")
    void gettersSetters_FuncionanCorrectamente() {
        // Arrange
        SocioRequestDTO dto = new SocioRequestDTO();

        // Act
        dto.setIdentificacion("1712345678");
        dto.setNombres("Test");
        dto.setApellidos("Usuario");
        dto.setEmail("test@test.com");
        dto.setTelefono("0987654321");
        dto.setDireccion("Calle Test");
        dto.setTipoIdentificacion("CEDULA");

        // Assert
        assertEquals("1712345678", dto.getIdentificacion());
        assertEquals("Test", dto.getNombres());
        assertEquals("Usuario", dto.getApellidos());
        assertEquals("test@test.com", dto.getEmail());
        assertEquals("0987654321", dto.getTelefono());
        assertEquals("Calle Test", dto.getDireccion());
        assertEquals("CEDULA", dto.getTipoIdentificacion());
    }
}
