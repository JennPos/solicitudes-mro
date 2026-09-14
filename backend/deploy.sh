#!/usr/bin/env bash
# deploy.sh — crea (o actualiza) el backend del almacén MRO en AWS.
#
# Requiere AWS CLI configurado con permisos para Lambda, S3, IAM y API Gateway.
# Mismo patrón que cnc-bridge del repo CNC: Lambda en us-west-2 + bucket de datos.
#
#   ./deploy.sh              # sólo actualiza el código de la función
#   ./deploy.sh --crear      # crea bucket, rol, función y API desde cero
#
set -euo pipefail

REGION="${AWS_REGION:-us-west-2}"
FUNCION="mro-bridge"
BUCKET="${MRO_DATA_BUCKET:-}"
ROL="mro-bridge-role"

cd "$(dirname "$0")"

empaquetar() {
  rm -f function.zip
  zip -q function.zip lambda_function.py
  echo "function.zip listo"
}

if [[ "${1:-}" == "--crear" ]]; then
  CUENTA=$(aws sts get-caller-identity --query Account --output text)
  BUCKET="${BUCKET:-mro-data-$CUENTA}"

  echo "1/5 bucket $BUCKET"
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" 2>/dev/null || echo "  (ya existía)"
  aws s3api put-public-access-block --bucket "$BUCKET" \
    --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

  echo "2/5 rol $ROL"
  aws iam create-role --role-name "$ROL" --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
    >/dev/null 2>&1 || echo "  (ya existía)"
  aws iam attach-role-policy --role-name "$ROL" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  aws iam put-role-policy --role-name "$ROL" --policy-name mro-s3 --policy-document "{
    \"Version\":\"2012-10-17\",
    \"Statement\":[{\"Effect\":\"Allow\",
      \"Action\":[\"s3:GetObject\",\"s3:PutObject\"],
      \"Resource\":\"arn:aws:s3:::$BUCKET/mro/*\"}]}"
  sleep 10   # el rol tarda unos segundos en propagarse

  echo "3/5 función $FUNCION"
  empaquetar
  aws lambda create-function --function-name "$FUNCION" --region "$REGION" \
    --runtime python3.12 --handler lambda_function.lambda_handler \
    --role "arn:aws:iam::$CUENTA:role/$ROL" \
    --timeout 20 --memory-size 256 \
    --environment "Variables={MRO_DATA_BUCKET=$BUCKET,MRO_ALLOW_ORIGIN=https://mro.rubber-mexico.com}" \
    --zip-file fileb://function.zip >/dev/null

  echo "4/5 API HTTP"
  API_ID=$(aws apigatewayv2 create-api --name mro-api --protocol-type HTTP \
    --target "arn:aws:lambda:$REGION:$CUENTA:function:$FUNCION" \
    --cors-configuration AllowOrigins="https://mro.rubber-mexico.com",AllowMethods="GET,PUT,DELETE,OPTIONS",AllowHeaders="Content-Type,Authorization,x-api-key" \
    --region "$REGION" --query ApiId --output text)
  aws lambda add-permission --function-name "$FUNCION" --region "$REGION" \
    --statement-id apigw --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:$CUENTA:$API_ID/*" >/dev/null

  echo "5/5 listo"
  echo
  echo "Pon esta URL en config.js del sitio:"
  aws apigatewayv2 get-api --api-id "$API_ID" --region "$REGION" --query ApiEndpoint --output text
else
  empaquetar
  aws lambda update-function-code --function-name "$FUNCION" --region "$REGION" \
    --zip-file fileb://function.zip --query LastModified --output text
fi
