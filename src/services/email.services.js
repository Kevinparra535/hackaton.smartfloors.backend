/* eslint-disable no-console */

/**
 * Servicio de notificaciones por email usando EmailJS
 *
 * EmailJS permite enviar emails desde el cliente o servidor sin backend propio
 * Documentación: https://www.emailjs.com/docs/
 *
 * INSTRUCCIONES DE IMPLEMENTACIÓN:
 * 1. Crear cuenta en https://www.emailjs.com/
 * 2. Configurar servicio de email (Gmail, Outlook, etc.)
 * 3. Crear plantilla de email en el dashboard
 * 4. Obtener: Service ID, Template ID, User ID (Public Key)
 * 5. Configurar variables de entorno en .env
 * 6. Instalar: npm install @emailjs/nodejs
 * 7. Implementar métodos marcados como TODO
 */

// TODO: Descomentar después de instalar: npm install @emailjs/nodejs
// const emailjs = require('@emailjs/nodejs');

class EmailService {
  constructor() {
    // TODO: Configurar credenciales de EmailJS desde variables de entorno
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
   * @returns {Object} Estado de configuración
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
   * @returns {Boolean} true si se puede enviar
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
   * @param {Number} floorId - ID del piso
   * @param {String} severity - Severidad de la alerta
   * @returns {Boolean} true si ha pasado el cooldown
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
   * Envía email de alerta usando EmailJS
   * @param {Object} alert - Objeto de alerta generado por AlertService
   * @returns {Promise<Object>} Resultado del envío
   *
   * TODO: IMPLEMENTAR ESTE MÉTODO
   * Pasos:
   * 1. Verificar configuración con checkConfiguration()
   * 2. Verificar rate limiting con canSendEmail()
   * 3. Verificar cooldown con checkCooldown()
   * 4. Preparar templateParams con datos de la alerta
   * 5. Seleccionar destinatarios según severity
   * 6. Usar emailjs.send() para enviar
   * 7. Registrar envío y actualizar cooldown
   * 8. Manejar errores apropiadamente
   */
  async sendAlert(alert) {
    try {
      // TODO: Verificar que el servicio esté configurado
      const configStatus = this.checkConfiguration();
      if (!configStatus.configured) {
        throw new Error(`Configuración incompleta: ${configStatus.missingConfig.join(', ')}`);
      }

      if (!this.config.enabled) {
        console.log('📧 Email deshabilitado. Alerta no enviada.');
        return { sent: false, reason: 'Email notifications disabled' };
      }

      // TODO: Verificar rate limiting
      if (!this.canSendEmail()) {
        return { sent: false, reason: 'Rate limit exceeded' };
      }

      // TODO: Verificar cooldown
      if (!this.checkCooldown(alert.floorId, alert.severity)) {
        return { sent: false, reason: 'Cooldown active' };
      }

      // TODO: Preparar parámetros para la plantilla de email
      const templateParams = {
        // Información del piso
        building_name: alert.buildingName || 'Edificio',
        floor_name: alert.floorName || `Piso ${alert.floorId}`,
        floor_id: alert.floorId,

        // Información de la alerta
        severity: alert.severity.toUpperCase(),
        timestamp: new Date(alert.timestamp).toLocaleString('es-ES'),

        // Anomalías (combinar todas en un string)
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

      // TODO: Obtener lista de destinatarios según severidad
      const recipients = this._getRecipients(alert.severity);

      if (recipients.length === 0) {
        console.warn('⚠️  No hay destinatarios configurados para severidad:', alert.severity);
        return { sent: false, reason: 'No recipients configured' };
      }

      // TODO: Seleccionar plantilla según severidad
      const templateId = this.templates[alert.severity] || this.templates.info;

      // TODO: IMPLEMENTAR ENVÍO CON EMAILJS
      // Ejemplo de implementación (descomentar después de instalar @emailjs/nodejs):
      /*
      const response = await emailjs.send(
        this.serviceId,
        templateId,
        {
          ...templateParams,
          to_email: recipients.join(','),
        },
        {
          publicKey: this.publicKey,
          privateKey: this.privateKey,
        }
      );
      */

      // TODO: Registrar envío exitoso
      // this.emailsSent.push(Date.now());
      // this.lastAlertSent.set(`${alert.floorId}-${alert.severity}`, Date.now());

      // TODO: Retornar resultado
      /*
      console.log(`✅ Email enviado: ${alert.severity} - Piso ${alert.floorId}`);
      return {
        sent: true,
        recipients: recipients.length,
        messageId: response.text,
        timestamp: new Date().toISOString(),
      };
      */

      // Placeholder temporal
      console.log('⚠️  MÉTODO sendAlert() NO IMPLEMENTADO');
      console.log('   Alerta a enviar:', {
        floor: alert.floorId,
        severity: alert.severity,
        anomalies: alert.anomalies.length,
      });

      return {
        sent: false,
        reason: 'Method not implemented - see TODO comments',
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
   * Envía resumen diario de alertas
   * @param {Object} summary - Resumen de alertas del día
   * @returns {Promise<Object>} Resultado del envío
   *
   * TODO: IMPLEMENTAR ESTE MÉTODO
   * Similar a sendAlert pero con plantilla de resumen
   */
  async sendDailySummary(summary) {
    try {
      // TODO: Implementar envío de resumen diario
      // Usar template: this.templates.summary
      // Destinatarios: this.recipients.admin

      console.log('⚠️  MÉTODO sendDailySummary() NO IMPLEMENTADO');
      console.log('   Resumen:', summary);

      return {
        sent: false,
        reason: 'Method not implemented',
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
   * Envía email de prueba
   * @param {String} email - Email de destino
   * @returns {Promise<Object>} Resultado del envío
   *
   * TODO: IMPLEMENTAR ESTE MÉTODO
   * Útil para probar configuración de EmailJS
   */
  async sendTestEmail(email) {
    try {
      // TODO: Implementar envío de email de prueba

      const templateParams = {
        to_email: email,
        message: 'Este es un email de prueba del sistema SmartFloors',
        timestamp: new Date().toLocaleString('es-ES'),
      };

      console.log('⚠️  MÉTODO sendTestEmail() NO IMPLEMENTADO');
      console.log('   Destinatario:', email);

      return {
        sent: false,
        reason: 'Method not implemented',
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
   * @param {Array} anomalies - Array de anomalías
   * @returns {String} Texto formateado
   */
  _formatAnomaliesForEmail(anomalies) {
    return anomalies.map((anomaly, index) => {
      return `${index + 1}. ${anomaly.metric}: ${anomaly.message}\n   → ${anomaly.recommendation}`;
    }).join('\n\n');
  }

  /**
   * Obtiene color según severidad (para estilos en email)
   * @param {String} severity - Nivel de severidad
   * @returns {String} Código de color hexadecimal
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
   * @param {String} severity - Nivel de severidad
   * @returns {String} Emoji o símbolo
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
   * @param {String} severity - Nivel de severidad
   * @returns {Array} Lista de emails
   */
  _getRecipients(severity) {
    // Critical: enviar a todos
    if (severity === 'critical') {
      return [
        ...this.recipients.critical,
        ...this.recipients.admin,
      ].filter((email, index, self) => self.indexOf(email) === index); // Remover duplicados
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
   * @returns {Object} Estadísticas
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
