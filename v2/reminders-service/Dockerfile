# Construction en deux étapes ("multi-stage build").

# Étape 1 : on compile le .jar avec une image qui contient Maven et le JDK 21.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# On copie d'abord le pom.xml seul et on télécharge les dépendances :
# Docker garde cette couche en cache tant que le pom.xml ne change pas.
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

# Étape 2 : image finale légère, avec seulement le JRE (pas Maven, pas les sources).
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/reminders-service-*.jar app.jar
EXPOSE 8081
CMD ["java", "-jar", "app.jar"]
