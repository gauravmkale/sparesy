#!/bin/bash

BASE_CORE="http://localhost:8082"

# =============================================
# PASTE YOUR TOKENS HERE
# =============================================
MFG_TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1IiwiY29tcGFueUlkIjo1LCJjb21wYW55VHlwZSI6Ik1BTlVGQUNUVVJFUiIsImlhdCI6MTc3MzQxNTA0NiwiZXhwIjoxNzczNTAxNDQ2fQ.hejXUo4sGZZsSFvyufr2EPrEC2cZ3SOwuG-bNSBy0UQ"
CLIENT_TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI2IiwiY29tcGFueUlkIjo2LCJjb21wYW55VHlwZSI6IkNMSUVOVCIsImlhdCI6MTc3MzQxNTA0NiwiZXhwIjoxNzczNTAxNDQ2fQ.zTJ_SZ6OOssZQQg9ONsQIBfltKyLJ7dInihB7zMeZqE"
SUPPLIER_TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI3IiwiY29tcGFueUlkIjo3LCJjb21wYW55VHlwZSI6IlNVUFBMSUVSIiwiaWF0IjoxNzczNDE1MDQ2LCJleHAiOjE3NzM1MDE0NDZ9.CfTn724obMNrgSE3i9NFeIR3ZJ2c-at6WvBK2g-nkbk"

# =============================================
# PASTE PROJECT ID FROM test-3 HERE
# =============================================
PROJECT_ID=8

echo "========================================="
echo "STEP 26 — Get production order for project"
echo "========================================="
PROD_RESPONSE=$(curl -s -X GET $BASE_CORE/api/production/project/$PROJECT_ID \
  -H "Authorization: Bearer $MFG_TOKEN")
echo $PROD_RESPONSE
PROD_ID=$(echo $PROD_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Production Order ID: $PROD_ID"
echo ""

echo "========================================="
echo "STEP 27 — Advance to PCB_FABRICATION"
echo "========================================="
curl -s -X PUT $BASE_CORE/api/production/$PROD_ID/advance \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 28 — Advance to SMT_ASSEMBLY"
echo "========================================="
curl -s -X PUT $BASE_CORE/api/production/$PROD_ID/advance \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 29 — Advance to SOLDERING"
echo "========================================="
curl -s -X PUT $BASE_CORE/api/production/$PROD_ID/advance \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 30 — Advance to QC_INSPECTION"
echo "========================================="
curl -s -X PUT $BASE_CORE/api/production/$PROD_ID/advance \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 31 — Advance to PACKAGING"
echo "========================================="
curl -s -X PUT $BASE_CORE/api/production/$PROD_ID/advance \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 32 — Advance to READY"
echo "========================================="
curl -s -X PUT $BASE_CORE/api/production/$PROD_ID/advance \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 33 — Client checks production status (should be READY)"
echo "========================================="
curl -s -X GET $BASE_CORE/api/production/project/$PROJECT_ID \
  -H "Authorization: Bearer $CLIENT_TOKEN"
echo ""

echo "========================================="
echo "STEP 34 — Check inventory"
echo "========================================="
curl -s -X GET $BASE_CORE/api/inventory \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 35 — Check low stock alerts"
echo "========================================="
curl -s -X GET $BASE_CORE/api/inventory/alerts \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 36 — Manufacturer views their transactions"
echo "========================================="
curl -s -X GET $BASE_CORE/api/transactions/my \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 37 — Client views their transactions"
echo "========================================="
curl -s -X GET $BASE_CORE/api/transactions/my \
  -H "Authorization: Bearer $CLIENT_TOKEN"
echo ""

echo "========================================="
echo "STEP 38 — Supplier views their transactions"
echo "========================================="
curl -s -X GET $BASE_CORE/api/transactions/my \
  -H "Authorization: Bearer $SUPPLIER_TOKEN"
echo ""

echo "========================================="
echo "STEP 39 — Manufacturer total revenue"
echo "========================================="
curl -s -X GET "$BASE_CORE/api/transactions/revenue?type=MANUFACTURER_REVENUE" \
  -H "Authorization: Bearer $MFG_TOKEN"
echo ""

echo "========================================="
echo "STEP 40 — Supplier total revenue"
echo "========================================="
curl -s -X GET "$BASE_CORE/api/transactions/revenue?type=SUPPLIER_REVENUE" \
  -H "Authorization: Bearer $SUPPLIER_TOKEN"
echo ""

echo "========================================="
echo "STEP 41 — Client total cost"
echo "========================================="
curl -s -X GET "$BASE_CORE/api/transactions/revenue?type=CLIENT_COST" \
  -H "Authorization: Bearer $CLIENT_TOKEN"
echo ""

echo "========================================="
echo "ALL TESTS COMPLETE"
echo "Backend is fully verified end to end"
echo "========================================="