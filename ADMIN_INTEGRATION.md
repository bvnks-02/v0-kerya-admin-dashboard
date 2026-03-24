# Kerya Admin API Integration Guide

## Base URL
```
{API_BASE_URL}/api/v1
```

All admin endpoints require authentication. Admin-only endpoints require either:
- `role == "admin"` OR
- `is_staff == true` (Django staff flag)

---

## Authorization

### Admin Roles
- **Admin User** - `role: "admin"` with `is_staff: true`

### Default Admin Credentials
After running seed command, default admin user:
```
Email: admin@example.com
Username: admin
Password: (set during seed)
Role: admin
is_staff: true
is_superuser: true
```

---

## Listings Management

### Get Pending Listings
**GET** `/listings/pending/`
- **Permission**: `IsAdminUser` (requires `is_staff: true`)
- **Public**: No

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "type": "house",
    "title": "Beautiful Studio",
    "description": "Cozy apartment in city center",
    "owner": {
      "id": "uuid",
      "username": "landlord",
      "email": "host@example.com"
    },
    "wilaya": "Algiers",
    "municipality": "Algiers",
    "lat": 36.7372,
    "lng": 3.0588,
    "capacity": 2,
    "status": "pending",
    "price_per_night": 50.00,
    "created_at": "2026-03-24T10:00:00Z",
    "updated_at": "2026-03-24T10:00:00Z",
    "media": [
      {
        "id": "uuid",
        "image": "https://minio-url/...",
        "order": 1
      }
    ],
    "detail": {
      "house_type": "Studio",
      "rooms": 1,
      "bathrooms": 1,
      "furnished": true,
      "amenities": ["WiFi", "AC", "TV"],
      "rules": ["No smoking"],
      "min_stay": 2,
      "price_per_night": 50.00
    }
  }
]
```

### Approve/Reject Listing
**PATCH** `/listings/{id}/`
- **Permission**: Admin only
- **Public**: No

**Request:**
```json
{
  "status": "active"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "type": "house",
  "status": "active",
  "title": "Beautiful Studio"
}
```

---

## Bookings Management

### List All Bookings
**GET** `/booking/admin/`
- **Permission**: `IsAdmin` (requires `role: "admin"`)
- **Public**: No

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "listing": {
      "id": "uuid",
      "title": "Beautiful Studio",
      "type": "house"
    },
    "guest": {
      "id": "uuid",
      "username": "traveler",
      "email": "guest@example.com",
      "rating": 4.5
    },
    "host": {
      "id": "uuid",
      "username": "landlord",
      "email": "host@example.com",
      "rating": 4.8
    },
    "start_date": "2026-04-01",
    "end_date": "2026-04-05",
    "nights": 4,
    "price_total": 200.00,
    "currency": "DZD",
    "status": "confirmed",
    "created_at": "2026-03-24T10:00:00Z",
    "decision_at": "2026-03-24T11:00:00Z",
    "cancelled_at": null,
    "is_active": true
  }
]
```



## Host Requests Management

### List All Host Requests
**GET** `/host-requests/`
- **Permission**: `is_staff: true` (Admin only)
- **Public**: No

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user": "uuid",
    "message": "I would like to become a host",
    "status": "pending",
    "approved_by": null,
    "approved_at": null,
    "created_at": "2026-03-24T10:00:00Z"
  }
]
```

### Approve Host Request
**PUT/PATCH** `/host-requests/{id}/?decision=approve`
- **Permission**: `role: "admin"` (Admin only)
- **Public**: No
- **Query Params**: `decision` (required: "approve" or "reject")

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user": "uuid",
  "message": "I would like to become a host",
  "status": "approved",
  "approved_by": "uuid",
  "approved_at": "2026-03-24T12:00:00Z",
  "created_at": "2026-03-24T10:00:00Z"
}
```

### Reject Host Request
**PUT/PATCH** `/host-requests/{id}/?decision=reject`
- **Permission**: `role: "admin"` (Admin only)
- **Public**: No
- **Query Params**: `decision` (required: "approve" or "reject")

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user": "uuid",
  "message": "I would like to become a host",
  "status": "rejected",
  "approved_by": "uuid",
  "approved_at": "2026-03-24T12:00:00Z",
  "created_at": "2026-03-24T10:00:00Z"
}
```

---

## Event Tickets Management

### List All Event Tickets (Admin)
**GET** `/tickets/`
- **Permission**: `role: "admin"` (Admin only)
- **Public**: No

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user": "uuid",
    "ticket_type": {
      "id": "uuid",
      "event": "uuid",
      "name": "Standard Ticket",
      "price": 50.00,
      "currency": "DZD"
    },
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+213675706769",
    "ticket_number": "TK-001-12345",
    "qr_code": "data:image/png;base64,...",
    "status": "valid",
    "price": 50.00,
    "created_at": "2026-03-24T10:00:00Z",
    "used_at": null,
    "can_be_used": true
  }
]
```

### Mark Ticket as Used
**PATCH** `/tickets/{id}/set-state/?state=used`
- **Permission**: Admin only
- **Public**: No
- **Query Params**: `state` (required: "used")

**Request:** (no body required)

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "ticket_number": "TK-001-12345",
  "status": "used",
  "used_at": "2026-03-24T15:00:00Z",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Expire Ticket
**PATCH** `/tickets/{id}/set-state/?state=expired`
- **Permission**: Admin only
- **Public**: No
- **Query Params**: `state` (required: "expired")

**Request:** (no body required)

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "ticket_number": "TK-001-12345",
  "status": "expired",
  "can_be_used": false
}
```

### Validate Ticket
**PATCH** `/tickets/{id}/set-state/?state=valid`
- **Permission**: Admin only
- **Public**: No
- **Query Params**: `state` (required: "valid")

**Request:** (no body required)

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "ticket_number": "TK-001-12345",
  "status": "valid",
  "can_be_used": true
}
```



## Budget Posts Management

## Django Admin Interface

### Access Django Admin
**URL**: `{API_BASE_URL}/admin/`

**Credentials**: Use superuser/admin credentials

**Available Models**:
- User Management
- List all users, filter by role, edit user details
- Modify user permissions and staff status

---

## Error Responses

### 403 Forbidden - Not Authorized
```json
{
  "detail": "Not authorized."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 400 Bad Request
```json
{
  "detail": "Error message"
}
```

---

## Authentication Headers

All admin endpoints require JWT token in the Authorization header:

```
Authorization: Bearer {access_token}
```

**Obtain token via:**
- POST `/auth/login/email/` - Email login
- POST `/auth/login/phone/` - Phone login
- POST `/auth/login/google/` - Google OAuth

---

## Common Admin Tasks

### Approve a Pending Listing
1. GET `/listings/pending/` - View all pending listings
2. PATCH `/listings/{id}/` - Update status to "active"

### Manage Host Requests
1. GET `/host-requests/` - View all pending requests
2. PUT `/host-requests/{id}/?decision=approve` - Approve request
3. User automatically gets `role: "host"` when approved

### Monitor Bookings
1. GET `/booking/admin/` - View all platform bookings

### Manage Event Tickets
1. GET `/tickets/` - View all event tickets
2. PATCH `/tickets/{id}/set-state/?state=used` - Mark ticket as used
3. PATCH `/tickets/{id}/set-state/?state=expired` - Expire ticket
4. PATCH `/tickets/{id}/set-state/?state=valid` - Validate ticket
