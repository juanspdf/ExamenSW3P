package ec.fin.coacandes.socios.repository;

import ec.fin.coacandes.socios.entity.Socio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("SocioRepository - Pruebas de Integración")
class SocioRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SocioRepository socioRepository;

    private Socio socio;

    @BeforeEach
    void setUp() {
        socio = new Socio();
        socio.setIdentificacion("1712345678");
        socio.setNombres("Juan");
        socio.setApellidos("Pérez");
        socio.setEmail("juan.perez@test.com");
        socio.setTelefono("0987654321");
        socio.setDireccion("Av. Principal 123");
        socio.setTipoIdentificacion("CEDULA");
        socio.setActivo(true);
    }

    @Test
    @DisplayName("Guardar socio - Exitoso")
    void guardarSocio_Exitoso() {
        // Act
        Socio guardado = entityManager.persistAndFlush(socio);

        // Assert
        assertNotNull(guardado);
        assertNotNull(guardado.getId());
        assertEquals(socio.getIdentificacion(), guardado.getIdentificacion());
        assertEquals(socio.getNombres(), guardado.getNombres());
        assertEquals(socio.getApellidos(), guardado.getApellidos());
        assertNotNull(guardado.getFechaCreacion());
    }

    @Test
    @DisplayName("Buscar por ID - Socio existente")
    void buscarPorId_Existente() {
        // Arrange
        Socio guardado = entityManager.persistAndFlush(socio);

        // Act
        Optional<Socio> encontrado = socioRepository.findById(guardado.getId());

        // Assert
        assertTrue(encontrado.isPresent());
        assertEquals(guardado.getId(), encontrado.get().getId());
        assertEquals(guardado.getIdentificacion(), encontrado.get().getIdentificacion());
    }

    @Test
    @DisplayName("Buscar por ID - Socio no existente")
    void buscarPorId_NoExistente() {
        // Act
        Optional<Socio> encontrado = socioRepository.findById(java.util.UUID.randomUUID());

        // Assert
        assertFalse(encontrado.isPresent());
    }

    @Test
    @DisplayName("Buscar por identificación - Exitoso")
    void buscarPorIdentificacion_Exitoso() {
        // Arrange
        entityManager.persistAndFlush(socio);

        // Act
        Optional<Socio> encontrado = socioRepository.findByIdentificacion("1712345678");

        // Assert
        assertTrue(encontrado.isPresent());
        assertEquals("1712345678", encontrado.get().getIdentificacion());
    }

    @Test
    @DisplayName("Buscar por identificación - No encontrado")
    void buscarPorIdentificacion_NoEncontrado() {
        // Act
        Optional<Socio> encontrado = socioRepository.findByIdentificacion("9999999999");

        // Assert
        assertFalse(encontrado.isPresent());
    }

    @Test
    @DisplayName("Verificar si existe por identificación - Existe")
    void existePorIdentificacion_Existe() {
        // Arrange
        entityManager.persistAndFlush(socio);

        // Act
        boolean existe = socioRepository.existsByIdentificacion("1712345678");

        // Assert
        assertTrue(existe);
    }

    @Test
    @DisplayName("Verificar si existe por identificación - No existe")
    void existePorIdentificacion_NoExiste() {
        // Act
        boolean existe = socioRepository.existsByIdentificacion("9999999999");

        // Assert
        assertFalse(existe);
    }

    @Test
    @DisplayName("Buscar todos los socios - Con resultados")
    void buscarTodos_ConResultados() {
        // Arrange
        Socio socio2 = new Socio();
        socio2.setIdentificacion("1723456789");
        socio2.setNombres("María");
        socio2.setApellidos("López");
        socio2.setTipoIdentificacion("CEDULA");
        socio2.setActivo(true);

        entityManager.persistAndFlush(socio);
        entityManager.persistAndFlush(socio2);

        // Act
        List<Socio> socios = socioRepository.findAll();

        // Assert
        assertNotNull(socios);
        assertEquals(2, socios.size());
    }

    @Test
    @DisplayName("Eliminar socio - Exitoso")
    void eliminarSocio_Exitoso() {
        // Arrange
        Socio guardado = entityManager.persistAndFlush(socio);

        // Act
        socioRepository.deleteById(guardado.getId());
        Optional<Socio> encontrado = socioRepository.findById(guardado.getId());

        // Assert
        assertFalse(encontrado.isPresent());
    }

    @Test
    @DisplayName("Actualizar socio - Exitoso")
    void actualizarSocio_Exitoso() {
        // Arrange
        Socio guardado = entityManager.persistAndFlush(socio);
        String nuevoEmail = "nuevo.email@test.com";

        // Act
        guardado.setEmail(nuevoEmail);
        Socio actualizado = socioRepository.save(guardado);

        // Assert
        assertNotNull(actualizado);
        assertEquals(nuevoEmail, actualizado.getEmail());
        assertNotNull(actualizado.getFechaActualizacion());
    }

    @Test
    @DisplayName("Email único - No permite duplicados")
    void emailUnico_NoDuplicados() {
        // Arrange
        entityManager.persistAndFlush(socio);

        Socio socio2 = new Socio();
        socio2.setIdentificacion("1723456789");
        socio2.setNombres("María");
        socio2.setApellidos("López");
        socio2.setEmail("juan.perez@test.com"); // Email duplicado
        socio2.setTipoIdentificacion("CEDULA");
        socio2.setActivo(true);

        // Act & Assert
        assertThrows(Exception.class, () -> {
            entityManager.persistAndFlush(socio2);
        });
    }

    @Test
    @DisplayName("Identificación única - No permite duplicados")
    void identificacionUnica_NoDuplicados() {
        // Arrange
        entityManager.persistAndFlush(socio);

        Socio socio2 = new Socio();
        socio2.setIdentificacion("1712345678"); // Identificación duplicada
        socio2.setNombres("María");
        socio2.setApellidos("López");
        socio2.setEmail("maria.lopez@test.com");
        socio2.setTipoIdentificacion("CEDULA");
        socio2.setActivo(true);

        // Act & Assert
        assertThrows(Exception.class, () -> {
            entityManager.persistAndFlush(socio2);
        });
    }
}
