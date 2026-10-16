# Guía para programar cada ejercicio

Esta guía te dice **qué programar, en qué orden y con qué herramientas de Java** en cada servicio del esqueleto. No contiene las soluciones completas: solo los patrones y pistas para que las escribas tú.

---

## 0. Cómo trabajar

### El flujo de cada ejercicio

1. Abre el servicio del ejercicio y lee sus comentarios `TODO`.
2. Programa la lógica siguiendo la sección correspondiente de esta guía.
3. Corre **solo la prueba de ese ejercicio**:
   ```bash
   cd backend
   mvn test -Dtest=EjerciciosTest#estacionamientoNuncaSuperaCuatro
   ```
   (cambia el nombre del método por el de la prueba que corresponda; están en `EjerciciosTest.java`)
4. Levanta el backend (`mvn spring-boot:run`) y el frontend (`npm run dev`) y prueba los escenarios de análisis desde la interfaz.
5. Haz un commit y pasa al siguiente.

Mientras un servicio esté sin implementar, su prueba falla con "Ejercicio N sin implementar". Al implementarlo deja de devolver `PENDIENTE`.

### Lo que ya tienes hecho (no lo modifiques)

| Herramienta | Para qué sirve |
|---|---|
| `Sim.start(nombre, runnable)` | Crea **y arranca** un hilo con nombre. Devuelve el `Thread`. |
| `Sim.joinAll(listaDeHilos)` | Espera a que terminen todos los hilos. |
| `Sim.sleep(ms)` | Duerme el hilo actual (simula trabajo). |
| `Sim.tryAcquire(semaforo, timeoutMs)` | `wait()` con tiempo límite; devuelve `false` si venció (bloqueo detectado). |
| `Sim.range(nombre, valor, min, max)` | Valida parámetros (ya está en cada servicio). |
| `Sim.metrics("clave", valor, "clave2", valor2, ...)` | Arma el mapa de métricas **en orden**. |
| `Sim.elapsedMs(inicioNanos)` | Milisegundos transcurridos desde `System.nanoTime()`. |
| `EventLog log = EventLog.enabled()` | Bitácora. `log.log("mensaje")` registra un evento (con hilo y tiempo). |
| `log.snapshot()` | Lista de eventos para devolver en el resultado. |
| `new SimulationResult(ejercicio, titulo, verified, resumen, metricas, eventos, duracionMs)` | El resultado que devuelve cada `run(...)`. |

### Plantilla de un `run(...)` terminado

```java
long inicio = System.nanoTime();
List<Thread> hilos = new ArrayList<>();
for (int i = 1; i <= n; i++) {
    final int id = i;                       // las lambdas solo capturan variables "efectivamente finales"
    hilos.add(Sim.start("hilo-" + id, () -> {
        // ... lógica del hilo ...
    }));
}
Sim.joinAll(hilos);
long duracion = Sim.elapsedMs(inicio);

boolean ok = /* criterio de verificación */;
return new SimulationResult(1, "Título", ok, "Resumen legible",
        Sim.metrics("clave", valor, "otra", otroValor),
        log.snapshot(), duracion);
```

### Reglas de oro de la concurrencia en Java

- **Todo `release()` / `unlock()` va dentro de un `finally`.** Si el hilo falla, el recurso debe liberarse igual.
- **Los contadores compartidos entre hilos** deben ser `AtomicInteger` / `AtomicLong` (no `int` sueltos).
- **No imprimas con `System.out`**: usa `log.log(...)`, que es seguro entre hilos y se muestra en la interfaz.
- **Los valores devueltos como métricas** deben ser tipos simples: números, texto o booleanos.
- **Los nombres de las métricas son un contrato**: las pruebas y la interfaz las leen por su nombre exacto (están listados en cada ejercicio).

---



## Ejercicio 5 — Centro de impresión (orden con semáforos)

**Archivo:** `impresion/PrintCenterService.java`
**Pruebas:** `impresionRespetaElOrden`, `omitirUnSignalBloqueaElCiclo`

### Idea

Aquí el semáforo no protege un recurso sino que **señaliza** ("ya puedes continuar"). Tres semáforos forman un **relevo** circular:

```
turnoDiseno(1) → diseño → signal(turnoRevision)
turnoRevision(0) → revisión → signal(turnoImpresion)
turnoImpresion(0) → impresión → signal(turnoDiseno)
```

Solo `turnoDiseno` empieza en 1, por eso diseño arranca primero; los otros esperan su turno.

### Pasos

1. **Semáforos:** `turnoDiseno = new Semaphore(1)`, `turnoRevision = new Semaphore(0)`, `turnoImpresion = new Semaphore(0)`.
2. **Registro del orden:** `List<String> orden = Collections.synchronizedList(new ArrayList<>());` y un `AtomicInteger bloqueados`.
3. **Tres hilos** (`"diseno"`, `"revision"`, `"impresion"`), cada uno repite `documentos` veces:
   1. `if (!Sim.tryAcquire(suTurno, timeoutMs)) { registrar bloqueo; bloqueados++; return; }`
   2. `log.log(...)`, `orden.add("D" + d)` (o `"R"+d`, `"I"+d`) y `Sim.sleep(trabajoMs)`.
   3. `suSiguiente.release()` — **salvo** que `omitir` indique que ese signal se omite.
4. **Qué signal se omite según `omitir`:**

   | `omitir` | Signal que no se ejecuta |
   |---|---|
   | `REVISION` | diseño no hace `turnoRevision.release()` |
   | `IMPRESION` | revisión no hace `turnoImpresion.release()` |
   | `DISENO` | impresión no hace `turnoDiseno.release()` |
   | `NINGUNO` | ninguno |

5. **Verificación:** construye la lista esperada (`D1 R1 I1 D2 R2 I2 … Dn Rn In`) y compárala con `orden`:
   `verified = orden.equals(esperado) && bloqueados.get() == 0`.

### Detalles que importan

- Registra en `orden` **justo después** de obtener el turno (antes de `release()` del siguiente), así el orden refleja la secuencia real de ejecución.
- `Sim.tryAcquire` existe para que, cuando omites un signal, el programa **detecte el bloqueo y termine** en lugar de colgarse.

### Métricas a devolver

`documentos`, `signalOmitido` (`omitir.name()`), `etapasEsperadas`, `etapasEjecutadas`, `hilosBloqueados`, `ordenObservado` (texto con los elementos separados por espacio: `String.join(" ", orden)`)

### Escenarios de análisis (pregunta de la guía)

| Caso | Qué esperar |
|---|---|
| `NINGUNO` | `ordenObservado = "D1 R1 I1 D2 R2 I2 D3 R3 I3"`, `verified = true` |
| Omitir un signal | La cadena se corta: el proceso siguiente nunca recibe su turno y los tres terminan bloqueados (por el timeout). `etapasEjecutadas < etapasEsperadas`. Pregúntate **en qué etapa** se corta según qué signal falte. |

---

