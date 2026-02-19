FROM quay.io/keycloak/keycloak:21.1.1

ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=admin
ENV KC_DB=postgres
ENV KC_DB_URL=jdbc:postgresql://keycloak-db:5432/keycloak
ENV KC_DB_USERNAME=keycloak
ENV KC_DB_PASSWORD=keycloak

EXPOSE 8080

RUN /opt/keycloak/bin/kc.sh build

ENTRYPOINT /opt/keycloak/bin/kc.sh start-dev