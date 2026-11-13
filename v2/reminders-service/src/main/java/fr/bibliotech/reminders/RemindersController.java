package fr.bibliotech.reminders;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// @RestController : chaque méthode répond à une requête HTTP et sa valeur
// de retour est convertie en JSON (pas de page HTML).
@RestController
@RequestMapping("/api/reminders")
public class RemindersController {

    private final OverdueService overdueService;

    public RemindersController(OverdueService overdueService) {
        this.overdueService = overdueService;
    }

    // GET /api/reminders/overdue : liste des emprunts en retard.
    @GetMapping("/overdue")
    public List<OverdueLoan> overdue() {
        return overdueService.findOverdueLoans();
    }
}
