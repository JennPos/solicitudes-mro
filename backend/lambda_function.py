"""
Backend del almacén MRO — Lambda + S3.

Guarda cuatro colecciones como un JSON por colección en S3:

    mro/solicitudes.json   solicitudes de material de las áreas
    mro/movimientos.json   entradas, salidas y ajustes del inventario
    mro/fichas.json        cambios a la ficha de una parte (mínimo, ubicación…)
    mro/reqs.json          requisiciones de compra

Cada colección es un objeto {id: documento}. El front las lee completas y
escribe documento por documento, así que no hacen falta índices ni una base
de datos: son unos cuantos miles de renglones al año.

Rutas (API Gateway HTTP API, payload v2):

    GET    /mro/{coleccion}         -> [documentos]
    PUT    /mro/{coleccion}/{id}    -> guarda (reemplaza) un documento
    DELETE /mro/{coleccion}/{id}    -> borra un documento

Variables de entorno:

    MRO_DATA_BUCKET   bucket de S3 donde vive mro/*.json   (obligatoria)
    MRO_ALLOW_ORIGIN  origen permitido por CORS            (default: *)

Concurrencia: se reescribe el JSON completo de la colección en cada escritura.
Si dos personas guardan en el mismo segundo, gana la última. Para el volumen
de este almacén es suficiente; si algún día estorba, el siguiente paso es
DynamoDB con una fila por documento, sin cambiar el contrato de estas rutas.
"""

import json
import os
import boto3
from botocore.exceptions import ClientError

BUCKET = os.environ.get("MRO_DATA_BUCKET", "")
ORIGIN = os.environ.get("MRO_ALLOW_ORIGIN", "*")
COLECCIONES = {"solicitudes", "movimientos", "fichas", "reqs"}

s3 = boto3.client("s3")


def _cors():
    return {
        "Access-Control-Allow-Origin": ORIGIN,
        "Access-Control-Allow-Headers": "Content-Type,Authorization,x-api-key",
        "Access-Control-Allow-Methods": "GET,PUT,DELETE,OPTIONS",
    }


def _responder(codigo, cuerpo):
    cabeceras = {"Content-Type": "application/json"}
    cabeceras.update(_cors())
    return {"statusCode": codigo, "headers": cabeceras,
            "body": json.dumps(cuerpo, ensure_ascii=False)}


def _clave(coleccion):
    return "mro/%s.json" % coleccion


def _leer(coleccion):
    try:
        obj = s3.get_object(Bucket=BUCKET, Key=_clave(coleccion))
        return json.loads(obj["Body"].read().decode("utf-8"))
    except ClientError as e:
        if e.response["Error"]["Code"] in ("NoSuchKey", "404"):
            return {}          # colección que todavía no existe
        raise
    except ValueError:
        return {}              # archivo corrupto: se empieza de nuevo


def _escribir(coleccion, datos):
    s3.put_object(
        Bucket=BUCKET,
        Key=_clave(coleccion),
        Body=json.dumps(datos, ensure_ascii=False).encode("utf-8"),
        ContentType="application/json",
    )


def lambda_handler(event, context):
    if not BUCKET:
        return _responder(500, {"error": "Falta la variable MRO_DATA_BUCKET"})

    ctx = event.get("requestContext", {}).get("http", {})
    metodo = ctx.get("method") or event.get("httpMethod") or "GET"
    ruta = ctx.get("path") or event.get("rawPath") or event.get("path") or ""

    if metodo == "OPTIONS":
        return {"statusCode": 204, "headers": _cors(), "body": ""}

    partes = [p for p in ruta.split("/") if p]
    if not partes or partes[0] != "mro":
        return _responder(404, {"error": "Ruta desconocida: %s" % ruta})

    coleccion = partes[1] if len(partes) > 1 else ""
    doc_id = "/".join(partes[2:]) if len(partes) > 2 else ""

    if coleccion not in COLECCIONES:
        return _responder(400, {"error": "Colección no válida: %s" % coleccion})

    try:
        if metodo == "GET":
            datos = _leer(coleccion)
            return _responder(200, list(datos.values()))

        if metodo == "PUT":
            if not doc_id:
                return _responder(400, {"error": "Falta el id del documento"})
            cuerpo = json.loads(event.get("body") or "{}")
            if not isinstance(cuerpo, dict):
                return _responder(400, {"error": "El documento debe ser un objeto"})
            cuerpo["id"] = doc_id
            datos = _leer(coleccion)
            datos[doc_id] = cuerpo
            _escribir(coleccion, datos)
            return _responder(200, cuerpo)

        if metodo == "DELETE":
            if not doc_id:
                return _responder(400, {"error": "Falta el id del documento"})
            datos = _leer(coleccion)
            datos.pop(doc_id, None)
            _escribir(coleccion, datos)
            return _responder(200, {"ok": True})

        return _responder(405, {"error": "Método no permitido: %s" % metodo})

    except Exception as e:                      # noqa: BLE001
        return _responder(500, {"error": str(e)})
