import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname of request (e.g. menu.myrestaurant.com, haket.neymanmenu.com, localhost:3000)
  let hostname = req.headers
    .get('host')!
    .replace('.localhost:3000', `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`);

  // Özel geliştirme ortamı için localhost check
  if (hostname.includes('localhost') || hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN || hostname === 'neymanmenu.com' || hostname === 'www.neymanmenu.com') {
    // Ana domain (SaaS paneli veya açılış sayfası). Normal akışa devam et.
    
    // SEO Koruması: Admin ve dashboard rotalarında (Google indekslemesin diye header ekleyebiliriz)
    const response = NextResponse.next();
    if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/operations') || url.pathname.startsWith('/management') || url.pathname.startsWith('/saas-admin') || url.pathname.startsWith('/marketing') || url.pathname.startsWith('/ai') || url.pathname.startsWith('/branches') || url.pathname.startsWith('/settings')) {
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
    return response;
  }

  // --- DİL ALGILAMA (GEO-IP & ACCEPT-LANGUAGE) ---
  let locale = req.cookies.get('NEXT_LOCALE')?.value;
  if (!locale) {
    // Vercel Geo-IP kontrolü
    const country = req.headers.get('x-vercel-ip-country');
    
    if (country === 'TR') locale = 'tr';
    else if (country === 'AZ') locale = 'az';
    else if (country === 'RU' || country === 'BY' || country === 'KZ') locale = 'ru';
    else {
      // Tarayıcı dilini kontrol et
      const acceptLang = req.headers.get('accept-language') || '';
      if (acceptLang.includes('tr')) locale = 'tr';
      else if (acceptLang.includes('az')) locale = 'az';
      else if (acceptLang.includes('ru')) locale = 'ru';
      else locale = 'en'; // Varsayılan dil
    }
  }

  // Eğer istek ana domain dışındaysa, bu bir restoran menüsüdür (Subdomain veya Custom Domain)
  // Bizim dijital menümüz normalde /m/[slug] altında çalışıyor. 
  // Gelen isteği /m/[hostname] adresine rewrite yapıyoruz.
  
  // Eğer zaten /m/ altındaysa rewrite yapmaya gerek yok
  if (url.pathname.startsWith('/m/')) {
      const response = NextResponse.next();
      if (locale) response.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
      return response;
  }

  // Extract slug from hostname
  // If hostname is haket.neymanmenu.com, slug is haket
  // If hostname is haket.com, slug is haket.com (custom domain)
  let slug = hostname;
  const baseDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  if (hostname.endsWith(`.${baseDomain}`)) {
    slug = hostname.replace(`.${baseDomain}`, '');
  } else if (hostname.endsWith('.neymanmenu.com')) {
    slug = hostname.replace('.neymanmenu.com', '');
  }

  // Rewrite to /m/[slug][pathname]
  const rewriteResponse = NextResponse.rewrite(new URL(`/m/${slug}${url.pathname === '/' ? '' : url.pathname}`, req.url));
  if (locale) rewriteResponse.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  return rewriteResponse;
}
