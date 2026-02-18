# Nutrito Versiyonlama

Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`

## Kurallar

| Numara | Ne zaman artırılır | Örnek |
|--------|--------------------|-------|
| **MAJOR** (soldan 1.) | Büyük, kırıcı değişiklikler. Veri yapısı değişimi, tamamen yeni UI. | `1.x.x → 2.0.0` |
| **MINOR** (ortadaki) | Yeni özellik eklendi, geriye uyumlu. | `1.1.x → 1.2.0` |
| **PATCH** (sağdaki) | Küçük fix, iyileştirme, stil düzeltmesi. | `1.1.0 → 1.1.1` |

## Nasıl güncellenir

Tek yapılacak: `package.json` içindeki `"version"` alanını değiştirmek.
Sidebar'daki versiyon build sırasında otomatik okunur.

```json
"version": "1.2.0"
```

## Geçmiş

| Versiyon | Tarih | Değişiklikler |
|----------|-------|---------------|
| 1.0.0 | 2026-02 | İlk yayın |
| 1.1.0 | 2026-02 | Tariflerden otomatik besin oluşturma; tarifli besinlere tarife-git butonu; versiyonlama sistemi |
