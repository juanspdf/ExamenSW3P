package ec.fin.coacandes.socios.integration;

import ec.fin.coacandes.socios.dto.SocioRequestDTO;
import ec.fin.coacandes.socios.dto.SocioResponseDTO;
import ec.fin.coacandes.socios.repository.SocioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DisplayName("API Socios - Pruebas de Integración")
class SocioIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private SocioRepository socioRepository;

    private String baseUrl;
    private SocioRequestDTO socioRequest;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/socios";
        socioRepository.deleteAll();

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
    @DisplayName("Crear socio - Integración completa")
    void crearSocio_IntegracionCompleta() {
        // Act
        ResponseEntity<SocioResponseDTO> response = restTemplate.postForEntity(
                baseUrl,
                socioRequest,
                SocioResponseDTO.class
        );

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getId());
        assertEquals(socioRequest.getIdentificacion(), response.getBody().getIdentificacion());
        assertEquals(1, socioRepository.count());
    }

    @Test
    @DisplayName("Obtener todos los socios - Integración")
    void obtenerTodosSocios_Integracion() {
        // Arrange
        restTemplate.postForEntity(baseUrl, socioRequest, SocioResponseDTO.class);

        // Act
        ResponseEntity<SocioResponseDTO[]> response = restTemplate.getForEntity(
                baseUrl,
                SocioResponseDTO[].class
        );

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().length);
    }

    @Test
    @DisplayName("Actualizar socio - Integración completa")
    void actualizarSocio_IntegracionCompleta() {
        // Arrange
        ResponseEntity<SocioResponseDTO> createResponse = restTemplate.postForEntity(
                baseUrl,
                socioRequest,
                SocioResponseDTO.class
        );

        String socioId = createResponse.getBody().getId().toString();
        socioRequest.setNombres("Juan Carlos");

        // Act
        ResponseEntity<SocioResponseDTO> updateResponse = restTemplate.exchange(
                baseUrl + "/" + socioId,
                HttpMethod.PUT,
                new HttpEntity<>(socioRequest),
                SocioResponseDTO.class
        );

        // Assert
        assertEquals(HttpStatus.OK, updateResponse.getStatusCode());
        assertNotNull(updateResponse.getBody());
        assertEquals("Juan Carlos", updateResponse.getBody().getNombres());
    }

    @Test
    @DisplayName("Eliminar socio - Integración completa")
    void eliminarSocio_IntegracionCompleta() {
        // Arrange
        ResponseEntity<SocioResponseDTO> createResponse = restTemplate.postForEntity(
                baseUrl,
                socioRequest,
                SocioResponseDTO.class
        );

        String socioId = createResponse.getBody().getId().toString();

        // Act
        ResponseEntity<Void> deleteResponse = restTemplate.exchange(
                baseUrl + "/" + socioId,
                HttpMethod.DELETE,
                null,
                Void.class
        );

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, deleteResponse.getStatusCode());
        assertEquals(0, socioRepository.count());
    }

    @Test
    @DisplayName("Buscar por identificación - Integración")
    void buscarPorIdentificacion_Integracion() {
        // Arrange
        restTemplate.postForEntity(baseUrl, socioRequest, SocioResponseDTO.class);

        // Act
        ResponseEntity<SocioResponseDTO> response = restTemplate.getForEntity(
                baseUrl + "/identificacion/" + socioRequest.getIdentificacion(),
                SocioResponseDTO.class
        );

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(socioRequest.getIdentificacion(), response.getBody().getIdentificacion());
    }

    @Test
    @DisplayName("Crear socio con identificación duplicada - Debe fallar")
    void crearSocioDuplicado_DebeFallar() {
        // Arrange
        restTemplate.postForEntity(baseUrl, socioRequest, SocioResponseDTO.class);

        // Act
        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl,
                socioRequest,
                String.class
        );

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
