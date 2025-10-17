FROM tomcat:9.0-jdk17-temurin

# Environment variables
ENV CATALINA_OPTS="-Xms1024m -Xmx2048m -XX:+UseG1GC"
ENV DHIS2_HOME=/opt/dhis2

# Install dependencies
RUN apt-get update && \
    apt-get install -y wget gettext-base && \
    apt-get clean

# Create DHIS2 directories
RUN mkdir -p /opt/dhis2/files && \
    chown -R root:root /opt/dhis2

# Download DHIS2 WAR file
RUN wget -O /usr/local/tomcat/webapps/ROOT.war \
    https://releases.dhis2.org/2.40/dhis2-stable-2.40.5.war

# Copy configuration template
COPY dhis.conf.template /opt/dhis2/dhis.conf.template

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
CMD ["catalina.sh", "run"]
