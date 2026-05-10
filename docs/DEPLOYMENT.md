# Deployment

## Local
```bash
npm install
npm start
```

## Web
```bash
npm run validate
npx expo-doctor
npx expo export
```
Deploy `dist` to Netlify, Vercel, Render static site, or another static host.

## Mobile
Use EAS after credentials and store metadata are ready.

```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

## Environment
Use only public Expo vars in the app:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Service role keys, OpenAI secrets, Stripe secrets, and webhook secrets must live server-side only.

## Supabase
Run `supabase/schema.sql`, verify RLS, then test persistence after refresh/login.

## Production Checklist
- Reviewed legal docs.
- Production RLS policies.
- Monitoring and error reporting.
- Backup/export plan.
- Store assets and privacy forms.
- Payment and notification providers connected server-side.
