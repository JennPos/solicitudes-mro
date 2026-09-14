# Almacén MRO — Rubber Mexico

Solicitudes de material al almacén MRO: las áreas piden, MRO surte y avisa, y el
inventario se descuenta solo. Incluye catálogo, sugerido de compra, requisiciones
y reportes de consumo.

Pensado para publicarse como **mro.rubber-mexico.com**, un sitio hermano de
gemba / calidad / lab / cnc / production / sales / purchasing.

---

## Qué hay aquí

| Archivo | Para qué |
|---|---|
| `index.html` | El sitio completo. Un solo archivo: React por CDN, sin build. |
| `config.js` | La URL del backend. **Es lo único que hay que editar al desplegar.** |
| `amplify.yml` | Publicación estática en AWS Amplify (sin paso de build). |
| `backend/lambda_function.py` | El backend: guarda las colecciones como JSON en S3. |
| `backend/deploy.sh` | Crea o actualiza ese backend en AWS. |
| `_catalogo_fuente.js` | El catálogo suelto, por si hay que regenerarlo. No lo carga el sitio. |

## Desplegar

### 1. El backend (una vez)

```bash
cd backend
./deploy.sh --crear
```

Crea el bucket `mro-data-<cuenta>`, el rol, la función `mro-bridge` y una API HTTP
en `us-west-2`. Al terminar imprime la URL del API Gateway.

Para actualizar el código después, `./deploy.sh` a secas.

### 2. El sitio

Editar `config.js` con la URL que imprimió el paso anterior:

```js
window.MRO_API_BASE = 'https://XXXXXXXX.execute-api.us-west-2.amazonaws.com/prod';
```

Y publicar el repositorio en Amplify (o en S3 + CloudFront, como purchasing):
conectar el repo, sin comandos de build, y apuntar el dominio
`mro.rubber-mexico.com` a la app.

### 3. Que aparezca en la barra de sitios

La barra negra de arriba la pinta `app-switcher.js`, que sirve cada sitio desde su
propia raíz. Para que **MRO** salga ahí junto a los demás, hay que agregar
`{ id: 'mro', title: 'Almacén MRO' }` a la lista `SITES` de ese archivo y volver a
publicarlo en cada sitio. Este sitio ya carga el switcher, así que desde MRO se ve
el resto del ecosistema aunque ese cambio no se haya hecho.

## Sin backend, no opera

Mientras `MRO_API_BASE` esté vacío, la página funciona pero **guarda en el
navegador de cada quien**: una solicitud capturada en Nave 1 no le llega a MRO.
El encabezado lo dice en todo momento — "Datos compartidos" contra "Sin servidor ·
solo este equipo". Sirve para enseñar el flujo, no para operar.

## Cómo guarda los datos

Cuatro colecciones, un JSON por colección en S3 (`mro/<colección>.json`), cada una
un objeto `{id: documento}`:

- `solicitudes` — lo que piden las áreas y su seguimiento
- `movimientos` — entradas, salidas y ajustes; **el stock se calcula sumándolos**
  sobre el catálogo semilla, no se guarda aparte
- `fichas` — cambios a la ficha de una parte (mínimo, ubicación, proveedor…)
- `reqs` — requisiciones de compra

El front relee cada 12 segundos, así que MRO ve las solicitudes nuevas sin recargar.

## Pendientes conocidos

- **El catálogo está incompleto**: 498 partes de más de 1,000. Salieron del Google
  Sheet "Control de Inventario - MRO 2022-24", que Google no deja exportar completo.
  Falta volver a importarlo desde el xlsx.
- **Los roles son declarados, no verificados**: quien entra elige si trabaja en MRO.
  Al integrarse con la sesión del portal (Cognito), amarrarlos a la cuenta.
- **El grupo "Soporte y administración"** de la lista de áreas está por confirmar;
  los departamentos y áreas de trabajo sí son los reales de la planta.
