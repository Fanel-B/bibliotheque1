package fr.bibliotech.reminders;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

// Règle métier pure : aucune dépendance à Spring ni à la base.
// On lui donne des dates, elle répond. C'est ce qui la rend testable
// en quelques millisecondes avec JUnit, sans rien démarrer.
public final class OverdueRule {

    private OverdueRule() {
        // Classe utilitaire : on ne l'instancie pas.
    }

    // Un emprunt est en retard s'il n'est pas rendu ET que la date
    // d'échéance est dépassée. Le jour même de l'échéance, l'usager
    // est encore dans les temps (même règle que le SQL côté Node :
    // due_date < CURRENT_DATE).
    public static boolean isOverdue(LocalDate dueDate, LocalDate returnDate, LocalDate today) {
        if (returnDate != null) {
            return false;
        }
        return today.isAfter(dueDate);
    }

    // Nombre de jours de retard (0 si l'emprunt n'est pas en retard).
    public static long daysOverdue(LocalDate dueDate, LocalDate returnDate, LocalDate today) {
        if (!isOverdue(dueDate, returnDate, today)) {
            return 0;
        }
        return ChronoUnit.DAYS.between(dueDate, today);
    }
}
