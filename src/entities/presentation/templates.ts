import { PresentationFormValues, PresentationTheme } from './schemas';

export const PRESENTATION_THEMES: PresentationTheme[] = [
  {
    id: 'orbital-cyber',
    name: 'Orbital Cyber',
    primaryColor: '#6366f1',
    accentColor: '#22d3ee',
    backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #090a10 75%)',
    enableParticles: true,
    fontFamily: 'sans',
  },
  {
    id: 'emerald-aurora',
    name: 'Emerald Aurora',
    primaryColor: '#059669',
    accentColor: '#34d399',
    backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #064e3b 0%, #051410 75%)',
    enableParticles: true,
    fontFamily: 'sans',
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    primaryColor: '#8b5cf6',
    accentColor: '#f43f5e',
    backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #3b0764 0%, #07030d 75%)',
    enableParticles: true,
    fontFamily: 'sans',
  },
  {
    id: 'solar-gold',
    name: 'Solar Obsidian',
    primaryColor: '#d97706',
    accentColor: '#fbbf24',
    backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #451a03 0%, #0c0a09 75%)',
    enableParticles: true,
    fontFamily: 'sans',
  },
];

export interface PresentationTemplateDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  slidesCount: number;
  data: PresentationFormValues;
}

export const PRESENTATION_TEMPLATES: PresentationTemplateDefinition[] = [
  {
    id: 'pitch-deck',
    name: 'Pitch Deck para Inversionistas',
    category: 'Venture Capital',
    description: 'Estructura validada por Y-Combinator para levantar capital y comunicar tracción inmediata.',
    badge: 'YC Style',
    slidesCount: 5,
    data: {
      title: 'INDI: Plataforma de Identidad & Networking 2026',
      slug: 'pitch-deck-inversionistas',
      isPublic: true,
      templateCategory: 'pitch-deck',
      themeSettings: PRESENTATION_THEMES[0],
      slidesData: [
        {
          id: 'slide-pd-1',
          title: 'El Fin de las Tarjetas de Papel',
          subtitle: 'La desconexión analógica en el networking profesional global',
          visualType: 'concept',
          layout: 'standard',
          badgeText: 'EL PROBLEMA',
          keyPoints: [
            'El 88% de las tarjetas impresas se botan en menos de 7 días sin generar seguimiento.',
            'Cero analítica de interacción: es imposible saber quién vio tu contacto o visitó tu web.',
            'Altos costos recurrentes de imprenta y una huella ecológica innecesaria en la era digital.',
          ],
          speakerNotes: 'Iniciar con la fricción del networking tradicional y la pérdida de oportunidades comerciales.',
        },
        {
          id: 'slide-pd-2',
          title: 'Métricas de Impacto y Tracción Viral',
          subtitle: 'Validación en mercado real durante la fase de prelanzamiento',
          visualType: 'metrics',
          layout: 'kpi-cards',
          badgeText: 'TRACCIÓN Q3 2026',
          keyPoints: [
            'Conversión directa a WhatsApp 3.4 veces superior a una tarjeta tradicional.',
            'Cero costo de infraestructura base gracias a Turso LibSQL Serverless.',
          ],
          metricsData: [
            { label: 'Tasa de Contacto Directo', value: '42.8%', change: '+340%', trend: 'up' },
            { label: 'Latencia Edge Global', value: '<25ms', change: '-80%', trend: 'up' },
            { label: 'Retención de Contactos', value: '76%', change: '+52%', trend: 'up' },
          ],
          speakerNotes: 'Exponer cómo la inmediatez de WhatsApp revoluciona el cierre de negocios.',
        },
        {
          id: 'slide-pd-3',
          title: 'La Disrupción del Modelo INDI',
          subtitle: 'Comparativa de capacidades frente a la fricción de soluciones tradicionales',
          visualType: 'comparison',
          layout: 'split-2col',
          badgeText: 'VENTAJA COMPETITIVA',
          keyPoints: [
            'Reemplazamos aplicaciones pesadas y suscripciones infladas por un enlace vivo sin descargas.',
          ],
          comparisonData: {
            beforeTitle: 'Solución Tradicional / Link-in-Bio',
            beforeItems: [
              'Cobros mensuales de $15-30 USD con límites de tráfico.',
              'Páginas genéricas sin soporte para WhatsApp dinámico ni CVs.',
              'Dependencia de apps nativas que la otra persona debe instalar.',
            ],
            afterTitle: 'Suite Unificada INDI 2026',
            afterItems: [
              'Plan Semestral accesible ($1.000 CLP/mes) todo-en-uno sin límites.',
              'Tarjeta con QR interactivo + Smart CV ATS + Presentaciones 16:9.',
              'Página web Edge nativa compatible con cualquier teléfono sin apps.',
            ],
          },
          speakerNotes: 'Destacar por qué el usuario elige INDI: menor precio, mayor valor funcional y cero fricción.',
        },
        {
          id: 'slide-pd-4',
          title: 'Arquitectura Técnica de Cero Fricción',
          subtitle: 'Diseñada para escalar a millones de usuarios con costo marginal cero',
          visualType: 'architecture',
          layout: 'bento-grid',
          badgeText: 'ARQUITECTURA EDGE',
          keyPoints: [
            'Next.js 15 App Router en Vercel Edge con reactividad React 19.',
            'Turso LibSQL SQLite distribuido geográficamente sin pool de conexiones saturable.',
            'Cloudflare R2 para almacenamiento de activos multimedia con $0 en cuotas de egreso.',
          ],
          speakerNotes: 'Transmitir confianza a inversionistas técnicos sobre la sostenibilidad económica de la infraestructura.',
        },
        {
          id: 'slide-pd-5',
          title: 'Hoja de Ruta y Próximos Hitos',
          subtitle: 'Estrategia de expansión regional y monetización recurrente',
          visualType: 'timeline',
          layout: 'timeline-steps',
          badgeText: 'ROADMAP 2026-2027',
          keyPoints: [
            'Consolidar la base de usuarios en Chile y expandir al mercado hispanohablante.',
          ],
          timelineData: [
            { step: 'Q3 2026', title: 'Lanzamiento VIP', description: 'Onboarding de 5.000 profesionales independientes y pymes.' },
            { step: 'Q4 2026', title: 'Suite Corporativa', description: 'Planes B2B para equipos de ventas con branding centralizado.' },
            { step: 'Q1 2027', title: 'Expansión LatAm', description: 'Apertura de pasarelas de pago locales en México, Colombia y Perú.' },
          ],
          speakerNotes: 'Cierre enfocado en la oportunidad de inversión y el retorno proyectado.',
        },
      ],
    },
  },
  {
    id: 'product-launch',
    name: 'Lanzamiento de Producto & Keynote',
    category: 'Presentación de Alto Impacto',
    description: 'Estética cinematográfica inspirada en eventos de Apple y Linear para cautivar audiencias.',
    badge: 'Keynote',
    slidesCount: 4,
    data: {
      title: 'Keynote de Presentación: INDI Suite 2026',
      slug: 'keynote-lanzamiento-indi',
      isPublic: true,
      templateCategory: 'product-launch',
      themeSettings: PRESENTATION_THEMES[2],
      slidesData: [
        {
          id: 'slide-pl-1',
          title: 'Una Nueva Era de Identidad Profesional',
          subtitle: 'Presentamos la suite definitiva para profesionales que no se conforman con lo ordinario',
          visualType: 'concept',
          layout: 'standard',
          badgeText: 'LANZAMIENTO OFICIAL',
          keyPoints: [
            'Una tarjeta de presentación que se siente viva, reactiva y elegante.',
            'Tecnología de partículas aceleradas por GPU y Glassmorphism 2.0.',
            'Diseñada para destacar instantáneamente en cualquier evento o reunión.',
          ],
          speakerNotes: 'Marcar el tono inspirador y el estándar de excelencia visual.',
        },
        {
          id: 'slide-pl-2',
          title: 'Rendimiento que Desafía lo Posible',
          subtitle: 'Optimización milimétrica para una experiencia fluida a 60 FPS',
          visualType: 'metrics',
          layout: 'kpi-cards',
          badgeText: 'CORE WEB VITALS',
          keyPoints: [
            'Lecturas perimetrales instantáneas desde cualquier rincón del planeta.',
          ],
          metricsData: [
            { label: 'Score Google Lighthouse', value: '98/100', change: 'Top 1%', trend: 'up' },
            { label: 'Tiempo de Carga Inicial', value: '0.6s', change: 'Instantáneo', trend: 'up' },
            { label: 'Cumulative Layout Shift', value: '0.00', change: 'Cero Saltos', trend: 'neutral' },
          ],
          speakerNotes: 'Demostrar que la belleza visual no compromete la velocidad.',
        },
        {
          id: 'slide-pl-3',
          title: 'Lo que Dicen Nuestros Primeros Usuarios',
          subtitle: 'Testimonio de un líder tecnológico tras adoptar la plataforma',
          visualType: 'quote',
          layout: 'quote-focus',
          badgeText: 'TESTIMONIO REAL',
          keyPoints: [
            'La tasa de respuesta tras conferencias se triplicó en el primer mes.',
          ],
          quoteData: {
            quote: 'INDI transformó radicalmente la manera en que presento mi perfil y el de mi equipo. El botón directo a WhatsApp y el código QR interactivo cerraron acuerdos en el acto.',
            author: 'Sebastián Morales',
            role: 'Head of Engineering en FinTech LatAm',
          },
          speakerNotes: 'Hacer una pausa para que la audiencia lea la cita con impacto.',
        },
        {
          id: 'slide-pl-4',
          title: 'Disponible Hoy con 3 Días Gratuitos',
          subtitle: 'Comienza a crear tu identidad profesional sin compromisos',
          visualType: 'concept',
          layout: 'standard',
          badgeText: 'ACCESO INMEDIATO',
          keyPoints: [
            'Sin tarjeta de crédito requerida para iniciar tu prueba VIP.',
            'Acceso total a Tarjetas, Smart CV y Estudio de Presentaciones.',
            'Planes desde solo $1.000 CLP al mes en modalidad semestral.',
          ],
          speakerNotes: 'Llamado a la acción final con el enlace directo en pantalla.',
        },
      ],
    },
  },
  {
    id: 'tech-architecture',
    name: 'Revisión de Arquitectura de Software',
    category: 'Ingeniería & Staff Lead',
    description: 'Plantilla técnica para revisiones de diseño de sistemas, escalabilidad y guardrails.',
    badge: 'Staff Lead',
    slidesCount: 4,
    data: {
      title: 'Diseño de Sistemas: Arquitectura INDI 2026',
      slug: 'arquitectura-software-2026',
      isPublic: true,
      templateCategory: 'tech-architecture',
      themeSettings: PRESENTATION_THEMES[1],
      slidesData: [
        {
          id: 'slide-ta-1',
          title: 'Principios de Arquitectura FSD',
          subtitle: 'Feature-Sliced Design con jerarquía unidireccional estricta',
          visualType: 'architecture',
          layout: 'bento-grid',
          badgeText: 'ESTRUCTURA MODULAR',
          keyPoints: [
            'src/app ➔ Enrutador Next.js App Router con Edge handlers y Server Components.',
            'src/features ➔ Módulos de negocio aislados sin dependencias cruzadas.',
            'src/entities ➔ Esquemas declarativos de Drizzle ORM y contratos Zod.',
            'src/shared ➔ Primitivas de base de datos, guardrails de sesión y UI Kit.',
          ],
          speakerNotes: 'Explicar las ventajas del FSD para evitar la deuda técnica y acoplamientos circulares.',
        },
        {
          id: 'slide-ta-2',
          title: 'Seguridad Multi-Tenant y Guardrails',
          subtitle: 'Protección estricta contra elevación de privilegios y data leaks',
          visualType: 'concept',
          layout: 'standard',
          badgeText: 'ZERO TRUST',
          keyPoints: [
            'Ninguna mutación accede a la base de datos sin getSafeAuthenticatedUserId.',
            'Validación exhaustiva de inputs con schema.safeParse() de Zod.',
            'Ambiente productivo bloquea cualquier ejecución huérfana o no autorizada.',
          ],
          speakerNotes: 'Destacar la política de seguridad estricta y los tests unitarios automatizados.',
        },
        {
          id: 'slide-ta-3',
          title: 'Rendimiento y Tolerancia a Fallos',
          subtitle: 'Métricas de resiliencia del pipeline Serverless y LibSQL',
          visualType: 'metrics',
          layout: 'kpi-cards',
          badgeText: 'TELEMETRÍA EN VIVO',
          keyPoints: [
            'Latencias de lectura distribuidas consistentes en múltiples regiones.',
          ],
          metricsData: [
            { label: 'Disponibilidad SLA', value: '99.98%', change: 'Sin caídas', trend: 'up' },
            { label: 'P95 Query Time', value: '8.4ms', change: '-45%', trend: 'up' },
            { label: 'Cold-Start Serverless', value: '0ms', change: 'Zero Cold', trend: 'neutral' },
          ],
          speakerNotes: 'Revisar métricas de telemetría y pruebas de carga.',
        },
        {
          id: 'slide-ta-4',
          title: 'Comparativa de Paradigmas: Legacy vs 2026',
          subtitle: 'Evolución desde un monolito Postgres tradicional a LibSQL distribuido',
          visualType: 'comparison',
          layout: 'split-2col',
          badgeText: 'MODERNIZACIÓN',
          keyPoints: [
            'Demostración del salto cuantitativo en rendimiento y costo operacional.',
          ],
          comparisonData: {
            beforeTitle: 'Arquitectura Legacy Monolítica',
            beforeItems: [
              'Agotamiento de sockets por conexión abierta en Serverless.',
              'NextAuth disperso con sesiones propensas a desincronización.',
              'Exportación pesada con Puppeteer causando caídas por Out-Of-Memory.',
            ],
            afterTitle: 'Nueva Arquitectura INDI 2026',
            afterItems: [
              'Turso SQLite sobre HTTP con réplicas perimetrales ultra-livianas.',
              'Better-Auth autónomo integrado directamente en Drizzle SQLite.',
              'Motor vectorial de PDFs en cliente sin sobrecarga de servidor.',
            ],
          },
          speakerNotes: 'Concluir con el retorno de inversión y facilidad de mantenimiento.',
        },
      ],
    },
  },
  {
    id: 'qbr-growth',
    name: 'Revisión Trimestral de Negocio (QBR)',
    category: 'Estrategia & Operaciones',
    description: 'Diapositivas para rendición de cuentas, cumplimiento de OKRs y apuestas estratégicas.',
    badge: 'QBR Growth',
    slidesCount: 4,
    data: {
      title: 'QBR: Balance Trimestral & Escala Comercial',
      slug: 'qbr-trimestral-2026',
      isPublic: true,
      templateCategory: 'qbr-growth',
      themeSettings: PRESENTATION_THEMES[3],
      slidesData: [
        {
          id: 'slide-qbr-1',
          title: 'Resumen Ejecutivo del Trimestre',
          subtitle: 'Superación de objetivos de adquisición y consolidación del modelo comercial',
          visualType: 'concept',
          layout: 'standard',
          badgeText: 'BALANCE GENERAL',
          keyPoints: [
            'Crecimiento exponencial en la adopción del Plan Semestral ($6.000 CLP / 6 meses).',
            'Tasa de conversión de prueba gratuita a membresía activa superior al 28%.',
            'Integración exitosa del módulo de presentaciones 16:9 con alta satisfacción.',
          ],
          speakerNotes: 'Abrir la sesión con los grandes hitos alcanzados y el agradecimiento al equipo.',
        },
        {
          id: 'slide-qbr-2',
          title: 'Indicadores Clave de Desempeño (KPIs)',
          subtitle: 'Métricas financieras y operativas auditadas del periodo',
          visualType: 'metrics',
          layout: 'kpi-cards',
          badgeText: 'RESULTADOS Q3',
          keyPoints: [
            'Salud financiera sólida con margen bruto optimizado.',
          ],
          metricsData: [
            { label: 'MRR Equivalente', value: '$4.2M CLP', change: '+64%', trend: 'up' },
            { label: 'Costo Adquisición (CAC)', value: '$1.800 CLP', change: '-32%', trend: 'up' },
            { label: 'Churn Rate Mensual', value: '2.1%', change: 'Mínimo Histórico', trend: 'neutral' },
          ],
          speakerNotes: 'Detallar la eficiencia en la inversión en marketing orgánico y boca a boca.',
        },
        {
          id: 'slide-qbr-3',
          title: 'Voz del Cliente & Casos de Éxito',
          subtitle: 'Impacto tangible en profesionales independientes',
          visualType: 'quote',
          layout: 'quote-focus',
          badgeText: 'CUSTOMER OBSESSION',
          keyPoints: [
            'Los usuarios destacan la velocidad del enlace y la profesionalidad visual.',
          ],
          quoteData: {
            quote: 'Llevar mi tarjeta digital con código QR a ferias de negocios y poder compartir mi presentación 16:9 en el momento me permitió cerrar contratos que antes se perdían en correos fríos.',
            author: 'Carolina Valenzuela',
            role: 'Consultora de Negocios y Estrategia Comercial',
          },
          speakerNotes: 'Conectar los números con historias humanas de éxito.',
        },
        {
          id: 'slide-qbr-4',
          title: 'Prioridades Estratégicas para el Próximo Trimestre',
          subtitle: 'Foco en expansión corporativa y automatizaciones de IA',
          visualType: 'timeline',
          layout: 'timeline-steps',
          badgeText: 'APUESTAS Q4',
          keyPoints: [
            'Líneas de trabajo principales para mantener la ventaja competitiva.',
          ],
          timelineData: [
            { step: 'Mes 1', title: 'Portal para Equipos', description: 'Dashboard empresarial con control de marcas y accesos para empresas.' },
            { step: 'Mes 2', title: 'Generador Multimodal', description: 'Conversión directa de documentos PDF a diapositivas cinemáticas en segundos.' },
            { step: 'Mes 3', title: 'Alianzas B2B', description: 'Acuerdos de distribución con colegios profesionales y cámaras de comercio.' },
          ],
          speakerNotes: 'Alinear a los líderes con los objetivos del siguiente trimestre y abrir espacio para preguntas.',
        },
      ],
    },
  },
];
