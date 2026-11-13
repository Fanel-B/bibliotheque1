package fr.bibliotech.reminders;

import java.time.LocalDate;

// Un emprunt non rendu, tel que lu dans la table "loans".
// Un "record" Java génère tout seul le constructeur, les getters,
// equals/hashCode et toString : idéal pour transporter des données.
public record OpenLoan(
        long loanId,
        long copyId,
        String bookTitle,
        long userId,
        String userName,
        LocalDate dueDate,
        LocalDate returnDate) {
}
