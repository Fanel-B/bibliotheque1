import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../src/schemas/auth.schema.js';
import { createLoanSchema } from '../src/schemas/loans.schema.js';
import { createReservationSchema } from '../src/schemas/reservations.schema.js';
import { setDeviceStateSchema, scenarioSchema } from '../src/schemas/iot.schema.js';
import { setRoleSchema } from '../src/schemas/users.schema.js';
import { setEnabledSchema } from '../src/schemas/automations.schema.js';
import { isoDateInDays } from '../src/utils/dates.js';

function messages(schema, donnees) {
  const resultat = schema.safeParse(donnees);
  expect(resultat.success).toBe(false);
  return resultat.error.issues.map((issue) => issue.message);
}

describe('registerSchema', () => {
  it('accepte une inscription valide et nettoie les espaces', () => {
    const resultat = registerSchema.parse({
      name: '  Alice  ',
      email: ' alice@exemple.test ',
      password: 'motdepasse',
    });
    expect(resultat).toEqual({ name: 'Alice', email: 'alice@exemple.test', password: 'motdepasse' });
  });

  it('refuse un nom trop court (après trim)', () => {
    expect(
      messages(registerSchema, { name: ' A ', email: 'a@exemple.test', password: 'motdepasse' })
    ).toContain('Le nom doit faire au moins 2 caractères.');
  });

  it('refuse un email invalide', () => {
    expect(
      messages(registerSchema, { name: 'Alice', email: 'pas-un-email', password: 'motdepasse' })
    ).toContain('Adresse email invalide.');
  });

  it('refuse un mot de passe de moins de 8 caractères', () => {
    expect(
      messages(registerSchema, { name: 'Alice', email: 'a@exemple.test', password: '1234567' })
    ).toContain('Le mot de passe doit faire au moins 8 caractères.');
  });
});

describe('loginSchema', () => {
  it('accepte email + mot de passe', () => {
    expect(loginSchema.safeParse({ email: 'a@exemple.test', password: 'x' }).success).toBe(true);
  });

  it('refuse un mot de passe vide', () => {
    expect(messages(loginSchema, { email: 'a@exemple.test', password: '' })).toContain(
      'Mot de passe requis.'
    );
  });

  it('refuse un email absent', () => {
    expect(loginSchema.safeParse({ password: 'x' }).success).toBe(false);
  });
});

describe('createLoanSchema', () => {
  it('accepte un email et un identifiant d’exemplaire entier positif', () => {
    expect(createLoanSchema.parse({ userEmail: 'a@exemple.test', copyId: 3 })).toEqual({
      userEmail: 'a@exemple.test',
      copyId: 3,
    });
  });

  it('refuse un identifiant d’exemplaire négatif ou nul', () => {
    expect(messages(createLoanSchema, { userEmail: 'a@exemple.test', copyId: 0 })).toContain(
      'Identifiant d’exemplaire invalide.'
    );
  });

  it('refuse un identifiant décimal ou en texte', () => {
    expect(createLoanSchema.safeParse({ userEmail: 'a@exemple.test', copyId: 1.5 }).success).toBe(false);
    expect(createLoanSchema.safeParse({ userEmail: 'a@exemple.test', copyId: '3' }).success).toBe(false);
  });

  it('refuse un email invalide', () => {
    expect(messages(createLoanSchema, { userEmail: 'nope', copyId: 3 })).toContain(
      'Adresse email invalide.'
    );
  });
});

describe('createReservationSchema', () => {
  const valide = {
    roomId: 1,
    date: isoDateInDays(1),
    startTime: '10:00',
    endTime: '11:30',
  };

  it('accepte une réservation future valide', () => {
    expect(createReservationSchema.safeParse(valide).success).toBe(true);
  });

  it('accepte une réservation pour aujourd’hui', () => {
    expect(createReservationSchema.safeParse({ ...valide, date: isoDateInDays(0) }).success).toBe(true);
  });

  it('refuse une date passée', () => {
    expect(messages(createReservationSchema, { ...valide, date: isoDateInDays(-1) })).toContain(
      "La date doit être aujourd'hui ou dans le futur."
    );
  });

  it('refuse une heure de fin avant (ou égale à) l’heure de début', () => {
    expect(
      messages(createReservationSchema, { ...valide, startTime: '14:00', endTime: '13:00' })
    ).toContain("L'heure de fin doit être après l'heure de début.");
    expect(
      messages(createReservationSchema, { ...valide, startTime: '14:00', endTime: '14:00' })
    ).toContain("L'heure de fin doit être après l'heure de début.");
  });

  it('refuse un format de date ou d’heure invalide', () => {
    expect(messages(createReservationSchema, { ...valide, date: '01/01/2099' })).toContain(
      'Date invalide (format AAAA-MM-JJ).'
    );
    expect(messages(createReservationSchema, { ...valide, startTime: '24:00' })).toContain(
      'Heure de début invalide.'
    );
    expect(messages(createReservationSchema, { ...valide, endTime: '9:00' })).toContain(
      'Heure de fin invalide.'
    );
  });

  it('refuse une salle invalide', () => {
    expect(messages(createReservationSchema, { ...valide, roomId: -2 })).toContain('Salle invalide.');
  });
});

describe('setDeviceStateSchema', () => {
  it('accepte on et off', () => {
    expect(setDeviceStateSchema.safeParse({ state: 'on' }).success).toBe(true);
    expect(setDeviceStateSchema.safeParse({ state: 'off' }).success).toBe(true);
  });

  it('refuse un état hors whitelist (ex. open, offline)', () => {
    expect(messages(setDeviceStateSchema, { state: 'open' })).toEqual(['État invalide (on ou off).']);
    expect(messages(setDeviceStateSchema, { state: 'offline' })).toEqual(['État invalide (on ou off).']);
  });

  it('refuse un état absent', () => {
    expect(setDeviceStateSchema.safeParse({}).success).toBe(false);
  });
});

describe('scenarioSchema', () => {
  it('accepte chacun des 5 scénarios connus', () => {
    for (const type of [
      'open_archives',
      'raise_temperature',
      'increase_visitors',
      'simulate_outage',
      'toggle_light',
    ]) {
      expect(scenarioSchema.safeParse({ type }).success).toBe(true);
    }
  });

  it('refuse un scénario inconnu', () => {
    expect(messages(scenarioSchema, { type: 'tout_casser' })).toEqual(['Scénario inconnu.']);
  });

  it('refuse un type absent', () => {
    expect(messages(scenarioSchema, {})).toEqual(['Scénario inconnu.']);
  });
});

describe('setRoleSchema', () => {
  it('accepte les trois rôles', () => {
    for (const role of ['user', 'employee', 'admin']) {
      expect(setRoleSchema.safeParse({ role }).success).toBe(true);
    }
  });

  it('refuse un rôle inconnu', () => {
    expect(messages(setRoleSchema, { role: 'superadmin' })).toEqual(['Rôle invalide.']);
  });

  it('est sensible à la casse', () => {
    expect(setRoleSchema.safeParse({ role: 'Admin' }).success).toBe(false);
  });
});

describe('setEnabledSchema', () => {
  it('accepte un booléen', () => {
    expect(setEnabledSchema.safeParse({ enabled: false }).success).toBe(true);
  });

  it('refuse une chaîne "true" ou une valeur absente', () => {
    expect(setEnabledSchema.safeParse({ enabled: 'true' }).success).toBe(false);
    expect(setEnabledSchema.safeParse({}).success).toBe(false);
  });
});
