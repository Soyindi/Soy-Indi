# 🚀 Guía de Despliegue en Producción: Oracle Cloud Always Free + Coolify (INDI 2026)

Esta guía documenta el procedimiento paso a paso para desplegar **INDI (soyindi.cl)** en una instancia dedicada **100% gratuita de por vida** mediante **Oracle Cloud Infrastructure (OCI) Always Free** y el orquestador PaaS open source **Coolify**.

---

## 🏗️ 1. Ventajas de la Arquitectura frente a Vercel

| Característica | Vercel Hobby | Coolify + OCI Always Free |
| :--- | :--- | :--- |
| **Costo** | $0 USD (con riesgo ToS) | **$0 USD (Para siempre)** |
| **Uso Comercial** | ❌ Prohibido en Hobby | **✅ Permitido por OCSA** |
| **Recursos** | Serverless compartido | **4 vCPU ARM Ampere + 24 GB RAM** |
| **Límite Uploads** | 4.5 MB serverless limit | **25 MB / Ilimitado (Next.js Standalone)** |
| **Certificado SSL** | Automático | **Automático vía Caddy / Let's Encrypt** |
| **Tiempo de Ejecución** | 10s - 15s timeout | **Sin timeouts de funciones serverless** |

---

## 📦 2. Requisitos Previos

1. Cuenta activa en [Oracle Cloud](https://www.oracle.com/cloud/free/) (Requiere tarjeta de crédito para verificación inicial sin cobro de suscripción).
2. Repositorio de GitHub `Soyindi/Soy-Indi` con acceso autorizado.
3. El archivo `.env.coolify.template` ubicado en la raíz del proyecto con las 22 variables.

---

## 🛠️ 3. Paso a Paso: Creación de la Instancia en Oracle Cloud

1. Inicia sesión en la consola de **Oracle Cloud Infrastructure (OCI)**.
2. Ve a **Compute ➔ Instances ➔ Create Instance**:
   - **Name:** `indi-production-core`
   - **Image:** `Ubuntu 22.04 LTS` o `Ubuntu 24.04 LTS` (Canonical Ubuntu).
   - **Shape:** Haz clic en *Change Shape* ➔ Selecciona **Ampere (ARM Processor)**:
     - Asigna **4 OCPUs** y **24 GB de Memoria RAM** (Cubierto 100% por el nivel *Always Free Eligible*).
   - **Networking:** Crear una nueva Virtual Cloud Network (VCN) pública con IP pública IPv4 asignada.
   - **SSH Keys:** Descarga el par de llaves privadas (`id_rsa`) para conectarte a la máquina.
3. Haz clic en **Create**. En ~60 segundos la máquina estará en estado *Running*.

### Configuración de Puertos en OCI (Security List)
En la subred pública de la VCN (Virtual Cloud Network), agrega las siguientes **Ingress Rules** (Reglas de entrada):
- `0.0.0.0/0` ➔ Puerto `80` (HTTP)
- `0.0.0.0/0` ➔ Puerto `443` (HTTPS)
- `0.0.0.0/0` ➔ Puerto `8000` (Panel Web de Coolify)
- `0.0.0.0/0` ➔ Puerto `22` (SSH)

---

## ⚡ 4. Instalación de Coolify en 1 Comando

Conéctate por SSH a tu instancia:
```bash
ssh -i /ruta/a/tu/id_rsa ubuntu@<IP_PUBLICA_DE_ORACLE>
```

Ejecuta el script oficial de instalación desatendida de Coolify:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Una vez completado (toma ~2 minutos), abre en tu navegador:
`http://<IP_PUBLICA_DE_ORACLE>:8000`

Crea tu cuenta de administrador de Coolify.

---

## 🚀 5. Despliegue de INDI en Coolify

1. **Conectar GitHub:**
   - En Coolify ve a **Sources ➔ Add Source ➔ GitHub App** y autoriza la lectura del repositorio `Soyindi/Soy-Indi`.
2. **Crear Nuevo Proyecto:**
   - Ve a **Projects ➔ Add Project ➔ Production**.
   - Selecciona **Add Resource ➔ Public / Private Repository ➔ Soyindi/Soy-Indi**.
   - Rama: `main`.
3. **Tipo de Construcción (Build Pack):**
   - Coolify detectará automáticamente el archivo `Dockerfile` incluido en la raíz.
   - Mantén seleccionado **Dockerfile** (usa el build multi-stage optimizado de Node 20 y `output: 'standalone'`).
4. **Dominio Canónico Oficial:**
   - En el campo **Domains**, ingresa: `https://soyindi.cl`.
   - Caddy configurará automáticamente el certificado HTTPS Let's Encrypt con renovación perpetua.
5. **Configuración de Variables de Entorno:**
   - Abre la pestaña **Environment Variables** en Coolify.
   - Copia el contenido de `.env.coolify.template`, rellena los valores secretos correspondientes a las 22 variables de producción y pégalas todas juntas.
6. **Desplegar:**
   - Haz clic en **Deploy**.
   - Coolify compilará la imagen de Docker, correrá el `next build` en sus 4 vCPU con 24 GB de RAM, y levantará el contenedor saludable en el puerto `3000`.

---

## 🌐 6. Configuración de DNS para `soyindi.cl`

En tu proveedor de DNS (Cloudflare / Nic Chile):
- Crea un registro **A** apuntando al host raíz `@`:
  - `Type`: `A`
  - `Name`: `@` (o `soyindi.cl`)
  - `IPv4 address`: `<IP_PUBLICA_DE_ORACLE>`
  - `Proxy status`: Si usas Cloudflare, puedes activar el proxy naranja (CDN + DDoS) o dejarlo en DNS Only.
- Crea un registro **CNAME** para subdominios si es necesario:
  - `Type`: `CNAME`
  - `Name`: `www`
  - `Target`: `soyindi.cl`

---

## 🩺 7. Health Check y Monitoreo

Coolify incluye monitoreo activo del endpoint:
```
http://localhost:3000/api/health
```
Si el contenedor presenta anomalías en Turso o Redis, Coolify lo reiniciará automáticamente o emitirá alertas a tu correo/Discord/Telegram.
