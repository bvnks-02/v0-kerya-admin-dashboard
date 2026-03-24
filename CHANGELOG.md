# Changelog

## [Unreleased] - 2026-03-24

### Added
- **Event Tickets Management**: New ticket state management system
  - `markTicketUsed()` - Mark ticket as used via `PATCH /tickets/{id}/set-state/?state=used`
  - `expireTicket()` - Expire ticket via `PATCH /tickets/{id}/set-state/?state=expired`
  - `validateTicket()` - Validate ticket via `PATCH /tickets/{id}/set-state/?state=valid`
  - UI with state-specific action buttons on tickets dashboard
  - Confirmation dialogs for ticket state changes

- **Listing Approval Workflow**: Admin approval system for pending listings
  - `updateListingStatus()` - Update listing status via `PATCH /listings/{id}/`
  - Approve/Reject actions with confirmation dialogs
  - Automatic status updates: Approve → "active", Reject → "inactive"
  - Changed fetch endpoint from `/listings/?page=` to `/listings/pending/?page=`

- **Environment Configuration**: API URL externalization
  - Added `NEXT_PUBLIC_API_BASE_URL` environment variable support
  - Created `.env.local` for local configuration (excluded from git)
  - Fallback to hardcoded URL: `https://app.alpha.openscaler.net:9281/api/v1`

- **Enhanced Token Refresh Logic**: Automatic token expiration handling
  - `isTokenExpiredError()` helper to detect token expiry from error responses
  - `redirectToLogin()` helper for graceful session expiration
  - Automatic token refresh on expired token detection (both 401 and `token_not_valid` code)
  - Recursive retry of requests after successful token refresh
  - Session expiration notification on login page with `?session=expired` query param

### Changed
- **lib/api.ts**
  - Externalized API base URL to environment variable with fallback
  - Enhanced `refreshAccessToken()` with proper error handling and automatic redirect
  - Improved `apiCall()` with token expiry detection and automatic retry mechanism
  - Better error message extraction (checks 'detail' field first, then 'message')
  - Added token expiry helpers and redirect logic

- **lib/types.ts**
  - Updated `Ticket` interface to match Event Tickets API response structure:
    - Changed from generic support ticket to event ticket type
    - Added fields: `ticketNumber`, `qrCode`, `ticketType`, `firstName`, `lastName`, `email`, `phone`, `usedAt`, `canBeUsed`
    - Updated status to `'valid' | 'used' | 'expired'`
  - Added `TicketType` interface for ticket type information

- **app/dashboard/tickets/page.tsx**
  - Complete refactor from support tickets to event tickets system
  - Added confirmation dialog for ticket state changes
  - Implemented state-specific action buttons:
    - Valid tickets: Mark Used, Expire buttons
    - Expired tickets: Validate button
  - Changed status filter from `'all' | 'open' | 'in-progress' | 'resolved' | 'closed'` to `'all' | 'valid' | 'used' | 'expired'`
  - Updated column definitions to match new ticket data structure

- **app/dashboard/listings/page.tsx**
  - Added listing approval/rejection workflow
  - Changed fetch endpoint to `/listings/pending/?page=`
  - Added Approve/Reject action buttons
  - Implemented confirmation dialog for approval actions
  - Optimistic UI updates on success

- **app/login/page.tsx**
  - Added session expiration detection via `useSearchParams`
  - Added notification toast when redirected with `?session=expired` query param
  - Added URL cleanup after displaying expiration message

### Fixed
- **Token Expiration Handling**
  - Fixed issue where expired tokens would throw errors instead of automatically refreshing
  - Now detects both HTTP 401 status and `token_not_valid` error code
  - Automatically attempts token refresh before throwing error to user
  - Properly clears tokens and redirects to login on refresh failure
  - Prevents infinite retry loops with max 1 retry attempt

- **Error Message Extraction**
  - Improved error message extraction from API responses
  - Now checks 'detail' field first (preferred by API), then 'message' field
  - Better fallback error messages

### Files Modified
- `lib/api.ts` - Core API client enhancements
- `lib/types.ts` - Updated Ticket type definition
- `app/dashboard/tickets/page.tsx` - Event tickets implementation
- `app/dashboard/listings/page.tsx` - Listing approval workflow
- `app/login/page.tsx` - Session expiration handling
- `.env.local` - Created for environment configuration

### Configuration
- Added `NEXT_PUBLIC_API_BASE_URL` environment variable support
- Created `.env.local` with default API base URL (not committed to git)
- Environment variable has fallback to hardcoded URL for development

### Testing Recommendations
1. **Ticket State Management**
   - Navigate to Event Tickets dashboard
   - Mark valid tickets as used → verify status changes
   - Mark valid tickets as expired → verify status changes
   - Mark expired tickets as valid → verify restore

2. **Listing Approval**
   - Navigate to Pending Listings dashboard
   - Approve pending listing → verify status changes to "active"
   - Reject pending listing → verify status changes to "inactive"

3. **Token Expiration**
   - Let access token expire
   - Make API request → verify automatic refresh and retry
   - Verify no error is thrown to user on successful refresh
   - Kill refresh token → verify redirect to login with session expiration message

4. **Environment Configuration**
   - Modify `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
   - Verify app uses new API base URL
   - Restart dev server for changes to take effect

### Known Limitations / Future Work
- Phase 3 Robustness improvements (optional):
  - Request timeout with AbortController (30s)
  - Exponential backoff retry logic for network errors (max 3 attempts)
  - Standardized error message extraction across all pages
- User management endpoints not implemented (Django admin interface only)
- Pagination for pending listings follows generic implementation

### Migration Notes
- No database migrations needed
- Token storage mechanism unchanged (localStorage + cookies)
- Existing tokens will continue to work
- Session expiration will gracefully redirect users to login

---

## How to Deploy

1. Update `.env.local` with correct API base URL if different from default
2. Ensure API supports:
   - `PATCH /listings/{id}/` for listing status updates
   - `PATCH /tickets/{id}/set-state/?state=` for ticket state management
   - `POST /auth/refresh/` for token refresh
3. Clear browser cache/localStorage to avoid using stale tokens
4. Test token expiration flow before going to production
