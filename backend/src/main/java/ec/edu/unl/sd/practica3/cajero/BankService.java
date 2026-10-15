package ec.edu.unl.sd.practica3.cajero;

import ec.edu.unl.sd.practica3.common.SimulationResult;
import org.springframework.stereotype.Service;

@Service
public class BankService {

    public SimulationResult run() {
        return SimulationResult.pending("Cajero");
    }
}
