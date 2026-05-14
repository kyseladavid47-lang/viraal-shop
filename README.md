# VIRAAL Shop — Instalační návod

## Jak to funguje

```
Zákazník klikne "Buy Now"
        ↓
index.html zavolá server → POST /create-checkout-session
        ↓
Server vytvoří Stripe session a vrátí URL
        ↓
Zákazník je přesměrován na Stripe platební bránu
        ↓
    ┌───────────────────────────────┐
    │ Platba OK?                    │
    │  ✅ ANO → thank-you.html      │
    │              ↓                │
    │     Server ověří session      │
    │     (payment_status = paid)   │
    │              ↓                │
    │     Zobrazí download odkaz    │
    │                               │
    │  ❌ NE  → cancel.html         │
    └───────────────────────────────┘
```

## Instalace

### 1. Nainstaluj závislosti
```bash
npm install
```

### 2. Vytvoř .env soubor
```bash
cp .env.example .env
```
Pak otevři `.env` a vyplň:
- `STRIPE_SECRET_KEY` — najdeš na https://dashboard.stripe.com/apikeys  
  *(testovací klíč začíná `sk_test_...`)*
- `DOMAIN` — URL kde jsou hostované tvé HTML soubory

### 3. Spusť server
```bash
# Produkce
npm start

# Vývoj (auto-restart při změnách)
npm run dev
```

### 4. Otevři index.html
Použij VS Code Live Server nebo jakýkoliv statický server — soubory musí běžet na URL nastavené v `DOMAIN`.

---

## Testovací platby (Stripe test mode)

Při testu použij tato čísla karet:

| Karta | Číslo | CVC | Datum |
|-------|-------|-----|-------|
| Úspěšná | `4242 4242 4242 4242` | libovolné 3 číslice | libovolné budoucí datum |
| Zamítnutá | `4000 0000 0000 0002` | libovolné | libovolné |

---

## Deployment (produkce)

1. Nahraj server.js + package.json + .env na hosting (Railway, Render, Fly.io)
2. Nastav env proměnné na hostingu
3. Aktualizuj `API_URL` v `index.html` a `thank-you.html` na URL tvého serveru
4. Nahraj HTML soubory na Netlify / Vercel / vlastní server

### Změna API_URL v HTML souborech

V `index.html` a `thank-you.html` najdi řádek:
```javascript
const API_URL = 'http://localhost:3000';
```
A změň na URL tvého serveru, např.:
```javascript
const API_URL = 'https://viraal-server.railway.app';
```

---

## Struktura souborů

```
viraal-shop/
├── server.js          ← Node.js backend (Stripe)
├── package.json       ← závislosti
├── .env               ← tajné klíče (NIKDY na GitHub!)
├── .env.example       ← šablona pro .env
├── index.html         ← hlavní e-shop stránka
├── thank-you.html     ← stránka po úspěšné platbě
└── cancel.html        ← stránka při zrušení/chybě platby
```
