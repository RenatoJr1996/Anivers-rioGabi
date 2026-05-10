# Aniversário Gabriela

Convite digital em Next.js para confirmação de presença no aniversário da Gabriela.

## Setup

Crie `.env.local` com:

```bash
MONGODB_URI=valor-da-string-do-mongodb
MONGODB_DATABASE=aniversarioGabriela
ADMIN_PASSWORD=senha-do-admin
```

## Scripts

```bash
npm run dev
npm run lint
npm test
npm run build
npm run seed:guests
```

## Rotas

- `/`: convite público com RSVP.
- `/admin`: painel protegido por senha para consultar status e adicionar convidados.

## Admin local

A senha inicial configurada neste ambiente está em `.env.local` como `ADMIN_PASSWORD`.
# Anivers-rioGabi
