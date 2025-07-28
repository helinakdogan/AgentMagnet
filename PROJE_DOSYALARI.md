# Agent Magnet - Tüm Proje Dosyaları

## Proje Yapısı
```
Agent-Magnet/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── ui/ (shadcn/ui bileşenleri)
│   │   │   ├── AgentCard.tsx
│   │   │   ├── MagneticDots.tsx
│   │   │   └── Navigation.tsx
│   │   ├── hooks/
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   ├── lib/
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── AgentStore.tsx
│   │   │   ├── AgentDetail.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Developer.tsx
│   │   │   └── NotFound.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   └── schema.ts
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── components.json
├── drizzle.config.ts
└── replit.md
```

## İndirilmesi Gereken Paketler

### Ana Bağımlılıklar (dependencies):
- @hookform/resolvers: ^3.10.0
- @neondatabase/serverless: ^0.10.4
- @radix-ui/react-* (Tüm Radix UI bileşenleri)
- @tanstack/react-query: ^5.60.5
- class-variance-authority: ^0.7.1
- clsx: ^2.1.1
- cmdk: ^1.1.1
- connect-pg-simple: ^10.0.0
- date-fns: ^3.6.0
- drizzle-orm: ^0.39.1
- drizzle-zod: ^0.7.0
- embla-carousel-react: ^8.6.0
- express: ^4.21.2
- express-session: ^1.18.1
- framer-motion: ^11.13.1
- input-otp: ^1.4.2
- lucide-react: ^0.453.0
- memorystore: ^1.6.7
- next-themes: ^0.4.6
- passport: ^0.7.0
- passport-local: ^1.0.0
- react: ^18.3.1
- react-dom: ^18.3.1
- react-hook-form: ^7.55.0
- react-icons: ^5.4.0
- react-resizable-panels: ^2.1.7
- recharts: ^2.15.2
- tailwind-merge: ^2.6.0
- tailwindcss-animate: ^1.0.7
- tw-animate-css: ^1.2.5
- vaul: ^1.1.2
- wouter: ^3.3.5
- ws: ^8.18.0
- zod: ^3.24.2
- zod-validation-error: ^3.4.0

### Geliştirme Bağımlılıkları (devDependencies):
- @replit/vite-plugin-cartographer: ^0.2.7
- @replit/vite-plugin-runtime-error-modal: ^0.0.3
- @tailwindcss/typography: ^0.5.15
- @tailwindcss/vite: ^4.1.3
- @types/* (TypeScript tip tanımları)
- @vitejs/plugin-react: ^4.3.2
- autoprefixer: ^10.4.20
- drizzle-kit: ^0.30.4
- esbuild: ^0.25.0
- postcss: ^8.4.47
- tailwindcss: ^3.4.17
- tsx: ^4.19.1
- typescript: 5.6.3
- vite: ^5.4.19

### Opsiyonel Bağımlılıklar:
- bufferutil: ^4.0.8

## Kurulum Komutları

```bash
# Projeyi klonladıktan sonra:
npm install

# Veya yarn kullanıyorsanız:
yarn install

# Geliştirme sunucusunu başlatmak için:
npm run dev

# Proje build etmek için:
npm run build

# Production'da çalıştırmak için:
npm start

# TypeScript kontrolü için:
npm run check

# Veritabanı şemasını güncellemek için:
npm run db:push
```

## Önemli Özellikler

1. **Mıknatıs Oyunu**: Ana sayfada interaktif mıknatıs oyunu
2. **Glassmorphic Tasarım**: Bulanık cam efektli modern arayüz
3. **3 Tier Fiyatlandırma**: Free, Plus, Premium planları
4. **Responsive Tasarım**: Mobil ve masaüstü uyumlu
5. **Türkçe Arayüz**: Tam Türkçe yerelleştirme
6. **AI Ajanları Marketplace**: 8 farklı kategori
7. **Dinamik Fiyatlandırma**: Aylık/yıllık faturalandırma seçenekleri
8. **Interaktif Animasyonlar**: Mıknatıs efektli parçacık animasyonları

## Teknolojiler

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (Drizzle ORM)
- **Authentication**: Passport.js
- **Animations**: Framer Motion, CSS animations