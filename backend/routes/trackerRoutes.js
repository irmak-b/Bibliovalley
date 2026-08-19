// backend/routes/trackerRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. GET /api/tracker/:userId - Kullanıcının kitaplarını getir
router.get('/:userId', async (req, res) => {
  try {
    const logs = await prisma.readingLog.findMany({
      where: { userId: req.params.userId },
    });
    res.json(logs);
  } catch (err) {
    console.error('Tracker get hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /api/tracker/add - Yeni kitap ekle
router.post('/add', async (req, res) => {
  const { userId, month, title, author, coverUrl, pages, rating, isFavorite } = req.body;
  try {
    const newLog = await prisma.readingLog.create({
      data: {
        userId,
        month,
        title,
        author: author || 'Unknown Author',
        coverUrl: coverUrl || '',
        pages: Number(pages) || 0,
        rating: Number(rating) || 5,
        isFavorite: Boolean(isFavorite),
      },
    });
    res.json(newLog);
  } catch (err) {
    console.error('Tracker add hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. PUT /api/tracker/favorite - Ayın şampiyonunu güncelle
router.put('/favorite', async (req, res) => {
  const { id, month, userId } = req.body;
  try {
    // Aynı ay içindeki diğer kitapların şampiyonluğunu sıfırla
    await prisma.readingLog.updateMany({
      where: { userId, month },
      data: { isFavorite: false },
    });

    // Seçilen kitabı şampiyon yap
    const updated = await prisma.readingLog.update({
      where: { id },
      data: { isFavorite: true },
    });

    res.json(updated);
  } catch (err) {
    console.error('Tracker favorite hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;