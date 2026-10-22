# Backend configuration

The backend requires these environment variables:

- `JWT_SECRET`: a long, random secret used to sign authentication tokens.
- `MONGODB_URI`: the MongoDB connection string.

For local development, copy `.env.example` to `.env` in this directory and
replace the example values. Do not commit `.env` or share its values.

For Render, add `JWT_SECRET` and `MONGODB_URI` under the backend service's
**Environment** settings, then redeploy. Generate the JWT secret privately
(for example, with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
and paste it directly into Render; do not add the generated value to source
control.
