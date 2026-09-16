const WALL = '#2C1810';
const FLOOR_HALL = '#F3EDE1';
const FLOOR_RAYON = '#EFEAD9';
const FLOOR_ARCHIVES = '#F5E9E9';
const SHELF_FILL = '#D8C4A0';
const SHELF_LINE = '#8A6D4A';

const STATUS_FILL = {
  on: '#1B5E20',
  open: '#1B5E20',
  off: '#C9BBAE',
  closed: '#C9BBAE',
  offline: '#7B1D1D',
};

function statusFill(state) {
  return STATUS_FILL[state] ?? '#C9BBAE';
}

function findDevice(zones, zoneName, deviceName) {
  const zone = zones.find((z) => z.name === zoneName);
  return zone?.devices.find((d) => d.name === deviceName) ?? null;
}

function findSensor(zones, zoneName, type) {
  const zone = zones.find((z) => z.name === zoneName);
  return zone?.sensors.find((s) => s.type === type) ?? null;
}

// Un bloc d'étagères : un rectangle "meuble" rempli de quelques lignes
// horizontales pour évoquer des rayonnages, comme sur un vrai plan.
function ShelfBlock({ x, y, w, h, rows = 4 }) {
  const lines = [];
  for (let i = 1; i < rows; i++) {
    const ly = y + (h / rows) * i;
    lines.push(<line key={i} x1={x + 4} y1={ly} x2={x + w - 4} y2={ly} stroke={SHELF_LINE} strokeWidth="1.5" />);
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={SHELF_FILL} stroke={SHELF_LINE} strokeWidth="1.5" rx="2" />
      {lines}
    </g>
  );
}

function DeviceBadge({ cx, cy, icon, state, label }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="16" fill={statusFill(state)} stroke={WALL} strokeWidth="1" />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14">
        {icon}
      </text>
      {label && (
        <text x={cx} y={cy + 28} textAnchor="middle" fontSize="9" fill="#5D4037">
          {label}
        </text>
      )}
    </g>
  );
}

function ReadoutTag({ x, y, w = 74, text }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="22" rx="11" fill="#FFFFFF" stroke="#E3D8C4" />
      <text x={x + w / 2} y={y + 15} textAnchor="middle" fontSize="11" fill="#2C1810">
        {text}
      </text>
    </g>
  );
}

// Plan architectural simplifié, vu du dessus : murs, portes (avec vantail
// ouvert), mobilier (étagères, accueil), et les équipements domotiques
// réels placés à l'endroit où ils se trouveraient dans la pièce. Les
// couleurs des équipements reflètent leur état courant (vert = actif,
// gris = inactif, rouge = en panne).
export function LibraryMap({ zones }) {
  const hallLight = findDevice(zones, 'Hall', 'Éclairage Hall');
  const rayonLight = findDevice(zones, 'Rayon A', 'Éclairage Rayon A');
  const ventilation = findDevice(zones, 'Rayon A', 'Ventilation Rayon A');
  const archiveDoor = findDevice(zones, 'Archives', 'Porte Archives');
  const alarm = findDevice(zones, 'Archives', 'Alarme Archives');

  const occupation = findSensor(zones, 'Hall', 'occupation');
  const temperature = findSensor(zones, 'Rayon A', 'temperature');

  const doorOpen = archiveDoor?.current_state === 'open';
  const doorLeafColor = archiveDoor?.current_state === 'offline' ? '#7B1D1D' : doorOpen ? '#1B5E20' : WALL;

  return (
    <div className="rounded-xl border border-black/10 bg-surface p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        Plan de la bibliothèque
      </h2>
      <p className="mb-3 text-xs text-text-secondary">Vue du dessus — équipements en couleur selon leur état</p>

      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 900 440" className="h-auto w-full min-w-[640px]" role="img" aria-label="Plan de la bibliothèque avec les équipements domotiques">
          {/* Sols des trois pièces */}
          <rect x="40" y="40" width="280" height="340" fill={FLOOR_HALL} />
          <rect x="320" y="40" width="300" height="340" fill={FLOOR_RAYON} />
          <rect x="620" y="40" width="240" height="340" fill={FLOOR_ARCHIVES} />

          {/* Murs extérieurs (avec l'ouverture de l'entrée principale) */}
          <line x1="40" y1="40" x2="860" y2="40" stroke={WALL} strokeWidth="7" />
          <line x1="40" y1="40" x2="40" y2="380" stroke={WALL} strokeWidth="7" />
          <line x1="860" y1="40" x2="860" y2="380" stroke={WALL} strokeWidth="7" />
          <line x1="40" y1="380" x2="140" y2="380" stroke={WALL} strokeWidth="7" />
          <line x1="200" y1="380" x2="860" y2="380" stroke={WALL} strokeWidth="7" />

          {/* Vantail de la porte d'entrée, ouvert vers l'intérieur du Hall */}
          <line x1="140" y1="380" x2="188" y2="336" stroke={WALL} strokeWidth="3" />

          {/* Mur Hall / Rayon A, avec porte */}
          <line x1="320" y1="40" x2="320" y2="175" stroke={WALL} strokeWidth="7" />
          <line x1="320" y1="245" x2="320" y2="380" stroke={WALL} strokeWidth="7" />
          <line x1="320" y1="175" x2="366" y2="221" stroke={WALL} strokeWidth="3" />

          {/* Mur Rayon A / Archives, avec porte (l'accès aux archives) */}
          <line x1="620" y1="40" x2="620" y2="175" stroke={WALL} strokeWidth="7" />
          <line x1="620" y1="245" x2="620" y2="380" stroke={WALL} strokeWidth="7" />
          <line x1="620" y1="175" x2="666" y2="221" stroke={doorLeafColor} strokeWidth="4" />

          {/* ===== Hall ===== */}
          <text x="60" y="65" fontSize="13" fontWeight="600" fill="#2C1810">🚪 Hall</text>
          {/* Bureau d'accueil */}
          <rect x="70" y="270" width="80" height="34" fill="#FFFFFF" stroke="#E3D8C4" strokeWidth="1.5" rx="3" />
          <line x1="70" y1="288" x2="150" y2="288" stroke="#E3D8C4" strokeWidth="1.5" />
          <text x="110" y="295" textAnchor="middle" fontSize="9" fill="#5D4037">Accueil</text>

          <DeviceBadge cx="180" cy="90" icon="💡" state={hallLight?.current_state} label="Éclairage" />
          {occupation && !occupation.offline && (
            <ReadoutTag x="220" y="280" text={`👥 ${occupation.value}`} />
          )}

          {/* ===== Rayon A ===== */}
          <text x="345" y="65" fontSize="13" fontWeight="600" fill="#2C1810">📚 Rayon A</text>
          <ShelfBlock x="420" y="270" w="90" h="70" rows={4} />
          <ShelfBlock x="520" y="270" w="90" h="70" rows={4} />

          <DeviceBadge cx="420" cy="90" icon="💡" state={rayonLight?.current_state} label="Éclairage" />
          <DeviceBadge cx="590" cy="120" icon="🌀" state={ventilation?.current_state} label="Ventilation" />
          {temperature && !temperature.offline && (
            <ReadoutTag x="480" y="150" text={`🌡️ ${temperature.value}°C`} />
          )}

          {/* ===== Archives ===== */}
          <text x="640" y="65" fontSize="13" fontWeight="600" fill="#2C1810">🔒 Archives</text>
          <ShelfBlock x="700" y="90" w="45" h="270" rows={9} />
          <ShelfBlock x="780" y="90" w="45" h="270" rows={9} />

          <DeviceBadge cx="655" cy="200" icon="🚨" state={alarm?.current_state} label="Alarme" />
          <ReadoutTag x="625" y="255" w="80" text={doorOpen ? '🚪 Ouverte' : '🚪 Fermée'} />

          {/* Légende */}
          <g fontSize="10" fill="#5D4037">
            <circle cx="50" cy="410" r="6" fill={STATUS_FILL.on} />
            <text x="62" y="414">Actif / ouvert</text>
            <circle cx="180" cy="410" r="6" fill={STATUS_FILL.off} />
            <text x="192" y="414">Inactif / fermé</text>
            <circle cx="320" cy="410" r="6" fill={STATUS_FILL.offline} />
            <text x="332" y="414">Panne</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
