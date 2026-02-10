# Nutrito - Diyet Takip Uygulaması

Kişisel diyet ve beslenme takip uygulaması. PWA destekli, Supabase entegrasyonlu.

## Özellikler

- Günlük öğün takibi (Kahvaltı, Öğle, Ara Öğün, Akşam)
- Besin değişim sistemi (1 bardak ayran = 4 yk yoğurt gibi)
- Su takibi
- Kilo takibi ve grafik
- Tarif yönetimi ve "ACIKTIM" butonu
- PWA desteği (offline çalışma, ana ekrana ekleme)
- Responsive tasarım (mobil ve masaüstü)
- Dark tema

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Supabase Kurulumu (Opsiyonel)

Supabase kullanmak için:

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun ("Nutrito" adıyla)
3. SQL Editor'da `supabase/schema.sql` dosyasını çalıştırın
4. Project Settings > API > URL ve anon key'i kopyalayın
5. `.env` dosyası oluşturup değerleri girin:

```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

Supabase yapılandırılmadığında uygulama yerel depolamayı (localStorage) kullanır.

### 3. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

### 4. Üretim Build

```bash
npm run build
npm run preview
```

## Teknolojiler

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Database**: Supabase (opsiyonel)
- **Charts**: Recharts
- **PWA**: vite-plugin-pwa
- **Icons**: Lucide React

## Proje Yapısı

```
src/
├── components/
│   ├── layout/      # Sidebar, BottomNav, Layout, GeminiButton
│   ├── meals/       # MealCard, FoodItem, AddFoodModal, ExchangeModal
│   ├── water/       # WaterTracker
│   ├── weight/      # WeightInput, WeightChart
│   └── ui/          # Button, Card, Modal, Select, Input
├── pages/
│   ├── Dashboard.jsx
│   ├── Exchanges.jsx
│   ├── Recipes.jsx
│   ├── Units.jsx
│   └── Settings.jsx
├── lib/
│   ├── supabase.js
│   └── utils.js
├── stores/
│   └── appStore.js
└── App.jsx
```

## Lisans

MIT
