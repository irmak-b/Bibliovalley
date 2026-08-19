const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Kullanıcının TBR listesini getir
router.get('/:userId', async (req, res) => {
  try {
    const tbr = await prisma.tbrItem.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tbr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TBR'a kitap ekle
router.post('/add', async (req, res) => {
  const { userId, title, author, coverUrl, priority, status } = req.body;
  try {
    const item = await prisma.tbrItem.create({
      data: { userId, title, author, coverUrl, priority, status: status || 'Queue' }
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TBR durum güncelle
router.put('/status/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await prisma.tbrItem.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TBR'dan sil
router.delete('/:id', async (req, res) => {
  try {
    await prisma.tbrItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;