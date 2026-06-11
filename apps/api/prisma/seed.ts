import { PrismaClient, BloodGroup, ItemCondition, ShiftType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const BLOOD_GROUPS: BloodGroup[] = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
const CONDITIONS: ItemCondition[] = ['NEW', 'GOOD', 'USED'];
const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'];
const UNITS = ['Eagle Unit', 'Falcon Unit', 'Tiger Unit', 'Lion Unit', 'Phoenix Unit', 'Hawk Unit'];
const SHIFTS: ShiftType[] = ['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'];

function pad(n: number, len = 5) {
  return String(n).padStart(len, '0');
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

async function main() {
  console.log('🌱 Seeding database...');

  // System config
  await prisma.systemConfig.upsert({
    where: { key: 'FINE_PERCENTAGE' },
    update: {},
    create: { key: 'FINE_PERCENTAGE', value: '5' },
  });
  await prisma.systemConfig.upsert({
    where: { key: 'PROGRAM_NAME' },
    update: {},
    create: { key: 'PROGRAM_NAME', value: 'Annual Scouts Program 2024' },
  });
  await prisma.systemConfig.upsert({
    where: { key: 'PROGRAM_START_DATE' },
    update: {},
    create: { key: 'PROGRAM_START_DATE', value: '2024-12-01' },
  });
  await prisma.systemConfig.upsert({
    where: { key: 'PROGRAM_END_DATE' },
    update: {},
    create: { key: 'PROGRAM_END_DATE', value: '2024-12-10' },
  });
  await prisma.systemConfig.upsert({
    where: { key: 'GUARANTOR_THRESHOLD' },
    update: {},
    create: { key: 'GUARANTOR_THRESHOLD', value: '500' },
  });

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@scouts.pk' },
    update: {},
    create: { name: 'System Administrator', email: 'admin@scouts.pk', password: adminPassword, role: 'ADMIN' },
  });

  const opRegPassword = await bcrypt.hash('Operator@1234', 12);
  await prisma.user.upsert({
    where: { email: 'registration@scouts.pk' },
    update: {},
    create: { name: 'Registration Operator', email: 'registration@scouts.pk', password: opRegPassword, role: 'OPERATOR_REGISTRATION' },
  });

  await prisma.user.upsert({
    where: { email: 'inventory@scouts.pk' },
    update: {},
    create: { name: 'Inventory Operator', email: 'inventory@scouts.pk', password: opRegPassword, role: 'OPERATOR_INVENTORY' },
  });

  await prisma.user.upsert({
    where: { email: 'viewer@scouts.pk' },
    update: {},
    create: { name: 'Report Viewer', email: 'viewer@scouts.pk', password: opRegPassword, role: 'VIEWER' },
  });

  // Duty departments
  const departments = await Promise.all([
    prisma.dutyDepartment.upsert({ where: { name: 'Gate A - Main Entrance' }, update: {}, create: { name: 'Gate A - Main Entrance', description: 'Primary access gate', location: 'North Wing' } }),
    prisma.dutyDepartment.upsert({ where: { name: 'Gate B - Side Entrance' }, update: {}, create: { name: 'Gate B - Side Entrance', description: 'Secondary access gate', location: 'South Wing' } }),
    prisma.dutyDepartment.upsert({ where: { name: 'Medical Unit' }, update: {}, create: { name: 'Medical Unit', description: 'First aid and medical support', location: 'Central Block' } }),
    prisma.dutyDepartment.upsert({ where: { name: 'VIP Protocol' }, update: {}, create: { name: 'VIP Protocol', description: 'VIP guest management', location: 'VIP Hall' } }),
    prisma.dutyDepartment.upsert({ where: { name: 'Traffic Control' }, update: {}, create: { name: 'Traffic Control', description: 'Parking and traffic management', location: 'Outer Perimeter' } }),
    prisma.dutyDepartment.upsert({ where: { name: 'Crowd Management' }, update: {}, create: { name: 'Crowd Management', description: 'Crowd flow and safety', location: 'Main Arena' } }),
  ]);

  // Inventory categories
  const categories = await Promise.all([
    prisma.inventoryCategory.upsert({ where: { name: 'Shirts' }, update: {}, create: { name: 'Shirts', description: 'Scout uniform shirts' } }),
    prisma.inventoryCategory.upsert({ where: { name: 'Caps' }, update: {}, create: { name: 'Caps', description: 'Scout caps' } }),
    prisma.inventoryCategory.upsert({ where: { name: 'Flashlights' }, update: {}, create: { name: 'Flashlights', description: 'LED flashlights' } }),
    prisma.inventoryCategory.upsert({ where: { name: 'Whistles' }, update: {}, create: { name: 'Whistles', description: 'Safety whistles' } }),
    prisma.inventoryCategory.upsert({ where: { name: 'Vests' }, update: {}, create: { name: 'Vests', description: 'High-visibility vests' } }),
    prisma.inventoryCategory.upsert({ where: { name: 'Walkie-Talkies' }, update: {}, create: { name: 'Walkie-Talkies', description: 'Two-way radios' } }),
    prisma.inventoryCategory.upsert({ where: { name: 'First Aid Kits' }, update: {}, create: { name: 'First Aid Kits', description: 'Medical first aid kits' } }),
    prisma.inventoryCategory.upsert({ where: { name: 'Notebooks' }, update: {}, create: { name: 'Notebooks', description: 'Duty log notebooks' } }),
  ]);

  // Cabin shelves
  const cabins: { id: string }[] = [];
  for (let c = 1; c <= 5; c++) {
    for (let s = 1; s <= 4; s++) {
      const cabin = await prisma.cabinShelf.upsert({
        where: { cabinNumber_shelfLabel: { cabinNumber: `C${c}`, shelfLabel: `S${s}` } },
        update: {},
        create: { cabinNumber: `C${c}`, shelfLabel: `S${s}`, description: `Cabin ${c}, Shelf ${s}` },
      });
      cabins.push(cabin);
    }
  }

  // Inventory items (200+)
  const categoryPrices: Record<string, number> = {
    'Shirts': 800,
    'Caps': 200,
    'Flashlights': 350,
    'Whistles': 80,
    'Vests': 600,
    'Walkie-Talkies': 2500,
    'First Aid Kits': 1200,
    'Notebooks': 50,
  };

  const categoryPrefixes: Record<string, string> = {
    'Shirts': 'SH',
    'Caps': 'CP',
    'Flashlights': 'FL',
    'Whistles': 'WH',
    'Vests': 'VS',
    'Walkie-Talkies': 'WT',
    'First Aid Kits': 'FK',
    'Notebooks': 'NB',
  };

  const inventoryItems: { id: string }[] = [];
  let itemCounter = 1;
  for (const category of categories) {
    const count = category.name === 'Walkie-Talkies' ? 20 : category.name === 'First Aid Kits' ? 15 : 30;
    const prefix = categoryPrefixes[category.name] ?? 'IT';
    const price = categoryPrices[category.name] ?? 100;

    for (let i = 0; i < count; i++) {
      const tagNumber = `${prefix}-${pad(itemCounter++, 4)}`;
      const condition = pick(CONDITIONS);
      const existingItem = await prisma.inventoryItem.findUnique({ where: { tagNumber } });
      if (!existingItem) {
        const item = await prisma.inventoryItem.create({
          data: {
            tagNumber,
            name: `${category.name.slice(0, -1)} #${pad(i + 1, 3)}`,
            categoryId: category.id,
            condition,
            originalPrice: price,
            cabinShelfId: pick(cabins).id,
          },
        });
        inventoryItems.push(item);
      }
    }
  }

  // 50 scouts
  const scouts: { id: string }[] = [];
  const firstNames = ['Ahmed', 'Muhammad', 'Ali', 'Hassan', 'Omar', 'Ibrahim', 'Khalid', 'Tariq', 'Bilal', 'Usman', 'Salman', 'Faisal', 'Adnan', 'Kamran', 'Imran', 'Zubair', 'Waqas', 'Shahid', 'Naveed', 'Asif', 'Rizwan', 'Hamza', 'Saad', 'Fahad', 'Talha', 'Junaid', 'Waseem', 'Rashid', 'Tanveer', 'Iqbal'];
  const lastNames = ['Khan', 'Ahmed', 'Ali', 'Hassan', 'Malik', 'Chaudhry', 'Siddiqui', 'Qureshi', 'Akhtar', 'Hussain', 'Rehman', 'Butt', 'Sheikh', 'Mirza', 'Raza', 'Shah', 'Javed', 'Riaz', 'Aslam', 'Nawaz'];

  for (let i = 1; i <= 50; i++) {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const regNum = `AMS-${new Date().getFullYear()}-${pad(i)}`;
    const existing = await prisma.scout.findUnique({ where: { registrationNumber: regNum } });
    if (!existing) {
      const scout = await prisma.scout.create({
        data: {
          registrationNumber: regNum,
          fullName: `${firstName} ${lastName}`,
          fatherName: `${pick(firstNames)} ${lastName}`,
          cnicOrBForm: `4220${pad(i * 311, 8)}`,
          contactNumber: `03${pick(['00','01','02','03','11','12','21','22'])}${pad(i * 127 % 10000000, 7)}`,
          emergencyContact: `03${pick(['00','01','02','03','11','12'])}${pad(i * 211 % 10000000, 7)}`,
          city: pick(CITIES),
          area: `Area ${Math.ceil(i / 5)}`,
          unitName: pick(UNITS),
          age: 14 + (i % 8),
          bloodGroup: pick(BLOOD_GROUPS),
          hasPreviousExperience: i % 3 === 0,
          registeredBy: admin.id,
          registeredAt: new Date(Date.now() - i * 3600000),
        },
      });
      scouts.push(scout);
    }
  }

  // Duty assignments for first 30 scouts
  for (let i = 0; i < Math.min(30, scouts.length); i++) {
    const scout = scouts[i]!;
    const dept = departments[i % departments.length]!;
    await prisma.dutyAssignment.create({
      data: {
        scoutId: scout.id,
        departmentId: dept.id,
        gateName: `Gate ${String.fromCharCode(65 + (i % 6))}`,
        shift: pick(SHIFTS),
        reportingTime: pick(['06:00', '08:00', '10:00', '14:00', '18:00']),
        inchargeName: `Incharge ${i + 1}`,
        assignedBy: admin.id,
      },
    });
  }

  console.log('✅ Seeding complete!');
  console.log('📧 Admin: admin@scouts.pk / Admin@1234');
  console.log('📧 Reg Op: registration@scouts.pk / Operator@1234');
  console.log('📧 Inv Op: inventory@scouts.pk / Operator@1234');
  console.log('📧 Viewer: viewer@scouts.pk / Operator@1234');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
