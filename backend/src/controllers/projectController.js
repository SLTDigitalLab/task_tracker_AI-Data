const prisma = require('../config/db');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { id, role } = req.user;
    let projects;

    if (role === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: {
          assignee: { select: { fullName: true, email: true } },
          supervisor: { select: { fullName: true, email: true } },
          _count: { select: { tasks: true, documents: true } }
        },
        orderBy: { updatedAt: 'desc' }
      });
    } else if (role === 'SUPERVISOR') {
      projects = await prisma.project.findMany({
        where: { supervisorId: id },
        include: {
          assignee: { select: { fullName: true, email: true } },
          supervisor: { select: { fullName: true, email: true } },
          _count: { select: { tasks: true, documents: true } }
        },
        orderBy: { updatedAt: 'desc' }
      });
    } else {
      // BAs see projects assigned to them
      projects = await prisma.project.findMany({
        where: { assigneeId: id },
        include: {
          assignee: { select: { fullName: true, email: true } },
          supervisor: { select: { fullName: true, email: true } },
          _count: { select: { tasks: true, documents: true } }
        },
        orderBy: { updatedAt: 'desc' }
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
    const { title, description, status, progress, assigneeId, assignedDate } = req.body;
    
    const project = await prisma.project.create({
      data: {
        title,
        description,
        status: status || 'BACKLOG',
        progress: progress !== undefined ? parseInt(progress, 10) : 0,
        supervisorId: req.user.id,
        assigneeId: assigneeId || null,
        assignedDate: assignedDate ? new Date(assignedDate) : new Date()
      },
      include: {
        assignee: { select: { fullName: true, email: true } },
        supervisor: { select: { fullName: true, email: true } },
        _count: { select: { tasks: true, documents: true } }
      }
    });

    if (assigneeId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          projectId: project.id,
          message: `You have been assigned to a new project: ${project.title}`
        }
      });
    }

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Supervisor/Admin only)
const updateProject = async (req, res) => {
  try {
    const { title, description, status, progress, assigneeId, assignedDate } = req.body;
    const projectId = req.params.id;

    const existingProject = await prisma.project.findUnique({ where: { id: projectId } });
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const dataToUpdate = {
      title,
      description,
      status,
      assigneeId: assigneeId || null
    };

    if (progress !== undefined) {
      dataToUpdate.progress = parseInt(progress, 10);
    }

    if (assignedDate !== undefined) {
      dataToUpdate.assignedDate = assignedDate ? new Date(assignedDate) : new Date();
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: dataToUpdate,
      include: {
        assignee: { select: { fullName: true, email: true } },
        supervisor: { select: { fullName: true, email: true } },
        _count: { select: { tasks: true, documents: true } }
      }
    });

    if (assigneeId && existingProject.assigneeId !== assigneeId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          projectId: project.id,
          message: `You have been assigned to project: ${project.title}`
        }
      });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating project' });
  }
};

// @desc    Update project Kanban status and progress
// @route   PATCH /api/projects/:id/status
// @access  Private (Assignee BA, Project Supervisor, or Admin)
const updateProjectStatus = async (req, res) => {
  try {
    const { status, progress } = req.body;
    const projectId = req.params.id;

    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: { assignee: true, supervisor: true }
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isAssignee = existingProject.assigneeId === req.user.id;
    const isSupervisor = existingProject.supervisorId === req.user.id || req.user.role === 'SUPERVISOR' || req.user.role === 'ADMIN';

    if (!isAssignee && !isSupervisor) {
      return res.status(403).json({ message: 'Not authorized to update this project status' });
    }

    const dataToUpdate = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (progress !== undefined) dataToUpdate.progress = Math.min(100, Math.max(0, parseInt(progress, 10) || 0));

    const project = await prisma.project.update({
      where: { id: projectId },
      data: dataToUpdate,
      include: {
        assignee: { select: { fullName: true, email: true } },
        supervisor: { select: { fullName: true, email: true } },
        _count: { select: { tasks: true, documents: true } }
      }
    });

    // Trigger notification if status moved
    if (status && status !== existingProject.status) {
      const notifyTargetId = isAssignee ? existingProject.supervisorId : existingProject.assigneeId;
      if (notifyTargetId && notifyTargetId !== req.user.id) {
        await prisma.notification.create({
          data: {
            userId: notifyTargetId,
            projectId: project.id,
            message: `Project "${project.title}" moved to ${status.replace('_', ' ')} (${project.progress}%) by ${req.user.fullName}.`
          }
        });
      }
    }

    res.json(project);
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ message: 'Server error updating project status' });
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

module.exports = { getProjects, createProject, getProjectById, updateProject, updateProjectStatus };
