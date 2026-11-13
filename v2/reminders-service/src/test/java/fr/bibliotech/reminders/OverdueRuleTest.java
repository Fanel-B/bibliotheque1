package fr.bibliotech.reminders;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

// Tests unitaires de la règle métier : pas de base, pas de Spring,
// seulement des dates en entrée et un résultat attendu.
class OverdueRuleTest {

    // Date du jour fixe : le test donne le même résultat quel que soit
    // le jour où on le lance.
    private static final LocalDate TODAY = LocalDate.of(2026, 11, 13);

    @Test
    void pasEncoreEchu_nEstPasEnRetard() {
        LocalDate dueDate = TODAY.plusDays(3);

        assertThat(OverdueRule.isOverdue(dueDate, null, TODAY)).isFalse();
        assertThat(OverdueRule.daysOverdue(dueDate, null, TODAY)).isZero();
    }

    @Test
    void echuAujourdhui_nEstPasEncoreEnRetard() {
        // L'usager a jusqu'à la fin du jour d'échéance pour rendre le livre.
        assertThat(OverdueRule.isOverdue(TODAY, null, TODAY)).isFalse();
        assertThat(OverdueRule.daysOverdue(TODAY, null, TODAY)).isZero();
    }

    @Test
    void echeanceDepassee_estEnRetard() {
        LocalDate dueDate = TODAY.minusDays(6);

        assertThat(OverdueRule.isOverdue(dueDate, null, TODAY)).isTrue();
        assertThat(OverdueRule.daysOverdue(dueDate, null, TODAY)).isEqualTo(6);
    }

    @Test
    void dejaRendu_nEstJamaisEnRetard() {
        // Même rendu en retard, un emprunt clos ne doit plus être relancé.
        LocalDate dueDate = TODAY.minusDays(10);
        LocalDate returnDate = TODAY.minusDays(2);

        assertThat(OverdueRule.isOverdue(dueDate, returnDate, TODAY)).isFalse();
        assertThat(OverdueRule.daysOverdue(dueDate, returnDate, TODAY)).isZero();
    }
}
