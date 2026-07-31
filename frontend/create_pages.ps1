$pages = @(
    @{ path="operations/orders"; title="Siparişlər"; desc="Aktiv və keçmiş siparişlərin siyahısı"; icon="ShoppingCart" },
    @{ path="operations/kds"; title="Mətbəx Ekranı (KDS)"; desc="Sifarişlərin hazırlanma statusları"; icon="MonitorPlay" },
    @{ path="operations/waiter"; title="Ofisiant Paneli"; desc="Masalara sifariş əlavə etmək üçün sürətli panel"; icon="Users" },
    @{ path="operations/reservations"; title="Rezervasiyalar"; desc="Stol rezervasiyalarının təqvimi"; icon="Calendar" },
    
    @{ path="management/menu"; title="Menyu İdarəetməsi"; desc="Məhsulların siyahısı və qiymətlər"; icon="PackageSearch" },
    @{ path="management/categories"; title="Kateqoriyalar"; desc="Menyu kateqoriyalarının yaradılması"; icon="PackageSearch" },
    @{ path="management/inventory"; title="Stok & Anbar"; desc="Stok qeydiyyatı və ehtiyatlar"; icon="PackageSearch" },
    @{ path="management/expenses"; title="Gider Yönetimi"; desc="Gündəlik xərclərin idarə edilməsi"; icon="Wallet" },
    @{ path="management/staff"; title="Personallar"; desc="İşçilərin qeydiyyatı və maaşlar"; icon="UserCheck" },
    @{ path="management/roles"; title="Rollar və İcazələr"; desc="Komi, Aşpaz və Kassa səlahiyyətləri"; icon="Shield" },
    @{ path="management/invoices"; title="Faturalar"; desc="Gələn və gedən faturalar"; icon="FileText" },
    @{ path="management/crm"; title="Müştərilər (CRM)"; desc="Sadakat kartları və müştəri siyahısı"; icon="Users" },
    
    @{ path="branches"; title="Şöbələr (Subdomains)"; desc="Yeni filialların yaradılması və aktivləşdirilməsi"; icon="Building2" },
    @{ path="settings/general"; title="Genel Ayarlar"; desc="Restoran məlumatları, loqo və valyuta"; icon="Settings" },
    @{ path="settings/integrations"; title="İnteqrasiyalar"; desc="Yemeksepeti, Getir və POS bağlantıları"; icon="Settings" },
    
    @{ path="ai/reports"; title="Süni İntellekt Hesabatları"; desc="Detallı AI təhlilləri və performans proqnozları"; icon="BrainCircuit" },
    @{ path="marketing/campaigns"; title="Kampaniyalar"; desc="Endirim və promosyon idarəetməsi"; icon="Megaphone" },
    @{ path="marketing/reviews"; title="Müştəri Rəyləri"; desc="Restoran üçün gələn dəyərləndirmələr"; icon="Star" }
)

$baseDir = "C:\Users\amira\OneDrive - Yalova Üniversitesi\Desktop\Startup project\Qr_menu APP\QR_\frontend\src\app\(admin)"

foreach ($page in $pages) {
    $dir = Join-Path $baseDir $page.path
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    
    $file = Join-Path $dir "page.tsx"
    
    $iconName = $page.icon
    $title = $page.title
    $desc = $page.desc
    
    $content = @"
'use client';

import React from 'react';
import { $iconName, Plus, Filter, Search } from 'lucide-react';

export default function Page() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">$title</h1>
          <p className="text-sm text-gray-500 mt-1">$desc</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Axtar..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-xl text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all">
            <Plus size={16} />
            Yeni Əlavə Et
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <$iconName size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Məlumat yoxdur</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Hələ ki sistemdə heç bir məlumat qeydiyyata alınmayıb. Yeni məlumat əlavə etmək üçün yuxarıdakı düymədən istifadə edin.
          </p>
        </div>
      </div>
    </div>
  );
}
"@
    
    Set-Content -Path $file -Value $content -Encoding UTF8
    Write-Host "Created $($page.path)"
}
