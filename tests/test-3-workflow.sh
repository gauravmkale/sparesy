#!/bin/bash

BASE_CORE="http://localhost:8082"

# =============================================
# PASTE YOUR TOKENS HERE
# =============================================
MFG_TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1IiwiY29tcGFueUlkIjo1LCJjb21wYW55VHlwZSI6Ik1BTlVGQUNUVVJFUiIsImlhdCI6MTc3MzQxNTA0NiwiZXhwIjoxNzczNTAxNDQ2fQ.hejXUo4sGZZsSFvyufr2EPrEC2cZ3SOwuG-bNSBy0UQ"
CLIENT_TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI2IiwiY29tcGFueUlkIjo2LCJjb21wYW55VHlwZSI6IkNMSUVOVCIsImlhdCI6MTc3MzQxNTA0NiwiZXhwIjoxNzczNTAxNDQ2fQ.zTJ_SZ6OOssZQQg9ONsQIBfltKyLJ7dInihB7zMeZqE"
SUPPLIER_TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI3IiwiY29tcGFueUlkIjo3LCJjb21wYW55VHlwZSI6IlNVUFBMSUVSIiwiaWF0IjoxNzczNDE1MDQ2LCJleHAiOjE3NzM1MDE0NDZ9.CfTn724obMNrgSE3i9NFeIR3ZJ2c-at6WvBK2g-nkbk"

echo "========================================="
echo "STEP 9 — Add component to catalog (manufacturer)"
echo "========================================="
RANDOM_PART="RES-10K-$(date +%s)"
COMPONENT_RESPONSE=$(curl -s -X POST $BASE_CORE/api/components \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MFG_TOKEN" \
  -d "{
    \"name\": \"Resistor 10k Ohm\",
    \"partNumber\": \"$RANDOM_PART\",
    \"category\": \"Resistors\",
    \"description\": \"SMD Resistor 10k Ohm 0805 package\"
  }")
echo $COMPONENT_RESPONSE
COMPONENT_ID=$(echo $COMPONENT_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Component ID: $COMPONENT_ID"
echo ""

echo "========================================="
echo "STEP 10 — Supplier adds component to their catalog"
echo "========================================="
curl -s -X POST $BASE_CORE/api/supplier-components \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPPLIER_TOKEN" \
  -d "{
    \"componentId\": $COMPONENT_ID,
    \"unitPrice\": 0.50,
    \"stockQuantity\": 1000,
    \"leadTimeDays\": 3
  }"
echo ""

echo "========================================="
echo "STEP 11 — View supplier catalog (manufacturer)"
echo "========================================="
curl -s -X GET $BASE_CORE/api/supplier-components/my \
  -H "Authorization: Bearer $SUPPLIER_TOKEN"
echo ""

echo "========================================="
echo "STEP 12 — Client submits a project"
echo "========================================="
PROJECT_RESPONSE=$(curl -s -X POST $BASE_CORE/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "name": "Arduino Shield v1.0",
    "quantity": 100,
    "layerCount": "2",
    "boardThickness": "1.6mm",
    "surfaceFinish": "HASL"
  }')
echo $PROJECT_RESPONSE
PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Project ID: $PROJECT_ID"
echo ""

echo "========================================="
echo "STEP 13 — Client views their own projects"
echo "========================================="
curl -s -X GET $BASE_CORE/api/projects/my \
  -H "Authorization: Bearer $CLIENT_TOKEN"
echo ""

echo "========================================="
echo "STEP 14 — Manufacturer views all projects"
echo "========================================="
curl -s -X GET $BASE_CORE/api/projects \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 15 — Get supplier company id"
echo "========================================="
SUPPLIER_LIST=$(curl -s -X GET $BASE_CORE/api/companies/suppliers \
  -H "Authorization: Bearer $MFG_TOKEN")
echo $SUPPLIER_LIST
SUPPLIER_ID=$(echo $SUPPLIER_LIST | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Supplier Company ID: $SUPPLIER_ID"
echo ""

echo "========================================="
echo "STEP 16 — Manufacturer sends request to supplier"
echo "========================================="
REQUEST_RESPONSE=$(curl -s -X POST $BASE_CORE/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MFG_TOKEN" \
  -d "{
    \"projectId\": $PROJECT_ID,
    \"supplierCompanyId\": $SUPPLIER_ID,
    \"componentId\": $COMPONENT_ID,
    \"quantityNeeded\": 100
  }")
echo $REQUEST_RESPONSE
REQUEST_ID=$(echo $REQUEST_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Request ID: $REQUEST_ID"
echo ""

echo "========================================="
echo "STEP 17 — Supplier views incoming requests"
echo "========================================="
curl -s -X GET $BASE_CORE/api/requests/my \
  -H "Authorization: Bearer $SUPPLIER_TOKEN"
echo ""

echo "========================================="
echo "STEP 18 — Supplier submits quote"
echo "========================================="
curl -s -X PUT "$BASE_CORE/api/requests/$REQUEST_ID/quote?price=45.00&delivery=2026-04-01T00:00:00" \
  -H "Authorization: Bearer $SUPPLIER_TOKEN"
echo ""

echo "========================================="
echo "STEP 19 — Manufacturer views requests for project"
echo "========================================="
curl -s -X GET $BASE_CORE/api/requests/project/$PROJECT_ID \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 20 — Manufacturer approves request"
echo "========================================="
curl -s -X PUT $BASE_CORE/api/requests/$REQUEST_ID/approve \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 21 — Manufacturer creates quote for client"
echo "========================================="
QUOTE_RESPONSE=$(curl -s -X POST $BASE_CORE/api/quotes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MFG_TOKEN" \
  -d "{
    \"projectId\": $PROJECT_ID,
    \"totalPrice\": 5500.00,
    \"leadTimeDays\": 14,
    \"lineItemsJson\": \"[{\\\"description\\\":\\\"Resistor 10k\\\",\\\"qty\\\":100,\\\"unitPrice\\\":0.50,\\\"total\\\":50.00},{\\\"description\\\":\\\"Assembly\\\",\\\"qty\\\":1,\\\"unitPrice\\\":5000.00,\\\"total\\\":5000.00},{\\\"description\\\":\\\"Shipping\\\",\\\"qty\\\":1,\\\"unitPrice\\\":450.00,\\\"total\\\":450.00}]\",
    \"notes\": \"Quote for Arduino Shield v1.0 — 100 units\"
  }")
echo $QUOTE_RESPONSE
QUOTE_ID=$(echo $QUOTE_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Quote ID: $QUOTE_ID"
echo ""

echo "========================================="
echo "STEP 22 — Manufacturer sends quote to client"
echo "========================================="
curl -s -X PUT $BASE_CORE/api/quotes/$QUOTE_ID/send \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 23 — Client views their quote"
echo "========================================="
curl -s -X GET $BASE_CORE/api/quotes/project/$PROJECT_ID \
  -H "Authorization: Bearer $CLIENT_TOKEN"
echo ""

echo "========================================="
echo "STEP 24 — Client approves quote"
echo "triggers: production order + transactions"
echo "========================================="
curl -s -X PUT $BASE_CORE/api/quotes/$QUOTE_ID/approve \
  -H "Authorization: Bearer $CLIENT_TOKEN"
echo ""

echo "========================================="
echo "STEP 25 — Check project status (should be IN_PRODUCTION)"
echo "========================================="
curl -s -X GET $BASE_CORE/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "ALL WORKFLOW TESTS DONE"
echo "Run test-4-production.sh next"
echo "========================================="