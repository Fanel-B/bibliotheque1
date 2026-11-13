package fr.bibliotech.reminders;

import java.time.LocalDate;

// Ce que renvoie la route GET /api/reminders/overdue pour chaque emprunt
// en retard. Spring transforme automatiquement ce record en JSON.
public record OverdueLoan(
        long loanId,
        long copyId,
        String bookTitle,
        long userId,
        String userName,
        LocalDate dueDate,
        long daysOverdue) {
}
