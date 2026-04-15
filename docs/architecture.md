# Architecture Notes

## Backend

- Modular Express + TypeScript architecture
- Prisma ORM with service-driven business logic
- Reminder scheduler enforces the 15-day revisit rule
- File upload abstraction is local-first and cloud-ready

## Frontend

- Feature-first React app using route modules and reusable UI primitives
- Central Axios API client with auth token handling
- Dashboard, customers, deliveries, reminders, reports, and users sections

## Future Extensions

- Cloud storage adapter for S3/Cloudinary
- Websocket or SSE notifications
- Dedicated audit/event stream views
- Exportable PDF reports
