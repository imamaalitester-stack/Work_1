# Bookly API

Booking API for small studios — classes, slots and reminder emails. Built with **Koa**.

## Run it

```bash
npm install
npm run dev
```

Listens on `PORT` (default 3000).

## Endpoints

| Method | Path | What it does |
|---|---|---|
| GET | `/api/bookings?page=1&size=5` | List bookings, paginated |
| POST | `/api/bookings` | Book a class `{ name, classId, date }` |
| DELETE | `/api/bookings/:id` | Cancel a booking |
| POST | `/api/login` | Studio owner sign-in `{ email, password }` |

---

<sub>Test fixture for Skeamo QA. It contains deliberate problems — do not deploy it.</sub>
