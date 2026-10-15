import { useState } from 'react';
import { exercises } from './exercises';

function App() {
  const [activeId, setActiveId] = useState(1);
  const [params, setParams] = useState({ vehiculos: 10, permisosSemaforo: 4, estadiaMs: 20 });
  const [semaphoreParams, setSemaphoreParams] = useState({ espacios: 5, elementos: 0 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const activeExercise = exercises.find(({ id }) => id === activeId);

  function selectExercise(id) {
    setActiveId(id);
    setResult(null);
    setError('');
  }

  function updateParam(event) {
    setParams({ ...params, [event.target.name]: event.target.value });
  }

  function updateSemaphoreParam(event) {
    setSemaphoreParams({ ...semaphoreParams, [event.target.name]: event.target.value });
  }

  async function runParking() {
    setError('');
    setResult(null);
    const query = new URLSearchParams(params);

    try {
      const response = await fetch(`/api/ejercicios/1/estacionamiento?${query}`);
      if (!response.ok) {
        throw new Error(`El servidor respondió con ${response.status}.`);
      }
      setResult(await response.json());
    } catch (requestError) {
      setError(`No se pudo ejecutar la simulación: ${requestError.message}`);
    }
  }

  async function runProducerConsumer() {
    setError('');
    setResult(null);
    try {
      const query = new URLSearchParams(semaphoreParams);
      const response = await fetch(`/api/ejercicios/3/productor-consumidor?${query}`);
      if (!response.ok) {
        throw new Error(`El servidor respondió con ${response.status}.`);
      }
      setResult(await response.json());
    } catch (requestError) {
      setError(`No se pudo ejecutar la simulación: ${requestError.message}`);
    }
  }

  return (
    <main className="app">
      <header>
        <p className="eyebrow">Sistemas Distribuidos · APE 3</p>
        <h1>Sincronización de procesos</h1>
        <p className="intro">Esqueleto inicial para que cada participante implemente un ejercicio.</p>
      </header>

      <nav className="exercise-tabs" aria-label="Ejercicios">
        {exercises.map((exercise) => (
          <button
            className={exercise.id === activeId ? 'tab active' : 'tab'}
            key={exercise.id}
            onClick={() => selectExercise(exercise.id)}
          >
            Ejercicio {exercise.id}
          </button>
        ))}
      </nav>

      <section className="panel">
        <h2>{activeExercise.name}</h2>
        <p>Concepto asignado: <strong>{activeExercise.concept}</strong></p>
        {activeId === 1 ? (
          <>
            <p>Configura la cantidad de vehículos, los permisos del semáforo y el tiempo de estadía.</p>
            <div className="form-grid">
              <label>
                Vehículos
                <input name="vehiculos" type="number" min="1" value={params.vehiculos} onChange={updateParam} />
              </label>
              <label>
                Permisos del semáforo
                <input name="permisosSemaforo" type="number" min="1" value={params.permisosSemaforo} onChange={updateParam} />
              </label>
              <label>
                Estadía (ms)
                <input name="estadiaMs" type="number" min="1" value={params.estadiaMs} onChange={updateParam} />
              </label>
            </div>
            <button className="primary" onClick={runParking}>Ejecutar simulación</button>
            {error && <p className="error" role="alert">{error}</p>}
            {result && <SimulationResult result={result} />}
          </>
        ) : activeId === 3 ? (
          <>
            <p>Dos productores fabrican cinco piezas cada uno y dos consumidores las ensamblan. El almacén tiene capacidad para cinco piezas.</p>
            <div className="form-grid semaphore-form">
              <label>
                Valor inicial de espacios
                <input name="espacios" type="number" min="0" max="10" value={semaphoreParams.espacios} onChange={updateSemaphoreParam} />
              </label>
              <label>
                Valor inicial de elementos
                <input name="elementos" type="number" min="0" max="10" value={semaphoreParams.elementos} onChange={updateSemaphoreParam} />
              </label>
              <div className="mutex-value"><strong>mutex_almacen</strong><span>1 (fijo)</span></div>
            </div>
            <p className="hint">Configuración correcta: espacios = 5 y elementos = 0. Prueba otros valores para ver el diagnóstico sin bloquear la aplicación.</p>
            <button className="primary" onClick={runProducerConsumer}>Probar sincronización</button>
            {error && <p className="error" role="alert">{error}</p>}
            {result && <ProducerConsumerResult result={result} />}
          </>
        ) : (
          <div className="assignment-space">
            <p>Espacio asignado para desarrollar este ejercicio.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function SimulationResult({ result }) {
  return (
    <div className="simulation-result">
      <div className={result.verified ? 'verdict success' : 'verdict failure'}>
        {result.verified ? 'Capacidad respetada' : 'Capacidad superada'}
      </div>
      <p>{result.summary}</p>
      <dl className="metrics">
        <div><dt>Máximo simultáneo</dt><dd>{result.metrics.maximoSimultaneos}</dd></div>
        <div><dt>Capacidad física</dt><dd>{result.metrics.capacidadFisica}</dd></div>
        <div><dt>Tiempo concurrente</dt><dd>{result.metrics.tiempoConcurrenteMs} ms</dd></div>
        <div><dt>Tiempo secuencial estimado</dt><dd>{result.metrics.tiempoSecuencialEstimadoMs} ms</dd></div>
      </dl>
      <details className="log-details">
        <summary>
          <span>Bitácora de ejecución</span>
          <span className="event-count">{result.events.length} eventos</span>
        </summary>
        <ol className="events">
          {result.events.map((event, index) => (
            <li className="event-item" key={`${event.timestamp}-${index}`}>
              <span className="event-marker">{index + 1}</span>
              <div className="event-content">
                <div className="event-meta">
                  <span className="event-thread">{event.thread}</span>
                  <time dateTime={event.timestamp}>{formatEventTime(event.timestamp)}</time>
                </div>
                <p>{event.message}</p>
              </div>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

function ProducerConsumerResult({ result }) {
  return (
    <div className="simulation-result">
      <div className={result.verified ? 'verdict success' : 'verdict failure'}>
        {result.verified ? 'Sincronización correcta' : 'Error de sincronización'}
      </div>
      <p>{result.summary}</p>
      <dl className="metrics">
        <div><dt>Capacidad del almacén</dt><dd>{result.metrics.capacidad}</dd></div>
        <div><dt>Inicialización espacios / elementos</dt><dd>{result.metrics.espaciosIniciales} / {result.metrics.elementosIniciales}</dd></div>
        <div><dt>Máximo almacenado</dt><dd>{result.metrics.maximoAlmacen}</dd></div>
        <div><dt>Piezas producidas</dt><dd>{result.metrics.piezasProducidas}</dd></div>
        <div><dt>Piezas consumidas</dt><dd>{result.metrics.piezasConsumidas}</dd></div>
        <div><dt>Piezas restantes</dt><dd>{result.metrics.piezasRestantes}</dd></div>
        <div><dt>Tiempo de ejecución</dt><dd>{result.metrics.tiempoConcurrenteMs} ms</dd></div>
      </dl>
      <section className="analysis">
        <h3>Análisis de los semáforos</h3>
        <p><strong>Si espacios inicia en 0:</strong> ningún productor puede insertar piezas, aunque el almacén esté vacío. Si ningún otro proceso aumenta ese semáforo, los productores quedan bloqueados y los consumidores también esperan piezas: se produce un interbloqueo.</p>
        <p><strong>Si elementos inicia en 5:</strong> los consumidores creen que hay cinco piezas cuando el almacén está vacío. Intentarán retirar elementos inexistentes; el contador queda desincronizado con la cola y la implementación puede fallar o desbloquear operaciones inválidas.</p>
      </section>
      <details className="log-details">
        <summary><span>Bitácora de ejecución</span><span className="event-count">{result.events.length} eventos</span></summary>
        <ol className="events">
          {result.events.map((event, index) => (
            <li className="event-item" key={`${event.timestamp}-${index}`}>
              <span className="event-marker">{index + 1}</span>
              <div className="event-content">
                <div className="event-meta"><span className="event-thread">{event.thread}</span><time dateTime={event.timestamp}>{formatEventTime(event.timestamp)}</time></div>
                <p>{event.message}</p>
              </div>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

function formatEventTime(timestamp) {
  return new Intl.DateTimeFormat('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  }).format(new Date(timestamp));
}

export default App;
