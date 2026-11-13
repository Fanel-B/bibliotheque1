package fr.bibliotech.reminders;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// Point d'entrée du service.
// @SpringBootApplication : active la configuration automatique et le scan
// des classes annotées (@Service, @RestController...) de ce package.
// @EnableScheduling : sans elle, les méthodes @Scheduled ne sont jamais lancées.
@SpringBootApplication
@EnableScheduling
public class RemindersApplication {

    public static void main(String[] args) {
        SpringApplication.run(RemindersApplication.class, args);
    }
}
