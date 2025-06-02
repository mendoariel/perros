FROM postgres:12

# Evitar interacciones durante la instalación de paquetes
ENV DEBIAN_FRONTEND=noninteractive

# Actualizar e instalar paquetes en una sola capa
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        cron \
        tzdata \
    && rm -rf /var/lib/apt/lists/*

# Set timezone to Argentina
ENV TZ=America/Argentina/Buenos_Aires
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy backup script
COPY production-backup.sh /backup.sh
RUN chmod +x /backup.sh

# Create backup and log directories
RUN mkdir -p /var/backups/peludosclick /var/log/peludosclick

# Add crontab file with timestamp logging
RUN echo "0 2 * * * date >> /var/log/peludosclick/cron.log && /backup.sh >> /var/log/peludosclick/cron.log 2>&1" > /etc/cron.d/database-backup \
    && chmod 0644 /etc/cron.d/database-backup \
    && crontab /etc/cron.d/database-backup

# Create the entry point script
RUN echo '#!/bin/bash\necho "Container starting with timezone: $(date +%Z)" >> /var/log/peludosclick/cron.log\ncron -f' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"] 