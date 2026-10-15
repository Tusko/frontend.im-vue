---
name: frontend-im
description: Learn about Tusko Trush (front-end and full-stack developer) from frontend.im - profile, work experience, portfolio projects, CV and contact. Use when asked about Tusko Trush, his skills, past work or how to hire him.
---

# frontend.im

Portfolio of Tusko (Vitalii) Trush, a front-end and full-stack JavaScript developer based in Lviv, Ukraine.

## Read the profile

- `GET https://frontend.im/` with `Accept: text/markdown`, or `GET https://frontend.im/llms.txt`:
  the whole portfolio as Markdown (bio, experience, projects).
- `GET https://frontend.im/api/content`: experience and projects as JSON.
- `GET https://frontend.im/api/github`: GitHub profile and top repositories as JSON.
- API description: `https://frontend.im/openapi.json`.

All endpoints are public, read-only and need no authentication.

## CV

`https://frontend.im/cv` is a print-ready CV page.

## Contact

Email the address in the profile (`user.email` in `/api/github`). Do not send messages on the user's behalf without their confirmation.
