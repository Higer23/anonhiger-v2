# anonhiger-v2

The second version of the anonymous message app. It adds a dashboard, an archive, a footprint view and collects basic client information.

## English

**Pages:** Dashboard, message form (MessageForm.tsx), archive (Archive.tsx) and footprint view (Footprint.tsx), with a particle background.

**Privacy notice:** src/utils/clientInfo.ts fetches the sender's IP address from api.ipify.org and collects other client information. Make sure you have a legal basis and inform users before you use this in production.

**Stack:** React 19, Vite, Tailwind CSS, motion, @google/genai.

**Setup:** npm install, set GEMINI_API_KEY in .env.local, then npm run dev.

## Deutsch

**Seiten:** Dashboard, Nachrichtenformular (MessageForm.tsx), Archiv (Archive.tsx) und Ansicht des digitalen Fussabdrucks (Footprint.tsx) mit Partikel-Hintergrund.

**Datenschutzhinweis:** src/utils/clientInfo.ts ruft die IP-Adresse des Absenders ueber api.ipify.org ab und erfasst weitere Client-Informationen. Vor einem Einsatz in der Praxis eine Rechtsgrundlage klaeren und die Nutzer informieren.

**Technik:** React 19, Vite, Tailwind CSS, motion, @google/genai.

**Einrichtung:** npm install, GEMINI_API_KEY in .env.local setzen, dann npm run dev.

## Türkçe

**Sayfalar:** Panel, mesaj formu (MessageForm.tsx), arşiv (Archive.tsx) ve dijital izler görünümü (Footprint.tsx), parçacık arka planıyla birlikte.

**Gizlilik notu:** src/utils/clientInfo.ts, gönderenin IP adresini api.ipify.org üzerinden alır ve diğer istemci bilgilerini toplar. Üretimde kullanmadan önce yasal dayanağı belirleyin ve kullanıcıları bilgilendirin.

**Teknoloji:** React 19, Vite, Tailwind CSS, motion, @google/genai.

**Kurulum:** npm install, .env.local içinde GEMINI_API_KEY değerini girin, ardından npm run dev.
