# Lynx Chatbot — Plugin de WordPress

Chatbot RAG (Retrieval Augmented Generation) que responde **únicamente** con el contenido publicado en tu sitio WordPress, usando Gemini de Google AI Studio.

- **Backend gratis**: Gemini (`gemini-2.5-flash-lite` por defecto) + embeddings (`text-embedding-004`).
- **RAG sobre tus posts/páginas**: indexación automática al publicar/editar + botón "Reindexar todo".
- **Widget flotante** en el frontend + shortcode `[lynx_chatbot]` para insertarlo en una página concreta.
- **Sin dependencias externas**: solo PHP + JS vanilla. No requiere `npm`, ni base de datos extra.
- Diseñado para sitios pequeños (decenas de posts, ~10 usuarios/semana). Para más volumen habría que migrar el almacenamiento de vectores a algo más serio.

## Instalación

1. Crea una API key gratuita en https://aistudio.google.com/apikey.
2. Empaqueta la carpeta `lynx-chatbot/` en un ZIP:
   ```bash
   cd wordpress-plugin
   zip -r lynx-chatbot.zip lynx-chatbot
   ```
3. En WordPress: **Plugins → Añadir nuevo → Subir plugin → Subir ZIP → Activar**.
4. Ve a **Ajustes → Lynx Chatbot** y pega la API key.
5. Pulsa **"Reindexar ahora"** para generar los embeddings de tus posts y páginas.
6. Visita el frontend: aparece un botón flotante en la esquina inferior derecha.

## Configuración recomendada

| Campo                | Valor por defecto             | Notas                                                                                  |
|----------------------|-------------------------------|----------------------------------------------------------------------------------------|
| Modelo de chat       | `gemini-2.5-flash-lite`       | Rápido y barato. Para respuestas más cuidadas: `gemini-2.5-flash` o `gemini-2.5-pro`.  |
| Modelo de embeddings | `text-embedding-004`          | Gratis en la capa free. Si cambias de modelo, **reindexa todo** otra vez.              |
| Top_K                | 5                             | Fragmentos recuperados por consulta.                                                   |
| Tamaño de fragmento  | 1200 caracteres               | Sube a 1800-2400 si tus posts son técnicos y largos.                                   |
| Solapamiento         | 150 caracteres                | Ayuda a no cortar frases entre fragmentos.                                             |

## System prompt por defecto

```
Eres el asistente del sitio Lynx Capital. Responde ÚNICAMENTE con información presente
en el CONTEXTO proporcionado más abajo. Si la respuesta no está claramente en el
contexto, responde exactamente: "No tengo esa información en el contenido del sitio."
No inventes datos, no uses conocimiento externo, no especules. Responde en castellano,
de forma clara y concisa. Cita el título del post o página de donde sacas la
información cuando sea útil.
```

Si el bot empieza a "alucinar" o responde sobre temas fuera del sitio, **refuerza el prompt**: añade ejemplos de preguntas que debe rechazar y una frase como "antes de responder, comprueba que cada afirmación está literalmente en el contexto".

## Cómo funciona

1. **Indexación**: al guardar un post, el plugin trocea el contenido en fragmentos, llama al endpoint `embedContent` de Gemini para obtener un vector por fragmento, y los guarda en la tabla `wp_lynx_chatbot_embeddings`.
2. **Consulta del usuario**: el JS del widget envía el mensaje + las últimas 10 turnos al endpoint REST `lynx-chatbot/v1/chat`.
3. **Recuperación**: el backend embebe la pregunta, calcula coseno contra todos los fragmentos (en PHP, en memoria) y se queda con los `top_k` más cercanos.
4. **Generación**: monta un prompt con `systemInstruction` + historial + contexto + pregunta, y llama a `generateContent`.
5. **Respuesta**: devuelve texto + lista de fuentes (post_id, título y URL).

## Endpoints REST

- `POST /wp-json/lynx-chatbot/v1/chat` — público, requiere `X-WP-Nonce` (incluido automáticamente por el widget).
- `POST /wp-json/lynx-chatbot/v1/reindex` — solo admins. Reindexa todo.

## Shortcode

Inserta el chat en una página o post concretos:

```
[lynx_chatbot]
```

El widget flotante se puede desactivar desde los ajustes si quieres usar solo el shortcode.

## Avisos legales / RGPD

- En la capa gratuita de Google AI Studio, **Google puede usar las entradas y salidas para mejorar sus modelos**. Esto incluye las preguntas que escriben tus visitantes.
- Para servicios dirigidos a usuarios en la UE, los términos estrictos de Gemini requieren capa de pago. Para 10 usuarios/semana el coste real con `gemini-2.5-flash-lite` son céntimos al mes.
- **Añade un aviso en tu política de privacidad** indicando que las consultas al asistente se procesan en servidores de Google (EE.UU.) y pueden usarse para mejorar sus modelos.

## Costes

Con la capa gratuita y los modelos por defecto, **0 €** para uso normal. Si te quedas sin cuota gratuita:

- `text-embedding-004`: gratis hasta cierto volumen / muy barato después.
- `gemini-2.5-flash-lite`: < 0,10 USD / 1 M tokens de entrada en el momento de escribir esto.

Para 10 usuarios/semana con conversaciones de 5-10 turnos, el coste estimado mensual es de **céntimos**.

## Limitaciones conocidas

- El cálculo de similitud se hace en PHP cargando todos los vectores. A partir de ~5.000 fragmentos esto empieza a notarse. Para ese volumen toca migrar a una solución vectorial (pgvector, Pinecone, etc.).
- No hay rate limiting por usuario; si abres el sitio al mundo conviene añadir uno (p. ej. con un plugin de seguridad como Wordfence o un cache CDN delante).
- No guarda historial entre sesiones (cada recarga empieza de cero).

## Estructura de archivos

```
lynx-chatbot/
├── lynx-chatbot.php             # cabecera + bootstrap
├── includes/
│   ├── class-plugin.php         # ciclo de vida + settings por defecto
│   ├── class-gemini-client.php  # cliente REST de Gemini (embed + chat)
│   ├── class-indexer.php        # troceo + indexación + hooks de save_post
│   ├── class-retriever.php      # coseno + construcción de contexto
│   ├── class-rest-api.php       # /chat y /reindex
│   ├── class-admin.php          # página de ajustes
│   └── class-frontend.php       # encolado + render del widget + shortcode
└── assets/
    ├── js/chatbot.js            # widget vanilla JS
    ├── js/admin.js              # botón "Reindexar"
    └── css/chatbot.css          # estilos del widget
```

## Desarrollo

No hay paso de build. Edita los archivos, recarga el sitio. Si tocas el JS/CSS, sube `LYNX_CHATBOT_VERSION` en `lynx-chatbot.php` para invalidar el caché del navegador.
