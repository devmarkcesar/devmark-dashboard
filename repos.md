Tú (Telegram) → devmark-core → Groq AI
                             → Jira (tickets)
                             → Supabase (logs)
                                   ↑
                        devmark-dashboard (visualiza)


Recomendaciones de mejora para devmark
🟡 Prioridad Media
6. Dashboard monolítico
devmark-dashboard/app/page.tsx tiene 600+ líneas. Dividirlo en componentes (AgentCard, ProjectsTab, LogsTab) mejoraría el mantenimiento enormemente.

7. Prompts de agentes hardcodeados en código
Si quieres cambiar el prompt de un agente, tienes que editar código y redeploy. Podrías cargar los prompts desde la columna prompt que ya existe en Supabase, permitiendo editar sin tocar código.

8. Sin datos de uso/métricas reales
tasks_done existe en Supabase pero el dashboard no lo muestra. Agregar una tabla de cuál agente más usas, tiempos de respuesta, etc., te daría visibilidad real.

9. Logs crecen indefinidamente
La tabla logs no tiene política de retención. Con el tiempo pesará mucho. Recomiendo un cron job semanal que borre logs de más de 90 días.

10. La misma lógica de Supabase está en dos lugares
devmark-core/dashboard/ es una copia del dashboard dentro del repo del core. Si son el mismo proyecto, deberías eliminar uno de los dos.

🟢 Prioridad Baja (mejoras de calidad)
11. Variables de entorno sin validación al arrancar
Si falta GROQ_API_KEY o TELEGRAM_TOKEN, el bot arranca y falla en la primera llamada. Mejor validar al inicio con un check explícito.

12. Bot.py duplica orquestador
devmark-core/bot.py es un bot de prueba que tiene lógica similar al orquestador. Si ya no se usa, conviene eliminarlo para evitar confusión.

13. Índices faltantes en Supabase
agents.name se busca constantemente pero no tiene índice. Un simple CREATE INDEX ON agents(name) mejoraría la velocidad de update_agent_status.