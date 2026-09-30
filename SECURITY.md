# 🔒 Política de Seguridad: INDI Platform (2026)

La seguridad e integridad de la identidad digital y los datos de nuestros usuarios es nuestra máxima prioridad.

## 🛡️ Medidas de Seguridad Implementadas

1. **Aislamiento Multi-Tenant y Prevención de IDOR:**
   - Todas las Server Actions validan la identidad del usuario mediante guardrails tipados en `@/shared/lib/session`.
   - En entornos de producción, las llamadas no autenticadas son bloqueadas por defecto.
2. **Sesiones Seguras HttpOnly:**
   - Autenticación gestionada con **Better-Auth** sobre SQLite distribuido.
   - Las cookies de sesión son `HttpOnly`, `SameSite=Lax` y cifradas en tránsito vía HTTPS.
3. **Validación de Entradas:**
   - Esquemas Zod estrictos que sanitizan y tipan cada campo antes de llegar a la capa de persistencia.
4. **Cumplimiento Regulatorio (EU AI Act):**
   - El motor de procesamiento de CVs filtra y descarta datos sensibles (edad, religión, estado civil, fotos) para prevenir sesgos algorítmicos.

## 🚨 Reporte de Vulnerabilidades

Si descubres una vulnerabilidad de seguridad en la plataforma INDI, por favor repórtala de forma responsable:

- **Email:** security@indi.bio
- **Plazo de Respuesta:** Dentro de las 48 horas hábiles.
- **Divulgación:** Solicitamos coordinar la divulgación una vez que el parche de seguridad haya sido desplegado.
