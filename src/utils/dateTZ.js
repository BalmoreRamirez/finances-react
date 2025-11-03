// Utilidades para manejar fechas en la zona horaria de El Salvador
// Zona horaria oficial: America/El_Salvador (UTC-6, sin DST)

const EL_SALVADOR_TZ = 'America/El_Salvador';
const ES_SV_LOCALE = 'es-SV';

// Dado un string de fecha 'YYYY-MM-DD', crea un Date que representa
// las 00:00:00 de esa fecha en El Salvador, expresado en UTC.
// Evita desfases por zona horaria cuando se usa <input type="date">.
export function parseDateYMDToSVMidnightUTC(value) {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  // Espera formato YYYY-MM-DD
  const [y, m, d] = String(value).split('-').map(Number);
  if (!y || !m || !d) return new Date(value);
  // El Salvador está en UTC-6 => medianoche local equivale a 06:00 UTC
  // Construimos un Date en UTC a las 06:00 para representar 00:00 en SV
  return new Date(Date.UTC(y, m - 1, d, 6, 0, 0, 0));
}

// Regresa YYYY-MM-DD para la fecha actual en America/El_Salvador
export function todayYMDInSV(date = new Date()) {
  // Obtener componentes en la TZ deseada usando Intl
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: EL_SALVADOR_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type) => parts.find(p => p.type === type)?.value;
  const y = get('year');
  const m = get('month');
  const d = get('day');
  return `${y}-${m}-${d}`;
}

// Formatea un objeto Date o string ISO a fecha corta en es-SV con TZ El Salvador
export function formatDateSV(value, options = {}) {
  const date = value instanceof Date ? value : new Date(value);
  const formatter = new Intl.DateTimeFormat(ES_SV_LOCALE, {
    timeZone: EL_SALVADOR_TZ,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
  return formatter.format(date);
}

// Formatea fecha y hora con hora/minutos
export function formatDateTimeSV(value, options = {}) {
  return formatDateSV(value, { hour: '2-digit', minute: '2-digit', ...options });
}

export { EL_SALVADOR_TZ, ES_SV_LOCALE };
