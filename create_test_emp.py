import os
import json

db_path = r"c:\Users\tom12\OneDrive\Escritorio\gimnasio\db.phdata"
with open(db_path, "r", encoding="utf-8") as f:
    db = json.loads(f.read())

if "users" not in db:
    db["users"] = []

# Find or create a test employee
test_emp = next((u for u in db["users"] if u.get("email") == "emp@test.com"), None)
if test_emp:
    test_emp["perms"] = []
    test_emp["role"] = "Empleados"
else:
    db["users"].append({
        "id": 999999999,
        "name": "Test Employee",
        "email": "emp@test.com",
        "role": "Empleados",
        "perms": []
    })

with open(db_path, "w", encoding="utf-8") as f:
    f.write(json.dumps(db, indent=2))
print("Test employee emp@test.com created/updated with NO permissions.")
