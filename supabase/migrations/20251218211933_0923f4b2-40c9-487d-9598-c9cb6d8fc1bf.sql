-- Create page_content table for dynamic page management
CREATE TABLE public.page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  page_subtitle TEXT,
  hero_icon TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Page content is viewable by everyone" 
ON public.page_content 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage page content" 
ON public.page_content 
FOR ALL 
USING (is_admin_type(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content for feature pages
INSERT INTO public.page_content (page_key, page_title, page_subtitle, hero_icon, content) VALUES
('aiml', 'AI & Machine Learning', 'Pioneering the future of artificial intelligence with cutting-edge neural processors, intelligent software frameworks, and transformative AI solutions.', 'Brain', '{"stats": [{"value": "10x", "label": "Faster Processing"}, {"value": "99.9%", "label": "Accuracy Rate"}, {"value": "50+", "label": "AI Models"}, {"value": "24/7", "label": "Real-time Analysis"}], "capabilities": [{"icon": "Cpu", "title": "Neural Processing Units", "description": "Custom-designed AI chips that deliver unprecedented processing power for edge computing and real-time inference."}, {"icon": "Sparkles", "title": "Intelligent Software Frameworks", "description": "Comprehensive AI development kits and libraries that accelerate your machine learning projects."}, {"icon": "Target", "title": "Computer Vision", "description": "Advanced image recognition and object detection systems for industrial automation and smart surveillance."}, {"icon": "TrendingUp", "title": "Predictive Analytics", "description": "AI-powered forecasting and decision support systems for business intelligence and optimization."}], "vision_title": "The Future is Intelligent", "vision_text": "At ASIREX, we believe AI is not just a technology—it is the key to solving humanity greatest challenges."}'),
('robotics', 'Robotics Solutions', 'Building the next generation of intelligent machines that transform industries and improve lives.', 'Bot', '{"stats": [{"value": "100+", "label": "Robots Designed"}, {"value": "98%", "label": "Precision Rate"}, {"value": "5+", "label": "Industries"}, {"value": "24/7", "label": "Operations"}], "capabilities": [{"icon": "Cog", "title": "Industrial Automation", "description": "High-precision robotic systems for manufacturing, assembly, and quality control."}, {"icon": "Hand", "title": "Collaborative Robots", "description": "Safe, intelligent cobots that work alongside humans in various environments."}, {"icon": "Eye", "title": "Vision Systems", "description": "Advanced computer vision for object recognition, inspection, and navigation."}, {"icon": "Cpu", "title": "Motion Control", "description": "Precise motor control and path planning for complex robotic movements."}], "vision_title": "Machines That Think", "vision_text": "Our robotics solutions combine advanced AI with precision engineering to create machines that understand, adapt, and excel."}'),
('cleantech', 'Clean Technology', 'Developing sustainable solutions for a greener, cleaner future with innovative environmental technologies.', 'Leaf', '{"stats": [{"value": "50%", "label": "Carbon Reduction"}, {"value": "1M+", "label": "Liters Purified"}, {"value": "100+", "label": "Sites Deployed"}, {"value": "0", "label": "Waste Generated"}], "capabilities": [{"icon": "Droplets", "title": "Water Purification", "description": "AI-powered autonomous systems for river and water body restoration."}, {"icon": "Sun", "title": "Solar Solutions", "description": "Smart solar energy systems with AI-optimized distribution."}, {"icon": "Wind", "title": "Air Quality", "description": "Advanced air purification and monitoring systems for urban environments."}, {"icon": "Recycle", "title": "Waste Management", "description": "Intelligent waste sorting and recycling automation solutions."}], "vision_title": "Technology for the Planet", "vision_text": "We believe technology should heal, not harm. Our clean tech solutions are designed to restore and protect our environment."}'),
('global-delivery', 'Global Delivery', 'Delivering innovation worldwide with reliable logistics and seamless international operations.', 'Globe', '{"stats": [{"value": "50+", "label": "Countries"}, {"value": "1000+", "label": "Deliveries"}, {"value": "99.9%", "label": "On-Time Rate"}, {"value": "24/7", "label": "Support"}], "capabilities": [{"icon": "Truck", "title": "Express Shipping", "description": "Fast and reliable delivery to destinations worldwide."}, {"icon": "Package", "title": "Secure Packaging", "description": "Professional packaging solutions to ensure product safety."}, {"icon": "MapPin", "title": "Real-time Tracking", "description": "Track your shipments in real-time from dispatch to delivery."}, {"icon": "Headphones", "title": "Customer Support", "description": "Dedicated support team available 24/7 for any queries."}], "vision_title": "Connecting the World", "vision_text": "Our global delivery network ensures that cutting-edge technology reaches every corner of the world."}');

-- Insert default content for stats pages
INSERT INTO public.page_content (page_key, page_title, page_subtitle, hero_icon, content) VALUES
('active-projects', '5+ Active Projects', 'Building India Tomorrow, Today. Each project is a bold step towards transforming India into a global technology leader.', 'Rocket', '{"mission": "To develop game-changing technologies that solve India biggest challenges—from clean water and sustainable energy to accessible AI and smart agriculture."}'),
('products-shipped', 'Products Shipped', 'Delivering innovation and quality to customers worldwide with reliable and fast shipping.', 'Package', '{"stats": [{"value": "10,000+", "label": "Products Shipped"}, {"value": "50+", "label": "Countries Reached"}, {"value": "99.9%", "label": "Delivery Success"}, {"value": "4.8/5", "label": "Customer Rating"}], "description": "From concept to customer, we ensure every product reaches its destination safely and on time."}'),
('countries-impacted', 'Global Impact', 'Reaching communities across the globe with transformative technology solutions.', 'Globe', '{"stats": [{"value": "50+", "label": "Countries"}, {"value": "1M+", "label": "Lives Impacted"}, {"value": "200+", "label": "Partners"}, {"value": "24/7", "label": "Global Support"}], "description": "Our technology solutions are making a difference in communities around the world."}'),
('customer-satisfaction', 'Customer Satisfaction', 'Delivering excellence and building lasting relationships with our customers.', 'Heart', '{"stats": [{"value": "98%", "label": "Satisfaction Rate"}, {"value": "4.9/5", "label": "Average Rating"}, {"value": "1000+", "label": "Happy Customers"}, {"value": "24/7", "label": "Support Available"}], "description": "Customer satisfaction is at the heart of everything we do. We strive to exceed expectations."}');