const prisma = require('../config/db');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { id, role } = req.user;
    let projects;

    if (role === 'SUPERVISOR' || role === 'ADMIN') {
      // Supervisors see projects they supervise
      projects = await prisma.project.findMany({
        where: { supervisorId: id },
        include: {
          assignee: { select: { fullName: true, email: true } },
          _count: { select: { tasks: true, documents: true } }
        }
      });
    } else {
      // BAs see projects assigned to them
      projects = await prisma.project.findMany({
        where: { assigneeId: id },
        include: {
          supervisor: { select: { fullName: true, email: true } },
          _count: { select: { tasks: true, documents: true } }
        }
      });
    }

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Supervisor/Admin only)
const createProject = async (req, res) => {
  try {
    const { title, description, deadline, assigneeId } = req.body;
    
    const project = await prisma.project.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        supervisorId: req.user.id,
        assigneeId: assigneeId || null
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: { select: { fullName: true, email: true } },
        supervisor: { select: { fullName: true, email: true } },
        tasks: {
          orderBy: { createdAt: 'desc' }
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Auth check: Is user assignee or supervisor?
    if (project.assigneeId !== req.user.id && project.supervisorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching project details' });
  }
};

module.exports = { getProjects, createProject, getProjectById };
