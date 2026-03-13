#!/bin/bash

BASE_AUTH="http://localhost:8081"
BASE_CORE="http://localhost:8082"

echo "========================================="
echo "STEP 4 — Login as Manufacturer"
echo "========================================="
curl -s -X POST $BASE_AUTH/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manufacturer@sparesy.com","password":"mfg123"}'
echo ""

echo "========================================="
echo "STEP 5 — Login as Client"
echo "========================================="
curl -s -X POST $BASE_AUTH/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@abc.com","password":"client123"}'
echo ""

echo "========================================="
echo "STEP 6 — Login as Supplier"
echo "========================================="
curl -s -X POST $BASE_AUTH/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"supplier@xyz.com","password":"supplier123"}'
echo ""

echo "========================================="
echo "Copy the three tokens above"
echo "Paste them into test-3-workflow.sh"
echo "========================================="