### Quick entry

gets something like this:

```
Vahid paid pizza for Alice and Bob
Bob paid tea for all
discount 10% limit £20
```

And parses it

### advanced tax,tip and discounts

Users should be able to add any number of tax tips and discounts. also these can
have a limit for example 10% discount maxed to £10

### Localised currency

Set the currency based on locale. display money with Intl API

### Connecting people together

For example a couple share expenses together but also have individual expenses.

### Choose who should pay to who

Some people aren't friends and don't want to owe each other money. so when
settling up the app should take that into account and only create debts between
people who are ok with it.

### Full offline PWA

The app should work fully offline as a PWA. all data is stored locally and
synced when online.

### Currency exchange

### Share and Sync

Done: short share links backed by Upstash Redis via `netlify/functions/share.ts`
(`#s=<id>`, 30-day TTL), falling back to the old fully URL-encoded link
(`#data=...`) when the backend is unreachable or not configured. See
`src/utils/share.ts`.

Still open: Peer-to-Peer Storage (IPFS, Gun.js) — decentralized storage where
the data lives on users' devices and syncs when they're online, no central
server needed. Gun.js is particularly interesting for this.
