import { HttpError } from '../utils/HttpError.js';
import { findUserByEmail } from '../repositories/users.repository.js';
import * as loansRepository from '../repositories/loans.repository.js';
import { insertLog } from '../repositories/logs.repository.js';
import { isoDateInDays } from '../utils/dates.js';

// Le journal des actions sensibles est un bonus de traçabilité : s'il
// échoue (souci réseau ponctuel...), ça ne doit jamais faire échouer le
// prêt/retour lui-même.
function logSafely(entry) {
  insertLog(entry).catch((error) => console.error('Échec de journalisation :', error.message));
}

const LOAN_DURATION_DAYS = 14;

function withStatus(loan) {
  const today = isoDateInDays(0);
  let status = 'en_cours';
  if (loan.return_date) status = 'retourne';
  else if (loan.due_date < today) status = 'retard';
  return { ...loan, status };
}

export async function createLoan({ userEmail, copyId, actingUserId }) {
  const user = await findUserByEmail(userEmail);
  if (!user) {
    throw new HttpError(404, 'Aucun compte trouvé avec cet email.');
  }

  const dueDate = isoDateInDays(LOAN_DURATION_DAYS);

  try {
    const loan = await loansRepository.createLoan({ userId: user.id, copyId, dueDate });
    logSafely({
      userId: actingUserId,
      action: 'loan_created',
      target: `exemplaire #${copyId} → ${userEmail}`,
    });
    return loan;
  } catch (error) {
    if (error.message === 'COPY_NOT_FOUND') {
      throw new HttpError(404, 'Exemplaire introuvable.');
    }
    if (error.message === 'COPY_UNAVAILABLE') {
      throw new HttpError(409, 'Cet exemplaire est déjà emprunté.');
    }
    throw error;
  }
}

export async function returnLoan(copyId, actingUserId) {
  try {
    const loan = await loansRepository.returnLoanByCopy(copyId);
    logSafely({
      userId: actingUserId,
      action: 'loan_returned',
      target: `exemplaire #${copyId}`,
    });
    return loan;
  } catch (error) {
    if (error.message === 'LOAN_NOT_FOUND') {
      throw new HttpError(404, "Cet exemplaire n'est pas actuellement emprunté.");
    }
    throw error;
  }
}

export async function listMyLoans(userId) {
  const loans = await loansRepository.listLoansByUser(userId);
  return loans.map(withStatus);
}

export async function listOverdueLoans() {
  return loansRepository.listOverdueLoans();
}
