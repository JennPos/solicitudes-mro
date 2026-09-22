/* Configuración del portal de solicitudes — se edita aquí, sin recompilar.
 *
 * 1. MRO_API_BASE: a dónde van las solicitudes. Hoy apunta al puente del CNC,
 *    que es el que recibe `/mro-publico` y las guarda donde el almacén las ve.
 *    Su lugar natural sería el Lambda del portal de compras, pero ése corre en
 *    otra cuenta de AWS sin acceso ni workflow de despliegue. El día que se
 *    pueda, se cambia esta línea y ya.
 *
 * 2. MRO_API_KEY: llave de cuota del API. No es un secreto — viaja en el
 *    navegador y es la misma del resto del portal. Quién eres lo decide el
 *    servidor, no esta llave.
 *
 * 3. MRO_GOOGLE_CLIENT_ID: OPCIONAL. Si se llena, la gente entra con el botón
 *    de Google y su correo queda verificado. Si se deja vacío, entran
 *    escribiendo su correo @rubber-mexico.com: funciona igual, pero el correo
 *    no está comprobado y la solicitud se marca así en la bandeja del almacén.
 */
window.MRO_API_BASE = 'https://o6vq4ipn49.execute-api.us-west-2.amazonaws.com/prod';
window.MRO_API_KEY  = 'snTfvuUCJr4jc2IinZGBo7yoY8DFsCUu5mgC9Kj8';
window.MRO_GOOGLE_CLIENT_ID = '';

/* Sólo entran las cuentas de este dominio. */
window.MRO_DOMINIO = 'rubber-mexico.com';
