# 🚀 Streaming Markdown Parser

> AI destekli uygulamalar için gerçek zamanlı Markdown ayrıştırıcı

## 🌟 Genel Bakış

Streaming Markdown Parser, özellikle AI sohbet uygulamaları için tasarlanmış yüksek performanslı, gerçek zamanlı bir markdown işleme aracıdır. Markdown metinlerini geldiği anda işler ve tam yanıtı beklemeden anında biçimlendirme ve sözdizimi vurgulaması sağlar.

![Demo Önizleme](demo.gif)

## ✨ Özellikler

- 🔄 **Gerçek Zamanlı İşleme**
  - Anında markdown görüntüleme
  - Tam yanıtı beklemeden işleme
  - Akıcı streaming deneyimi

- 💻 **Kod Bloğu Desteği**
  - Birden fazla dil için sözdizimi vurgulama
  - Satır numaraları
  - Panoya kopyalama özelliği
  - Genişletme/Daraltma özelliği
  - Dil algılama

- 🎨 **Tema Desteği**
  - Açık/Koyu mod
  - Özelleştirilebilir renk şemaları
  - Akıcı geçişler

- ⚡ **Performans Optimizasyonu**
  - 60fps hedefi
  - Verimli DOM güncellemeleri
  - Bellek dostu uygulama
  - Throttled işleme

- 📱 **Responsive Tasarım**
  - Mobil uyumlu arayüz
  - Uyarlanabilir düzen
  - Dokunmatik ekran dostu kontroller

## 🛠️ Teknik Detaylar

### Desteklenen Diller

```typescript
// Sözdizimi vurgulama desteği:
✓ JavaScript/TypeScript
✓ Python
✓ Bash/Shell
```

### Performans Metrikleri

- Buffer işleme: Parça başına < 16ms
- Bellek kullanımı: Uzun oturumlar için optimize edilmiş
- DOM güncellemeleri: Minimum seviyeye indirilmiş

## 🚀 Başlangıç

### Gereksinimler

- Node.js (v12 veya üzeri)
- npm (Node Package Manager)
- Python 3 (yerel sunucu için)

### Kurulum

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/yourusername/streaming-markdown-parser.git
   ```

2. Proje dizinine gidin:
   ```bash
   cd streaming-markdown-parser
   ```

3. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

4. TypeScript'i derleyin:
   ```bash
   npx tsc
   ```

### Demo'yu Çalıştırma

1. Yerel sunucuyu başlatın:
   ```bash
   python3 -m http.server
   ```

2. Tarayıcıda açın:
   ```
   http://localhost:8000
   ```

## 🎯 Kullanım Alanları

1. **AI Sohbet Uygulamaları**
   - Gerçek zamanlı yanıt biçimlendirme
   - Kod parçacığı vurgulama
   - Etkileşimli kod blokları

2. **Canlı Kodlama Ortamları**
   - Anında önizleme
   - Sözdizimi vurgulama
   - Kod biçimlendirme

3. **Dokümantasyon Araçları**
   - Gerçek zamanlı dokümantasyon önizleme
   - Kod örneği biçimlendirme
   - Teknik dokümantasyon

## 🔧 Yapılandırma

### Tema Özelleştirme

```typescript
const themes = {
    light: {
        background: '#ffffff',
        text: '#000000',
        codeBackground: '#f5f5f5',
        // ... diğer renkler
    },
    dark: {
        background: '#1e1e1e',
        text: '#ffffff',
        codeBackground: '#2d2d2d',
        // ... diğer renkler
    }
};
```

### Sözdizimi Vurgulama

```typescript
const syntaxHighlighting = {
    javascript: {
        keywords: ['const', 'let', 'var', ...],
        strings: /"[^"]*"|'[^']*'/g,
        // ... diğer kurallar
    },
    // ... diğer diller
};
```

## 🔍 Kod Örnekleri

### Temel Kullanım

```typescript
// Parser'ı başlat
const parser = new MarkdownParser();

// Streaming başlat
parser.processToken("```javascript\n");
parser.processToken("const hello = 'world';\n");
parser.processToken("```");
```

### Özel Tema

```typescript
// Özel tema ekle
parser.addTheme('custom', {
    background: '#2a2a2a',
    text: '#ffffff',
    // ... diğer renkler
});

// Temayı uygula
parser.setTheme('custom');
```

## 📈 Performans İpuçları

1. **Buffer Yönetimi**
   - Büyük streamler için throttling kullanın
   - Buffer'ı düzenli olarak temizleyin
   - Bellek kullanımını izleyin

2. **DOM Güncellemeleri**
   - DOM manipülasyonlarını minimize edin
   - Document fragments kullanın
   - Güncellemeleri toplu yapın

3. **Olay Yönetimi**
   - Kullanıcı etkileşimlerini debounce edin
   - Event listener'ları optimize edin
   - Kullanılmayan listener'ları temizleyin

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! İşte nasıl yardımcı olabilirsiniz:

1. Depoyu fork edin
2. Özellik dalınızı oluşturun
3. Değişikliklerinizi commit edin
4. Dalınıza push yapın
5. Pull Request açın

## 📝 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- AI sohbet uygulamalarından ilham alınmıştır
- Modern web teknolojileri ile oluşturulmuştur
- Gerçek dünya kullanımı için optimize edilmiştir

## 📞 İletişim

- GitHub: [@yourusername](https://github.com/yourusername)
- E-posta: your.email@example.com

## 🔮 Gelecek Planları

- [ ] Daha fazla dil desteği
- [ ] WebAssembly optimizasyonu
- [ ] Eklenti sistemi
- [ ] Erişilebilirlik iyileştirmeleri
- [ ] Test kapsamı
- [ ] Dokümantasyon sitesi

---

<p align="center">Geliştirici topluluğu için ❤️ ile yapılmıştır</p>