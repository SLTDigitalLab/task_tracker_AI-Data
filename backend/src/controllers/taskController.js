const prisma = require('../config/db');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { id, role } = req.user;
    let tasks;

    if (role === 'SUPERVISOR' || role === 'ADMIN') {
      tasks = await prisma.task.findMany({
        include: {
          assignee: { select: { fullName: true } },
          project: { select: { title: true } }
        }
      });
    } else {
      tasks = await prisma.task.findMany({
        where: { assigneeId: id },
        include: {
          project: { select: { title: true } }
        }
      });
    }

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Supervisor/Admin)
const createTask = async (req, res) => {
  try {
    const { title, description, priority, deadline, projectId, assigneeId } = req.body;
    
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        deadline: new Date(deadline),
        projectId,
        assigneeId
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating task status' });
  }
};

module.exports = { getTasks, createTask, updateTaskStatus };
