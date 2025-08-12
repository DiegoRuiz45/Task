const express = require('express');
const router = express.Router();
const tagCtrl = require('../controllers/tagController');

router.get('/tags', tagCtrl.getAllTags);
router.get('/tags/:id', tagCtrl.getTagById);
router.post('/tags', tagCtrl.createTag);
router.put('/tags/:id', tagCtrl.updateTag);
router.delete('/tags/:id', tagCtrl.deleteTag);

module.exports = router;
