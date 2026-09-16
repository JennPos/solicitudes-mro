/* Configuración del portal de solicitudes — se edita aquí, sin recompilar.
 *
 * 1. GOOGLE_CLIENT_ID: OPCIONAL. Si se llena, la gente entra con el botón de
 *    Google y su correo queda verificado. Si se deja vacío, entran escribiendo
 *    su correo @rubber-mexico.com — funciona igual, pero el correo no está
 *    comprobado y la solicitud se marca así en la bandeja del almacén.
 *    Se crea en la consola de Google Cloud de la empresa, autorizando el
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
