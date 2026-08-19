// 1. Load environment variables FIRST before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Initialize Gemini SDK with safety check
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY is not defined in .env file!');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware
app.use(cors());
app.use(express.json());

// Solvation for 304 code
app.set('etag', false);

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});


const resolveUserId = (req) => {
  const headerId = req.headers['x-user-id'] || req.query.userId || req.body?.userId;
  return headerId ? String(headerId) : null;
};

// Shop coordinate map for default positions
const GENRE_POSITIONS = {
  fantasy: { x: 22, y: 19 },
  scifi: { x: 73, y: 15 },
  romance: { x: 57, y: 34 },
  horror: { x: 36, y: 44 },
  mystery: { x: 50, y: 45 },
  historical: { x: 76, y: 51 },
  dystopian: { x: 38, y: 64 },
  classics: { x: 68, y: 80 },
  gothic: { x: 26, y: 83 },
  ya: { x: 42, y: 89 },
  mythology: { x: 18, y: 39 },
};

// ================= 1. SYSTEM & HEALTH CHECK =================

app.get('/', (req, res) => {
  res.send('Bibliovalley API is running! 🏰📖');
});

app.get('/api/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({
      success: true,
      message: 'PostgreSQL database connected successfully! 🎉',
      userCount: userCount,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect to database.',
      details: error.message,
    });
  }
});

// ================= 2. AUTHENTICATION ENDPOINTS =================

// REGISTER (Wanderer Initiation)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, guildClass } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All parchment fields must be inscribed.' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'A wanderer with this name or seal already walks the valley.' });
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
        guildClass: guildClass || 'Valley Scribe',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Welcome to the Guild, wanderer! ✨',
      user: { id: user.id, username: user.username, email: user.email, guildClass: user.guildClass },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Guild registry error: ' + error.message });
  }
});

// LOGIN (Unhinge the Gateway)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: username }, { username: username }],
        password: password,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'The runes do not align. Invalid credentials.' });
    }

    return res.json({
      success: true,
      message: 'The gates swing open! 🗝️',
      user: { id: user.id, username: user.username, email: user.email, guildClass: user.guildClass },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Gateway error: ' + error.message });
  }
});

// ================= 3. BIBI CHAT & HISTORY =================

// GET
app.get('/api/fairy/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await prisma.fairyMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
app.post('/api/fairy/chat', async (req, res) => {
  try {
    const { messages, userId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const latestUserMsg = messages[messages.length - 1];

    // 1. PostgreSQL save
    if (userId && latestUserMsg && latestUserMsg.sender === 'user') {
      await prisma.fairyMessage.create({
        data: {
          userId,
          sender: 'user',
          text: latestUserMsg.text,
        },
      });
    }

    const formattedContents = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const systemPrompt = `You are Bibi, the magical, bespectacled fairy guardian of Bibliovalley.
You dwell within the ancient Tree of Wisdom.
Your personality: Gentle, enthusiastic about fantasy lore and books, wise, poetic, slightly playful, and very helpful.
Your goal: Help travelers with book recommendations across various genres (Fantasy, Sci-Fi, Gothic, Romance, Dystopian, etc.), share memorable book quotes, and encourage them on their reading journey in the valley.
Keep your answers engaging, concise (1-3 short paragraphs max), and sprinkle in gentle magical metaphors (e.g., "by the starlight", "the scrolls whisper", "dear wanderer"). Speak in the language the user addresses you with (English or Turkish).`;

    // 2. Gemini 3.6 Flash response
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const replyText = response.text;

    // 3. Save the BIBI'S answer
    if (userId && replyText) {
      await prisma.fairyMessage.create({
        data: {
          userId,
          sender: 'fairy',
          text: replyText,
        },
      });
    }

    return res.json({
      reply: replyText,
    });
  } catch (error) {
    console.error('Bibi AI Chat Error:', error);
    return res.status(500).json({
      error: 'Bibi could not reach the stars for guidance right now.',
      details: error.message,
    });
  }
});

// ================= 4. OPEN LIBRARY SEARCH PROXY =================

app.get('/api/books/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'Search query (q) is required.' });
    }

    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`,
      {
        headers: {
          'User-Agent': 'BibliovalleyBookApp/1.0 (contact@bibliovalley.com)',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return res.status(502).json({ error: 'Could not reach Open Library services.' });
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.docs)) {
      return res.json([]);
    }

    const cleanedBooks = data.docs
      .map((book) => {
        try {
          let authorName = 'Unknown Author';
          if (Array.isArray(book.author_name) && book.author_name.length > 0) {
            authorName = book.author_name.join(', ');
          } else if (typeof book.author_name === 'string') {
            authorName = book.author_name;
          }

          let cover = null;
          if (book.cover_i) {
            cover = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
          } else if (Array.isArray(book.isbn) && book.isbn.length > 0) {
            cover = `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`;
          }

          return {
            externalId: String(book.key || book.cover_i || Math.random()),
            title: String(book.title || 'Untitled Book'),
            author: authorName,
            coverUrl: cover,
            pages: book.number_of_pages_median || null,
            firstPublishYear: book.first_publish_year || null,
          };
        } catch (itemErr) {
          return null;
        }
      })
      .filter(Boolean);

    return res.json(cleanedBooks);
  } catch (error) {
    console.error('Book Search Error:', error);
    return res.status(500).json({
      error: 'An error occurred while searching for books.',
      details: error.message,
    });
  }
});

// ================= 5. PARCHMENTS & SHOPS =================

// Create & Seal New Parchment
app.post('/api/parchments', async (req, res) => {
  try {
    const { book, genre, rating, thoughts, quotes } = req.body;
    const normalizedGenre = (genre || 'fantasy').toLowerCase();

    if (!book) {
      return res.status(400).json({ error: 'Book details are required.' });
    }

    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User must be authenticated.' });
    }

    let shop = await prisma.shop.findFirst({
      where: {
        userId: userId,
        genre: normalizedGenre,
      },
    });

    if (!shop) {
      const pos = GENRE_POSITIONS[normalizedGenre] || { x: 50, y: 50 };
      shop = await prisma.shop.create({
        data: {
          genre: normalizedGenre,
          positionX: pos.x,
          positionY: pos.y,
          userId: userId,
        },
      });
    }

    const newParchment = await prisma.parchment.create({
      data: {
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        externalId: String(book.externalId || Date.now()),
        pages: book.pages ? Number(book.pages) : null,
        rating: Number(rating) || 5,
        thoughts: thoughts || '',
        quotes: quotes || '',
        userId: userId,
        shopId: shop.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Parchment sealed and added to the shop! 📜✨',
      parchment: newParchment,
    });
  } catch (error) {
    console.error('Parchment Creation Error:', error);
    return res.status(500).json({ error: 'Failed to seal parchment: ' + error.message });
  }
});

// Get Parchments by Shop Genre
app.get('/api/shops/:genre/parchments', async (req, res) => {
  try {
    const { genre } = req.params;
    const normalizedGenre = (genre || '').toLowerCase();
    const userId = resolveUserId(req);

    if (!userId) {
      return res.json([]);
    }

    const shop = await prisma.shop.findFirst({
      where: {
        genre: normalizedGenre,
        userId: userId, // <-- Yalnızca giriş yapan kullanıcının dükkanı
      },
      include: {
        parchments: {
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!shop) {
      return res.json([]);
    }

    return res.json(shop.parchments);
  } catch (error) {
    console.error('Fetch Shop Parchments Error:', error);
    return res.status(500).json({ error: 'Failed to fetch parchments.' });
  }
});

// Delete Parchment
app.delete('/api/parchments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.parchment.delete({ where: { id } });
    return res.json({ success: true, message: 'Parchment deleted successfully. 🗑️' });
  } catch (error) {
    console.error('Delete Parchment Error:', error);
    return res.status(500).json({ error: 'Failed to delete parchment.' });
  }
});

// ================= 6. TBR (TO BE READ) SCROLL =================

// Get TBR List
app.get(['/api/tbr', '/api/tbr/:userId'], async (req, res) => {
  try {
    const userId = req.params.userId || resolveUserId(req);
    if (!userId) return res.json([]);

    const items = await prisma.tbrItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Item to TBR
app.post(['/api/tbr', '/api/tbr/add'], async (req, res) => {
  try {
    const userId = req.body.userId || resolveUserId(req);
    if (!userId) return res.status(401).json({ error: 'User must be authenticated.' });

    const { title, author, coverUrl, externalId, pages, priority, status, targetGenre, notes } = req.body;

    const item = await prisma.tbrItem.create({
      data: {
        title,
        author: author || 'Unknown Bard',
        coverUrl: coverUrl || '',
        externalId: String(externalId || ''),
        pages: pages ? Number(pages) : null,
        priority: priority || 'Medium',
        status: status || 'Queue',
        targetGenre: (targetGenre || 'fantasy').toLowerCase(),
        notes: notes || '',
        userId: userId,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update TBR Item Status
app.all(['/api/tbr/:id', '/api/tbr/status/:id'], async (req, res, next) => {
  if (req.method !== 'PATCH' && req.method !== 'PUT') return next();
  try {
    const { id } = req.params;
    const { status, priority, notes, targetGenre } = req.body;

    const updated = await prisma.tbrItem.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(notes !== undefined && { notes }),
        ...(targetGenre && { targetGenre: targetGenre.toLowerCase() }),
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete TBR Item
app.delete('/api/tbr/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tbrItem.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= 7. READING TRACKER & PLAYOFFS =================

// 1. Daily Heatmap Logs 
app.get('/api/tracker/daily', async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'userId gerekli.' });
    }

    const logs = await prisma.dailyLog.findMany({
      where: { userId },
    });

    console.log('[GET /api/tracker/daily] userId:', userId, '-> bulunan kayıt sayısı:', logs.length, logs);

    const logMap = {};
    logs.forEach((l) => {
      logMap[`${l.year}-${l.month}-${l.day}`] = l.pages;
    });

    res.json(logMap);
  } catch (err) {
    console.error('Daily log getirme hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Save Daily Read Pages 
app.post('/api/tracker/daily', async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'userId gerekli.' });
    }

    const day = Number(req.body.day);
    const month = Number(req.body.month);
    const year = Number(req.body.year) || 2026;
    const pages = Number(req.body.pages) || 0;

    console.log('[POST /api/tracker/daily] userId:', userId, { day, month, year, pages });

    const log = await prisma.dailyLog.upsert({
      where: {
        userId_year_month_day: {
          userId: userId,
          year: year,
          month: month,
          day: day,
        },
      },
      update: {
        pages: pages
      },
      create: {
        userId: userId,
        year: year,
        month: month,
        day: day,
        pages: pages,
      },
    });

    return res.json({ success: true, log });
  } catch (err) {
    console.error('Daily log kaydetme hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Monthly Shelves
app.get(['/api/tracker/months', '/api/tracker', '/api/tracker/:userId'], async (req, res) => {
  try {
    const userId = req.params.userId || resolveUserId(req);
    if (!userId) return res.json([]);

    const books = await prisma.monthlyBook.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Add Book to Month
app.post(['/api/tracker/months', '/api/tracker/add', '/api/tracker'], async (req, res) => {
  try {
    const userId = req.body.userId || resolveUserId(req);
    if (!userId) return res.status(401).json({ error: 'User must be authenticated.' });

    const { month, year, title, author, coverUrl, rating, pages, isFavorite } = req.body;

    const newBook = await prisma.monthlyBook.create({
      data: {
        month: String(month || 'January'),
        year: Number(year) || 2026,
        title: String(title || 'Untitled'),
        author: String(author || 'Unknown Bard'),
        coverUrl: coverUrl ? String(coverUrl) : null,
        rating: Number(rating) || 5,
        pages: Number(pages) || 0,
        isFavorite: Boolean(isFavorite) || false,
        userId: String(userId),
      },
    });
    res.status(201).json(newBook);
  } catch (err) {
    console.error('🔥 PRISMA HATASI DETAYI:', err);
    res.status(500).json({ error: err.message, meta: err.meta });
  }
});

// 5. Nominate / Crown Champion Book for Playoffs
app.all(['/api/tracker/favorite', '/api/tracker/months/:id/favorite'], async (req, res, next) => {
  if (req.method !== 'PUT' && req.method !== 'PATCH') return next();
  try {
    const userId = req.body.userId || resolveUserId(req);
    if (!userId) return res.status(401).json({ error: 'User must be authenticated.' });

    const id = req.params.id || req.body.id;
    const { month } = req.body;

    if (month) {
      await prisma.monthlyBook.updateMany({
        where: { userId, month },
        data: { isFavorite: false },
      });
    }

    const updated = await prisma.monthlyBook.update({
      where: { id },
      data: { isFavorite: true },
    });

    res.json(updated);
  } catch (err) {
    console.error('Tracker favorite hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================= SERVER START =================

app.listen(PORT, () => {
  console.log(`🏰 Bibliovalley Backend running on http://localhost:${PORT}`);
});
