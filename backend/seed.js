const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // Create Supervisor
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@slt.com' },
    update: {},
    create: {
      fullName: 'Admin Supervisor',
      inspNumber: 'INSP-100',
      nic: '123456789V',
      designation: 'Senior Manager',
      department: 'IT',
      email: 'supervisor@slt.com',
      username: 'supervisor',
      passwordHash: passwordHash,
      role: 'SUPERVISOR'
    }
  });

  // Create BA
  const ba = await prisma.user.upsert({
    where: { email: 'ba@slt.com' },
    update: {},
    create: {
      fullName: 'Alice Smith',
      inspNumber: 'INSP-200',
      nic: '987654321V',
      designation: 'Business Analyst',
      department: 'IT',
      email: 'ba@slt.com',
      username: 'alicesmith',
      passwordHash: passwordHash,
      role: 'BA'
    }
  });

  // Create a Project
  const project = await prisma.project.create({
    data: {
      title: 'Project Alpha - BRD Refinement',
      description: 'Refining the Business Requirements Document for the new CRM system.',
      supervisorId: supervisor.id,
      assigneeId: ba.id,
      status: 'ONGOING'
    }
  });

  // Create a Task
  await prisma.task.create({
    data: {
      title: 'Draft CRM requirements',
      description: 'Compile the initial draft from stakeholder meetings.',
      priority: 'HIGH',
      projectId: project.id,
      assigneeId: ba.id
    }
  });

  console.log('Database seeded successfully!');
  console.log('Supervisor login: username: supervisor, password: password123');
  console.log('BA login: username: alicesmith, password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
