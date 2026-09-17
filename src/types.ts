export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  category: string;
  startingPrice: string;
  features: string[];
  icon: string;
  badge?: string;
  gradient: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  client: string;
  category: string;
  image: string;
  impactMetric: string;
  metricLabel: string;
  description: string;
  tags: string[];
  year: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  ratingScore?: string;
  highlight: string;
  growthMetric: string;
}

export interface PricingPackage {
  id: string;
  name: string;
  tagline: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
  notIncluded?: string[];
  deliveryTime: string;
  bestFor: string;
  buttonText: string;
}

export interface ConsultationFormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  packageTier?: string;
  budget?: string;
  message: string;
  goals?: string;
  project_overview?: string;
}
