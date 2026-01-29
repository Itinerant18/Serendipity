-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL, -- Logical reference to product in Main or Seller DB
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(100),
  comment TEXT,
  media JSONB DEFAULT '[]', -- Array of {url, type, size}
  is_verified_purchase BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Prevent multiple reviews for same product by same user
  UNIQUE(user_id, product_id)
);

-- Create review responses table (for seller replies)
CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  seller_profile_id UUID NOT NULL, -- Logical reference to seller profile
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- One response per review
  UNIQUE(review_id)
);

-- Create helpful votes table
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- One vote per user per review
  UNIQUE(review_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Security Policies (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "Public reviews are viewable by everyone" 
ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their purchases" 
ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Policies for responses
CREATE POLICY "Public responses are viewable by everyone" 
ON review_responses FOR SELECT USING (true);

-- Policies for votes
CREATE POLICY "Public votes are viewable by everyone" 
ON review_helpful_votes FOR SELECT USING (true);

CREATE POLICY "Users can vote" 
ON review_helpful_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their vote" 
ON review_helpful_votes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their vote" 
ON review_helpful_votes FOR DELETE USING (auth.uid() = user_id);
