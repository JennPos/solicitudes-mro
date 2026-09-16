# Solicitud de material — MRO

El link que usa toda la planta para pedirle material al almacén MRO.
Pensado para **solicitar.rubber-mexico.com**.

Quien entra se identifica con su cuenta de Google de la empresa, elige el
material del catálogo y manda la solicitud. Esa solicitud **aparece sola en la
bandeja del almacén**, dentro de la sección MRO del portal de compras
(`purchasing.rubber-mexico.com/consolidated/mro_solicitudes`), y de ahí sigue
el flujo de siempre: el almacén la revisa, la surte, avisa y el inventario se
descuenta. Cuando está lista, a quien la pidió le aparece el aviso aquí mismo
y confirma de recibido.

Este sitio **no administra inventario**: no muestra existencias ni permite
mover stock. Sólo pide y da seguimiento.

---

## Qué hay aquí

| Archivo | Para qué |
|---|---|
| `index.html` | El sitio completo. Un archivo, React por CDN, sin build. |
| `config.js` | **Lo único que se edita.** Client ID de Google y URL del API. |
| `amplify.yml` | Publicación estática en AWS Amplify (sin paso de build). |

El backend **no vive aquí**: es `lambdas/mro-publico/handler.py` del repo
`hcarter-4545/vendor-portal`, para que escriba en el mismo archivo de datos que
lee el portal.

## Los tres pasos para ponerlo en línea

### 1. Client ID de Google (opcional, se puede dejar para después)

Sin esto el sitio **ya funciona**: la persona entra escribiendo su correo
@rubber-mexico.com. Lo que cambia es que ese correo no está comprobado, y la
solicitud llega marcada así a la bandeja del almacén.

Para que quede verificado, en la consola de Google Cloud de la empresa: crear
credenciales OAuth tipo **Aplicación web**, autorizar el origen
`https://solicitar.rubber-mexico.com` y copiar el Client ID a `config.js`:

```js
window.MRO_GOOGLE_CLIENT_ID = '....apps.googleusercontent.com';
```

### 2. El backend

En el repo `vendor-portal`, desplegar la función `lambdas/mro-publico/handler.py`
y **colgarla de una ruta `POST /mro-publico` sin el autorizador de Cognito** —
es la única ruta abierta, porque quien pide material no tiene cuenta del portal.
La función necesita estas variables de entorno:

| Variable | Valor |
|---|---|
| `DATA_BUCKET` | el mismo bucket de datos del portal |
| `MRO_GOOGLE_CLIENT_ID` | el Client ID del paso 1 |
| `MRO_DOMINIO` | `rubber-mexico.com` |
| `MRO_ALLOW_ORIGIN` | `https://solicitar.rubber-mexico.com` |

Permisos de la función: leer y escribir `data/mro_solicitudes.json` en ese bucket.

Después, poner la URL del API en `config.js`:

```js
window.MRO_API_BASE = 'https://XXXXXXXX.execute-api.us-west-2.amazonaws.com/prod';
```

### 3. El sitio

Conectar este repositorio a Amplify (sin comandos de build) y apuntar el
dominio `solicitar.rubber-mexico.com`.

## Mientras falte algo

El sitio abre igual y lo dice en pantalla: si falta el Client ID no deja entrar,
y si falta el API avisa que lo capturado no le llega al almacén. Nunca finge que
guardó.

## Por qué el correo lo decide el backend

El navegador manda el token que firma Google; la función lo verifica contra
Google, revisa que la audiencia sea nuestro Client ID y que el dominio sea el de
la empresa, y **de ahí saca el correo**. Nada de lo que el navegador diga sobre
quién es se toma por cierto. Por eso el solicitante sólo puede crear sus
solicitudes y confirmar de recibido las suyas: surtir y descontar inventario
vive del otro lado, en el portal.

## Este repositorio es público

Por eso aquí no hay nada interno: el catálogo que viaja en `index.html` trae
sólo número de parte, descripción, unidad y familia — lo que necesita alguien
para pedir. **Sin existencias, sin ubicaciones de rack, sin proveedores ni
costos.** Esos datos viven del otro lado, en el portal de compras, detrás de su
autenticación.

Si algún día hace falta agregar información al catálogo de este sitio, vale la
pena preguntarse antes si debe leerse en internet abierto.
