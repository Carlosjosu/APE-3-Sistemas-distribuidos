package ec.edu.unl.sd.practica3.impresion;

import ec.edu.unl.sd.practica3.common.SimulationResult;
import org.springframework.stereotype.Service;

@Service
public class PrintCenterService {

    public SimulationResult run() {
        return SimulationResult.pending("Centro de impresión");
    }
}
