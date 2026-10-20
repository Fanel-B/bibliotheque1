import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  withStatus,
  createLoan,
  returnLoan,
  listMyLoans,
} from '../src/services/loans.service.js';
import * as loansRepository from '../src/repositories/loans.repository.js';
import { findUserByEmail } from '../src/repositories/users.repository.js';
import { insertLog } from '../src/repositories/logs.repository.js';
import { isoDateInDays } from '../src/utils/dates.js';

vi.mock('../src/repositories/loans.repository.js');
vi.mock('../src/repositories/users.repository.js');
vi.mock('../src/repositories/logs.repository.js');

// Laisse s'exécuter les promesses "fire and forget" (journalisation).
const attendreMicrotaches = () => new Promise((resolve) => setImmediate(resolve));

beforeEach(() => {
  vi.resetAllMocks();
  insertLog.mockResolvedValue(undefined);
});

describe('withStatus (statut d’un emprunt)', () => {
  it('"retourne" dès qu’une date de retour existe, même en retard', () => {
    expect(withStatus({ due_date: isoDateInDays(-30), return_date: isoDateInDays(-1) }).status).toBe(
      'retourne'
    );
  });

  it('"retard" si la date prévue est passée et le livre non rendu', () => {
    expect(withStatus({ due_date: isoDateInDays(-1), return_date: null }).status).toBe('retard');
  });

  it('"en_cours" si la date prévue est aujourd’hui ou plus tard', () => {
    expect(withStatus({ due_date: isoDateInDays(0), return_date: null }).status).toBe('en_cours');
    expect(withStatus({ due_date: isoDateInDays(10), return_date: null }).status).toBe('en_cours');
  });

  it('conserve les autres champs sans muter l’objet d’origine', () => {
    const pret = { id: 1, title: 'Dune', due_date: isoDateInDays(3), return_date: null };
    const resultat = withStatus(pret);
    expect(resultat).toEqual({ ...pret, status: 'en_cours' });
    expect(pret).not.toHaveProperty('status');
  });
});

describe('createLoan', () => {
  it('crée un prêt de 14 jours et journalise l’action', async () => {
    findUserByEmail.mockResolvedValue({ id: 7 });
    loansRepository.createLoan.mockResolvedValue({ id: 99 });

    const pret = await createLoan({ userEmail: 'lecteur@exemple.test', copyId: 3, actingUserId: 2 });

    expect(pret).toEqual({ id: 99 });
    expect(loansRepository.createLoan).toHaveBeenCalledWith({
      userId: 7,
      copyId: 3,
      dueDate: isoDateInDays(14),
    });
    expect(insertLog).toHaveBeenCalledWith({
      userId: 2,
      action: 'loan_created',
      target: 'exemplaire #3 → lecteur@exemple.test',
    });
  });

  it('404 si aucun compte ne correspond à l’email', async () => {
    findUserByEmail.mockResolvedValue(null);
    await expect(createLoan({ userEmail: 'x@exemple.test', copyId: 1 })).rejects.toMatchObject({
      statusCode: 404,
      message: 'Aucun compte trouvé avec cet email.',
    });
    expect(loansRepository.createLoan).not.toHaveBeenCalled();
  });

  it('404 si l’exemplaire n’existe pas', async () => {
    findUserByEmail.mockResolvedValue({ id: 7 });
    loansRepository.createLoan.mockRejectedValue(new Error('COPY_NOT_FOUND'));
    await expect(createLoan({ userEmail: 'x@exemple.test', copyId: 1 })).rejects.toMatchObject({
      statusCode: 404,
      message: 'Exemplaire introuvable.',
    });
  });

  it('409 si l’exemplaire est déjà emprunté', async () => {
    findUserByEmail.mockResolvedValue({ id: 7 });
    loansRepository.createLoan.mockRejectedValue(new Error('COPY_UNAVAILABLE'));
    await expect(createLoan({ userEmail: 'x@exemple.test', copyId: 1 })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(insertLog).not.toHaveBeenCalled();
  });

  it('laisse remonter une erreur inattendue telle quelle', async () => {
    findUserByEmail.mockResolvedValue({ id: 7 });
    const erreur = new Error('connexion perdue');
    loansRepository.createLoan.mockRejectedValue(erreur);
    await expect(createLoan({ userEmail: 'x@exemple.test', copyId: 1 })).rejects.toBe(erreur);
  });

  it('un échec de journalisation ne fait pas échouer le prêt', async () => {
    const espion = vi.spyOn(console, 'error').mockImplementation(() => {});
    findUserByEmail.mockResolvedValue({ id: 7 });
    loansRepository.createLoan.mockResolvedValue({ id: 99 });
    insertLog.mockRejectedValue(new Error('journal indisponible'));

    await expect(createLoan({ userEmail: 'x@exemple.test', copyId: 1, actingUserId: 2 })).resolves.toEqual({
      id: 99,
    });
    await attendreMicrotaches();
    expect(espion).toHaveBeenCalledWith('Échec de journalisation :', 'journal indisponible');
    espion.mockRestore();
  });
});

describe('returnLoan', () => {
  it('rend l’exemplaire et journalise le retour', async () => {
    loansRepository.returnLoanByCopy.mockResolvedValue({ id: 5, return_date: isoDateInDays(0) });
    const pret = await returnLoan(3, 2);
    expect(pret.id).toBe(5);
    expect(insertLog).toHaveBeenCalledWith({ userId: 2, action: 'loan_returned', target: 'exemplaire #3' });
  });

  it('404 si l’exemplaire n’est pas emprunté', async () => {
    loansRepository.returnLoanByCopy.mockRejectedValue(new Error('LOAN_NOT_FOUND'));
    await expect(returnLoan(3, 2)).rejects.toMatchObject({
      statusCode: 404,
      message: "Cet exemplaire n'est pas actuellement emprunté.",
    });
  });

  it('laisse remonter une erreur inattendue', async () => {
    loansRepository.returnLoanByCopy.mockRejectedValue(new Error('autre'));
    await expect(returnLoan(3, 2)).rejects.toThrow('autre');
  });
});

describe('listMyLoans', () => {
  it('ajoute le statut calculé à chaque emprunt', async () => {
    loansRepository.listLoansByUser.mockResolvedValue([
      { id: 1, due_date: isoDateInDays(5), return_date: null },
      { id: 2, due_date: isoDateInDays(-2), return_date: null },
      { id: 3, due_date: isoDateInDays(-20), return_date: isoDateInDays(-21) },
    ]);
    const prets = await listMyLoans(7);
    expect(loansRepository.listLoansByUser).toHaveBeenCalledWith(7);
    expect(prets.map((p) => p.status)).toEqual(['en_cours', 'retard', 'retourne']);
  });
});
