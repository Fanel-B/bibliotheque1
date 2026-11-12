package fr.bibliotech.reminders;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

// Logique applicative : on récupère les emprunts non rendus et on
// applique la règle métier pour ne garder que ceux en retard.
// @Service : Spring crée une seule instance de cette classe et
// l'injecte là où on en a besoin (contrôleur, tâche planifiée).
@Service
public class OverdueService {

    private final LoanRepository loanRepository;

    public OverdueService(LoanRepository loanRepository) {
        this.loanRepository = loanRepository;
    }

    public List<OverdueLoan> findOverdueLoans() {
        LocalDate today = LocalDate.now();

        return loanRepository.findOpenLoans().stream()
                .filter(loan -> OverdueRule.isOverdue(loan.dueDate(), loan.returnDate(), today))
                .map(loan -> new OverdueLoan(
                        loan.loanId(),
                        loan.copyId(),
                        loan.bookTitle(),
                        loan.userId(),
                        loan.userName(),
                        loan.dueDate(),
                        OverdueRule.daysOverdue(loan.dueDate(), loan.returnDate(), today)))
                .toList();
    }
}
