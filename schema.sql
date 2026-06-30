-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  date TIMESTAMP DEFAULT NOW()
);

-- Seed admin user (password: admin123)
INSERT INTO users (username, email, password) VALUES
('admin', 'admin@blog.com', '$2b$10$Xu5YUbNS4UDPGOGSNxGa3.Fj5ZiXiBrjJLaFbI4WVNM3/6nGl4Ey')
ON CONFLICT (email) DO NOTHING;

-- Seed posts owned by admin (user_id = 1)
INSERT INTO posts (title, content, author, user_id, date) VALUES
(
  'The Rise of Decentralized Finance',
  'Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading.',
  'Alex Thompson',
  1,
  '2023-08-01T10:00:00Z'
),
(
  'The Impact of Artificial Intelligence on Modern Businesses',
  'Artificial Intelligence (AI) is no longer a concept of the future. It''s very much a part of our present, reshaping industries and enhancing the capabilities of existing systems. From automating routine tasks to offering intelligent insights, AI is proving to be a boon for businesses. With advancements in machine learning and deep learning, businesses can now address previously insurmountable problems and tap into new opportunities.',
  'Mia Williams',
  1,
  '2023-08-05T14:30:00Z'
),
(
  'Sustainable Living: Tips for an Eco-Friendly Lifestyle',
  'Sustainability is more than just a buzzword; it''s a way of life. As the effects of climate change become more pronounced, there''s a growing realization about the need to live sustainably. From reducing waste and conserving energy to supporting eco-friendly products, there are numerous ways we can make our daily lives more environmentally friendly. This post will explore practical tips and habits that can make a significant difference.',
  'Samuel Green',
  1,
  '2023-08-10T09:15:00Z'
)
ON CONFLICT DO NOTHING;
