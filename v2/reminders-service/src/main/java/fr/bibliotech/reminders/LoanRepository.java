package fr.bibliotech.reminders;

import java.time.LocalDate;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

// Accès à la base, et seulement ça (même rôle que les fichiers
// src/repositories du back Node).
// JdbcTemplate exécute notre SQL écrit à la main : le SQL reste visible,
// comme avec "pg" côté Node. JdbcTemplate s'occupe d'ouvrir/fermer la
// connexion et de transformer les erreurs SQL en exceptions Spring.
@Repository
public class LoanRepository {

    private final JdbcTemplate jdbc;

    // Injection par constructeur : Spring fournit le JdbcTemplate
    // (déjà configuré avec spring.datasource.* de application.properties).
    public LoanRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // On lit tous les emprunts non rendus. Le choix "en retard ou pas"
    // n'est volontairement PAS fait en SQL : il est fait par OverdueRule,
    // pour que la règle soit écrite une seule fois et testée en Java.
    public List<OpenLoan> findOpenLoans() {
        String sql = """
                SELECT l.id, l.copy_id, b.title, l.user_id, u.name,
                       l.due_date, l.return_date
                FROM loans l
                JOIN users u ON u.id = l.user_id
                JOIN copies c ON c.id = l.copy_id
                JOIN books b ON b.id = c.book_id
                WHERE l.return_date IS NULL
                ORDER BY l.due_date ASC
                """;

        // Le "RowMapper" (la lambda) transforme chaque ligne SQL en OpenLoan.
        return jdbc.query(sql, (rs, rowNum) -> new OpenLoan(
                rs.getLong("id"),
                rs.getLong("copy_id"),
                rs.getString("title"),
                rs.getLong("user_id"),
                rs.getString("name"),
                rs.getObject("due_date", LocalDate.class),
                rs.getObject("return_date", LocalDate.class)));
    }
}
