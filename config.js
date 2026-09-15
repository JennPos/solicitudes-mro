/* Configuración del portal de solicitudes — se edita aquí, sin recompilar.
 *
 * 1. GOOGLE_CLIENT_ID: el ID de cliente OAuth (tipo "Aplicación web") que se
 *    crea en la consola de Google Cloud de la empresa. Hay que autorizar el
 *    origen https://solicitar.rubber-mexico.com.
 *
 * 2. MRO_API_BASE: la URL del API Gateway del portal de compras — la misma
 *    que usa purchasing.rubber-mexico.com. Ahí vive la ruta /mro-publico,
 *    que recibe la solicitud y la deja donde el almacén la ve.
 *
 * Mientras alguno esté vacío, el sitio abre pero avisa que no está conectado.
 */
window.MRO_GOOGLE_CLIENT_ID = '';
window.MRO_API_BASE = '';

/* Sólo entran las cuentas de este dominio. */
window.MRO_DOMINIO = 'rubber-mexico.com';
