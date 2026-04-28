## Environment Variables

### Setup

Copy the example file:

```bash
cp .env.example .env.local
```

---

### Auth Secret

Generate a secure secret:

```bash
npx auth secret
```

Paste it into:

```env
AUTH_SECRET=
```

---

### Google OAuth

Create OAuth credentials in Google Cloud and add this redirect URI:

```
http://localhost:3000/api/auth/callback/google
```

Then fill in:

```env
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

---

### Snowflake

Fill in your Snowflake credentials:

```env
SNOWFLAKE_ACCOUNT=
SNOWFLAKE_USERNAME=
SNOWFLAKE_PASSWORD=
SNOWFLAKE_WAREHOUSE=
SNOWFLAKE_DATABASE=
SNOWFLAKE_SCHEMA=
SNOWFLAKE_ROLE=
SNOWFLAKE_TABLE=
```

---

### Optional

Restrict sign-in to your organisation:

```env
ALLOWED_EMAIL_DOMAIN=
```

---

### App Config

```env
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

---

### Usage

Access variables in server-side code:

```ts
process.env.SNOWFLAKE_ACCOUNT
```

Expose variables to the client only if necessary using the \`NEXT_PUBLIC_\` prefix.

---

### Notes

- Do not commit .env.local
- Set environment variables in your deployment platform for production (e.g. Vercel, Docker)
- Keep secrets out of client-side code


## Getting Started
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
