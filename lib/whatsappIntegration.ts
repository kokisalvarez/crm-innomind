// project/lib/tuArchivo.ts

import type { CalendarEvent } from '../src/types/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';


class WhatsAppIntegrationService {
  public generateEventMessage(event: CalendarEvent): string {
    const startDate = format(event.start, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es });
    const startTime = format(event.start, 'HH:mm');
    const endTime = format(event.end, 'HH:mm');

    let message = `📅 *${event.title}*\n\n`;
    message += `📆 *Fecha:* ${startDate}\n`;
    message += `🕐 *Hora:* ${startTime} - ${endTime}\n`;

    if (event.description) {
      message += `📝 *Descripción:* ${event.description}\n`;
    }

    if (event.location) {
      message += `📍 *Ubicación:* ${event.location}\n`;
    }

    if (event.meetLink) {
      message += `💻 *Enlace de reunión:* ${event.meetLink}\n`;
    }

    if (event.attendees.length > 0) {
      message += `👥 *Participantes:* ${event.attendees.map(a => a.name || a.email).join(', ')}\n`;
    }

    message += `\n¡Te esperamos! 🎉`;

    return message;
  }

  public generateCalendarInviteText(event: CalendarEvent): string {
    const startDate = format(event.start, 'yyyyMMdd\'T\'HHmmss');
    const endDate = format(event.end, 'yyyyMMdd\'T\'HHmmss');
    
    const calendarData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CRM InnoMind//Calendar//ES',
      'BEGIN:VEVENT',
      `UID:${event.id}@crm-innomind.com`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    return calendarData;
  }

  public createWhatsAppShareUrl(event: CalendarEvent, includeCalendarInvite: boolean = false): string {
    const message = this.generateEventMessage(event);
    let shareText = encodeURIComponent(message);

    if (includeCalendarInvite) {
      shareText += encodeURIComponent('\n\n📎 Archivo de calendario adjunto');
    }

    return `https://wa.me/?text=${shareText}`;
  }

  public createWhatsAppDirectUrl(phoneNumber: string, event: CalendarEvent): string {
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    const message = this.generateEventMessage(event);
    const shareText = encodeURIComponent(message);

    return `https://wa.me/${cleanPhone}?text=${shareText}`;
  }

  public async sendEventNotification(
    phoneNumber: string, 
    event: CalendarEvent, 
    reminderType: 'now' | 'reminder'
  ): Promise<boolean> {
    try {
      // En un entorno real, aquí integrarías con la API de WhatsApp Business
      // Por ahora, simulamos el envío y abrimos WhatsApp Web
      
      let message = '';
      
      if (reminderType === 'reminder') {
        const timeUntilEvent = event.start.getTime() - Date.now();
        const minutesUntil = Math.floor(timeUntilEvent / (1000 * 60));
        
        if (minutesUntil <= 15) {
          message = `⏰ *Recordatorio:* Tu evento "${event.title}" comienza en ${minutesUntil} minutos.\n\n`;
        } else if (minutesUntil <= 60) {
          message = `⏰ *Recordatorio:* Tu evento "${event.title}" comienza en 1 hora.\n\n`;
        } else {
          message = `⏰ *Recordatorio:* Tu evento "${event.title}" es mañana.\n\n`;
        }
      } else {
        message = `🔔 *Evento iniciado:* "${event.title}" ha comenzado.\n\n`;
      }

      message += this.generateEventMessage(event);

      const whatsappUrl = this.createWhatsAppDirectUrl(phoneNumber, {
        ...event,
        title: message
      });

      // Abrir WhatsApp en una nueva ventana
      window.open(whatsappUrl, '_blank');
      
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      return false;
    }
  }

  public downloadCalendarFile(event: CalendarEvent): void {
    const calendarData = this.generateCalendarInviteText(event);
    const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  }
}

export const whatsappIntegrationService = new WhatsAppIntegrationService();