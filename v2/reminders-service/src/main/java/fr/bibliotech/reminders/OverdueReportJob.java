package fr.bibliotech.reminders;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

// Tâche planifiée : chaque jour à 8 h, on écrit dans les logs le nombre
// d'emprunts en retard. Plus tard, c'est ici qu'on enverrait les e-mails
// de relance (hors périmètre pour l'instant).
@Component
public class OverdueReportJob {

    private static final Logger log = LoggerFactory.getLogger(OverdueReportJob.class);

    private final OverdueService overdueService;

    public OverdueReportJob(OverdueService overdueService) {
        this.overdueService = overdueService;
    }

    // Expression cron Spring : seconde minute heure jour mois jour-de-semaine.
    // "0 0 8 * * *" = tous les jours à 8 h 00 min 00 s.
    @Scheduled(cron = "0 0 8 * * *")
    public void dailyReport() {
        report();
    }

    // Une fois au démarrage, quand l'application est prête : pratique pour
    // vérifier tout de suite que tout marche, sans attendre 8 h.
    @EventListener(ApplicationReadyEvent.class)
    public void reportAtStartup() {
        report();
    }

    private void report() {
        try {
            List<OverdueLoan> overdue = overdueService.findOverdueLoans();
            log.info("Relances : {} emprunt(s) en retard", overdue.size());
            for (OverdueLoan loan : overdue) {
                log.info("  - emprunt {} : \"{}\" chez {} ({} jour(s) de retard)",
                        loan.loanId(), loan.bookTitle(), loan.userName(), loan.daysOverdue());
            }
        } catch (Exception e) {
            // Si la base est momentanément injoignable, on log l'erreur
            // sans faire planter le service : la prochaine exécution réessaiera.
            log.error("Relances : impossible de lire les emprunts ({})", e.getMessage());
        }
    }
}
