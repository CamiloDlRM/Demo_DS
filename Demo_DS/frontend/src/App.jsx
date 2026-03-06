import { useCallback, useEffect, useMemo, useState } from 'react';

const ALERT_ICONS = {
  NIVEL_BAJO: '🟡',
  NIVEL_CRITICO: '🔴',
  NIVEL_ALTO: '🟠',
  LLENO: '🔵',
  POSIBLE_FUGA: '🚨',
  NORMAL: '🟢',
};

const ALERT_TYPES = ['all', 'NIVEL_BAJO', 'NIVEL_CRITICO', 'NIVEL_ALTO', 'LLENO', 'POSIBLE_FUGA', 'NORMAL'];

const defaultConfig = {
  siteName: '',
  sampleRateSeconds: 10,
  alertThresholdPercent: 80,
  calibrationOffset: 0,
};

const emptyEvaluateForm = {
  tankId: '1',
  levelLiters: '',
  percentage: '',
  temperatureC: '',
  previousLevelLiters: '',
  minutesSinceLastReading: '',
};

const apiBase = import.meta.env.VITE_API_URL ?? '/api';

async function parseError(response) {
  try {
    const payload = await response.json();
    if (payload?.message) {
      return Array.isArray(payload.message) ? payload.message.join(', ') : payload.message;
    }
  } catch {
    // fallback below
  }
  return `HTTP ${response.status} ${response.statusText}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function AlertBadge({ type }) {
  return (
    <span className={`badge badge-${type}`}>
      {ALERT_ICONS[type] ?? '⚠️'} {type.replace('_', ' ')}
    </span>
  );
}

function AlertTable({ alerts, loading, onResolve, resolvingId }) {
  if (loading) return <p className="hint centered">Cargando alertas...</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tanque</th>
            <th>Tipo</th>
            <th>Nivel (L)</th>
            <th>%</th>
            <th>Umbral</th>
            <th>Mensaje</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {alerts.length === 0 ? (
            <tr className="empty-row">
              <td colSpan={10}>No hay alertas para mostrar.</td>
            </tr>
          ) : (
            alerts.map((a) => (
              <tr key={a.id}>
                <td>#{a.id}</td>
                <td>
                  <strong>{a.tank?.name ?? `Tanque ${a.tankId}`}</strong>
                  <br />
                  <span className="small-muted">ID: {a.tankId}</span>
                </td>
                <td><AlertBadge type={a.alertType} /></td>
                <td>{Number(a.currentLevel).toFixed(1)}</td>
                <td>{Number(a.percentage).toFixed(1)}%</td>
                <td>{a.threshold}</td>
                <td className="message-cell">{a.message}</td>
                <td className="small-muted">{formatDate(a.createdAt)}</td>
                <td>
                  {a.resolved ? (
                    <span className="resolved">✔ Resuelta</span>
                  ) : (
                    <span className="active">● Activa</span>
                  )}
                </td>
                <td>
                  {!a.resolved && (
                    <button
                      className="btn btn-success"
                      onClick={() => onResolve(a.id)}
                      disabled={resolvingId === a.id}
                    >
                      {resolvingId === a.id ? 'Resolviendo...' : 'Resolver'}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SingletonPanel() {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const endpoint = useMemo(() => `${apiBase}/singleton/config`, []);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(await parseError(response));
      const data = await response.json();
      setConfig({
        siteName: data.siteName ?? '',
        sampleRateSeconds: data.sampleRateSeconds ?? 10,
        alertThresholdPercent: data.alertThresholdPercent ?? 80,
        calibrationOffset: data.calibrationOffset ?? 0,
      });
      setMessage('Configuración cargada correctamente.');
    } catch (fetchError) {
      const fallback = `No se pudo conectar con la API (${apiBase}).`;
      setError(fetchError instanceof Error ? `${fetchError.message}. ${fallback}` : fallback);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const updateConfig = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: config.siteName,
          sampleRateSeconds: Number(config.sampleRateSeconds),
          alertThresholdPercent: Number(config.alertThresholdPercent),
          calibrationOffset: Number(config.calibrationOffset),
        }),
      });
      if (!response.ok) throw new Error(await parseError(response));
      const data = await response.json();
      setConfig(data);
      setMessage('Configuración actualizada.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${endpoint}/reset`, { method: 'POST' });
      if (!response.ok) throw new Error(await parseError(response));
      const data = await response.json();
      setConfig(data);
      setMessage('Configuración reiniciada.');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Error al resetear.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card">
      <h2>Singleton: Configuración Global</h2>
      <p className="subtitle">API: {apiBase}</p>
      <form onSubmit={updateConfig} className="form">
        <label>
          Sitio / Planta
          <input
            value={config.siteName}
            onChange={(event) => setConfig((prev) => ({ ...prev, siteName: event.target.value }))}
            required
          />
        </label>
        <label>
          Frecuencia de muestreo (seg)
          <input
            type="number"
            min={1}
            max={100}
            value={config.sampleRateSeconds}
            onChange={(event) => setConfig((prev) => ({ ...prev, sampleRateSeconds: event.target.value }))}
            required
          />
        </label>
        <label>
          Umbral de alerta (%)
          <input
            type="number"
            min={0}
            max={100}
            value={config.alertThresholdPercent}
            onChange={(event) => setConfig((prev) => ({ ...prev, alertThresholdPercent: event.target.value }))}
            required
          />
        </label>
        <label>
          Offset de calibración
          <input
            type="number"
            min={-10}
            max={10}
            step="0.1"
            value={config.calibrationOffset}
            onChange={(event) => setConfig((prev) => ({ ...prev, calibrationOffset: event.target.value }))}
            required
          />
        </label>
        <div className="actions">
          <button type="submit" disabled={saving || loading}>Guardar</button>
          <button type="button" className="secondary" onClick={resetConfig} disabled={saving || loading}>Reset</button>
          <button type="button" className="ghost" onClick={() => void fetchConfig()} disabled={saving || loading}>Recargar</button>
        </div>
      </form>
      {loading && <p className="hint">Cargando configuración...</p>}
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}

function ObserverPanel() {
  const [alertsTab, setAlertsTab] = useState('active');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [filters, setFilters] = useState({ tankId: '', alertType: 'all', resolved: 'all' });
  const [form, setForm] = useState(emptyEvaluateForm);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [evalLoading, setEvalLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (alertsTab === 'all') {
        if (filters.tankId) params.set('tankId', filters.tankId);
        if (filters.alertType !== 'all') params.set('alertType', filters.alertType);
        if (filters.resolved !== 'all') params.set('resolved', filters.resolved);
      }
      const path = alertsTab === 'active' ? '/alerts/active' : `/alerts${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(`${apiBase}${path}`);
      if (!response.ok) throw new Error(await parseError(response));
      setAlerts(await response.json());
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [alertsTab, filters]);

  useEffect(() => {
    void fetchAlerts();
  }, [fetchAlerts]);

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      const response = await fetch(`${apiBase}/alerts/${id}/resolve`, { method: 'PATCH' });
      if (!response.ok) throw new Error(await parseError(response));
      await fetchAlerts();
    } finally {
      setResolvingId(null);
    }
  };

  const handleEvaluate = async (event) => {
    event.preventDefault();
    setEvalLoading(true);
    setError('');
    setResults(null);
    try {
      const body = {
        tankId: Number(form.tankId),
        levelLiters: Number(form.levelLiters),
        percentage: Number(form.percentage),
      };
      if (form.temperatureC) body.temperatureC = Number(form.temperatureC);
      if (form.previousLevelLiters) body.previousLevelLiters = Number(form.previousLevelLiters);
      if (form.minutesSinceLastReading) body.minutesSinceLastReading = Number(form.minutesSinceLastReading);

      const response = await fetch(`${apiBase}/alerts/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(await parseError(response));
      const events = await response.json();
      setResults(events);
      await fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en evaluación');
    } finally {
      setEvalLoading(false);
    }
  };

  const activeCount = alerts.filter((a) => !a.resolved).length;

  return (
    <section className="observer-grid">
      <div className="card">
        <div className="card-title">
          🔔 Alertas Observer
          {activeCount > 0 && <span className="count-badge">{activeCount}</span>}
          <button className="link-refresh" onClick={() => void fetchAlerts()}>↻ Actualizar</button>
        </div>

        <div className="tabs">
          <button className={`tab ${alertsTab === 'active' ? 'active' : ''}`} onClick={() => setAlertsTab('active')}>Activas</button>
          <button className={`tab ${alertsTab === 'all' ? 'active' : ''}`} onClick={() => setAlertsTab('all')}>Todas</button>
        </div>

        {alertsTab === 'all' && (
          <div className="filters">
            <input
              name="tankId"
              type="number"
              placeholder="Tanque ID"
              value={filters.tankId}
              onChange={(e) => setFilters((prev) => ({ ...prev, tankId: e.target.value }))}
            />
            <select
              name="alertType"
              value={filters.alertType}
              onChange={(e) => setFilters((prev) => ({ ...prev, alertType: e.target.value }))}
            >
              {ALERT_TYPES.map((type) => (
                <option key={type} value={type}>{type === 'all' ? 'Todos los tipos' : type}</option>
              ))}
            </select>
            <select
              name="resolved"
              value={filters.resolved}
              onChange={(e) => setFilters((prev) => ({ ...prev, resolved: e.target.value }))}
            >
              <option value="all">Activas y resueltas</option>
              <option value="false">Solo activas</option>
              <option value="true">Solo resueltas</option>
            </select>
            <button onClick={() => void fetchAlerts()}>Filtrar</button>
          </div>
        )}

        <AlertTable alerts={alerts} loading={loading} resolvingId={resolvingId} onResolve={handleResolve} />
      </div>

      <aside className="card">
        <div className="card-title">⚡ Evaluar Lectura</div>
        <form className="form" onSubmit={handleEvaluate}>
          <label>ID del Tanque<input name="tankId" type="number" min="1" required value={form.tankId} onChange={(e) => setForm((prev) => ({ ...prev, tankId: e.target.value }))} /></label>
          <label>Nivel actual (L)<input name="levelLiters" type="number" min="0" step="0.1" required value={form.levelLiters} onChange={(e) => setForm((prev) => ({ ...prev, levelLiters: e.target.value }))} /></label>
          <label>Porcentaje (%)<input name="percentage" type="number" min="0" max="100" step="0.1" required value={form.percentage} onChange={(e) => setForm((prev) => ({ ...prev, percentage: e.target.value }))} /></label>
          <label>Nivel anterior (opcional)<input name="previousLevelLiters" type="number" min="0" step="0.1" value={form.previousLevelLiters} onChange={(e) => setForm((prev) => ({ ...prev, previousLevelLiters: e.target.value }))} /></label>
          <label>Minutos desde lectura anterior<input name="minutesSinceLastReading" type="number" min="0" step="0.5" value={form.minutesSinceLastReading} onChange={(e) => setForm((prev) => ({ ...prev, minutesSinceLastReading: e.target.value }))} /></label>
          <button className="btn-primary" type="submit" disabled={evalLoading}>{evalLoading ? 'Evaluando...' : 'Evaluar'}</button>
        </form>

        {error && <div className="alert-msg error">{error}</div>}
        {results && (
          <div className="result-list">
            {results.map((event, index) => (
              <div key={`${event.alertType}-${index}`} className={`result-item ${event.alertType}`}>
                <strong>{ALERT_ICONS[event.alertType]} {event.alertType}</strong>
                {event.message}
              </div>
            ))}
          </div>
        )}
      </aside>
    </section>
  );
}

export function App() {
  const [mainTab, setMainTab] = useState('singleton');

  return (
    <main className="layout">
      <header className="header">
        <h1>Lecturas y Alertas de Tanques</h1>
        <p className="subtitle">Integración Singleton + Observer</p>
      </header>

      <div className="tabs main-tabs">
        <button className={`tab ${mainTab === 'singleton' ? 'active' : ''}`} onClick={() => setMainTab('singleton')}>
          Singleton
        </button>
        <button className={`tab ${mainTab === 'observer' ? 'active' : ''}`} onClick={() => setMainTab('observer')}>
          Observer
        </button>
      </div>

      {mainTab === 'singleton' ? <SingletonPanel /> : <ObserverPanel />}
    </main>
  );
}
