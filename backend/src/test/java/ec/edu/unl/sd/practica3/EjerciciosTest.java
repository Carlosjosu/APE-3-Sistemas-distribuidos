package ec.edu.unl.sd.practica3;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ec.edu.unl.sd.practica3.api.EjerciciosController;
import ec.edu.unl.sd.practica3.estacionamiento.ParkingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class EjerciciosTest {

    @Autowired
    private EjerciciosController controller;

    @Test
    void todosLosEndpointsEstanDisponibles() {
        assertThat(controller.estacionamiento(10, 4, 1).verified()).isTrue();
        assertThat(controller.cajero().verified()).isTrue();
        assertThat(controller.productorConsumidor(5, 0).verified()).isTrue();
        assertThat(controller.puente().verified()).isTrue();
        assertThat(controller.impresion().verified()).isTrue();
    }

    @Test
    void estacionamientoNuncaSuperaCuatro() {
        var result = controller.estacionamiento(10, 4, 5);

        assertThat(result.verified()).isTrue();
        assertThat(result.metrics()).containsEntry("maximoSimultaneos", 4);
    }

    @Test
    void estacionamientoConSemaforoEn10ViolaLaCapacidad() {
        var result = controller.estacionamiento(10, 10, 20);

        assertThat(result.verified()).isFalse();
        assertThat(result.metrics()).containsEntry("maximoSimultaneos", 10);
    }

    @Test
    void estacionamientoRechazaParametrosNoPositivos() {
        assertThatThrownBy(() -> controller.estacionamiento(0, 4, 1))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void productorConsumidorRespetaCapacidadYConsumeTodo() {
        var result = controller.productorConsumidor(5, 0);

        assertThat(result.verified()).isTrue();
        assertThat(result.metrics())
                .containsEntry("capacidad", 5)
                .containsEntry("maximoAlmacen", 5)
                .containsEntry("piezasProducidas", 10)
                .containsEntry("piezasConsumidas", 10)
                .containsEntry("piezasRestantes", 0);
        assertThat(result.events()).hasSize(30);
    }

    @Test
    void productorConsumidorDetectaEspaciosEnCeroSinBloquear() {
        var result = controller.productorConsumidor(0, 0);

        assertThat(result.verified()).isFalse();
        assertThat(result.summary()).contains("quedaría bloqueada");
        assertThat(result.events()).anyMatch(event -> event.message().contains("ninguno puede producir"));
    }

    @Test
    void productorConsumidorDetectaElementosFalsosSinExtraerDeColaVacia() {
        var result = controller.productorConsumidor(5, 5);

        assertThat(result.verified()).isFalse();
        assertThat(result.summary()).contains("cola vacía");
        assertThat(result.events()).anyMatch(event -> event.message().contains("extraer una pieza inexistente"));
    }
}
