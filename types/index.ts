export type PortfolioCategory =
  | "lawn-restoration"
  | "hedge-trimming"
  | "garden-clean-up"
  | "planting-flowers";

export interface PortfolioEntry {
  id: string;
  title: string;
  description: string | null;
  before_image: string;
  after_image: string;
  category: PortfolioCategory;
  tags: string[];
  facebook_post_id: string | null;
  display_order: number;
  created_at: string;
}

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  image_url: string | null;
  visualization_url: string | null;
  preferences: QuotePreferences;
  status: "new" | "contacted" | "quoted" | "won" | "lost";
  notes: string | null;
  created_at: string;
}

export interface QuotePreferences {
  needs_improving: string[];
  add_flowers: boolean;
  preferred_flowers: string[];
  garden_type: string;
  additional_notes?: string;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string | null;
  last_visit: string | null;
  paid: boolean;
  access_token: string;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GardenHealthScore {
  id: string;
  client_id: string;
  score: number;
  image_url: string;
  analysis_notes: string | null;
  analyzed_at: string;
}

export interface WateringLog {
  id: string;
  client_id: string;
  watered: boolean;
  logged_at: string;
}

export interface ClientDashboardData {
  client: Client;
  latest_score: GardenHealthScore | null;
  recent_scores: GardenHealthScore[];
  recent_watering: WateringLog[];
  rainfall_mm: number;
}

export interface TransformResult {
  type: "similar_projects" | "ai_visualization";
  similar_projects?: PortfolioEntry[];
  visualization_url?: string;
  visualization_base64?: string;
}
