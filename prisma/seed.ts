
  // 9. Create demo holiday
  const holiday = await prisma.holiday.create({
    data: {
      orgId: org.id,
      companyId: company.id,
      houseId: house.id,
      holidayId: `HOL-${String(now.getFullYear()).slice(2)}-NEW`,
      name: 'New Year\'s Day',
      date: new Date(`${now.getFullYear()}-01-01`),
      type: 'federal',
      observed: true,
      notes: 'Non-working day. All staff off.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 10. Create demo certification
  const cert = await prisma.certification.create({
    data: {
      orgId: org.id,
      employeeId: employee.id,
      certId: `CERT-${String(now.getFullYear()).slice(2)}-CPR`,
      issuer: 'Red Cross',
      certNumber: 'RC-2023-88421',
      issuingDate: new Date('2023-06-01'),
      expiryDate: new Date('2026-05-31'),
      status: 'valid',
      issuedBy: 'Red Cross Training Center - Sacramento',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 11. Create demo work schedule
  await prisma.workSchedule.createMany({
    data: [
      {
        orgId: org.id,
        employeeId: employee.id,
        payrollPeriodId: period.id,
        scheduleType: 'shift',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '16:00',
        isBreak: false,
        comment: 'Standard weekday shift',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        orgId: org.id,
        employeeId: employee.id,
        payrollPeriodId: period.id,
        scheduleType: 'shift',
        dayOfWeek: 2,
        startTime: '08:00',
        endTime: '16:00',
        isBreak: false,
        comment: 'Standard weekday shift',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        orgId: org.id,
        employeeId: employee.id,
        payrollPeriodId: period.id,
        scheduleType: 'shift',
        dayOfWeek: 3,
        startTime: '08:00',
        endTime: '16:00',
        isBreak: false,
        comment: 'Standard weekday shift',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        orgId: org.id,
        employeeId: employee.id,
        payrollPeriodId: period.id,
        scheduleType: 'shift',
        dayOfWeek: 4,
        startTime: '08:00',
        endTime: '16:00',
        isBreak: false,
        comment: 'Standard weekday shift',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        orgId: org.id,
        employeeId: employee.id,
        payrollPeriodId: period.id,
        scheduleType: 'shift',
        dayOfWeek: 5,
        startTime: '08:00',
        endTime: '16:00',
        isBreak: false,
        comment: 'Standard weekday shift',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });

  // 12. Create demo benefit enrollment
  const enrollment = await prisma.benefitEnrollment.create({
    data: {
      orgId: org.id,
      employeeId: employee.id,
      benefitId: benefit1.id,
      enrollmentId: `BEN-ENR-${String(now.getFullYear())}-${employee.employeeCode}`,
      coverage: 'individual',
      effectiveDate: new Date('2026-01-01'),
      endDate: new Date(`${now.getFullYear() + 1}-12-31`),
      status: 'active',
      optedOut: false,
      dateElected: new Date('2025-11-15'),
      premiumPaid: 150,
      paidBy: 'employer',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 13. Create demo document
  const doc = await prisma.document.create({
    data: {
      orgId: org.id,
      userId: admin1.id,
      employeeId: employee.id,
      type: 'handbooks',
      folder: 'policies',
      filename: 'hcr-handbook-2025.pdf',
      originalName: 'HCR Employee Handbook 2025.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2457600,
      url: 'https://storage.hcr-demo.com/handbooks/hcr-handbook-2025.pdf',
      status: 'uploaded',
      isSigned: false,
      uploadedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 14. Create demo approval (pending timesheet approval)
  await prisma.approval.create({
    data: {
      orgId: org.id,
      payrollPeriodId: period.id,
      employeeId: employee.id,
      timesheetId: randomUUID(),
      approverId: admin1.id,
      approverName: 'Sarah Chen',
      status: 'pending',
      reasonRequired: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('Demo data seeded successfully!');
  console.log(`  Organization: ${org.dbName}`);
  console.log(`  Company: ${company.name}`);
  console.log(`  House: ${house.name}`);
  console.log(`  Admin: ${admin1.email}`);
  console.log(`  Employee: ${employee.email}`);
  console.log(`  Payroll Period: ${period.payrollId}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


  // 4. Create a demo payroll period (current)
  const now = new Date();
  const period = await prisma.payrollPeriod.create({
    data: {
      orgId: org.id,
      companyId: company.id,
      houseId: house.id,
      payrollId: `PRP-${String(now.getFullYear()).slice(2)}-01`,
      name: `Period 01 - ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      status: 'draft',
      payrateType: 'hourly',
      standardHours: 40,
      contractorsOnly: false,
      bankAccountNumber: '************4231',
      bankRoutingNumber: '************021000019',
      bankName: 'First DSP Credit Union',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 5. Create admin users
  const passwordHash = await bcrypt.hash('Dem0Demo123!', 10);

  const admin1 = await prisma.user.create({
    data: {
      orgId: org.id,
      companyId: company.id,
      email: 'admin@hrv-homes.com',
      emailVerifiedAt: new Date(),
      passwordHash,
      name: 'Sarah Chen',
      firstName: 'Sarah',
      lastName: 'Chen',
      phone: '+19165550101',
      photoUrl: '/avatars/sarah.png',
      role: 'admin',
      status: 'active',
      mfaEnabled: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      orgId: org.id,
      companyId: company.id,
      email: 'director@hrv-homes.com',
      emailVerifiedAt: new Date(),
      passwordHash,
      name: 'David Okafor',
      firstName: 'David',
      lastName: 'Okafor',
      phone: '+19165550102',
      photoUrl: '/avatars/david.png',
      role: 'super_admin',
      status: 'active',
      mfaEnabled: true,
      mfaSecret: 'JBSWOWYJ4CIQOQZQKGBJLLWUOZKPG7KQZUZWDZKXKZXCVDGBHNM2',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 6. Create a demo employee
  const employee = await prisma.employee.create({
    data: {
      orgId: org.id,
      companyId: company.id,
      houseId: house.id,
      userId: admin1.id,
      employeeCode: `EMP-${String(now.getFullYear()).slice(2)}001`,
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@hrv-homes.com',
      phone: '+19165550111',
      ssnLast4: '1234',
      dob: new Date('1992-05-18'),
      gender: 'Female',
      race: 'Hispanic/Latino',
      hireDate: new Date('2022-08-15'),
      terminationDate: null,
      positionTitle: 'Home Care Aide',
      accessLevel: 'normal',
      emergencyContactName: 'Rosa Garcia',
      emergencyContactPhone: '(916) 555-0122',
      enrollmentStatus: 'active',
      status: 'active',
      photoUrl: '/avatars/maria.png',
      notes: 'Full-time awake household staff.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 7. Create demo program
  const program = await prisma.program.create({
    data: {
      orgId: org.id,
      companyId: company.id,
      houseId: house.id,
      programId: `PROG-${String(now.getFullYear()).slice(2)}-AC`,
      name: 'Autism Care Program',
      code: 'AC-2025',
      description: 'Behavioral health program for adults with Autism Spectrum Disorder. Requires 1:1 supervision.',
      active: true,
      sortOrder: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 8. Create demo benefits
  const benefit1 = await prisma.benefit.create({
    data: {
      orgId: org.id,
      companyId: company.id,
      houseId: house.id,
      benefitId: `BEN-${String(now.getFullYear()).slice(2)}-HI`,
      name: 'Medical - Individual',
      category: 'health',
      type: 'employer',
      coverage: 'individual',
      monthlyCost: 150,
      companyShare: 250,
      active: true,
      sortOrder: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const benefit2 = await prisma.benefit.create({
    data: {
      orgId: org.id,
      companyId: company.id,
      benefitId: `BEN-${String(now.getFullYear()).slice(2)}-DVD`,
      name: 'Dental - Individual',
      category: 'dental',
      type: 'employer',
      coverage: 'individual',
      monthlyCost: 30,
      companyShare: 60,
      active: true,
      sortOrder: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const benefit3 = await prisma.benefit.create({
    data: {
      orgId: org.id,
      companyId: company.id,
      benefitId: `BEN-${String(now.getFullYear()).slice(2)}-LIT`,
      name: 'Life Insurance',
      category: 'life',
      type: 'employer',
      coverage: 'individual',
      monthlyCost: 0,
      companyShare: 15,
      active: true,
      sortOrder: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

// Prisma seed — demo data for HCR Payroll & HR SaaS
// Run: pnpm db:seed
// Usage: Only in development / demo mode. Never run in production.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const demoMode = process.env.DEMO_MODE === 'true';

  if (!demoMode) {
    console.log('DEMO_MODE is not enabled. Skipping seed.');
    return;
  }

  console.log('Seeding HCR demo data...');

  // 1. Create a demo organization
  const org = await prisma.organization.create({
    data: {
      legalName: 'Home Care Residential',
      dbName: 'hcr-demo',
      bannerColor: '#0a97a0',
      logoUrl: '/logo.svg',
      coverImgUrl: '/cover.svg',
      tosUrl: '/tos',
      privacyUrl: '/privacy',
      registeredAt: new Date(),
      active: true,
      isDemo: true,
    },
  });

  // 2. Create a demo company
  const company = await prisma.company.create({
    data: {
      orgId: org.id,
      name: 'HRV North Sacramento Branch',
      code: '854f9453-d7a0-4e1f-b2c3-9d6e1f0a3b8c',
      address1: '1200 Industrial Parkway',
      address2: 'Suite 200',
      city: 'Sacramento',
      state: 'CA',
      postalCode: '95815',
      country: 'US',
      phone: '(916) 555-0142',
      website: 'https://hrv-homes.com',
      industry: 'Home Care / DSP',
      onboardingUrl: '/onboarding',
      settings: { payroll_frequency: 'biweekly', currency: 'USD' },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 3. Create a demo house
  const house = await prisma.house.create({
    data: {
      orgId: org.id,
      companyId: company.id,
      name: 'Sunrise House',
      code: 'HRV-SN-001',
      address1: '4500 Sunrise Avenue',
      city: 'Sacramento',
      state: 'CA',
      postalCode: '95821',
      country: 'US',
      email: 'manager@hrv-homes.com',
      phone: '(916) 555-0188',
      managerName: 'Maria Santos',
      managerPhone: '(916) 555-0177',
      settings: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
