# ⚠️ [ARCHIVADO] RFC Histórico: Arquitectura Plataforma SaaS (Fase 1 - Supabase)

> [!WARNING]
> **DOCUMENTO HISTÓRICO / ARCHIVADO (NO VIGENTE)**
> Este documento representa la propuesta de arquitectura inicial (Fase 1) evaluada durante la concepción del proyecto INDI.
> La arquitectura vigente oficial del producto fue migrada y consolidada en **Turso (LibSQL Serverless SQLite) + Better-Auth + Drizzle ORM**.
> Para consultar la especificación técnica en producción, diríjase al Blueprint vigente en [docs/architecture/BLUEPRINT_2026.md](../architecture/BLUEPRINT_2026.md).

---

# **Blueprint Arquitectónico y de Diseño: Plataforma de Identidad Digital y Networking (INDI)**

La conceptualización y el desarrollo desde cero de una plataforma web de identidad digital interactiva y creación de currículums inteligentes exige una convergencia precisa entre ingeniería de software de alto rendimiento y tecnología creativa de vanguardia. Para convertir contactos B2B en clientes mediante una experiencia visual verdaderamente hipnotizante, la arquitectura subyacente debe soportar renderizado dinámico global, generación de gráficos tridimensionales en el navegador, integración de inteligencia artificial generativa en tiempo real y una latencia imperceptible.  
El presente informe detalla de manera exhaustiva el diseño técnico, visual y estructural requerido para construir un sistema escalable, resiliente y estéticamente disruptivo, alineado estrictamente con los estándares de la industria tecnológica del año 2026.

## **1. Arquitectura de Software y Stack Tecnológico**

La fundación de la plataforma requiere un stack tecnológico que priorice la velocidad de iteración, la tipificación estricta de extremo a extremo y la capacidad de ejecutar lógica de negocio compleja directamente en los nodos de borde (*Edge*).

### **Framework y Runtime Base**

La arquitectura adopta Next.js 15/16 (App Router) como framework principal sobre el ecosistema React 19.

### **Capa de Datos y Persistencia (Propuesta Legacy Supabase)**

La persistencia de datos residía en la propuesta original sobre Supabase (PostgreSQL) con RLS nativo de PostgreSQL. *(Nota: Sustituido en implementación final por Turso LibSQL)*.

*(Consultar el archivo histórico completo para detalles de esta propuesta temprana).*
