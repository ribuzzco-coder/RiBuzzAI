// =========================================================
// Blueprint v2 · 40 preguntas en 9 bloques (A–I)
// Lenguaje común — el usuario responde con hechos.
// RiBuzz interpreta internamente en lenguaje comercial.
// =========================================================

import type { Pregunta } from "./types";

export const QUESTIONS: Pregunta[] = [
  // ===== A. Identificación y contexto mínimo =====
  {
    numero: 1,
    seccion: "A",
    texto: "¿Cuál es tu nombre, correo y WhatsApp?",
    variables: ["lead_nombre", "lead_correo", "lead_whatsapp"],
    nodo: "Sintetizador",
    inputType: "text",
    isFused: true,
    placeholder: "Ej. Laura Gómez · laura@empresa.com · +57 300 0000000"
  },
  {
    numero: 2,
    seccion: "A",
    texto: "¿Cómo se llama tu empresa?",
    variables: ["empresa_nombre"],
    nodo: "Sintetizador",
    inputType: "text",
    placeholder: "Ej. Viajes Nómada · DataBridge SAS · Mora Studio"
  },
  {
    numero: 3,
    seccion: "A",
    texto: "¿Dónde podemos ver tu negocio? Comparte web, Instagram, LinkedIn o WhatsApp comercial.",
    variables: ["lead_canal_digital"],
    nodo: "Scorer",
    inputType: "text",
    placeholder: "URL, @usuario, número o \"no tengo\""
  },
  {
    numero: 4,
    seccion: "A",
    texto: "¿A qué se dedica tu empresa? Explícalo como se lo explicarías a un cliente nuevo.",
    variables: ["negocio_descripcion"],
    nodo: "Scorer",
    inputType: "textarea",
    placeholder: "No uses palabras complicadas. Escríbelo como se lo dirías a alguien que te acaba de conocer."
  },

  // ===== B. Momento comercial actual =====
  {
    numero: 5,
    seccion: "B",
    texto: "¿Cuál frase describe mejor cómo vende tu empresa hoy?",
    variables: ["comercial_momento"],
    nodo: "Scorer",
    inputType: "select",
    options: [
      { value: "validando", label: "Todavía estoy validando si las personas pagarían por lo que ofrezco." },
      { value: "ventas_inconstantes", label: "Ya he vendido, pero las ventas no son constantes." },
      { value: "depende_persona", label: "Vendo todos los meses, pero dependo mucho de mí o de una persona clave." },
      { value: "se_pierden", label: "Tengo interesados, pero muchos se pierden antes de comprar." },
      { value: "no_se_que_funciona", label: "Tengo clientes y ventas, pero no sé qué canal, oferta o proceso funciona mejor." },
      { value: "procesos_desordenados", label: "Llevo años operando, pero mis procesos comerciales están desordenados." },
      { value: "transformacion_digital", label: "Estoy en transformación digital y necesito saber qué proceso ordenar primero." },
      { value: "tengo_equipo", label: "Tengo equipo comercial, pero quiero mejorar medición, seguimiento y conversión." }
    ]
  },
  {
    numero: 6,
    seccion: "B",
    texto: "¿Qué tan claro tienes hoy el paso a paso para vender?",
    variables: ["proceso_claridad"],
    nodo: "Scorer",
    inputType: "select",
    options: [
      { value: "no_claro", label: "No lo tengo claro." },
      { value: "en_cabeza", label: "Lo tengo en mi cabeza." },
      { value: "parcial", label: "Lo tengo parcialmente organizado." },
      { value: "en_persona_equipo", label: "Lo tiene una persona del equipo." },
      { value: "documentado_sin_medir", label: "Está documentado, pero no lo medimos." },
      { value: "documentado_medido", label: "Está documentado y medido." }
    ]
  },
  {
    numero: 7,
    seccion: "B",
    texto: "¿Qué tan fácil sería para otra persona vender siguiendo tu proceso actual?",
    variables: ["dependencia_persona"],
    nodo: "Scorer",
    inputType: "select",
    options: [
      { value: "imposible", label: "Imposible, todo depende de mí." },
      { value: "dificil", label: "Difícil, tendría que explicarle casi todo." },
      { value: "posible_acompanado", label: "Posible, pero con acompañamiento." },
      { value: "facil", label: "Fácil, porque ya hay proceso." },
      { value: "muy_facil", label: "Muy fácil, porque está documentado y medido." }
    ]
  },

  // ===== C. Qué vende y qué quiere vender más =====
  {
    numero: 8,
    seccion: "C",
    texto: "¿Qué vendes principalmente hoy?",
    variables: ["oferta_actual"],
    nodo: "Scorer",
    inputType: "textarea",
    placeholder: "Escribe lo que más vendes hoy, no todo tu portafolio."
  },
  {
    numero: 9,
    seccion: "C",
    texto: "¿Qué producto o servicio te gustaría vender más en los próximos meses?",
    variables: ["oferta_prioritaria"],
    nodo: "Mayor",
    inputType: "textarea",
    placeholder: "Puede ser diferente a lo que más vendes hoy."
  },
  {
    numero: 10,
    seccion: "C",
    texto: "Cuando alguien te compra, ¿qué recibe exactamente?",
    variables: ["oferta_alcance"],
    nodo: "Scorer",
    inputType: "textarea",
    placeholder: "Piensa en qué se lleva el cliente después de pagar (producto, servicio, duración, acompañamiento)."
  },
  {
    numero: 11,
    seccion: "C",
    texto: "¿Por qué crees que tus clientes te compran a ti y no a otra opción?",
    variables: ["diferenciador_percibido"],
    nodo: "Scorer",
    inputType: "textarea",
    placeholder: "Escribe lo que has escuchado o lo que crees que valoran.",
    allowUnknown: true
  },
  {
    numero: 12,
    seccion: "C",
    texto: "¿Qué dudas, miedos o excusas te ponen antes de comprar?",
    variables: ["objeciones"],
    nodo: "Fit",
    inputType: "textarea",
    placeholder: "Piensa en lo que más repiten antes de comprar o cuando se enfría la venta."
  },

  // ===== D. Cliente real y cliente prioritario =====
  {
    numero: 13,
    seccion: "D",
    texto: "¿Quién te compra hoy realmente? Describe el tipo de persona o empresa.",
    variables: ["cliente_actual"],
    nodo: "Scorer",
    inputType: "textarea",
    placeholder: "No pienses en el cliente ideal. Piensa en quien sí te compra hoy."
  },
  {
    numero: 14,
    seccion: "D",
    texto: "Piensa en tus mejores clientes recientes. ¿Quiénes fueron y por qué fueron buenos clientes?",
    variables: ["cliente_prioritario"],
    nodo: "Scorer",
    inputType: "textarea",
    placeholder: "Buenos = compran, pagan bien, valoran tu trabajo, no generan desgaste."
  },
  {
    numero: 15,
    seccion: "D",
    texto: "¿Qué tipo de cliente te desgasta, regatea mucho o no quieres atraer más?",
    variables: ["cliente_no_deseado"],
    nodo: "Scorer",
    inputType: "textarea",
    placeholder: "Esto ayuda a evitar atraer clientes que consumen tiempo y dejan poco valor.",
    allowUnknown: true
  },
  {
    numero: 16,
    seccion: "D",
    texto: "¿Qué problema, necesidad o deseo hace que alguien te busque?",
    variables: ["problema_compra"],
    nodo: "Scorer",
    inputType: "textarea",
    placeholder: "Piensa en qué estaba pasando en la vida o empresa del cliente cuando te buscó."
  },
  {
    numero: 17,
    seccion: "D",
    texto: "¿Quién toma la decisión de compra y quién paga?",
    variables: ["decisor_pagador"],
    nodo: "Diagnostico",
    inputType: "textarea",
    placeholder: "A veces quien usa, quien decide y quien paga no es la misma persona."
  },

  // ===== E. Venta ganada y oportunidad perdida =====
  {
    numero: 18,
    seccion: "E",
    texto: "Cuéntanos una venta reciente que sí cerraste. ¿Cómo llegó esa persona, qué pidió y por qué compró?",
    variables: ["venta_ganada"],
    nodo: "Diagnostico",
    inputType: "textarea",
    placeholder: "Origen + qué pidió + por qué compró."
  },
  {
    numero: 19,
    seccion: "E",
    texto: "Cuéntanos una oportunidad reciente que se perdió. ¿Cómo llegó, qué pasó y en qué momento dejó de avanzar?",
    variables: ["venta_perdida"],
    nodo: "Diagnostico",
    inputType: "textarea",
    placeholder: "Origen + avance + objeción o punto de pérdida."
  },
  {
    numero: 20,
    seccion: "E",
    texto: "¿En qué momento sientes que más personas se pierden?",
    variables: ["punto_fuga"],
    nodo: "Mayor",
    inputType: "multi-select",
    options: [
      { value: "apenas_preguntan", label: "Apenas preguntan." },
      { value: "despues_explicar", label: "Después de explicarles." },
      { value: "despues_cotizar", label: "Después de enviar precio o cotización." },
      { value: "despues_reunion", label: "Después de una reunión." },
      { value: "al_pagar", label: "Cuando deben pagar." },
      { value: "lo_voy_a_pensar", label: "Después de decir \"lo voy a pensar\"." },
      { value: "no_se", label: "No sé dónde se pierden." },
      { value: "otro", label: "Otro." }
    ]
  },
  {
    numero: 21,
    seccion: "E",
    texto: "Cuando alguien muestra interés pero no compra, ¿qué haces después?",
    variables: ["seguimiento_proceso"],
    nodo: "Scorer",
    inputType: "textarea",
    placeholder: "Describe lo que haces normalmente, no lo que te gustaría hacer."
  },

  // ===== F. Canales, interesados y ventas =====
  {
    numero: 22,
    seccion: "F",
    texto: "¿Por dónde llegan hoy las personas interesadas?",
    variables: ["canales_entrada"],
    nodo: "Diagnostico",
    inputType: "multi-select",
    options: [
      { value: "whatsapp", label: "WhatsApp" },
      { value: "instagram", label: "Instagram" },
      { value: "facebook", label: "Facebook" },
      { value: "tiktok", label: "TikTok" },
      { value: "linkedin", label: "LinkedIn" },
      { value: "web", label: "Página web" },
      { value: "google", label: "Google" },
      { value: "referidos", label: "Referidos" },
      { value: "ferias", label: "Ferias o eventos" },
      { value: "punto_fisico", label: "Punto físico" },
      { value: "llamadas", label: "Llamadas" },
      { value: "email", label: "Email" },
      { value: "otro", label: "Otro" }
    ]
  },
  {
    numero: 23,
    seccion: "F",
    texto: "¿Cuál canal te trae ventas reales, no solo mensajes o likes?",
    variables: ["canal_ventas"],
    nodo: "Scorer",
    inputType: "textarea",
    placeholder: "No el canal que más se mueve. El que más termina en ventas.",
    allowUnknown: true
  },
  {
    numero: 24,
    seccion: "F",
    texto: "En los últimos 30 días, ¿cuántas personas aproximadamente preguntaron por tus productos o servicios?",
    variables: ["interesados_30d"],
    nodo: "Codigo",
    inputType: "select",
    options: [
      { value: "no_se", label: "No sé." },
      { value: "menos_10", label: "Menos de 10." },
      { value: "10_30", label: "Entre 10 y 30." },
      { value: "31_100", label: "Entre 31 y 100." },
      { value: "mas_100", label: "Más de 100." }
    ]
  },
  {
    numero: 25,
    seccion: "F",
    texto: "En los últimos 30 días, ¿cuántas personas terminaron comprando?",
    variables: ["ventas_30d"],
    nodo: "Codigo",
    inputType: "select",
    options: [
      { value: "no_se", label: "No sé." },
      { value: "0", label: "0." },
      { value: "1_5", label: "1 a 5." },
      { value: "6_15", label: "6 a 15." },
      { value: "16_30", label: "16 a 30." },
      { value: "mas_30", label: "Más de 30." }
    ]
  },
  {
    numero: 26,
    seccion: "F",
    texto: "¿Cuánto paga normalmente un cliente por compra? Puedes responder con un rango.",
    variables: ["ticket_promedio"],
    nodo: "Codigo",
    inputType: "text",
    placeholder: "Ej. \"$500.000 a $1.000.000\" · \"~$80.000\"",
    allowUnknown: true
  },

  // ===== G. Organización, seguimiento y datos =====
  {
    numero: 27,
    seccion: "G",
    texto: "¿Dónde guardas hoy los interesados, cotizaciones y clientes?",
    variables: ["sistema_registro"],
    nodo: "Fit",
    inputType: "multi-select",
    options: [
      { value: "whatsapp", label: "WhatsApp" },
      { value: "excel", label: "Excel o Google Sheets" },
      { value: "crm", label: "CRM" },
      { value: "cuaderno", label: "Cuaderno" },
      { value: "correo", label: "Correo" },
      { value: "memoria", label: "Memoria" },
      { value: "sistema_interno", label: "Sistema interno" },
      { value: "no_los_guardo", label: "No los guardo" },
      { value: "otro", label: "Otro" }
    ]
  },
  {
    numero: 28,
    seccion: "G",
    texto: "¿Cuánto tiempo tardas normalmente en responder a un nuevo interesado?",
    variables: ["tiempo_respuesta"],
    nodo: "Scorer",
    inputType: "select",
    options: [
      { value: "menos_1h", label: "Menos de 1 hora." },
      { value: "mismo_dia", label: "El mismo día." },
      { value: "1_2_dias", label: "Entre 1 y 2 días." },
      { value: "mas_2_dias", label: "Más de 2 días." },
      { value: "depende", label: "Depende de quién esté disponible." },
      { value: "no_se", label: "No lo sé." }
    ]
  },
  {
    numero: 29,
    seccion: "G",
    texto: "¿Tienes una lista de personas que preguntaron o cotizaron pero no compraron?",
    variables: ["lista_no_compradores"],
    nodo: "Scorer",
    inputType: "select",
    options: [
      { value: "organizada", label: "Sí, organizada." },
      { value: "incompleta", label: "Sí, pero incompleta." },
      { value: "en_chats", label: "Está en WhatsApp o chats." },
      { value: "en_cabeza", label: "Está en la cabeza de alguien." },
      { value: "no_lista", label: "No tenemos lista." },
      { value: "no_se", label: "No sé." }
    ]
  },
  {
    numero: 30,
    seccion: "G",
    texto: "¿Qué información puedes ver hoy fácilmente sobre tus ventas?",
    variables: ["datos_disponibles"],
    nodo: "Diagnostico",
    inputType: "multi-select",
    options: [
      { value: "cuantos_preguntan", label: "Cuántas personas preguntan." },
      { value: "cuantos_compran", label: "Cuántas compran." },
      { value: "de_donde_llegan", label: "De dónde llegan." },
      { value: "cuanto_compra_cada", label: "Cuánto compra cada cliente." },
      { value: "vendedor", label: "Qué vendedor respondió." },
      { value: "donde_se_perdio", label: "Dónde se perdió la venta." },
      { value: "canal_vende_mas", label: "Qué canal vende más." },
      { value: "clientes_recurrentes", label: "Qué clientes vuelven a comprar." },
      { value: "casi_nada", label: "No puedo ver casi nada." },
      { value: "otro", label: "Otro." }
    ]
  },
  {
    numero: 31,
    seccion: "G",
    texto: "¿Qué información te gustaría poder ver cada semana para tomar mejores decisiones?",
    variables: ["datos_deseados"],
    nodo: "Diagnostico",
    inputType: "multi-select",
    options: [
      { value: "interesados_llegaron", label: "Cuántos interesados llegaron." },
      { value: "cuantos_compraron", label: "Cuántos compraron." },
      { value: "de_donde_llegaron", label: "De dónde llegaron." },
      { value: "cuanto_compraron", label: "Cuánto compraron." },
      { value: "canal_mejor_clientes", label: "Qué canal trae mejores clientes." },
      { value: "donde_se_pierden", label: "Dónde se pierden las ventas." },
      { value: "seguimiento_falta", label: "Qué seguimiento falta." },
      { value: "pueden_volver", label: "Qué clientes pueden volver a comprar." },
      { value: "producto_rentable", label: "Qué producto o servicio deja más dinero." },
      { value: "otro", label: "Otro." }
    ]
  },

  // ===== H. Recurrencia, referidos y crecimiento =====
  {
    numero: 32,
    seccion: "H",
    texto: "¿Tus clientes vuelven a comprar o te recomiendan?",
    variables: ["recurrencia_referidos"],
    nodo: "Scorer",
    inputType: "select",
    options: [
      { value: "frecuentemente", label: "Sí, frecuentemente." },
      { value: "a_veces", label: "A veces." },
      { value: "muy_poco", label: "Muy poco." },
      { value: "no", label: "No." },
      { value: "no_medimos", label: "No lo medimos." }
    ]
  },
  {
    numero: 33,
    seccion: "H",
    texto: "¿Qué haces hoy para que un cliente vuelva, compre más o recomiende tu negocio?",
    variables: ["acciones_postventa"],
    nodo: "Scorer",
    inputType: "textarea",
    placeholder: "Describe lo que haces hoy después de vender (o si no haces nada).",
    allowUnknown: true
  },
  {
    numero: 34,
    seccion: "H",
    texto: "Si mañana te llegara el doble de interesados, ¿qué parte del negocio se complicaría primero?",
    variables: ["cuello_operativo"],
    nodo: "Diagnostico",
    inputType: "textarea",
    placeholder: "Piensa en responder, cotizar, entregar y hacer seguimiento."
  },
  {
    numero: 35,
    seccion: "H",
    texto: "¿Qué parte de vender depende demasiado de ti o de una sola persona?",
    variables: ["dependencia_persona_clave"],
    nodo: "Scorer",
    inputType: "textarea",
    placeholder: "Piensa en qué pasaría si esa persona no está disponible.",
    allowUnknown: true
  },

  // ===== I. Objetivo, restricción y disposición =====
  {
    numero: 36,
    seccion: "I",
    texto: "¿Qué quieres lograr comercialmente en los próximos 3 meses?",
    variables: ["meta_3m"],
    nodo: "Mayor",
    inputType: "textarea",
    placeholder: "Un resultado concreto que te gustaría lograr en 90 días."
  },
  {
    numero: 37,
    seccion: "I",
    texto: "¿Qué crees que hoy te impide lograrlo?",
    variables: ["obstaculo_percibido"],
    nodo: "Diagnostico",
    inputType: "textarea",
    placeholder: "Lo que tú crees, aunque después el diagnóstico encuentre otra causa."
  },
  {
    numero: 38,
    seccion: "I",
    texto: "¿Cuánto tiempo puede dedicar tu equipo cada semana a mejorar ventas o procesos comerciales?",
    variables: ["tiempo_disponible"],
    nodo: "Fit",
    inputType: "select",
    options: [
      { value: "menos_1h", label: "Menos de 1 hora." },
      { value: "1_3h", label: "1 a 3 horas." },
      { value: "4_6h", label: "4 a 6 horas." },
      { value: "mas_6h", label: "Más de 6 horas." },
      { value: "no_claro", label: "No tenemos tiempo claro todavía." }
    ]
  },
  {
    numero: 39,
    seccion: "I",
    texto: "Si el diagnóstico muestra una mejora clara, ¿estarías dispuesto a implementar cambios en tu proceso comercial?",
    variables: ["disposicion_ejecutar"],
    nodo: "Fit",
    inputType: "select",
    options: [
      { value: "si_inmediato", label: "Sí, de inmediato." },
      { value: "si_con_acompanamiento", label: "Sí, pero necesitaría acompañamiento." },
      { value: "tal_vez", label: "Tal vez, depende del costo y del tiempo." },
      { value: "no_por_ahora", label: "No por ahora." }
    ]
  },
  {
    numero: 40,
    seccion: "I",
    texto: "¿Te gustaría revisar el diagnóstico con RiBuzz para definir próximos pasos?",
    variables: ["cta_revision"],
    nodo: "Fit",
    inputType: "select",
    options: [
      { value: "si", label: "Sí." },
      { value: "mas_adelante", label: "Más adelante." },
      { value: "no_por_ahora", label: "No por ahora." }
    ]
  }
];

export const SECCION_LABELS: Record<string, string> = {
  A: "Identificación",
  B: "Momento comercial",
  C: "Qué vendes",
  D: "Tus clientes",
  E: "Ventas y pérdidas",
  F: "Canales y números",
  G: "Organización y datos",
  H: "Crecimiento",
  I: "Objetivos y fit"
};
