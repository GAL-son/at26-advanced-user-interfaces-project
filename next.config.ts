import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin'; // <--- Zwróć uwagę na '/plugin' na końcu
 
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
