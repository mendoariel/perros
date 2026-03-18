# Protocolo de Emergencia: Modo Mascota Perdida

Este documento detalla el diseño y las implicaciones de implementar la nueva funcionalidad de "Mascota Perdida" en **PeludosClick**. El objetivo es que, además del escaneo de la medalla QR, el usuario pueda lanzar un plan de emergencia integral.

## 1. Activación del Protocolo

**¿Quién puede activar este protocolo?**
- El dueño de la mascota desde el perfil de su mascota en la app.
- **Nuevos Usuarios:** La sección de mascotas perdidas ahora será una parte independiente de la aplicación. Nuevos usuarios podrán registrarse de forma rápida con el **único** propósito de reportar / publicar una mascota perdida, incluso si no tienen la medalla QR.

**¿Cómo es el proceso de activación?**
- Mediante un botón destacado (ej. "Activar Alerta de Pérdida").
- Se debe solicitar información rápida: última ubicación conocida (mapa), fecha/hora, y detalles adicionales del incidente.

## 2. Procesamiento (¿Qué sucede al activarlo?)

El sistema debe ejecutar acciones para maximizar la difusión de manera automática o semiautomática:

- **Escanear la Medalla:** Si alguien escanea la medalla, el perfil web cambia a un "Modo Alerta" destacando que la mascota está perdida y contactando inmediatamente al dueño con la ubicación del escaneo.
- **Publicación en Redes Sociales:** 
  - *¿Se puede hacer automático?* Sí, utilizando APIs (como la de Facebook Graph API, Instagram o Twitter/X). La plataforma puede auto-generar un "flyer" con foto y datos y publicarlo en las redes oficiales de PeludosClick.
  - Botones de "Compartir a WhatsApp/Facebook" integrados para que el usuario difunda la alerta con un solo clic.
- **Envío de Emails:** El sistema puede cruzar la ubicación de la pérdida y enviar correos masivos de alerta a:
  - Otros usuarios de la app que vivan en un radio cercano.
  - Refugios, veterinarias y asociaciones proteccionistas asociadas en esa locación.
- **Grupos Especializados:** 
  - Integración con bots de Telegram o WhatsApp para enviar la alerta a grupos zonales preconfigurados.
  - Directorio de grupos de Facebook sugeridos basados en la ubicación para que el dueño comparta.

## 3. Eliminación / Baja del Protocolo

**¿Cómo se da de baja?**
- **Cierre manual:** El usuario debe poder desactivar la alerta desde su panel con un botón de "Mascota Encontrada" o "Desactivar Alerta".
- **Caducidad:** Alerta para renovar la búsqueda cada X tiempo, para evitar tener publicaciones falsas o desactualizadas flotando indefinidamente.

**Procedimiento de baja:**
- El perfil del código QR vuelve a la normalidad.
- El posteo en el muro de "Mascotas Perdidas" pasa a estado "Encontrado" (generando impacto positivo) o se elimina.
- Detener automáticamente cualquier envío de recordatorios o emails programados.
