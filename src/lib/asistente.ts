// Spec 0015 · Lo que el navegador necesita saber del asistente. La llave nunca está aquí.
// Spec 0009: la interfaz habla el idioma de la página; el asistente responde en el de la pregunta.
import type { Idioma } from './fechas';

export const API_ASISTENTE = 'https://edrei-asistente.netlify.app/api';

export const TEXTOS = {
  es: {
    /** FR-0015-03: las cuatro preguntas para empezar. */
    sugerencias: ['¿Qué ha construido con IA?', '¿Qué estudió y dónde?', '¿Dónde ha trabajado?', '¿Cómo lo contacto?'],
    /** FR-0015-09 */
    aviso: 'Asistente con IA. Responde solo con lo publicado en este portafolio y puede equivocarse.',
    /** Spec 0018: el asistente tiene cara de mayordomo autómata. */
    lanzador: 'Habla con el mayordomo de Edrei, su asistente con IA',
    titulo: 'El mayordomo de Edrei',
    subtitulo: 'Asistente con IA · en servicio',
    invitacion: '¿Te ayudo? Pregúntame por Edrei.',
    nueva: 'Empezar una conversación nueva',
    nuevaCorto: 'Empezar de nuevo',
    cerrar: 'Cerrar el asistente',
    cerrarCorto: 'Cerrar',
    sugeridas: 'Preguntas sugeridas',
    etiqueta: 'Tu pregunta sobre Edrei',
    placeholder: 'Escribe tu pregunta…',
    enviar: 'Enviar la pregunta',
    detener: 'Detener la respuesta',
    chat: {
      saludo: 'Bienvenido al gabinete. Soy el mayordomo de **Edrei Robles**: pregúntame por su trayectoria, sus proyectos, su formación o cómo contactarlo.',
      mientras: ' Mientras, puedes ver su ',
      curriculum: 'currículum',
      escribirle: ' o escribirle por ',
      caracteres: 'caracteres',
      respuesta: 'Respuesta del asistente: ',
      errores: {
        'limite-visitante': 'Llegaste al límite de preguntas de hoy.',
        'limite-dia': 'El asistente ya respondió todas las preguntas que tiene para hoy.',
        rapido: 'Vas muy rápido. Espera un minuto y vuelve a preguntar.',
        largo: 'Tu pregunta pasa de 500 caracteres. Hazla más corta.',
        turnos: 'Esta conversación llegó a su límite. Empieza una nueva con el botón de arriba.',
        firma: 'La conversación se desincronizó. Empieza una nueva con el botón de arriba.',
        servicio: 'El asistente está descansando en este momento.',
      },
    },
  },
  en: {
    sugerencias: ['What has he built with AI?', 'What did he study, and where?', 'Where has he worked?', 'How can I contact him?'],
    aviso: 'AI assistant. It answers only from what is published in this portfolio and can make mistakes.',
    lanzador: "Talk to Edrei's butler, his AI assistant",
    titulo: "Edrei's butler",
    subtitulo: 'AI assistant · at your service',
    invitacion: 'Can I help? Ask me about Edrei.',
    nueva: 'Start a new conversation',
    nuevaCorto: 'Start over',
    cerrar: 'Close the assistant',
    cerrarCorto: 'Close',
    sugeridas: 'Suggested questions',
    etiqueta: 'Your question about Edrei',
    placeholder: 'Type your question…',
    enviar: 'Send the question',
    detener: 'Stop the answer',
    chat: {
      saludo: "Welcome to the cabinet. I'm **Edrei Robles**'s butler: ask me about his career, his projects, his education or how to reach him.",
      mientras: ' Meanwhile, you can see his ',
      curriculum: 'CV',
      escribirle: ' or message him on ',
      caracteres: 'characters',
      respuesta: 'Assistant answer: ',
      errores: {
        'limite-visitante': "You've reached today's question limit.",
        'limite-dia': 'The assistant has answered all the questions it has for today.',
        rapido: "You're going too fast. Wait a minute and ask again.",
        largo: 'Your question is over 500 characters. Please make it shorter.',
        turnos: 'This conversation reached its limit. Start a new one with the button above.',
        firma: 'The conversation got out of sync. Start a new one with the button above.',
        servicio: 'The assistant is resting right now.',
      },
    },
  },
} satisfies Record<Idioma, unknown>;

export type TextosChat = (typeof TEXTOS)['es']['chat'];
