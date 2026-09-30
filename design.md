CORPTRACK
Corp Member CDS Attendance, Clearance & Service Lifecycle Platform

Product Type: Reusable web/PWA platform
Primary Users: Corp Members, CDS Presidents/CDS Admins, Super Administrators
Target Scale: 10,000+ registered Corp Members
Architecture: React + Vite + TypeScript + Bootstrap + Vercel Functions + Neon PostgreSQL + Vercel Blob
Design Direction: Realistic, official administrative/government portal; clean, responsive, practical; no flashy AI-generated UI.

PART 1 — PRODUCT OVERVIEW
1.1 Product Name

CorpTrack

CorpTrack is a reusable Corp Member management platform designed to manage:

Corp Member registration
NYSC State Code parsing
Deployment state
Deployment year
Batch and stream
CDS groups
CDS Presidents/Admins
CDS attendance sessions
GPS-based attendance verification
Clearance periods
Nigerian public holidays
Attendance history
Attendance reports
Batch-based POP lifecycle
Automatic Alumni transition
Device binding
Lost-device recovery
Admin management
Audit logging
PWA installation
Privacy and cookie notices

The system should be designed as a reusable platform rather than a one-off attendance website.

PART 2 — CORE PRODUCT PRINCIPLES

The system must follow these principles:

1. Server is authoritative

Never trust the browser for:

identity
role
CDS group
attendance eligibility
POP status
batch
location distance
attendance status
clearance
public holiday status
member ID
admin permissions

The server must verify everything.

2. One member = one active device

Each Corp Member can have only one registered active device.

3. One device = one member

A registered device cannot simultaneously be bound to multiple Corp Member accounts.

4. Passed-out members are never deleted

When a member reaches POP:

ACTIVE
   ↓
POP DATE REACHED
   ↓
ALUMNI

Historical attendance remains available.

5. Attendance is session-based

A CDS President/Admin creates an attendance session for a specific group, date, time, venue and radius.

6. Attendance rules are centralized

All attendance eligibility checks should go through a central backend service/function.

Example:

canMemberAttend(member, session)
7. Designed for 10,000+ members

The application must use:

database indexing
server-side filtering
pagination
efficient queries
connection pooling/serverless-compatible database access
idempotency
unique constraints
rate limiting
background processing for heavy tasks
PART 3 — TECHNOLOGY STACK
Frontend
React
Vite
TypeScript
Bootstrap 5.3+
Custom CSS
SweetAlert2
Browser Geolocation API
PWA APIs
Responsive design

Bootstrap should provide:

grid
navbar
sidebar/offcanvas
cards
tables
forms
modals
dropdowns
badges
pagination
spacing
responsive utilities

Custom CSS should provide the actual CorpTrack visual identity.

Do not make the application look like an untouched Bootstrap template.

Backend

Use:

Vercel Serverless Functions / API routes
TypeScript
Neon PostgreSQL
Vercel server-side environment variables/secrets
Vercel Blob for logo/files

There is no separately managed Express/Node server.

Vercel server-side functions still execute backend JavaScript/TypeScript.

Infrastructure
GitHub
   ↓
Vercel
   ├── React/Vite frontend
   └── Server-side Functions/API
           ↓
       Neon PostgreSQL
           ↓
       Vercel Blob
PART 4 — BRANDING & UI DESIGN
Visual direction

CorpTrack should resemble a modern official administrative portal.

Avoid:

excessive gradients
glassmorphism everywhere
excessive animations
neon colors
oversized decorative cards
AI-dashboard appearance
unnecessary 3D effects
fake terminal interfaces

The interface should look like software used by an actual organization.

Color system

Primary:

NYSC-inspired green

Supporting:

White
Dark neutral
Red for errors/destructive/absent
Yellow for warnings/pending/clearance
Green for successful/present/active

Use colors consistently.

Example semantic usage:

Green    → Present / Active / Success
Red      → Absent / Error / Destructive
Yellow   → Clearance / Pending / Warning
Neutral  → Historical / Inactive
Logo

Super Admin can upload the CorpTrack logo.

Logo:

stored in Vercel Blob
served securely
maintains aspect ratio
can be displayed circularly where appropriate

The logo should not be represented only as text.

Splash screen

On PWA launch:

CorpTrack logo
      ↓
subtle zoom in
      ↓
subtle zoom out
      ↓
Login

Animation should be short and professional.

Do not create artificial long loading times.

PART 5 — USER TYPES
5.1 Corp Member

Can:

register
log in using State Code
view dashboard
view CDS group
view batch/stream
view attendance
sign attendance when eligible
view clearance
export attendance
recover account/device
view profile
log out

Cannot:

access admin
change CDS group
change batch
change POP date
modify attendance
access another member
manipulate GPS distance
register multiple active devices
5.2 CDS Admin / President

Scoped to exactly one CDS group.

Can:

view group members
start attendance
end attendance
configure venue
use current location
set attendance radius
monitor attendance
view group attendance
export group reports
manage group clearance where permission allows

Cannot:

access other CDS groups
create other admins
modify global system settings
change batch POP dates
manage Super Admins
5.3 Super Admin

Full system access.

Can:

manage members
manage Alumni
manage admins
manage CDS groups
manage batches
manage POP dates
manage attendance
manage clearance
manage public holidays
manage branding
manage settings
view reports
view audit logs
reset member devices
suspend accounts
perform administrative corrections
PART 6 — NYSC STATE CODE

Expected example:

OS/26A1/1502

Meaning:

OS       = deployment state
26       = deployment year
A1       = Batch A, Stream 1
1502     = member number

Supported batch/stream combinations:

A1
A2
B1
B2
C1
C2

The system must preserve the original State Code.

Store parsed fields separately.

raw_state_code
deployment_state
deployment_year
batch
stream
member_number

Do not hard-code assumptions about future NYSC code formats.

The parser should validate the expected format while preserving the raw value.

PART 7 — MEMBER REGISTRATION

Registration fields:

Full Name
State Code
CDS Group

The system parses the State Code automatically.

Example:

State Code:
OS/26A1/1502

Parsed:

State: Osun
Year: 2026
Batch: A
Stream: 1
Number: 1502

No member password is required under the current passwordless design.

Because State Code is not a secret, device binding and recovery controls are mandatory.

PART 8 — AUTHENTICATION
Member authentication

Initial model:

State Code
   +
Registered device
   ↓
Authenticated member session

Member credentials should not be stored in:

localStorage
sessionStorage

Use secure cookies/session mechanisms.

Admin authentication

Admin login:

Username
Password

Password:

Argon2id hash
never plaintext

Recommended:

rate limiting
secure sessions
Super Admin 2FA
reauthentication for sensitive actions
PART 9 — DEVICE BINDING
Rule
One Member ↔ One Active Device

One Device ↔ One Member

Database constraints must enforce this.

Suggested table:

member_devices

id
member_id
device_binding_hash
device_name
platform
first_seen_at
last_seen_at
last_ip
status
revoked_at
created_at
updated_at

Constraints:

UNIQUE(member_id)
UNIQUE(device_binding_hash)

Do not depend solely on a weak browser-generated fingerprint.

Use a server-issued device credential stored securely, preferably through an HttpOnly/Secure/SameSite cookie mechanism or equivalent secure browser credential.

PART 10 — LOST DEVICE RECOVERY

If the member loses their device:

New Device
   ↓
State Code
   ↓
Device Not Recognized
   ↓
Recover Account
   ↓
Security Verification
   ↓
Verification succeeds
   ↓
New device registration
   ↓
Old device revoked
Security questions

Primary question:

What is your assigned CDS Group?

The answer must be checked against the actual server-side cds_group_id.

Do not simply compare arbitrary text.

Recommended additional verification:

Assigned CDS Group
Deployment State
Batch/Stream

The system can require at least two successful checks.

For example:

2 out of 3 correct

For stronger deployments, add OTP/passkey recovery later.

Device recovery rules

When approved:

Revoke old device.
Invalidate old device session.
Register new device.
Invalidate old device credential.
Record audit event.
Allow login on new device.

The member should not simply enter their State Code on another device and bypass the device restriction.

Admin device reset

Super Admin:

Member
   ↓
Device Management
   ↓
Reset Device
   ↓
Confirmation/Re-authentication
   ↓
Old device revoked
   ↓
Member can perform recovery on new device

Log:

Device Reset
Member
Old device
New device
Admin
Timestamp
Reason
PART 11 — CDS GROUPS

Each CDS group has:

name
normal_attendance_day
status
assigned_admin

Example:

Education → Thursday
Health → Friday

There is no requirement to manually create every future attendance date.

The recurring day is informational/configurational.

Actual attendance occurs through sessions.

PART 12 — ATTENDANCE SESSION

A CDS President creates a session.

Fields:

CDS Group
Date
Start Time
End Time
Location
Radius

Example:

Education
8 October 2026
9:00 AM
12:00 PM
Latitude: ...
Longitude: ...
Radius: 200m
ATTENDANCE SESSION STATES
SCHEDULED
   ↓
OPEN
   ↓
CLOSED

Before start:

CLOSED

President clicks Start:

OPEN

Members can sign in.

President clicks End:

CLOSED

The configured end time should automatically close the session.

PART 13 — LOCATION SETUP

President can:

Option A

Enter location manually.

Option B

Use:

Use Current Location

Browser requests location permission.

The browser returns:

latitude
longitude

The server stores the venue location for that session.

Important:

The President's location establishes the attendance venue.

It does not mean the system uses the President's location as the member's location.

PART 14 — MEMBER GEOLOCATION

When member attempts attendance:

Browser
   ↓
Request location permission
   ↓
Current member coordinates
   ↓
Secure backend request
   ↓
Server calculates distance

Never trust:

distance = 87

from the browser.

The server calculates:

distance(venue_coordinates, member_coordinates)

Example:

Actual distance = 87m
Allowed radius = 200m

87 ≤ 200
ALLOW

Another:

Actual distance = 742m
Allowed radius = 200m

742 > 200
REJECT
PART 15 — CENTRAL ATTENDANCE ELIGIBILITY

Implement a centralized backend service:

canMemberAttend(member, session)

It checks:

✓ authenticated
✓ account active
✓ not Alumni
✓ POP date not reached
✓ correct CDS group
✓ session exists
✓ session is OPEN
✓ current date is correct
✓ current server time is valid
✓ not clearance
✓ not public holiday
✓ within radius
✓ not already signed

If any required condition fails:

ATTENDANCE REJECTED

Return a clear reason without leaking sensitive internal information.

PART 16 — ATTENDANCE DUPLICATION PROTECTION

A member can tap multiple times.

The backend must remain safe.

Use:

Application-level idempotency

and:

Database constraint
UNIQUE(session_id, member_id)

This guarantees one attendance record per member per session.

PART 17 — CLEARANCE

Clearance is CDS-group specific.

Example:

Education
October 1–7

Health
October 2–8

During clearance:

Sign In → Disabled

Member can still:

view history
view profile
export attendance

Status:

CLEARANCE

Clearance should not count as absence.

It should not reduce attendance percentage.

After the clearance period ends, normal attendance resumes.

CLEARANCE PERMISSIONS

Recommended:

CDS President/Admin

Can manage their assigned group's clearance.

Super Admin

Can manage all clearance periods.

If the organization later wants only Super Admin to control clearance, permissions should be configurable.

PART 18 — PUBLIC HOLIDAYS

Create:

public_holidays

Fields:

id
name
start_date
end_date
source
active
created_at
updated_at

Fixed holidays may be seeded.

Movable/religious holidays should be managed using authoritative/current declarations rather than permanently assuming dates.

Super Admin can:

add
edit
disable
delete
define date ranges

Attendance engine checks holidays automatically.

A public holiday should:

prevent normal attendance
not count as absence
not reduce attendance percentage
PART 19 — BATCH & POP MANAGEMENT

Members do not enter individual POP dates.

Instead, POP is configured at the service-cycle level.

Example:

OS/26B1

A corresponding service cycle can have:

Expected POP:
Configured by Super Admin

Recommended service-cycle structure:

Deployment State
Deployment Year
Batch
Stream
Expected POP Date
Status

This allows state-specific differences if required.

AUTOMATIC POP PROCESS

System continuously evaluates active members.

When:

current_date >= expected_pop_date

members belonging to that service cycle transition:

ACTIVE
   ↓
ALUMNI

No ordinary manual action is required.

POP EFFECT

After POP:

Member status = ALUMNI

Member:

disappears from Current Corp Members
appears in Alumni
retains attendance history
retains reports
can export historical attendance
cannot sign new attendance

Dashboard:

SERVICE COMPLETED

Status:
ALUMNI

POP Date:
...

Attendance:
...

[View History]
[Export PDF]
[Export PNG]
PART 20 — ALUMNI

Alumni records must never be deleted simply because service ended.

Alumni section:

search
filter
State Code
batch
stream
CDS group
POP date
attendance %
export

Historical records remain linked.

PART 21 — MEMBER DASHBOARD

Display:

Welcome, Daniel

State Code
OS/26A1/1502

CDS Group
Education

Batch
A1

Status
ACTIVE

Expected POP
...

Today's Attendance
[Eligible / Closed / Present / Clearance / Holiday]

Attendance summary:

Scheduled Days
Present
Absent
Clearance
Public Holidays
Attendance %

Main actions:

Sign Attendance
Attendance History
Export
Profile
PART 22 — ADMIN DASHBOARD

Super Admin dashboard:

Total Members
Active Members
Alumni
CDS Groups
Open Sessions
Today's Attendance

Recent activity:

Member registered
Attendance session started
Device reset
Admin created
POP configuration changed
PART 23 — MEMBER MANAGEMENT

Support:

search by name
search State Code
deployment state
deployment year
batch
stream
A1
A2
B1
B2
C1
C2
CDS group
status
attendance percentage
registration date

Quick filters:

ALL
A1
A2
B1
B2
C1
C2

Use server-side filtering.

Never download all 10,000+ members to the browser.

PART 24 — REPORTING

Individual reports:

Name
State Code
Deployment State
Batch
Stream
CDS Group
Attendance history
Present
Absent
Clearance
Public Holidays
Attendance %
POP Date

Group reports:

CDS group attendance
date
batch
attendance %
present/absent

Batch reports:

service cycle
active members
alumni
attendance statistics
EXPORT

Support:

PDF
PNG
CSV/Excel as an additional reporting capability

Do not make attendance requests wait for heavy report generation.

Heavy exports can use asynchronous/background processing.

PART 25 — ATTENDANCE CALCULATION

Example:

Scheduled CDS days: 20

Present: 15
Clearance: 3
Public holidays: 2
Absent: 0

Attendance denominator:

20 - 3 - 2 = 15

Attendance:

15 / 15 × 100 = 100%

Clearance and public holidays should not unfairly reduce attendance.

The exact reporting formula should be implemented centrally so every dashboard/report uses the same calculation.

PART 26 — DATABASE DESIGN
members
id
full_name
raw_state_code
deployment_state
deployment_year
batch
stream
member_number
cds_group_id
status
created_at
updated_at

Indexes:

raw_state_code
deployment_state
deployment_year
batch
stream
cds_group_id
status
admins
id
name
username
password_hash
role
cds_group_id
status
last_login_at
created_at
updated_at

Unique:

username
cds_groups
id
name
normal_attendance_day
status
created_at
updated_at
service_cycles / batches
id
deployment_state
deployment_year
batch
stream
expected_pop_date
status
created_at
updated_at

Unique logical combination:

deployment_state
deployment_year
batch
stream
attendance_sessions
id
cds_group_id
date
start_time
end_time
status
latitude
longitude
radius_meters
started_at
ended_at
created_by
created_at
updated_at

Indexes:

cds_group_id
date
status
attendance_records
id
session_id
member_id
sign_in_time
latitude
longitude
distance_meters
status
created_at

Unique:

(session_id, member_id)

Indexes:

member_id
session_id
sign_in_time
clearance_periods
id
cds_group_id
start_date
end_date
status
created_by
created_at
updated_at
public_holidays
id
name
start_date
end_date
source
active
created_at
updated_at
member_devices
id
member_id
device_binding_hash
device_name
platform
first_seen_at
last_seen_at
last_ip
status
revoked_at
created_at
updated_at

Unique:

member_id
device_binding_hash
audit_logs
id
actor_type
actor_id
action
entity
entity_id
metadata
ip_address
user_agent
created_at

Protect audit logs from ordinary modification.

sessions

Secure application sessions.

Use secure server-side session management.

settings

System-wide configuration:

key
value
updated_by
updated_at

Do not use this as a replacement for properly structured relational data where relational tables are appropriate.

PART 27 — API DESIGN

Example endpoint structure:

/api/auth/member/login
/api/auth/member/recover
/api/auth/member/device
/api/auth/logout

/api/auth/admin/login
/api/auth/admin/logout

/api/member/profile
/api/member/dashboard
/api/member/attendance
/api/member/attendance/sign-in
/api/member/export

/api/admin/members
/api/admin/alumni
/api/admin/cds-groups
/api/admin/batches
/api/admin/attendance
/api/admin/clearance
/api/admin/holidays
/api/admin/admins
/api/admin/reports
/api/admin/settings
/api/admin/audit-logs
/api/admin/devices

Every authenticated endpoint must perform:

Authentication
+
Authorization
+
Validation
+
Business-rule verification
+
Rate limiting where appropriate
+
Audit logging where appropriate

Never trust:

member_id
role
cds_group_id
admin_id
attendance status
distance
POP status

supplied by the frontend.

PART 28 — SECURITY ARCHITECTURE
Authentication
secure sessions
HttpOnly cookies
Secure cookies
SameSite cookies
session expiration
session rotation
logout invalidation
no auth credentials in localStorage/sessionStorage
Password security

Admin passwords:

Argon2id

Never plaintext.

Rate limiting

Protect:

login
member recovery
device registration
attendance sign-in
admin actions
API endpoints
export requests

Rate limits should be appropriate to each endpoint.

CSRF

Use a suitable CSRF protection strategy for cookie-authenticated state-changing requests.

Combine with:

SameSite cookies
Origin/Referer validation where appropriate
server-side CSRF tokens where required

CORS must never be treated as an authentication mechanism.

SQL injection

Use parameterized queries/prepared statements.

Never concatenate untrusted SQL values.

XSS

Use:

React's safe rendering model
output encoding
sanitization for any rich content
Content Security Policy
secure headers

Avoid unsafe HTML rendering unless explicitly required and sanitized.

IDOR / BOLA protection

A user must not be able to modify:

/member/123

to:

/member/124

and see another member.

Every resource must be authorized server-side.

CDS Admins must be scoped to their assigned CDS group.

Privilege escalation protection

Never accept:

role=super_admin

from the browser.

Role comes from authenticated server-side identity.

Session security

Protect against:

session fixation
session theft
session replay
stale sessions

Rotate session identifiers when appropriate.

Attendance anti-fraud

Server validates:

member status
CDS group
POP
session
time
date
clearance
holiday
GPS distance
duplicate attendance

Server calculates GPS distance.

Replay protection

Use:

short-lived authenticated sessions
request validation
idempotency
unique DB constraints
server timestamps
File upload security

For logo/files:

MIME validation
extension validation
size limits
safe filenames
no executable files
private credentials never exposed
secure Blob access
Security headers

Implement where appropriate:

Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Frame protection
Vercel/Neon secrets

Never expose:

Neon credentials
database connection secrets
Vercel Blob private credentials
signing secrets
administrative secrets

to the React client.

Use server-side Vercel Environment Variables/secrets.

PART 29 — AUDIT LOGGING

Log important actions:

Admin login
Failed admin login
Member login
Device registration
Device reset
Device revocation
Member registration
Attendance session creation
Attendance start
Attendance end
Attendance correction
Clearance creation
Clearance change
Holiday change
Batch change
POP change
Admin creation
Admin disabling
Role changes
Member suspension
Important settings changes

Audit entry should include:

actor
action
entity
entity_id
timestamp
IP where appropriate
metadata
PART 30 — ADMIN CONFIRMATION REQUIREMENTS

Sensitive actions should require explicit confirmation.

Examples:

Reset Device
Change POP Date
Disable Admin
Change CDS Assignment
Correct Attendance
Suspend Member
Delete/Disable Holiday
Change Important System Settings

For especially sensitive actions:

Re-authentication

may be required.

Use SweetAlert2 confirmations rather than browser confirm().

PART 31 — PWA

Create:

manifest.webmanifest
service worker
icons

Configuration:

display: standalone
start_url: /login
background_color: white
theme_color: CorpTrack primary
PWA flow
PWA Launch
   ↓
Splash Screen
   ↓
Login

Never start directly in an unsecured dashboard.

Android

Use the browser's supported install mechanism.

Provide an install prompt when supported.

Hide it after installation.

iOS

Provide custom instructions:

1. Tap Share
2. Tap Add to Home Screen
3. Tap Add

Installation is not authentication.

PART 32 — COOKIE NOTICE

First visit:

Floating cookie/privacy notice.

Example controls:

Necessary cookies and similar technologies are used
to keep CorpTrack secure and functional.

[Privacy Policy]
[Terms]
[Accept]

Authentication cookies remain security-critical and must use secure cookie attributes.

PART 33 — TERMS & CONDITIONS

Public route:

/terms

Include:

acceptance
registration
State Code use
device binding
attendance
location verification
CDS responsibilities
clearance
public holidays
POP/alumni
account security
prohibited use
suspension
data retention
service changes
administrative corrections
contact information
PART 34 — PRIVACY POLICY

Public route:

/privacy

Explain collection and use of:

full name
State Code
deployment information
CDS group
attendance
GPS/location data
device information
IP address where collected
timestamps
audit records

Explain:

purpose
access
security
retention
sharing where applicable
user rights
contact

Do not claim compliance with a specific law unless the legal requirements have actually been reviewed for the deployment jurisdiction.

PART 35 — PUBLIC ROUTES
/
 /login
 /register
 /terms
 /privacy
 /contact
MEMBER ROUTES
/member
/member/attendance
/member/profile
ADMIN ROUTES
/admin
/admin/members
/admin/alumni
/admin/batches
/admin/cds-groups
/admin/attendance
/admin/clearance
/admin/holidays
/admin/admins
/admin/reports
/admin/settings
/admin/audit-logs

Admin routes must be protected server-side.

PART 36 — RESPONSIVE DESIGN

Support:

Android phones
iPhones
Tablets
Laptops
Desktop

Mobile should use:

responsive Bootstrap grid
offcanvas sidebar
touch-friendly controls
readable tables
horizontal scrolling where necessary
responsive cards

Do not simply shrink desktop tables until they become unusable.

PART 37 — MVP
MVP Objective

Build the smallest complete production-capable CorpTrack system.

MVP must include
Authentication
Member State Code login
Admin username/password login
secure sessions
device binding
device recovery
Registration
member registration
State Code parser
CDS group selection
Administration
Super Admin
CDS Admin/President
RBAC
group scoping
CDS
create groups
assign admins
normal attendance day
Attendance
session creation
start/end
location
radius
GPS verification
duplicate prevention
attendance history
Clearance
group-specific clearance
attendance disabled during clearance
Public holidays
holiday management
attendance exclusion
Batch
batch/stream management
expected POP
Lifecycle
automatic ACTIVE → ALUMNI
Reports
member attendance
group attendance
basic PDF/PNG export
PWA
manifest
service worker
splash
install support
Legal
cookie notice
terms
privacy
Security
RBAC
rate limiting
secure cookies
Argon2id
CSRF
validation
audit logs
security headers
database constraints
PART 38 — MVP PHASE PLAN
Phase 1 — Foundation

Build:

Vite
React
TypeScript
Bootstrap
custom theme
routing
API structure
database connection
configuration
error handling
Phase 2 — Database

Create:

members
admins
CDS groups
service cycles
attendance sessions
attendance records
clearance
holidays
devices
audit logs
sessions
settings

Add indexes and foreign keys.

Phase 3 — Authentication

Implement:

admin login
member login
sessions
device binding
device recovery
logout
rate limiting
Phase 4 — Member

Build:

registration
dashboard
profile
attendance
history
export
Phase 5 — Admin

Build:

dashboard
member management
groups
batches
attendance
clearance
holidays
reports
Phase 6 — Lifecycle

Implement:

ACTIVE
→ POP
→ ALUMNI

Automatic server-side transition.

Phase 7 — PWA

Implement:

manifest
service worker
icons
splash
install prompt
iOS instructions
Phase 8 — Security Hardening

Test:

SQL injection
XSS
CSRF
IDOR
privilege escalation
brute force
session attacks
duplicate attendance
replay
device takeover
unauthorized CDS access
parameter tampering
Phase 9 — Reporting

Implement:

PDF
PNG
CSV/Excel if included
server-side filtering
Phase 10 — Production

Test:

10,000+ members
concurrent attendance
serverless database connections
rate limiting
database performance
export load
mobile GPS behavior
PWA behavior
PART 39 — EPR / ENGINEERING PRODUCT REQUIREMENTS
Engineering Rule 1

Frontend is never authoritative.

Engineering Rule 2

All business rules live on the backend.

Engineering Rule 3

All database writes are validated.

Engineering Rule 4

All sensitive actions are auditable.

Engineering Rule 5

All attendance writes are idempotent.

Engineering Rule 6

Database constraints enforce critical uniqueness.

Engineering Rule 7

Admin scope is enforced server-side.

Engineering Rule 8

Location distance is calculated server-side.

Engineering Rule 9

POP status is calculated from service-cycle configuration.

Engineering Rule 10

Alumni records remain historically accessible.

PART 40 — ERROR STATES

Every important operation needs clear states.

Examples:

Member login
Invalid State Code
Account inactive
Device not recognized
Account already bound to another device
Recovery required
Session expired
Attendance
Attendance closed
Not your CDS group
Outside attendance radius
Clearance period active
Public holiday
Already signed
Service completed
POP reached
Location unavailable
Location permission denied
GPS accuracy insufficient
Device recovery
Verification failed
Too many attempts
Recovery temporarily locked
Device registration failed

Use SweetAlert2 for user-facing feedback.

PART 41 — OBSERVABILITY

Track:

API errors
authentication failures
attendance failures
database failures
rate-limit events
device recovery events
important administrative changes

Do not log sensitive secrets or unnecessary personal information.

PART 42 — PERFORMANCE

For 10,000+ members:

Never:

SELECT * FROM members

and send all records to React.

Use:

pagination
filters
search
indexes
selected columns

Example:

GET /api/admin/members?page=1&limit=25&batch=A1

Use indexed queries.

PART 43 — SERVERLESS DATABASE HANDLING

Because Vercel functions can scale horizontally:

use Neon serverless-compatible database access
use connection pooling/serverless driver as appropriate
avoid creating unmanaged persistent database connections
keep transactions short
avoid unnecessary queries

Attendance transaction example:

BEGIN

verify member
verify session
verify eligibility
calculate distance
check duplicate
insert attendance

COMMIT

If duplicate constraint triggers:

already recorded

without creating a second record.

PART 44 — SECURITY TEST CASES
Authentication

Test:

Wrong State Code
Wrong admin password
Brute force
Session expiration
Session reuse
Logout
Device

Test:

Member A → Device 1
Member A → Device 2
Member B → Device 1
Device reset
Lost device recovery
Revoked device

Expected:

One active device per member.
One member per device.
Attendance

Test:

Inside radius
Outside radius
Session closed
Wrong group
Clearance
Holiday
After POP
Duplicate request
Multiple rapid taps
Authorization

Test:

CDS Admin Group A → Group B
Member → another member
Admin → Super Admin endpoint

All unauthorized attempts must fail.

PART 45 — UX FLOW
Member
Landing
 ↓
Register/Login
 ↓
Device verification
 ↓
Dashboard
 ↓
Today's Attendance
 ↓
Sign In
 ↓
Location permission
 ↓
Server verification
 ↓
Present
New device
Login
 ↓
Device not recognized
 ↓
Recover Account
 ↓
Security Questions
 ↓
Verification
 ↓
Register Device
 ↓
Dashboard
CDS President
Login
 ↓
Dashboard
 ↓
Attendance
 ↓
Create Session
 ↓
Use Current Location
 ↓
Set Radius
 ↓
Start
 ↓
Members Sign In
 ↓
Monitor
 ↓
End
POP
Service Cycle
 ↓
POP date reached
 ↓
Server lifecycle process
 ↓
Members become ALUMNI
 ↓
Removed from active list
 ↓
Historical attendance retained
PART 46 — MASTER DEVELOPMENT PROMPT
COPY THIS INTO THE DEVELOPMENT/AI CODING ENVIRONMENT

Build a production-ready reusable web/PWA platform called CorpTrack.

CorpTrack is a Corp Member/CDS attendance, clearance, batch lifecycle and alumni management platform designed for 10,000+ registered Corp Members.

Use:

React
Vite
TypeScript
Bootstrap 5.3+
Custom CSS
SweetAlert2
Vercel
Vercel server-side Functions/API routes
Neon PostgreSQL
Vercel Blob
GitHub
Browser Geolocation API
PWA technologies

Do not create a separately managed Express/Node server.

Use Vercel server-side functions for backend/API logic.

The frontend must be responsive on Android, iOS, tablets, laptops and desktop.

The UI must look like a realistic official administrative/government portal. Do not create a flashy AI-generated dashboard. Avoid excessive gradients, glassmorphism, neon effects, oversized decorative cards and unnecessary animations.

Use Bootstrap extensively for the layout and responsive components, but customize the design with CSS so it does not look like a default Bootstrap template.

Use an NYSC-inspired visual direction:

green primary
white background
dark neutral text
red for errors/absent/destructive
yellow for warnings/clearance/pending
green for active/present/success

Use SweetAlert2 instead of browser alert/confirm dialogs.

USER ROLES

Implement:

Corp Member
CDS Admin/President
Super Admin

CDS Admins must be restricted to exactly one assigned CDS group.

Super Admin has full system access.

Never trust frontend role/group/member IDs.

STATE CODE

Support State Codes such as:

OS/26A1/1502

Parse:

deployment state
deployment year
batch
stream
member number

Support:

A1
A2
B1
B2
C1
C2

Preserve the raw State Code.

Do not hard-code future State Code assumptions.

REGISTRATION

Member registration requires:

Full Name
State Code
CDS Group

No conventional member password.

Because State Code is not a secret, implement secure device binding and account recovery.

DEVICE SECURITY

Enforce:

ONE MEMBER = ONE ACTIVE DEVICE
ONE DEVICE = ONE MEMBER

Use a server-issued secure device credential.

Do not rely solely on weak browser fingerprints.

Do not store authentication credentials in localStorage or sessionStorage.

Store device information server-side.

Database constraints must enforce uniqueness.

LOST DEVICE

If a member uses another device:

Show:

Device not recognized

Allow:

Recover Account

Ask security questions based on known registration data.

Primary question:

What is your assigned CDS Group?

Also support:

deployment state
batch/stream

Prefer at least two successful verification checks.

Verify answers against server-side member data.

Do not trust frontend-provided CDS group.

After successful recovery:

revoke old device
invalidate old device session
register new device
record audit log
allow login

Allow Super Admin to perform a controlled device reset.

AUTHENTICATION

Members:

State Code
+
registered device

Admins:

Username
+
password

Admin passwords must use Argon2id.

Implement:

secure sessions
HttpOnly cookies
Secure cookies
SameSite
session expiration
session rotation where appropriate
logout invalidation
rate limiting
CSRF protection

Do not put authentication state in localStorage/sessionStorage.

Recommend 2FA for Super Admin.

CDS GROUPS

Each group has:

name
normal attendance day
active status
assigned CDS Admin/President

Example:

Education → Thursday

Health → Friday

Do not manually generate every future attendance date.

ATTENDANCE

CDS President/Admin creates a session containing:

CDS group
date
start time
end time
latitude
longitude
allowed radius

Provide:

Use Current Location

to obtain the venue coordinates.

The President's location is the attendance venue location.

Members provide their own current location when signing attendance.

The server calculates the distance.

Never trust a client-provided distance.

Example:

87m <= 200m
ALLOW

742m > 200m
REJECT

Attendance states:

SCHEDULED
OPEN
CLOSED

President can manually end a session.

Configured end time automatically closes it.

CENTRAL ATTENDANCE RULE

Implement:

canMemberAttend(member, session)

Server-side checks:

authenticated
active account
not Alumni
POP not reached
correct CDS group
session open
correct date
correct time
not clearance
not public holiday
within radius
not already signed

Any failed mandatory condition rejects attendance.

DUPLICATE ATTENDANCE

Use both:

idempotency
database unique constraint

Constraint:

UNIQUE(session_id, member_id)

Multiple taps must never produce multiple attendance records.

CLEARANCE

Clearance is CDS-group specific.

Fields:

group
start date
end date
status
creator

During clearance:

sign-in disabled
member can view attendance
member can export history
status is CLEARANCE
clearance does not count as absence
clearance does not reduce attendance percentage

After clearance ends, normal attendance resumes.

CDS Admin can manage their group clearance.

Super Admin can manage all clearance.

PUBLIC HOLIDAYS

Implement a public holiday table.

Allow Super Admin to:

add
edit
disable
delete

Support date ranges.

Fixed holidays may be seeded.

Movable/religious holidays must be configurable rather than permanently assuming dates.

During a public holiday:

attendance is blocked
holiday is not absence
attendance percentage is not reduced
BATCH / POP

Do not allow each member to enter an individual POP date.

Manage POP at service-cycle level.

Service cycle contains:

deployment state
deployment year
batch
stream
expected POP date
status

When current date reaches the configured POP date:

ACTIVE → ALUMNI

The transition must happen automatically.

Members are not deleted.

After POP:

member leaves Current Corp Members
appears under Alumni
retains all historical attendance
can view/export history
cannot sign new attendance
DATABASE

Create relational PostgreSQL tables for:

members
admins
cds_groups
service_cycles
attendance_sessions
attendance_records
clearance_periods
public_holidays
member_devices
sessions
audit_logs
settings

Use foreign keys.

Use unique constraints.

Use appropriate indexes.

Do not use huge unindexed queries.

ADMIN MEMBER LIST

Support:

name search
State Code search
deployment state
deployment year
batch
stream
A1
A2
B1
B2
C1
C2
CDS group
status
attendance percentage
registration date

Use server-side filtering and pagination.

Never send 10,000+ records to the browser at once.

DASHBOARDS

Member dashboard:

name
State Code
CDS group
batch
stream
status
expected POP
today's attendance
attendance percentage
history
export

Alumni dashboard should show:

SERVICE COMPLETED

and prevent attendance.

Super Admin dashboard:

total members
active members
alumni
CDS groups
open sessions
recent activity

CDS Admin dashboard must show only their assigned group.

REPORTING

Implement:

individual attendance reports
CDS group reports
batch reports
attendance percentage
clearance
public holidays
POP date

Support:

PDF
PNG
CSV/Excel where included

Do not block normal attendance requests with expensive export operations.

PWA

Create:

manifest
service worker
icons
splash screen

Set:

display: standalone
start_url: /login

Flow:

PWA launch
→ splash
→ login

Android should use the browser's supported install prompt.

iOS should provide:

Share
→ Add to Home Screen
→ Add

PWA installation must never be treated as identity verification.

LEGAL

Create:

/terms

and:

/privacy

Also create a first-visit cookie/privacy notice.

Terms should explain:

account registration
State Code
device binding
attendance
GPS/location
CDS
clearance
public holidays
POP
Alumni
account security
prohibited use
suspension
retention
changes
contact

Privacy should explain:

personal data
State Code
deployment information
CDS
attendance
location
device
IP/timestamps where collected
purposes
access
retention
security
rights
contact

Do not make unsupported legal compliance claims.

SECURITY

Implement:

Argon2id
secure cookies
HttpOnly
Secure
SameSite
CSRF
rate limiting
input validation
output encoding
XSS protection
SQL injection protection
parameterized queries
IDOR/BOLA protection
RBAC
privilege escalation protection
session security
replay protection
idempotency
duplicate constraints
file upload validation
secure headers
audit logging
secure server secrets

Server must be authoritative.

Never trust:

role
member ID
CDS group ID
attendance status
distance
POP status
admin ID

from the frontend.

AUDIT LOGS

Record:

logins
failed logins
device registration
device reset
device revocation
attendance session creation
attendance start/end
attendance corrections
clearance changes
public holiday changes
batch changes
POP changes
admin creation
admin status changes
role changes
member suspension
important settings changes

Protect audit logs from ordinary modification.

ERROR HANDLING

Create clear error states for:

invalid State Code
invalid admin credentials
device not recognized
recovery failure
account inactive
session expired
attendance closed
wrong CDS group
outside radius
clearance
public holiday
POP reached
duplicate attendance
location denied
GPS unavailable
rate limited

Use SweetAlert2 for user-facing feedback.

PERFORMANCE

Design for 10,000+ members.

Use:

indexed PostgreSQL queries
pagination
server-side search
server-side filtering
efficient selected columns
Neon serverless-compatible database access
connection pooling where appropriate
short transactions
idempotency
rate limiting
asynchronous/background processing for heavy exports
no N+1 queries

Do not claim a fixed concurrency capacity without load testing.

UI REQUIREMENTS

Use:

Bootstrap 5.3+
custom CSS
responsive layouts
offcanvas mobile sidebar
clean tables
cards
forms
badges
modals
pagination

Use SweetAlert2 for confirmations and feedback.

Make the design look like a real administrative system.

Do not produce an AI-looking interface.

Do not use excessive animation.

Use only purposeful animation such as the short logo splash animation.

ROUTES

Public:

/
/login
/register
/terms
/privacy
/contact

Member:

/member
/member/attendance
/member/profile

Admin:

/admin
/admin/members
/admin/alumni
/admin/batches
/admin/cds-groups
/admin/attendance
/admin/clearance
/admin/holidays
/admin/admins
/admin/reports
/admin/settings
/admin/audit-logs

All admin routes must be server-protected.

DEVELOPMENT QUALITY

Build reusable components.

Avoid duplicate code.

Keep business logic out of presentation components where possible.

Centralize:

authentication
authorization
attendance eligibility
POP calculations
attendance calculations
validation
API error handling

Use TypeScript types throughout.

Use meaningful database constraints.

Add tests for security-critical business logic.

REQUIRED TESTING

Test:

authentication
device binding
lost-device recovery
RBAC
CDS isolation
attendance eligibility
GPS radius
clearance
public holidays
POP
Alumni
duplicate attendance
rate limiting
CSRF
XSS
SQL injection
IDOR
privilege escalation
session handling
exports
PWA
responsive design
FINAL DEVELOPMENT REQUIREMENT

Do not implement only the UI.

Build the complete functional system:

React frontend
+
Vercel backend/API
+
Neon database
+
Vercel Blob
+
Authentication
+
Authorization
+
Attendance engine
+
GPS verification
+
Device binding
+
Recovery
+
Batch lifecycle
+
POP automation
+
Alumni
+
Clearance
+
Public holidays
+
Reports
+
Audit logs
+
Security
+
PWA

The finished application must be structured so that the same platform can be reused for different CDS organizations, states, groups and service cycles without rewriting the core system.

Before considering the project complete, verify that every critical rule is enforced server-side and that the frontend cannot bypass attendance, device, role, CDS-group, POP or authorization restrictions.