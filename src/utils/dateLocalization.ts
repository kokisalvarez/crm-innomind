import moment from 'moment';

// Configuración de localización en español para el calendario
export const spanishLocale = {
  months: [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ],
  monthsShort: [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ],
  weekdays: [
    'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
  ],
  weekdaysShort: [
    'dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'
  ],
  weekdaysMin: [
    'D', 'L', 'M', 'X', 'J', 'V', 'S'
  ]
};

// Configurar moment.js en español
export const configureMomentLocale = () => {
  moment.defineLocale('es-custom', {
    months: spanishLocale.months,
    monthsShort: spanishLocale.monthsShort,
    weekdays: spanishLocale.weekdays,
    weekdaysShort: spanishLocale.weekdaysShort,
    weekdaysMin: spanishLocale.weekdaysMin,
    longDateFormat: {
      LT: 'HH:mm',
      LTS: 'HH:mm:ss',
      L: 'DD/MM/YYYY',
      LL: 'D [de] MMMM [de] YYYY',
      LLL: 'D [de] MMMM [de] YYYY HH:mm',
      LLLL: 'dddd, D [de] MMMM [de] YYYY HH:mm'
    },
    calendar: {
      sameDay: '[Hoy a las] LT',
      nextDay: '[Mañana a las] LT',
      nextWeek: 'dddd [a las] LT',
      lastDay: '[Ayer a las] LT',
      lastWeek: '[el] dddd [pasado a las] LT',
      sameElse: 'L'
    },
    relativeTime: {
      future: 'en %s',
      past: 'hace %s',
      s: 'unos segundos',
      ss: '%d segundos',
      m: 'un minuto',
      mm: '%d minutos',
      h: 'una hora',
      hh: '%d horas',
      d: 'un día',
      dd: '%d días',
      M: 'un mes',
      MM: '%d meses',
      y: 'un año',
      yy: '%d años'
    },
    dayOfMonthOrdinalParse: /\d{1,2}º/,
    ordinal: '%dº',
    week: {
      dow: 1, // Lunes es el primer día de la semana
      doy: 4  // La semana que contiene el 4 de enero es la primera semana del año
    }
  });

  moment.locale('es-custom');
};

// Función para formatear fechas en español
export const formatDateSpanish = (date: Date, format: string): string => {
  return moment(date).format(format);
};

// Función para obtener el nombre del mes en español
export const getMonthNameSpanish = (monthIndex: number): string => {
  return spanishLocale.months[monthIndex];
};

// Función para obtener el nombre del día en español
export const getDayNameSpanish = (dayIndex: number): string => {
  return spanishLocale.weekdays[dayIndex];
};

// Función para obtener la abreviación del día en español
export const getDayShortSpanish = (dayIndex: number): string => {
  return spanishLocale.weekdaysShort[dayIndex];
};