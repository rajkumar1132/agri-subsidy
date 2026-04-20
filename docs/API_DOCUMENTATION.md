# API Documentation — Agricultural Subsidy Management System

**Base URL:** `http://localhost:3000/api`  
**Auth:** Bearer token in `Authorization` header  
**Content-Type:** `application/json`

---

## 🔐 Authentication

### POST `/auth/register`
Register a new user.

**Body:**
```json
{
  "name": "Gurpreet Singh",
  "email": "farmer@example.com",
  "password": "password123",
  "contact_no": "9876543210",
  "address": "Ludhiana, Punjab",
  "user_type": "FARMER",
  "aadhaar_no": "123456789012",
  "land_area": 5.5
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "token": "eyJhbG...",
  "user": { "user_id": 1, "name": "Gurpreet Singh", "user_type": "FARMER" }
}
```

### POST `/auth/login`
**Body:** `{ "email": "...", "password": "..." }`  
**Response:** `{ "success": true, "token": "...", "user": {...} }`

### GET `/auth/me` 🔒
Get current authenticated user profile.

---

## 🌾 Farmers

### GET `/farmers` 🔒
List all farmers with user details.

### GET `/farmers/:id` 🔒
Get farmer by ID with profile details.

### GET `/farmers/:id/rentals` 🔒
Get all rentals for a specific farmer.

### GET `/farmers/:id/subsidies` 🔒
Get all subsidy applications for a farmer.

### PUT `/farmers/profile` 🔒 `[FARMER]`
Update farmer profile (contact, address).

---

## 🚜 Equipment

### GET `/equipment` 🔒
List all equipment. Query params: `status`, `type`, `search`

### GET `/equipment/types` 🔒
Get distinct equipment types.

### GET `/equipment/:id` 🔒
Get equipment details with recent rentals.

---

## 🔧 Equipment Owner

### GET `/owners/equipment` 🔒 `[EQUIPMENT_OWNER]`
List owner's equipment.

### POST `/owners/equipment` 🔒 `[EQUIPMENT_OWNER]`
Add new equipment.
**Body:** `{ "name": "...", "type": "Tractor", "rental_rate": 1500 }`

### PUT `/owners/equipment/:id` 🔒 `[EQUIPMENT_OWNER]`
Update equipment details.

### DELETE `/owners/equipment/:id` 🔒 `[EQUIPMENT_OWNER]`
Delete equipment (not if IN_USE).

### GET `/owners/rentals` 🔒 `[EQUIPMENT_OWNER]`
List rentals for owner's equipment.

### POST `/owners/rentals/:id/approve` 🔒 `[EQUIPMENT_OWNER]`
Approve a rental request. Equipment → IN_USE.

### POST `/owners/rentals/:id/complete` 🔒 `[EQUIPMENT_OWNER]`
Mark rental as completed. Equipment → AVAILABLE.

---

## 📋 Rentals

### GET `/rentals` 🔒
List rentals. Farmers see only their own. Query params: `status`, `farmer_id`

### POST `/rentals/book` 🔒 `[FARMER]`
Book equipment.
**Body:** `{ "equipment_id": 1, "duration": 5 }`
**Response:** `{ "success": true, "rental": {...}, "message": "..." }`

### GET `/rentals/:id` 🔒
Get rental details with all related data.

---

## ✅ Verification

### GET `/verify/pending` 🔒 `[VERIFIER, ADMIN]`
List completed but unverified rentals.

### POST `/verify/:id/confirm` 🔒 `[VERIFIER, ADMIN]`
Verify a rental. Sets `verified=true`, `status=VERIFIED`.

### GET `/verify/history` 🔒 `[VERIFIER, ADMIN]`
List all verified rentals.

---

## 💰 Subsidies

### GET `/subsidies` 🔒
List subsidies. Farmers see only their own. Query param: `status`

### POST `/subsidies/apply` 🔒 `[FARMER]`
Apply for subsidy.
**Body:** `{ "rental_id": 1 }`

**Fraud checks performed:**
1. Rental exists
2. Rental belongs to this farmer
3. Rental is VERIFIED
4. No duplicate application exists

**Response (success):**
```json
{
  "success": true,
  "application": { "application_id": 1, "subsidy_amount": 2500 },
  "category": "Small Farmer (50% subsidy)"
}
```

**Response (fraud):**
```json
{
  "error": "FRAUD ALERT: This rental does not belong to you.",
  "fraud_alert": true
}
```

### GET `/subsidies/calculate/:rentalId` 🔒
Preview subsidy calculation for a rental.

### POST `/subsidies/:id/approve` 🔒 `[PROGRAM_OFFICER, ADMIN]`
Approve subsidy. **Body:** `{ "remarks": "..." }`

### POST `/subsidies/:id/reject` 🔒 `[PROGRAM_OFFICER, ADMIN]`
Reject subsidy. **Body:** `{ "remarks": "Reason required" }`

---

## 📊 Reports

### GET `/reports/dashboard` 🔒
Dashboard statistics (counts, totals).

### GET `/reports/rental-history` 🔒
Rental history. Query param: `farmer_id`

### GET `/reports/subsidy-distribution` 🔒 `[ADMIN, PROGRAM_OFFICER]`
Subsidy breakdown by status with recent approvals.

### GET `/reports/fraud-alerts` 🔒 `[ADMIN, PROGRAM_OFFICER]`
Fraud attempt audit logs.

### GET `/reports/monthly-trends` 🔒 `[ADMIN, PROGRAM_OFFICER]`
Monthly rental and subsidy trends (raw SQL aggregation).

---

## 👤 Admin

### GET `/admin/users` 🔒 `[ADMIN]`
List all system users with role details.

### GET `/admin/audit-log` 🔒 `[ADMIN]`
System audit trail. Query params: `action`, `limit`

### DELETE `/admin/users/:id` 🔒 `[ADMIN]`
Delete a user (cannot delete self).

---

## 🔑 Legend

- 🔒 = Requires JWT Bearer token
- `[ROLE]` = Requires specific user role
- Fraud alerts are logged to AUDIT_LOG automatically
