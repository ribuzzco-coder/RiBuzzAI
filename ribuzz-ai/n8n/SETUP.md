# RiBuzz · Setup del workflow n8n multi-agente
## versión 3 — bloques nativos de IA (chainLlm + lmChatAnthropic)

Guía paso a paso para conectar el workflow `ribuzz-multi-agent-workflow.json` a tu instancia de n8n en `https://n8n.srv1097452.hstgr.cloud`.

> **Cambio arquitectural v3:** Los 8 agentes ya no usan nodos HTTP Request que llaman a la API de Anthropic directamente. Ahora usan los bloques nativos de IA de n8n: **Basic LLM Chain** (chainLlm) + **Anthropic Chat Model** (lmChatAnthropic). Ventajas: system prompt y user message son campos visuales editables en el canvas, la credencial Anthropic se configura una sola vez, no necesitas variables de entorno del contenedor para la API key.

---

## 0. Antes de empezar

Necesitas tener:

- Acceso de admin a tu n8n.
- La **URL de Supabase** (la tienes en `.env.local`).
- La **service_role key** de Supabase (también en `.env.local` — la `SUPABASE_SERVICE_ROLE_KEY`).
- Tu **API key de Anthropic** (`sk-ant-api03-...`) — ahora se configura como credencial en n8n, no como variable de entorno.
- Una **contraseña/secret** que vas a inventar tú mismo — algo como `ribuzz-2025-xyz-aleatorio-largo`. Esto protege el webhook de llamadas externas.
- La migración `0004_processing_jobs.sql` ejecutada en Supabase (la corremos al final, antes de probar).

---

## 1. Importar el workflow

1. Abre tu n8n: **https://n8n.srv1097452.hstgr.cloud**
2. Menú izquierdo → **Workflows** → botón **+ Add workflow** → submenú **Import from File** (o usa el menú `⋮` arriba a la derecha del editor y selecciona "Import from File").
3. Selecciona el archivo: `C:\Users\User\Documents\RiBuzzAi\ribuzz-ai\n8n\ribuzz-multi-agent-workflow.json`.
4. Se abrirá el editor mostrando los **41 nodos** del flow — 10 chainLlm + 10 lmChatAnthropic + infraestructura.

Verás nodos rojos/amarillos — es normal, faltan las dos credenciales. Lo arreglamos en el paso 2 y 3.

---

## 2. Configurar credencial de Postgres (Supabase)

Los nodos Postgres del workflow se conectan directo a la BD de Supabase usando el service_role. Es lo más simple y robusto.

1. En el menú izquierdo de n8n → **Credentials** → **+ Add credential**.
2. Busca **Postgres** y selecciónalo.
3. Llena los campos:
   - **Credential Name:** `Supabase Postgres` (este nombre debe ser exacto — el workflow lo referencia así).
   - **Host:** `db.tzehvodilrqwwtvswqxz.supabase.co`
   - **Database:** `postgres`
   - **User:** `postgres`
   - **Password:** tu contraseña de base de datos (la generaste al crear el proyecto Supabase). Si no la guardaste, ve a Supabase → Settings → Database → **Reset Database Password**.
   - **Port:** `5432`
   - **SSL:** activa **Require** o **Allow** (Supabase requiere SSL).
4. Clic en **Save**. n8n hace una prueba de conexión — debería decir "Connection successful" en verde.

> Alternativa, si prefieres no usar Postgres directo: puedes cambiar todos los nodos Postgres por nodos **Supabase** que usan la REST API. Es más simple para autenticación pero requiere reescribir las queries como filtros REST. Para empezar, Postgres directo es más rápido.

---

## 3. Configurar credencial Anthropic en n8n (nuevo en v3)

En v3 los agentes usan los bloques nativos de IA de n8n. La API key de Anthropic se configura como una **credencial n8n**, no como variable de entorno del contenedor. Esto es más seguro y permite reutilizarla en cualquier workflow.

1. En el menú izquierdo de n8n → **Credentials** → **+ Add credential**.
2. Busca **Anthropic** y selecciónalo.
3. Llena los campos:
   - **Credential Name:** `RiBuzz Anthropic` (nombre exacto — todos los nodos `lmChatAnthropic` del workflow lo referencian con este nombre).
   - **API Key:** `sk-ant-api03-...` (tu API key de Anthropic).
4. Clic en **Save**. n8n valida la key automáticamente.

> Después de crear esta credencial, abre cada uno de los 10 nodos **Anthropic Chat Model** del canvas (los nodos pequeños conectados debajo de cada agente), y en el dropdown **Credential** selecciona `RiBuzz Anthropic`. Puedes usar **Select All** en el canvas para aplicarla en lote si tu versión de n8n lo soporta.

---

## 3b. Configurar webhook secret en n8n

El nodo `Validate Input` lee `$env.RIBUZZ_WEBHOOK_SECRET` para verificar llamadas. Esta variable **sí** requiere variable de entorno del contenedor (es solo un string de validación, no una API key):

**En n8n self-hosted (Hostinger/VPS):**

1. Conéctate por SSH a tu VPS de Hostinger.
2. Edita el archivo `.env` o `docker-compose.yml` del contenedor n8n.
3. Agrega esta línea:

   ```bash
   RIBUZZ_WEBHOOK_SECRET=ribuzz-2025-xyz-aleatorio-largo
   ```

4. Reinicia el contenedor: `docker compose restart n8n` o el comando equivalente.

**Alternativa rápida sin SSH:** En el nodo `Validate Input`, reemplaza `$env.RIBUZZ_WEBHOOK_SECRET` por el valor literal directamente en el código JavaScript. Funciona pero queda visible en el JSON del workflow.

---

## 4. Activar el webhook

1. En el editor del workflow, clic en el nodo **Webhook (entry)** (el primero del flow).
2. En el panel de la derecha verás dos URLs:
   - **Test URL:** úsala mientras estás probando (solo funciona si tienes el editor abierto y "Execute workflow" activo).
   - **Production URL:** la definitiva. Algo como:
     ```
     https://n8n.srv1097452.hstgr.cloud/webhook/ribuzz-diagnostic
     ```
3. **Copia la Production URL.** La vamos a meter en `.env.local` de la app.

4. En el toggle de arriba a la derecha del editor (`Inactive ⇄ Active`), pásalo a **Active**. Si no lo activas, la URL de producción devuelve 404.

5. Guarda el workflow con el botón **Save** (esquina superior derecha).

---

## 5. Conectar la app Next.js al webhook

1. Abre `C:\Users\User\Documents\RiBuzzAi\ribuzz-ai\.env.local` en tu editor.
2. Agrega estas dos líneas al final:

   ```
   N8N_WEBHOOK_URL=https://n8n.srv1097452.hstgr.cloud/webhook/ribuzz-diagnostic
   N8N_WEBHOOK_SECRET=ribuzz-2025-xyz-aleatorio-largo
   ```

   **Importante:** el valor de `N8N_WEBHOOK_SECRET` aquí debe ser **exactamente el mismo** que pusiste en n8n en el paso 3. Si no coincide, n8n rechaza la llamada con error de validación.

3. Guarda el archivo.

---

## 6. Correr la migración `0004_processing_jobs.sql`

Antes de probar end-to-end, falta crear la tabla que rastrea el progreso del job.

1. Ve a tu dashboard Supabase → **SQL Editor**.
2. Limpia el editor.
3. Abre `C:\Users\User\Documents\RiBuzzAi\ribuzz-ai\supabase\migrations\0004_processing_jobs.sql` y copia todo su contenido.
4. Pégalo en el SQL Editor de Supabase y clic en **Run**.
5. Debe decir **"Success. No rows returned"**.

---

## 7. Probar el flujo completo

1. En la terminal donde corre Next.js, mata el servidor con **Ctrl + C**.
2. Vuelve a arrancar: `npm run dev` (necesita releer `.env.local`).
3. Abre `http://localhost:3000/profile`. Verás tu diagnóstico anterior en estado "En progreso" o similar.
4. Si ya tienes uno completo de respuestas y solo falló el procesamiento, ve a `/processing?d=<el-uuid-de-tu-diagnostic>` o usa el botón **Reintentar** desde la pantalla de error.
5. **Otra opción más limpia:** elimina el diagnóstico anterior desde Supabase Table Editor y haz uno nuevo desde cero.

Cuando la app dispare el procesamiento, verás:

- En la pantalla `/processing`: una barra de progreso que avanza con etiquetas tipo "Agente 4: Redactando tu reporte".
- En n8n: si vas al workflow y abres **Executions** (menú izquierdo), verás la ejecución en vivo, nodo por nodo, con los datos que pasan entre ellos.
- En Supabase: la tabla `processing_jobs` se va actualizando con `current_phase` y `progress_pct`. Cuando termina, los resultados aparecen en `scores`, `reports`, `playbooks`, `leads`.

---

## 8. Troubleshooting

| Síntoma | Causa probable | Fix |
|---|---|---|
| `n8n_webhook_failed 404` | Workflow no está Active o la URL de producción no es la correcta | Activa el workflow; revisa que `N8N_WEBHOOK_URL` apunte a `/webhook/` (no `/webhook-test/`) |
| `Invalid webhook secret` en n8n logs | El secret de la app y de n8n no coinciden | Verifica que `N8N_WEBHOOK_SECRET` en `.env.local` y `RIBUZZ_WEBHOOK_SECRET` en n8n sean idénticos |
| Postgres connection failed | Contraseña BD incorrecta o SSL no activado | Reset password en Supabase → reconfigurar credencial Postgres en n8n |
| Anthropic 401 / nodos modelo en rojo | Credencial `RiBuzz Anthropic` no asignada o API key inválida | En cada nodo `Anthropic Chat Model` → dropdown Credential → selecciona `RiBuzz Anthropic`; verifica saldo en console.anthropic.com |
| Job se queda en `running` sin avanzar | Algún nodo falló silenciosamente | Abre la ejecución en n8n → Executions → busca el nodo rojo y mira el error |
| Resultados llegan pero el panel /admin no los muestra | RLS bloquea al usuario común; admin requiere email en `ADMIN_EMAILS` | Verifica que `jdbb2108@gmail.com` esté en `ADMIN_EMAILS` y que sea el email con el que estás logueado |

---

## 9. Iterar prompts sin redeploy

Esta es la razón principal por la que movimos a n8n. Para cambiar el system prompt de un agente:

1. Abre el workflow en n8n.
2. Doble-click en el nodo del agente (ej. `Agente 4: Reporter`).
3. En el panel de la derecha, busca el campo **JSON Body** y edita el texto del campo `"system"`.
4. **Save** (no requiere desactivar/reactivar el workflow).
5. La próxima ejecución usa el nuevo prompt.

Para versionar fuera de n8n, mantén `docs/agent-prompts.md` actualizado cada vez que cambies algo importante. Es la única fuente de verdad si algún día migras o haces fork.

---

## 10. Próximos pasos sugeridos

Una vez que el flow básico funcione end-to-end:

- **Branch de error global:** conectar el nodo `Job → failed (on error)` a errors de cada agente para que un fallo en cualquier paso marque el job como failed con mensaje útil (hoy solo lo marca si falla la validación inicial).
- **Persistir raw outputs:** los `raw_ai_response` de cada agente ahora solo se guardan parcialmente en scores. Considera agregarlos a una tabla `agent_runs` separada para auditoría completa.
- **Follow-up flow:** un segundo workflow n8n que escucha "diagnostic completed" y dispara WhatsApp/email/Google Sheets.
- **A/B testing de prompts:** duplica un workflow, modifica un agente, asigna 50/50 vía un nodo Switch en función del diagnostic_id.
