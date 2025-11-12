// Importar EmailJS al inicio del archivo
const emailjs = require('@emailjs/nodejs');

class EmailService {
  constructor() {
    // Configurar credenciales de EmailJS desde variables de entorno
    this.serviceId = process.env.EMAILJS_SERVICE_ID || '';
    this.publicKey = process.env.EMAILJS_PUBLIC_KEY || '';
    this.privateKey = process.env.EMAILJS_PRIVATE_KEY || '';

    // IDs de plantillas para diferentes tipos de alertas
    this.templates = {
      critical: process.env.EMAILJS_TEMPLATE_CRITICAL || 'template_critical',
      warning: process.env.EMAILJS_TEMPLATE_WARNING || 'template_warning',
      info: process.env.EMAILJS_TEMPLATE_INFO || 'template_info',
      summary: process.env.EMAILJS_TEMPLATE_SUMMARY || 'template_summary',
    };

    // Lista de destinatarios por tipo de alerta
    this.recipients = {
      critical: process.env.EMAIL_RECIPIENTS_CRITICAL?.split(',') || [],
      warning: process.env.EMAIL_RECIPIENTS_WARNING?.split(',') || [],
      info: process.env.EMAIL_RECIPIENTS_INFO?.split(',') || [],
      admin: process.env.EMAIL_RECIPIENTS_ADMIN?.split(',') || [],
    };

    // Configuración de límites de envío
    this.config = {
      maxEmailsPerMinute: parseInt(process.env.EMAIL_MAX_PER_MINUTE) || 5,
      cooldownMinutes: parseInt(process.env.EMAIL_COOLDOWN_MINUTES) || 15,
      enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
    };

    // Control de rate limiting
    this.emailsSent = [];
    this.lastAlertSent = new Map(); // floorId+severity -> timestamp

    if (this.config.enabled) {
      console.log('📧 Servicio de Email inicializado');
      console.log(`   - Máximo emails/minuto: ${this.config.maxEmailsPerMinute}`);
      console.log(`   - Cooldown: ${this.config.cooldownMinutes} minutos`);
    } else {
      console.log('📧 Servicio de Email deshabilitado (configurar EMAIL_NOTIFICATIONS_ENABLED=true)');
    }
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  checkConfiguration() {
    const missingConfig = [];

    if (!this.serviceId) missingConfig.push('EMAILJS_SERVICE_ID');
    if (!this.publicKey) missingConfig.push('EMAILJS_PUBLIC_KEY');
    if (!this.privateKey) missingConfig.push('EMAILJS_PRIVATE_KEY');

    return {
      configured: missingConfig.length === 0,
      enabled: this.config.enabled,
      missingConfig,
      hasRecipients: Object.values(this.recipients).some(list => list.length > 0),
    };
  }

  /**
   * Verifica si se puede enviar un email según rate limiting
   */
  canSendEmail() {
    if (!this.config.enabled) return false;

    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Limpiar emails antiguos (más de 1 minuto)
    this.emailsSent = this.emailsSent.filter(timestamp => timestamp > oneMinuteAgo);

    // Verificar límite de emails por minuto
    if (this.emailsSent.length >= this.config.maxEmailsPerMinute) {
      console.warn('⚠️  Rate limit alcanzado. No se pueden enviar más emails en este minuto.');
      return false;
    }

    return true;
  }

  /**
   * Verifica el cooldown para evitar spam de la misma alerta
   */
  checkCooldown(floorId, severity) {
    const key = `${floorId}-${severity}`;
    const lastSent = this.lastAlertSent.get(key);

    if (!lastSent) return true;

    const now = Date.now();
    const cooldownMs = this.config.cooldownMinutes * 60000;
    const timeSinceLastAlert = now - lastSent;

    if (timeSinceLastAlert < cooldownMs) {
      const remainingMinutes = Math.ceil((cooldownMs - timeSinceLastAlert) / 60000);
      console.log(`⏳ Cooldown activo para ${key}. Esperar ${remainingMinutes} minutos.`);
      return false;
    }

    return true;
  }

  /**
   * 🚀 IMPLEMENTACIÓN COMPLETA - Envía email de alerta usando EmailJS
   */
  async sendAlert(alert) {
    try {
      // 1. Verificar que el servicio esté configurado
      const configStatus = this.checkConfiguration();
      if (!configStatus.configured) {
        throw new Error(`Configuración incompleta: ${configStatus.missingConfig.join(', ')}`);
      }

      if (!this.config.enabled) {
        console.log('📧 Email deshabilitado. Alerta no enviada.');
        return { sent: false, reason: 'Email notifications disabled' };
      }

      // 2. Verificar rate limiting
      if (!this.canSendEmail()) {
        return { sent: false, reason: 'Rate limit exceeded' };
      }

      // 3. Verificar cooldown
      if (!this.checkCooldown(alert.floorId, alert.severity)) {
        return { sent: false, reason: 'Cooldown active' };
      }

      // 4. Preparar parámetros para la plantilla de email
      const templateParams = {
        // Información del piso
        building_name: alert.buildingName || 'Edificio',
        floor_name: alert.floorName || `Piso ${alert.floorId}`,
        floor_id: alert.floorId,

        // Información de la alerta
        severity: alert.severity.toUpperCase(),
        timestamp: new Date(alert.timestamp).toLocaleString('es-ES', {
          dateStyle: 'full',
          timeStyle: 'short'
        }),

        // Anomalías
        anomalies_count: alert.anomalies.length,
        anomalies_list: this._formatAnomaliesForEmail(alert.anomalies),

        // Primera anomalía (para resumen rápido)
        main_metric: alert.anomalies[0]?.metric || '',
        main_message: alert.anomalies[0]?.message || '',
        main_recommendation: alert.anomalies[0]?.recommendation || '',

        // Estilo según severidad
        severity_color: this._getSeverityColor(alert.severity),
        severity_icon: this._getSeverityIcon(alert.severity),
      };

      // 5. Obtener lista de destinatarios según severidad
      const recipients = this._getRecipients(alert.severity);

      if (recipients.length === 0) {
        console.warn('⚠️  No hay destinatarios configurados para severidad:', alert.severity);
        return { sent: false, reason: 'No recipients configured' };
      }

      // 6. Seleccionar plantilla según severidad
      const templateId = this.templates[alert.severity] || this.templates.info;

      console.log(`📤 Enviando email: ${alert.severity.toUpperCase()} - Piso ${alert.floorId}`);
      console.log(`   Destinatarios: ${recipients.join(', ')}`);

      // 7. ENVIAR CON EMAILJS - Enviar un email por cada destinatario
      const sendPromises = recipients.map(recipient => 
        emailjs.send(
          this.serviceId,
          templateId,
          {
            ...templateParams,
            to_email: recipient,
            to_name: recipient.split('@')[0], // Nombre del destinatario
          },
          {
            publicKey: this.publicKey,
            privateKey: this.privateKey,
          }
        )
      );

      // Esperar a que todos los emails se envíen
      const results = await Promise.allSettled(sendPromises);

      // Contar éxitos y fallos
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      // 8. Registrar envío exitoso
      this.emailsSent.push(Date.now());
      this.lastAlertSent.set(`${alert.floorId}-${alert.severity}`, Date.now());

      console.log(`✅ Emails enviados: ${successful}/${recipients.length}`);
      if (failed > 0) {
        console.warn(`⚠️  ${failed} emails fallaron`);
      }

      // 9. Retornar resultado
      return {
        sent: true,
        recipients: recipients.length,
        successful,
        failed,
        timestamp: new Date().toISOString(),
        severity: alert.severity,
        floorId: alert.floorId,
      };

    } catch (error) {
      console.error('❌ Error al enviar email:', error.message);
      return {
        sent: false,
        error: error.message,
      };
    }
  }

  /**
   * 🚀 IMPLEMENTACIÓN COMPLETA - Envía resumen diario de alertas
   */
  async sendDailySummary(summary) {
    try {
      const configStatus = this.checkConfiguration();
      if (!configStatus.configured || !this.config.enabled) {
        return { sent: false, reason: 'Service not configured or disabled' };
      }

      const templateParams = {
        date: new Date().toLocaleDateString('es-ES', { 
          dateStyle: 'full' 
        }),
        total_alerts: summary.total || 0,
        critical_count: summary.critical || 0,
        warning_count: summary.warning || 0,
        info_count: summary.info || 0,
        affected_floors: summary.floors?.join(', ') || 'Ninguno',
        summary_text: summary.description || 'Sin actividad reportada',
      };

      const recipients = this.recipients.admin;

      if (recipients.length === 0) {
        return { sent: false, reason: 'No admin recipients configured' };
      }

      console.log('📊 Enviando resumen diario...');

      const sendPromises = recipients.map(recipient =>
        emailjs.send(
          this.serviceId,
          this.templates.summary,
          {
            ...templateParams,
            to_email: recipient,
          },
          {
            publicKey: this.publicKey,
            privateKey: this.privateKey,
          }
        )
      );

      await Promise.allSettled(sendPromises);

      console.log('✅ Resumen diario enviado');
      
      return {
        sent: true,
        recipients: recipients.length,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('❌ Error al enviar resumen diario:', error.message);
      return {
        sent: false,
        error: error.message,
      };
    }
  }

  /**
   * 🚀 IMPLEMENTACIÓN COMPLETA - Envía email de prueba
   */
  async sendTestEmail(email) {
    try {
      const configStatus = this.checkConfiguration();
      if (!configStatus.configured) {
        throw new Error('Servicio no configurado correctamente');
      }

      const templateParams = {
        to_email: email,
        to_name: email.split('@')[0],
        message: '🎉 ¡Felicidades! Tu servicio de notificaciones está funcionando correctamente.',
        timestamp: new Date().toLocaleString('es-ES'),
        building_name: process.env.BUILDING_NAME || 'SmartFloors',
      };

      console.log(`🧪 Enviando email de prueba a: ${email}`);

      const response = await emailjs.send(
        this.serviceId,
        this.templates.info, // Usar template de info para pruebas
        templateParams,
        {
          publicKey: this.publicKey,
          privateKey: this.privateKey,
        }
      );

      console.log('✅ Email de prueba enviado exitosamente');

      return {
        sent: true,
        recipient: email,
        messageId: response.text,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('❌ Error al enviar email de prueba:', error.message);
      return {
        sent: false,
        error: error.message,
      };
    }
  }

  /**
   * Formatea anomalías para mostrar en email
   */
  _formatAnomaliesForEmail(anomalies) {
    return anomalies.map((anomaly, index) => {
      return `${index + 1}. ${anomaly.metric}: ${anomaly.message}\n   → ${anomaly.recommendation}`;
    }).join('\n\n');
  }

  /**
   * Obtiene color según severidad
   */
  _getSeverityColor(severity) {
    const colors = {
      critical: '#DC2626', // Rojo
      warning: '#F59E0B',  // Amarillo/Naranja
      info: '#3B82F6',     // Azul
    };
    return colors[severity] || colors.info;
  }

  /**
   * Obtiene icono según severidad
   */
  _getSeverityIcon(severity) {
    const icons = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[severity] || icons.info;
  }

  /**
   * Obtiene lista de destinatarios según severidad
   */
  _getRecipients(severity) {
    // Critical: enviar a todos
    if (severity === 'critical') {
      return [
        ...this.recipients.critical,
        ...this.recipients.admin,
      ].filter((email, index, self) => self.indexOf(email) === index);
    }

    // Warning: enviar a warning + admin
    if (severity === 'warning') {
      return [
        ...this.recipients.warning,
        ...this.recipients.admin,
      ].filter((email, index, self) => self.indexOf(email) === index);
    }

    // Info: solo a destinatarios de info
    return this.recipients.info || [];
  }

  /**
   * Obtiene estadísticas de envío
   */
  getStats() {
    return {
      enabled: this.config.enabled,
      configured: this.checkConfiguration().configured,
      emailsSentLastMinute: this.emailsSent.length,
      maxEmailsPerMinute: this.config.maxEmailsPerMinute,
      canSendMore: this.canSendEmail(),
      activeAlerts: this.lastAlertSent.size,
      recipients: {
        critical: this.recipients.critical.length,
        warning: this.recipients.warning.length,
        info: this.recipients.info.length,
        admin: this.recipients.admin.length,
      },
    };
  }

  /**
   * Limpia el historial de cooldowns (útil para testing)
   */
  clearCooldowns() {
    this.lastAlertSent.clear();
    console.log('🔄 Cooldowns limpiados');
  }

  /**
   * Limpia el rate limiting (útil para testing)
   */
  clearRateLimiting() {
    this.emailsSent = [];
    console.log('🔄 Rate limiting reseteado');
  }
}

module.exports = EmailService;