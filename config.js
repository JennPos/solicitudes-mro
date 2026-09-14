/* Configuración del sitio MRO — se edita aquí, sin recompilar nada.
 *
 * MRO_API_BASE vacío  → la página guarda en el navegador de cada quien
 *                       (sirve para probar, NO para operar: cada dispositivo
 *                        ve sus propios datos y MRO no recibe las solicitudes).
 * MRO_API_BASE con URL → todos comparten los mismos datos a través del Lambda.
 *
 * Pon aquí la URL del API Gateway una vez desplegado el backend (ver README):
 *   window.MRO_API_BASE = 'https://XXXXXXXX.execute-api.us-west-2.amazonaws.com/prod';
 */
window.MRO_API_BASE = '';

/* Clave del API Gateway, si el stage la exige (mismo esquema que las demás apps). */
window.MRO_API_KEY = '';
