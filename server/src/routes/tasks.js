const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createTask, updateTask, deleteTask, listTasks, completeTask } = require('../controllers/taskController');

router.use(protect);

router.get('/', listTasks);
router.post('/', authorize('coach', 'admin'), createTask);
router.put('/:id', authorize('coach', 'admin'), updateTask);
router.delete('/:id', authorize('coach', 'admin'), deleteTask);
router.post('/:id/complete', authorize('client'), completeTask);

module.exports = router;
