# Tsukuyomi.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)
![Expo](https://img.shields.io/badge/mobile-Expo%20(React%20Native)-black.svg)

**Tsukuyomi**, yerel müzik arşivinizi estetik ve güçlü bir arayüzle yönetmenizi sağlayan; Web, Masaüstü ve Mobil (Android/iOS) platformlarında çalışan yeni nesil bir müzik çalardır. 

---

##  Özellikler

### Arayüz & Deneyim
*   **Modern Tasarım:** Buzlu cam efektleri, canlı renkler ve akıcı animasyonlar.
*   **Duyarlı (Responsive) Yapı:** Masaüstü ve mobil cihazlarda kusursuz görünüm.
*   **Mini & Tam Ekran Oynatıcı:** Şarkı kontrolünü her an elinizin altında tutun.

### Müzik Yönetimi
*   **Otomatik Tarama & İzleme:** Belirlediğiniz klasörlerdeki değişikleri anlık algılar (Watchdog entegrasyonu).
*   **Akıllı Meta Veri Okuma:** ID3 tagları, kapak resimleri ve FLAC/MP3 desteği.
*   **Gelişmiş Arama:** Sanatçı, albüm veya şarkı ismine göre anlık filtreleme.
*   **Favoriler & Çalma Listeleri:** Kendi listelerinizi oluşturun, favorilerinizi yönetin.

### Mobil (Expo) (Eh işte, biraz biraz yapıyorum şuan kullanılabilecek gibi değil.)
*   **Native Performans:** React Native ile geliştirilmiş akıcı mobil deneyim.
*   **Senkronizasyon:** Aynı ağ üzerindeki sunucuya bağlanarak kütüphanenize heryerden erişim.
*   **Arka Planda Çalma:** Uygulama kapalıyken bile müzik keyfi (iOS/Android).

### Teknik Özellikler
*   **Streaming:** Büyük dosyaları bile beklemeden oynatabilen range-request destekli streaming.
*   **Canlı Şarkı Sözleri:** `lrclib.net` entegrasyonu ile senkronize veya düz şarkı sözleri.
*   **Hot-Reload Database:** SQLite tabanlı hızlı veri yönetimi.

---

## Kurulum ve Çalıştırma

Proje Sunucu (Server) ve İstemci (Client) olmak üzere iki ana parçadan oluşur.

### Gereksinimler
*   Python 3.9+
*   Node.js 18+ & Bun (veya npm/yarn)

### 1. Sunucu (Backend) Kurulumu
Sunucu, müzik dosyalarını tarar ve API sağlar.

```bash
cd server

# Sanal ortam oluşturma (Önerilir)
python -m venv venv
# Windows için:
.\venv\Scripts\activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# Sunucuyu başlat (Varsayılan port: 8000)
python main.py
```

### 2. İstemci (Web/Desktop) Kurulumu
Modern web / tauri arayüzü.

```bash
cd client

# Bağımlılıkları yükle
bun install

# Geliştirme modunda başlat (Web)
bun run dev

# Masaüstü Uygulaması (Tauri) olarak başlat
bun run tauri dev
```

### 3. Mobil (Expo) Uygulama
Mobil cihazınızda çalıştırmak için.

```bash
cd client

# Android için başlat (veya sadece 'bun run mobile' ile QR okut)
bun run mobile -- --clear
```
_Not: Telefonunuzun ve bilgisayarınızın aynı Wi-Fi ağında olduğundan emin olun._

---

## API Dokümantasyonu

Tsukuyomi, RESTful bir API yapısı kullanır. Temel endpointler aşağıdadır:

### Müzik İşlemleri

| Method | Endpoint | Açıklama |
| :--- | :--- | :--- |
| `POST` | `/api/v1/music/scan` | Kütüphaneyi tarar ve veritabanını günceller. |
| `GET` | `/api/v1/music/search` | Şarkı araması yapar. (`?q=query`) |
| `GET` | `/api/v1/music/stream/{id}` | Şarkı dosyasını stream eder. |
| `GET` | `/api/v1/music/cover/{album_id}` | Albüm kapağını getirir. |
| `GET` | `/api/v1/music/track-cover/{id}` | Şarkıya gömülü kapağı getirir. |
| `GET` | `/api/v1/music/lyrics` | Şarkı sözlerini çeker. |

### Favoriler & Listeler

| Method | Endpoint | Açıklama |
| :--- | :--- | :--- |
| `GET` | `/api/v1/music/favorites` | Favori şarkıları listeler. |
| `POST` | `/api/v1/music/favorites/{id}` | Şarkıyı favorilere ekler. |
| `DELETE` | `/api/v1/music/favorites/{id}` | Şarkıyı favorilerden çıkarır. |
| `GET` | `/api/v1/music/playlists` | Tüm çalma listelerini getirir. |
| `POST` | `/api/v1/music/playlists` | Yeni çalma listesi oluşturur. |
| `GET` | `/api/v1/music/playlists/{id}` | Çalma listesi detaylarını getirir. |
| `DELETE` | `/api/v1/music/playlists/{id}` | Çalma listesini siler. |

---

## Proje Yapısı

```
tsukuyomi/
├── client/                 # Frontend (React + Vite + Expo)
│   ├── src/
│   │   ├── components/     # UI Bileşenleri (Web & Mobile)
│   │   ├── views/          # Sayfa Görünümleri
│   │   └── MobileApp.jsx   # Mobil Giriş Noktası
│   └── package.json
│
├── server/                 # Backend (FastAPI)
│   ├── app/
│   │   ├── api/            # API Route'ları
│   │   ├── db/             # Veritabanı Modelleri
│   │   └── services/       # Tarayıcı ve Müzik Servisleri
│   └── main.py             # Sunucu Başlatıcı
│
└── README.md
```

## Katkıda Bulunma

1.  Bu depoyu fork'layın.
2.  Yeni bir özellik dalı (feature branch) oluşturun (`git checkout -b feature/YeniOzellik`).
3.  Değişikliklerinizi commit'leyin (`git commit -m 'Yeni özellik eklendi'`).
4.  Dalınızı push'layın (`git push origin feature/YeniOzellik`).
5.  Bir Pull Request oluşturun.