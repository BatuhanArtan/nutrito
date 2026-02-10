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

### 2. Supabase’e Bağlanma (Opsiyonel)

Verileri Supabase’te saklamak için:

**Adım 1 – Proje oluştur**

1. [Supabase Dashboard](https://supabase.com/dashboard) → **New project**
2. Proje adı ve şifre belirleyin, region seçin, **Create project** deyin.

**Adım 2 – Tabloları oluştur**

1. Sol menüden **SQL Editor** → **New query**
2. Bu repodaki `supabase/schema.sql` dosyasının **tüm içeriğini** kopyalayıp yapıştırın
3. **Run** (veya F5) ile çalıştırın. “Success” görmeniz yeterli.

**Adım 3 – API bilgilerini al**

1. Sol menü **Project Settings** (dişli) → **API**
2. **Project URL** ve **anon public** key’i kopyalayın.

**Adım 4 – Projede .env ayarla**

1. Proje kökünde `.env` dosyası oluşturun (yoksa `cp .env.example .env`)
2. Şu değişkenleri yapıştırın (kendi değerlerinizle değiştirin):

```
VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

3. Kaydedin, ardından geliştirme sunucusunu **yeniden başlatın** (`npm run dev`).

**Adım 5 – Mevcut yerel verileri göndermek (isteğe bağlı)**

Daha önce uygulamada veri girdiyseniz: **Ayarlar** sayfasında **“Yerel verileri Supabase’e aktar”** butonuna bir kez tıklayın. Böylece localStorage’taki veriler Supabase’e kopyalanır.

Supabase yapılandırılmadığında uygulama sadece yerel depolamayı (localStorage) kullanır.

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
