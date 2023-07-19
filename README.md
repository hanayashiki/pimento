# Pimento

<h3 align="center">
<i><a href="https://pimento.cwang.io">Simple Password Manager Web App</a></i>
</h3>

[![frame](https://github.com/hanayashiki/pimento/assets/26056783/7f7b9146-20f4-46d0-9ab4-53297ae0762e)](https://pimento.cwang.io)


## Features

1. Completely private and secure. Sensitive data are encrypted and decrypted locally.

2. Fast. Using durable cache as database. Using React Server Component for SSR.

3. Host it yourself. Simple hosting with NextJS and Redis.

4. Bleeding-edge server side rendering using React Server Component on Edge Runtime. Opens in a flash with lowest cost.

5. DaisyUI + TailwindCSS

## Try it Online

https://pimento.cwang.io

## How is my data handled?

Generally speaking, all data private to the user is encrypted and only accessible to the user. 

For the online demo, the data is stored on [Vercel KV](https://vercel.com/docs/storage/vercel-kv), which is in turn managed by [Upstash](https://docs.upstash.com/redis/features/globaldatabase) in its Global Database. The server accessing the data is deploy with the [Vercel Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions) globally.

Technically, the private data is encrypted on the client before it is sent to the server, using AES-256 algorithm. The key is derived from a random nonce and the user's clear text password, and never sent to the server. The user's clear text password is not stored in the database, but only the hashed version.

