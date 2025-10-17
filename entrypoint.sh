#!/bin/bash
set -e

echo "🚀 Starting DHIS2 deployment..."

if [ -z "$DATABASE_URL" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Error: Required database environment variables are not set!"
    echo "Required: DATABASE_URL, DB_USERNAME, DB_PASSWORD"
    exit 1
fi

echo "📝 Generating dhis.conf from template..."

envsubst < /opt/dhis2/dhis.conf.template > /opt/dhis2/dhis.conf

chmod 600 /opt/dhis2/dhis.conf

echo "✅ Configuration file generated successfully"
echo "🔗 Database URL: ${DATABASE_URL}"
echo "👤 Database User: ${DB_USERNAME}"
echo "🌐 Server URL: ${SERVER_URL}"

if [ ! -f /opt/dhis2/dhis.conf ]; then
    echo "❌ Error: dhis.conf was not created!"
    exit 1
fi

echo "📄 dhis.conf contents:"
cat /opt/dhis2/dhis.conf

echo "🚀 Starting Tomcat..."
exec "$@"
