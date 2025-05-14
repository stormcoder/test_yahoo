#!/bin/bash

curl -X POST http://localhost:3000/api/tests/run \
-H "Content-Type: application/json" \
-d '{
  "testNames": ["Scenario: Check cryptocurrency data display"],
  "tags": [],
  "suite": ""
}'