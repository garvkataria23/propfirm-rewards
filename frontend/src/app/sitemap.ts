import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://propfirmrewards.com';
  const currentDate = new Date().toISOString();

  const publicRoutes = [
    '',
    '/prop-firms',
    '/rewards',
    '/how-it-works',
    '/reviews',
    '/announcements',
    '/faq',
    '/help-center',
    '/contact',
    '/community',
    '/terms',
    '/privacy',
    '/login',
    '/register',
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/prop-firms' || route === '/rewards' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/prop-firms' || route === '/rewards' ? 0.9 : 0.7,
  }));
}
