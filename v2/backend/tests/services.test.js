import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import bcrypt from 'bcryptjs';
import * as reservationsService from '../src/services/reservations.service.js';
import * as recommendationsService from '../src/services/recommendations.service.js';
import * as authService from '../src/services/auth.service.js';
import * as adminService from '../src/services/admin.service.js';
import * as iotService from '../src/services/iot.service.js';
import * as booksService from '../src/services/books.service.js';
import * as healthService from '../src/services/health.service.js';
import { handleDoorOpened } from '../src/services/security.service.js';
import { runScenario } from '../src/services/scenarios.service.js';
import * as reservationsRepository from '../src/repositories/reservations.repository.js';
import * as recommendationsRepository from '../src/repositories/recommendations.repository.js';
import * as usersRepository from '../src/repositories/users.repository.js';
import * as logsRepository from '../src/repositories/logs.repository.js';
import * as iotRepository from '../src/repositories/iot.repository.js';
import * as booksRepository from '../src/repositories/books.repository.js';
import * as healthRepository from '../src/repositories/health.repository.js';
import { signRefreshToken, verifyAccessToken } from '../src/utils/tokens.js';

vi.mock('../src/repositories/reservations.repository.js');
vi.mock('../src/repositories/recommendations.repository.js');
vi.mock('../src/repositories/users.repository.js');
vi.mock('../src/repositories/logs.repository.js');
vi.mock('../src/repositories/iot.repository.js');
vi.mock('../src/repositories/books.repository.js');
vi.mock('../src/repositories/health.repository.js');
vi.mock('../src/repositories/automations.repository.js');

beforeEach(() => vi.resetAllMocks());
afterEach(() => vi.useRealTimers());

describe('reservations.service', () => {
  const demande = { userId: 1, roomId: 2, date: '2099-01-01', startTime: '10:00', endTime: '11:00' };

  it('transmet la réservation au repository', async () => {
    reservationsRepository.createReservation.mockResolvedValue({ id: 10 });
    expect(await reservationsService.createReservation(demande)).toEqual({ id: 10 });
    expect(reservationsRepository.createReservation).toHaveBeenCalledWith(demande);
  });

  it('404 si la salle n’existe pas', async () => {
    reservationsRepository.createReservation.mockRejectedValue(new Error('ROOM_NOT_FOUND'));
    await expect(reservationsService.createReservation(demande)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Salle introuvable.',
    });
  });

  it('409 si le créneau chevauche une réservation existante', async () => {
    reservationsRepository.createReservation.mockRejectedValue(new Error('SLOT_TAKEN'));
    await expect(reservationsService.createReservation(demande)).rejects.toMatchObject({
      statusCode: 409,
      message: 'Ce créneau est déjà réservé pour cette salle.',
    });
  });

  it('laisse remonter une erreur inattendue', async () => {
    reservationsRepository.createReservation.mockRejectedValue(new Error('autre'));
    await expect(reservationsService.createReservation(demande)).rejects.toThrow('autre');
  });

  it('annulation : 404 si la réservation n’appartient pas à l’utilisateur ou n’existe pas', async () => {
    reservationsRepository.deleteReservation.mockResolvedValue(null);
    await expect(reservationsService.cancelReservation(5, 1)).rejects.toMatchObject({ statusCode: 404 });
    expect(reservationsRepository.deleteReservation).toHaveBeenCalledWith(5, 1);
  });

  it('annulation réussie', async () => {
    reservationsRepository.deleteReservation.mockResolvedValue({ id: 5 });
    expect(await reservationsService.cancelReservation(5, 1)).toEqual({ id: 5 });
  });
});

describe('recommendations.service', () => {
  it('convertit les scores renvoyés en texte par PostgreSQL en nombres', async () => {
    recommendationsRepository.getRecommendationsForUser.mockResolvedValue([
      { id: 1, title: 'Dune', genre_score: '2', author_score: '1', popularity_score: '5', score: '13' },
    ]);
    const [livre] = await recommendationsService.getRecommendationsForUser(4);
    expect(recommendationsRepository.getRecommendationsForUser).toHaveBeenCalledWith(4);
    expect(livre).toEqual({
      id: 1,
      title: 'Dune',
      genre_score: 2,
      author_score: 1,
      popularity_score: 5,
      score: 13,
    });
  });

  it('renvoie une liste vide sans historique', async () => {
    recommendationsRepository.getRecommendationsForUser.mockResolvedValue([]);
    expect(await recommendationsService.getRecommendationsForUser(4)).toEqual([]);
  });
});

describe('books.service', () => {
  it('convertit les compteurs d’exemplaires en nombres', async () => {
    booksRepository.listBooks.mockResolvedValue([{ id: 1, available_copies: '2', total_copies: '3' }]);
    expect(await booksService.searchBooks('dune')).toEqual([
      { id: 1, available_copies: 2, total_copies: 3 },
    ]);
    expect(booksRepository.listBooks).toHaveBeenCalledWith('dune');
  });

  it('404 pour un livre inconnu', async () => {
    booksRepository.getBookById.mockResolvedValue(null);
    await expect(booksService.getBook(1)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('health.service', () => {
  it('"up" quand la base répond', async () => {
    healthRepository.pingDatabase.mockResolvedValue(true);
    expect(await healthService.checkDatabaseHealth()).toEqual({ status: 'up' });
  });

  it('"down" avec la raison quand la base est injoignable', async () => {
    healthRepository.pingDatabase.mockRejectedValue(new Error('timeout'));
    expect(await healthService.checkDatabaseHealth()).toEqual({ status: 'down', reason: 'timeout' });
  });
});

describe('auth.service', () => {
  const motDePasse = 'motdepasse-de-test';

  it('inscription : 409 si l’email est déjà utilisé', async () => {
    usersRepository.findUserByEmail.mockResolvedValue({ id: 1 });
    await expect(
      authService.register({ name: 'A', email: 'a@exemple.test', password: motDePasse })
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(usersRepository.createUser).not.toHaveBeenCalled();
  });

  it('inscription : le mot de passe est haché, jamais stocké en clair', async () => {
    usersRepository.findUserByEmail.mockResolvedValue(null);
    usersRepository.createUser.mockImplementation(async ({ name, email }) => ({ id: 1, name, email, role: 'user' }));

    await authService.register({ name: 'A', email: 'a@exemple.test', password: motDePasse });

    const { passwordHash } = usersRepository.createUser.mock.calls[0][0];
    expect(passwordHash).not.toBe(motDePasse);
    expect(await bcrypt.compare(motDePasse, passwordHash)).toBe(true);
  });

  it('connexion : 401 identique pour un email inconnu et un mauvais mot de passe', async () => {
    usersRepository.findUserByEmail.mockResolvedValue(null);
    const inconnu = authService.login({ email: 'x@exemple.test', password: motDePasse });
    await expect(inconnu).rejects.toMatchObject({ statusCode: 401, message: 'Email ou mot de passe incorrect.' });

    usersRepository.findUserByEmail.mockResolvedValue({
      id: 1,
      role: 'user',
      password_hash: await bcrypt.hash('autre-mot-de-passe', 4),
    });
    const mauvais = authService.login({ email: 'x@exemple.test', password: motDePasse });
    await expect(mauvais).rejects.toMatchObject({ statusCode: 401, message: 'Email ou mot de passe incorrect.' });
  });

  it('connexion réussie : tokens valides et utilisateur sans hash', async () => {
    usersRepository.findUserByEmail.mockResolvedValue({
      id: 9,
      name: 'Alice',
      role: 'employee',
      password_hash: await bcrypt.hash(motDePasse, 4),
    });

    const { user, accessToken, refreshToken } = await authService.login({
      email: 'a@exemple.test',
      password: motDePasse,
    });

    expect(user).toEqual({ id: 9, name: 'Alice', role: 'employee' });
    expect(verifyAccessToken(accessToken)).toMatchObject({ sub: 9, role: 'employee' });
    expect(refreshToken).toEqual(expect.any(String));
  });

  it('rafraîchissement : 401 sans token ou avec un token invalide', async () => {
    await expect(authService.refreshAccessToken(undefined)).rejects.toMatchObject({ statusCode: 401 });
    await expect(authService.refreshAccessToken('invalide')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rafraîchissement : 401 si l’utilisateur a été supprimé', async () => {
    usersRepository.findUserById.mockResolvedValue(null);
    await expect(authService.refreshAccessToken(signRefreshToken({ id: 9 }))).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('rafraîchissement : nouveau token avec le rôle actuel en base', async () => {
    usersRepository.findUserById.mockResolvedValue({ id: 9, role: 'admin', password_hash: 'x' });
    const { accessToken, user } = await authService.refreshAccessToken(signRefreshToken({ id: 9 }));
    expect(usersRepository.findUserById).toHaveBeenCalledWith(9);
    expect(user).toEqual({ id: 9, role: 'admin' });
    expect(verifyAccessToken(accessToken).role).toBe('admin');
  });
});

describe('admin.service — changeUserRole', () => {
  it('400 si un admin tente de changer son propre rôle', async () => {
    await expect(
      adminService.changeUserRole({ targetUserId: 3, role: 'user', actingUserId: 3 })
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(usersRepository.setUserRole).not.toHaveBeenCalled();
  });

  it('404 si l’utilisateur cible n’existe pas', async () => {
    usersRepository.setUserRole.mockResolvedValue(null);
    await expect(
      adminService.changeUserRole({ targetUserId: 8, role: 'employee', actingUserId: 3 })
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(logsRepository.insertLog).not.toHaveBeenCalled();
  });

  it('change le rôle et journalise', async () => {
    usersRepository.setUserRole.mockResolvedValue({ id: 8, email: 'b@exemple.test', role: 'employee' });
    const user = await adminService.changeUserRole({ targetUserId: 8, role: 'employee', actingUserId: 3 });
    expect(user.role).toBe('employee');
    expect(logsRepository.insertLog).toHaveBeenCalledWith({
      userId: 3,
      action: 'role_changed',
      target: 'b@exemple.test → employee',
    });
  });
});

describe('iot.service', () => {
  it('historique : 400 pour une plage autre que 24h ou 7d', async () => {
    await expect(iotService.getSensorHistory(1, '30d')).rejects.toMatchObject({ statusCode: 400 });
  });

  it('historique : 404 pour un capteur inconnu', async () => {
    iotRepository.getSensorById.mockResolvedValue(null);
    await expect(iotService.getSensorHistory(1, '7d')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('pilotage : 400 pour un état hors whitelist', async () => {
    await expect(iotService.setDeviceState(1, 'open')).rejects.toMatchObject({ statusCode: 400 });
    expect(iotRepository.getDeviceById).not.toHaveBeenCalled();
  });

  it('pilotage : 404 pour un dispositif inconnu', async () => {
    iotRepository.getDeviceById.mockResolvedValue(null);
    await expect(iotService.setDeviceState(1, 'on')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('pilotage : 403 pour un dispositif non contrôlable (ex. porte des archives)', async () => {
    iotRepository.getDeviceById.mockResolvedValue({ id: 1, controllable: false });
    await expect(iotService.setDeviceState(1, 'on')).rejects.toMatchObject({ statusCode: 403 });
    expect(iotRepository.updateDeviceState).not.toHaveBeenCalled();
  });

  it('pilotage : met à jour un dispositif contrôlable', async () => {
    iotRepository.getDeviceById.mockResolvedValue({ id: 1, controllable: true });
    iotRepository.updateDeviceState.mockResolvedValue({ id: 1, current_state: 'off' });
    expect(await iotService.setDeviceState(1, 'off')).toEqual({ id: 1, current_state: 'off' });
  });

  it('acquittement : 404 pour une alerte inconnue', async () => {
    iotRepository.acknowledgeAlert.mockResolvedValue(null);
    await expect(iotService.acknowledgeAlert(1)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('security.service — handleDoorOpened', () => {
  it('pendant les horaires : événement sans alerte', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-10T10:00:00Z'));
    iotRepository.insertEvent.mockResolvedValue({ id: 50 });

    const { event, alert } = await handleDoorOpened(4);

    expect(iotRepository.insertEvent).toHaveBeenCalledWith({
      type: 'door_open',
      zoneId: 4,
      payload: { withinHours: true },
    });
    expect(event).toEqual({ id: 50 });
    expect(alert).toBeNull();
    expect(iotRepository.insertAlert).not.toHaveBeenCalled();
  });

  it('hors horaires : alerte critique liée à l’événement', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-10T22:00:00Z'));
    iotRepository.insertEvent.mockResolvedValue({ id: 51 });
    iotRepository.insertAlert.mockResolvedValue({ id: 7, severity: 'critical' });

    const { alert } = await handleDoorOpened(4);

    expect(iotRepository.insertAlert).toHaveBeenCalledWith({ eventId: 51, severity: 'critical' });
    expect(alert).toEqual({ id: 7, severity: 'critical' });
  });
});

describe('scenarios.service — runScenario', () => {
  const zones = [
    { id: 1, name: 'Hall' },
    { id: 2, name: 'Rayon A' },
    { id: 3, name: 'Archives' },
  ];
  const appareils = (etatLumiere = 'off') => [
    { id: 10, name: 'Porte Archives', current_state: 'closed' },
    { id: 11, name: 'Ventilation Rayon A', current_state: 'on' },
    { id: 12, name: 'Éclairage Rayon A', current_state: etatLumiere },
  ];

  beforeEach(() => {
    iotRepository.listZones.mockResolvedValue(zones);
    iotRepository.listDevices.mockResolvedValue(appareils());
    iotRepository.insertEvent.mockResolvedValue({ id: 1 });
  });

  it('400 pour un scénario inconnu', async () => {
    await expect(runScenario('inconnu')).rejects.toMatchObject({ statusCode: 400 });
  });

  it('open_archives hors horaires : ouvre la porte et génère une alerte', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-10T23:00:00Z'));
    iotRepository.insertAlert.mockResolvedValue({ id: 1 });

    const { message } = await runScenario('open_archives');

    expect(iotRepository.updateDeviceState).toHaveBeenCalledWith(10, 'open');
    expect(message).toContain('alerte de sécurité');
  });

  it('open_archives pendant les horaires : pas d’alerte', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-10T11:00:00Z'));
    const { message } = await runScenario('open_archives');
    expect(iotRepository.insertAlert).not.toHaveBeenCalled();
    expect(message).toContain("pendant les horaires d'ouverture");
  });

  it('raise_temperature : remplace le boost actif par un boost de +6 pendant 10 minutes', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const maintenant = new Date('2026-03-10T11:00:00Z');
    vi.setSystemTime(maintenant);

    await runScenario('raise_temperature');

    expect(iotRepository.clearActiveScenarioBoosts).toHaveBeenCalledWith(2, 'temperature', maintenant);
    expect(iotRepository.insertEvent).toHaveBeenCalledWith({
      type: 'scenario_boost',
      zoneId: 2,
      payload: { sensorType: 'temperature', boost: 6, expiresAt: '2026-03-10T11:10:00.000Z' },
    });
    expect(iotRepository.clearActiveScenarioBoosts.mock.invocationCallOrder[0]).toBeLessThan(
      iotRepository.insertEvent.mock.invocationCallOrder[0]
    );
  });

  it('increase_visitors : boost d’occupation de +25 dans le Hall', async () => {
    await runScenario('increase_visitors');
    expect(iotRepository.insertEvent).toHaveBeenCalledWith(
      expect.objectContaining({ zoneId: 1, payload: expect.objectContaining({ sensorType: 'occupation', boost: 25 }) })
    );
  });

  it('simulate_outage : met la ventilation hors service', async () => {
    await runScenario('simulate_outage');
    expect(iotRepository.updateDeviceState).toHaveBeenCalledWith(11, 'offline');
  });

  it('toggle_light : inverse l’état de l’éclairage', async () => {
    expect((await runScenario('toggle_light')).message).toContain('allumé');
    expect(iotRepository.updateDeviceState).toHaveBeenLastCalledWith(12, 'on');

    iotRepository.listDevices.mockResolvedValue(appareils('on'));
    expect((await runScenario('toggle_light')).message).toContain('éteint');
    expect(iotRepository.updateDeviceState).toHaveBeenLastCalledWith(12, 'off');
  });

  it('404 si la zone ou le dispositif attendu n’existe pas', async () => {
    iotRepository.listZones.mockResolvedValue([]);
    await expect(runScenario('raise_temperature')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Zone "Rayon A" introuvable.',
    });
    iotRepository.listDevices.mockResolvedValue([]);
    await expect(runScenario('simulate_outage')).rejects.toMatchObject({ statusCode: 404 });
  });
});
