FROM tomcat:9.0-jdk17-temurin

ENV CATALINA_OPTS="-Xms1024m -Xmx2048m -XX:+UseG1GC"
ENV DHIS2_HOME=/opt/dhis2

RUN apt-get update && \
    apt-get install -y wget && \
    apt-get clean

RUN mkdir -p /opt/dhis2/files && \
    chown -R root:root /opt/dhis2

RUN wget -O /usr/local/tomcat/webapps/ROOT.war \
    https://releases.dhis2.org/2.40/dhis2-stable-2.40.5.war

COPY dhis.conf /opt/dhis2/dhis.conf

RUN chmod 600 /opt/dhis2/dhis.conf

EXPOSE 8080

CMD ["catalina.sh", "run"]
