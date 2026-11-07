-- ====================================================================
-- CAFE QR CODE ORDERING SYSTEM - SUPABASE DATABASE SCHEMA & SEED DATA
-- ====================================================================

-- 1. CAFE INFO TABLE
CREATE TABLE IF NOT EXISTS public.cafe (
    id TEXT PRIMARY KEY DEFAULT 'cafe_main',
    name TEXT NOT NULL DEFAULT 'The Roasted Bean Cafe',
    tagline TEXT DEFAULT 'Artisanal Coffee & Fresh Gourmet Bites',
    logo TEXT DEFAULT 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
    cover_image TEXT DEFAULT 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
    tax_rate NUMERIC DEFAULT 5,
    currency TEXT DEFAULT 'INR',
    tables_count INT DEFAULT 12,
    razorpay_key_id TEXT DEFAULT 'rzp_test_TxJ87ji7k95ncJ',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    mrp NUMERIC,
    portion TEXT DEFAULT 'Regular',
    description TEXT,
    why_love_it JSONB DEFAULT '[]'::jsonb,
    image TEXT,
    is_veg BOOLEAN DEFAULT TRUE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    prep_time TEXT DEFAULT '10 mins',
    rating NUMERIC DEFAULT 4.8,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    table_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL,
    tax NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    payment_method TEXT DEFAULT 'Razorpay',
    payment_id TEXT,
    order_status TEXT DEFAULT 'received',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STAFF ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.staff_alerts (
    id TEXT PRIMARY KEY,
    table_number TEXT NOT NULL,
    type TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.cafe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_alerts ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon Read for Cafe, Categories & Menu
DROP POLICY IF EXISTS "Public can view cafe" ON public.cafe;
CREATE POLICY "Public can view cafe" ON public.cafe FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can update cafe" ON public.cafe;
CREATE POLICY "Public can update cafe" ON public.cafe FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can view menu" ON public.menu_items;
CREATE POLICY "Public can view menu" ON public.menu_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage orders" ON public.orders;
CREATE POLICY "Public can manage orders" ON public.orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage alerts" ON public.staff_alerts;
CREATE POLICY "Public can manage alerts" ON public.staff_alerts FOR ALL USING (true);

-- ====================================================================
-- SEED INITIAL DATA
-- ====================================================================

-- Seed Cafe Info
INSERT INTO public.cafe (id, name, tagline, logo, cover_image, tax_rate, currency, tables_count, razorpay_key_id)
VALUES (
    'cafe_main',
    'The Roasted Bean Cafe',
    'Artisanal Coffee & Fresh Gourmet Bites',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
    5,
    'INR',
    12,
    'rzp_test_TxJ87ji7k95ncJ'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    updated_at = NOW();

-- Seed Categories
INSERT INTO public.categories (id, name) VALUES
('cat_1', 'Espresso & Hot Coffee'),
('cat_2', 'Cold Brews & Shakes'),
('cat_3', 'Artisanal Teas'),
('cat_4', 'Bakery & Croissants'),
('cat_5', 'Sourdough Sandwiches'),
('cat_6', 'Gourmet Desserts')
ON CONFLICT (id) DO NOTHING;

-- Seed Menu Items
INSERT INTO public.menu_items (id, name, category, price, mrp, portion, description, why_love_it, image, is_veg, is_bestseller, is_available, prep_time, rating) VALUES
(
    'item_1',
    'Iced Matcha Latte',
    'Cold Brews & Shakes',
    280,
    340,
    '350ml',
    'Ceremonial grade Uji Japanese matcha whisked with oat milk and poured over chilled ice.',
    '["100% Ceremonial grade Uji Japanese matcha", "Rich in antioxidants and clean natural energy", "Lightly sweetened with organic pure agave"]'::jsonb,
    'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
    TRUE,
    TRUE,
    TRUE,
    '5 mins',
    4.9
),
(
    'item_2',
    'Truffle Mushroom Sourdough Toast',
    'Sourdough Sandwiches',
    340,
    420,
    '2 Slices',
    'Sautéed wild forest mushrooms with black truffle oil and creamy herb ricotta on toasted country sourdough.',
    '["Freshly baked country sourdough bread", "Infused with pure Italian black truffle oil", "Rich velvety house-made herb ricotta"]'::jsonb,
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    TRUE,
    TRUE,
    TRUE,
    '8 mins',
    4.8
),
(
    'item_3',
    'Spanish Cortado',
    'Espresso & Hot Coffee',
    190,
    230,
    '150ml',
    'Equal parts double ristretto espresso and velvety steamed whole milk served in a signature glass.',
    '["Double ristretto from 100% Arabica beans", "Silky textured microfoam milk", "Balanced robust coffee flavor without bitterness"]'::jsonb,
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    TRUE,
    FALSE,
    TRUE,
    '4 mins',
    4.6
),
(
    'item_4',
    'Vanilla Sweet Cream Cold Brew',
    'Cold Brews & Shakes',
    260,
    310,
    '400ml',
    '18-hour slow steeped cold brew topped with house-made Madagascar vanilla sweet cream foam.',
    '["Slow cold-steeped for 18 hours for zero bitterness", "House-made Madagascar Bourbon vanilla foam", "Low acidity and naturally refreshing"]'::jsonb,
    'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
    TRUE,
    TRUE,
    TRUE,
    '4 mins',
    5.0
),
(
    'item_5',
    'Belgian Dark Chocolate Frappe',
    'Cold Brews & Shakes',
    280,
    340,
    '400ml',
    'Thick ice-blended 70% dark Belgian cocoa with whipped cream and chocolate drizzle.',
    '["Authentic 70% dark Belgian couverture cocoa", "Topped with fresh cloud whipped cream", "Decadent yet balanced sweetness"]'::jsonb,
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
    TRUE,
    FALSE,
    TRUE,
    '6 mins',
    4.7
),
(
    'item_6',
    'Kashmiri Kahwa Tea',
    'Artisanal Teas',
    180,
    220,
    '200ml',
    'Fragrant green tea infused with saffron strands, whole green cardamom, cinnamon, and crushed almonds.',
    '["Real pure Kashmiri saffron strands", "Freshly crushed fragrant green cardamom", "Soothing digestive and warming spices"]'::jsonb,
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    TRUE,
    FALSE,
    TRUE,
    '5 mins',
    4.7
),
(
    'item_7',
    'Almond Butter Croissant',
    'Bakery & Croissants',
    210,
    260,
    '1 Piece',
    'Flaky, golden twice-baked French croissant filled with rich frangipane almond cream and toasted flaked almonds.',
    '["French butter laminated with 27 delicate layers", "Rich velvety frangipane almond paste filling", "Golden toasted sliced California almonds"]'::jsonb,
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
    TRUE,
    TRUE,
    TRUE,
    '3 mins',
    4.9
),
(
    'item_8',
    'Avocado & Burrata Sourdough Tartine',
    'Sourdough Sandwiches',
    390,
    480,
    '1 Plate',
    'Hass avocado mash, fresh Italian burrata ball, chili flakes, and balsamic glaze on toasted artisanal sourdough.',
    '["Fresh hand-torn Italian burrata heart", "Fresh Hass avocado seasoned with sea salt", "Aged Modena balsamic glaze drizzle"]'::jsonb,
    'https://images.unsplash.com/photo-1603046891744-1f76eb10aec1?w=600&auto=format&fit=crop&q=80',
    TRUE,
    TRUE,
    TRUE,
    '7 mins',
    4.9
),
(
    'item_9',
    'Smoked Chicken & Basil Pesto Panini',
    'Sourdough Sandwiches',
    360,
    440,
    '1 Panini',
    'Hickory-smoked chicken breast, fresh basil pine-nut pesto, and melted buffalo mozzarella in grilled ciabatta.',
    '["Hickory-smoked tender chicken breast slices", "House-made Genovese basil pine-nut pesto", "Melted creamy buffalo mozzarella"]'::jsonb,
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
    FALSE,
    TRUE,
    TRUE,
    '9 mins',
    4.8
),
(
    'item_10',
    'Burnt Basque Cheesecake',
    'Gourmet Desserts',
    290,
    350,
    '1 Slice',
    'Caramelized caramelized top with an ultra-creamy, custard-like molten center served with berry compote.',
    '["Traditional San Sebastian Basque recipe", "Caramelized charred exterior with gooey molten center", "Served with tart wild blackberry compote"]'::jsonb,
    'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
    TRUE,
    TRUE,
    TRUE,
    '2 mins',
    5.0
),
(
    'item_11',
    'Nutella Sea Salt Cookie Skillet',
    'Gourmet Desserts',
    250,
    300,
    'Warm Skillet',
    'Warm, gooey chocolate chip skillet cookie stuffed with molten Nutella, topped with vanilla gelato and Maldon sea salt.',
    '["Baked fresh in cast iron skillet to order", "Stuffed with molten hazelnut Nutella core", "Sprinkled with Maldon flaky sea salt crystals"]'::jsonb,
    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80',
    TRUE,
    FALSE,
    TRUE,
    '8 mins',
    4.8
),
(
    'item_12',
    'Flat White',
    'Espresso & Hot Coffee',
    210,
    250,
    '200ml',
    'Ristretto specialty coffee blended with a thin layer of velvety micro-foam milk and latte art.',
    '["Artisanal single-origin Arabica roast", "Silky thin microfoam with latte art", "Strong coffee taste with smooth milky finish"]'::jsonb,
    'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80',
    TRUE,
    FALSE,
    TRUE,
    '4 mins',
    4.7
)
ON CONFLICT (id) DO NOTHING;

