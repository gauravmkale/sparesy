#!/bin/bash

BASE_AUTH="http://localhost:8081"

echo "========================================="
echo "STEP 1 — Register Manufacturer"
echo "========================================="
curl -s -X POST $BASE_AUTH/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sparesy Manufacturing",
    "email": "manufacturer@sparesy.com",
    "password": "mfg123",
    "type": "MANUFACTURER",
    "pinCode": "400001",
    "contactNumber": "9000000001",
    "gstNumber": "27AAPFU0939F1Z1",
    "address": "101 Factory Road, Mumbai",
    "contactPersonName": "Admin User"
  }'
echo ""

echo "========================================="
echo "STEP 2 — Register Client"
echo "========================================="
curl -s -X POST $BASE_AUTH/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Electronics",
    "email": "client@abc.com",
    "password": "client123",
    "type": "CLIENT",
    "pinCode": "400002",
    "contactNumber": "9000000002",
    "gstNumber": "27AAPFU0939F1Z2",
    "address": "202 Client Street, Mumbai",
    "contactPersonName": "Raj Sharma"
  }'
echo ""

echo "========================================="
echo "STEP 3 — Register Supplier"
echo "========================================="
curl -s -X POST $BASE_AUTH/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "XYZ Components",
    "email": "supplier@xyz.com",
    "password": "supplier123",
    "type": "SUPPLIER",
    "pinCode": "400003",
    "contactNumber": "9000000003",
    "gstNumber": "27AAPFU0939F1Z3",
    "address": "303 Supplier Lane, Mumbai",
    "contactPersonName": "Priya Patel"
  }'
echo ""

echo "========================================="
echo "ALL REGISTRATIONS DONE"
echo "Run test-2-login.sh next"
echo "========================================="