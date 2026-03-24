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



## User Management

### List All Users
**GET** `/admin/users/`
- **Permission**: `IsAdmin` (requires `role: "admin"`)
- **Public**: No
- **Pagination**: Yes (default 50 per page)
- **Description**: Get paginated list of all users with filtering and search capabilities

**Query Parameters:**
- `page` - Page number (1-indexed)
- `page_size` - Number of results to return per page
- `role` - Filter by role: "guest", "host", "admin"
- `status` - Filter by status: "active", "inactive"
- `verified` - Filter by verification: "email", "phone"
- `search` - Search by email, username, or phone

**Response:** `200 OK`
```json
{
  "count": 422,
  "next": "https://app.alpha.openscaler.net/api/v1/admin/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 96,
      "email": "user@example.com",
      "phone": "+213675706769",
      "username": "user_123",
      "profile_picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=user_123",
      "role": "guest",
      "is_active": true,
      "is_staff": false,
      "is_superuser": false,
      "is_email_verified": true,
      "is_phone_verified": false,
      "rating": 4.3,
      "rating_count": 30,
      "created_at": "2026-03-25T14:25:55.471609Z",
      "updated_at": "2026-03-24T14:26:11.847742Z",
      "last_login": null
    },
    {
      "id": 412,
      "email": "host@example.com",
      "phone": "+213538339789",
      "username": "host_user",
      "profile_picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=host_user",
      "role": "host",
      "is_active": true,
      "is_staff": false,
      "is_superuser": false,
      "is_email_verified": true,
      "is_phone_verified": false,
      "rating": 4.1,
      "rating_count": 48,
      "created_at": "2026-03-25T14:25:55.471609Z",
      "updated_at": "2026-03-24T14:27:16.347460Z",
      "last_login": null
    },
    {
      "id": 8,
      "email": "admin@kerya.com",
      "phone": null,
      "username": "kerya_admin",
      "profile_picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=kerya_admin",
      "role": "admin",
      "is_active": true,
      "is_staff": true,
      "is_superuser": true,
      "is_email_verified": false,
      "is_phone_verified": false,
      "rating": 0,
      "rating_count": 0,
      "created_at": "2026-03-24T14:25:55.585168Z",
      "updated_at": "2026-03-24T14:25:55.620984Z",
      "last_login": null
    }
  ]
}
```

**Response Model:**

Each user object contains:
- `id` - Integer ID of the user
- `email` - Email address (max 254 chars)
- `phone` - Phone number (max 128 chars, nullable)
- `username` - Username (max 150 chars, nullable)
- `profile_picture` - Profile picture URL (max 200 chars, nullable)
- `role` - User role: "guest", "host", or "admin"
- `is_active` - Whether user account is active
- `is_staff` - Django staff flag
- `is_superuser` - Superuser status flag
- `is_email_verified` - Whether email is verified
- `is_phone_verified` - Whether phone is verified
- `rating` - User rating (decimal, read-only)
- `rating_count` - Number of ratings (read-only)
- `created_at` - Account creation timestamp
- `updated_at` - Last account update timestamp
- `last_login` - Last login timestamp (nullable)

### Get User Details
**GET** `/admin/users/{id}/`
- **Permission**: `IsAdmin`
- **Public**: No

**Response:** `200 OK`
```json
{
  "id": 412,
  "email": "host@example.com",
  "phone": "+213538339789",
  "username": "host_user",
  "profile_picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=host_user",
  "role": "host",
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "is_email_verified": true,
  "is_phone_verified": true,
  "rating": 4.8,
  "rating_count": 45,
  "created_at": "2026-03-15T08:00:00Z",
  "updated_at": "2026-03-24T10:00:00Z",
  "last_login": "2026-03-24T14:45:00Z"
}
```

### Update User Information
**PATCH** `/admin/users/{id}/`
- **Permission**: `IsAdmin`
- **Public**: No
- **Allowed Fields**: `role`, `is_active`, `is_staff`, `is_email_verified`, `is_phone_verified`

**Request:**
```json
{
  "role": "host",
  "is_active": true,
  "is_email_verified": true
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "host",
  "is_active": true,
  "updated_at": "2026-03-24T16:00:00Z"
}
```

### Ban User
**POST** `/admin/users/{id}/ban_user/`
- **Permission**: `IsAdmin`
- **Public**: No
- **Effect**: Deactivates user account, prevents login

**Request:**
```json
{
  "reason": "Violation of terms of service"
}
```

**Response:** `200 OK`
```json
{
  "status": "user_banned",
  "message": "User user@example.com has been banned",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "is_active": false
  }
}
```

### Unban User
**POST** `/admin/users/{id}/unban_user/`
- **Permission**: `IsAdmin`
- **Public**: No
- **Effect**: Reactivates a previously banned user account

**Response:** `200 OK`
```json
{
  "status": "user_unbanned",
  "message": "User user@example.com has been reactivated",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "is_active": true
  }
}
```

### Promote User to Host
**POST** `/admin/users/{id}/promote_to_host/`
- **Permission**: `IsAdmin`
- **Public**: No
- **Effect**: Changes user role from "guest" to "host"

**Response:** `200 OK`
```json
{
  "status": "promoted_to_host",
  "message": "User user@example.com has been promoted to host",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "user_123",
    "role": "host"
  }
}
```

### Demote Host to Guest
**POST** `/admin/users/{id}/demote_to_guest/`
- **Permission**: `IsAdmin`
- **Public**: No
- **Effect**: Changes user role from "host" to "guest"

**Response:** `200 OK`
```json
{
  "status": "demoted_to_guest",
  "message": "User user@example.com has been demoted to guest",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "user_123",
    "role": "guest"
  }
}
```

### Get User Statistics
**GET** `/admin/users/stats/`
- **Permission**: `IsAdmin`
- **Public**: No
- **Description**: Get overview of user distribution and status

**Response:** `200 OK`
```json
{
  "total_users": 1500,
  "active_users": 1475,
  "inactive_users": 25,
  "by_role": {
    "guest": 1200,
    "host": 285,
    "admin": 15
  },
  "email_verified": 1350,
  "phone_verified": 1200,
  "timestamp": "2026-03-24T16:30:00Z"
}
```

---

## Budget Posts Management

### Get Budget Posts Activity
**GET** `/budget-posts/`
- **Permission**: Public (but returnable for logged-in admins)
- **Public**: Yes

---

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
