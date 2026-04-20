// ============================================================
// Prisma Seed Script — Realistic Punjab Farmer Data (~600 records)
// ============================================================
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with realistic Punjab farmer data...\n');

  const password = await bcrypt.hash('password123', 12);

  // ══════════════════════════════════════════════════════════
  // ADMIN, VERIFIER, PROGRAM OFFICER accounts
  // ══════════════════════════════════════════════════════════
  const admin = await prisma.user.create({
    data: { name: 'Rajinder Kumar (Admin)', email: 'admin@agri.gov.in', password, contact_no: '9876500001', address: 'Block Office, Chandigarh, Punjab', user_type: 'ADMIN' },
  });
  const verifier = await prisma.user.create({
    data: { name: 'Harpal Singh (Verifier)', email: 'verifier@agri.gov.in', password, contact_no: '9876500002', address: 'Tehsil Office, Ludhiana, Punjab', user_type: 'VERIFIER' },
  });
  const verifier2 = await prisma.user.create({
    data: { name: 'Kuldeep Kaur (Verifier)', email: 'verifier2@agri.gov.in', password, contact_no: '9876500003', address: 'Tehsil Office, Patiala, Punjab', user_type: 'VERIFIER' },
  });
  const officer = await prisma.user.create({
    data: { name: 'Dr. Amarjit Singh (Officer)', email: 'officer@agri.gov.in', password, contact_no: '9876500004', address: 'District HQ, Ludhiana, Punjab', user_type: 'PROGRAM_OFFICER' },
  });
  const officer2 = await prisma.user.create({
    data: { name: 'Sarabjit Kaur (Officer)', email: 'officer2@agri.gov.in', password, contact_no: '9876500005', address: 'District HQ, Patiala, Punjab', user_type: 'PROGRAM_OFFICER' },
  });
  console.log('   ✓ 5 system accounts (admin, verifiers, officers)');

  // ══════════════════════════════════════════════════════════
  // FARMERS — 30 realistic Punjab farmers
  // ══════════════════════════════════════════════════════════
  const farmerData = [
    { name: 'Gurpreet Singh', village: 'Khanna', district: 'Ludhiana', land: 3.50, aadhaar: '211111111111' },
    { name: 'Harmanpreet Kaur', village: 'Nihal Singh Wala', district: 'Moga', land: 8.25, aadhaar: '222222222222' },
    { name: 'Amritpal Singh', village: 'Tapa', district: 'Barnala', land: 2.00, aadhaar: '233333333333' },
    { name: 'Rajveer Sandhu', village: 'Rajpura', district: 'Patiala', land: 12.75, aadhaar: '244444444444' },
    { name: 'Sukhwinder Gill', village: 'Phillaur', district: 'Jalandhar', land: 22.00, aadhaar: '255555555555' },
    { name: 'Manpreet Kaur', village: 'Nakodar', district: 'Jalandhar', land: 4.00, aadhaar: '266666666666' },
    { name: 'Jagtar Singh', village: 'Shahkot', district: 'Jalandhar', land: 6.50, aadhaar: '277777777777' },
    { name: 'Kulwant Singh', village: 'Raikot', district: 'Ludhiana', land: 1.75, aadhaar: '288888888888' },
    { name: 'Paramjit Kaur', village: 'Samrala', district: 'Ludhiana', land: 9.00, aadhaar: '299999999999' },
    { name: 'Baldev Singh', village: 'Bassi Pathana', district: 'Fatehgarh Sahib', land: 15.00, aadhaar: '311111111111' },
    { name: 'Iqbal Singh', village: 'Amloh', district: 'Fatehgarh Sahib', land: 3.25, aadhaar: '322222222222' },
    { name: 'Surjit Kaur', village: 'Malerkotla', district: 'Sangrur', land: 7.50, aadhaar: '333333333333' },
    { name: 'Harbhajan Singh', village: 'Moonak', district: 'Sangrur', land: 18.00, aadhaar: '344444444444' },
    { name: 'Daljit Singh', village: 'Sunam', district: 'Sangrur', land: 2.50, aadhaar: '355555555555' },
    { name: 'Nirmal Kaur', village: 'Budhlada', district: 'Mansa', land: 11.25, aadhaar: '366666666666' },
    { name: 'Avtar Singh', village: 'Sardulgarh', district: 'Mansa', land: 4.75, aadhaar: '377777777777' },
    { name: 'Baljinder Kaur', village: 'Rampura Phul', district: 'Bathinda', land: 25.00, aadhaar: '388888888888' },
    { name: 'Gurdas Singh', village: 'Talwandi Sabo', district: 'Bathinda', land: 6.00, aadhaar: '399999999999' },
    { name: 'Lakhwinder Singh', village: 'Goniana', district: 'Bathinda', land: 3.00, aadhaar: '411111111111' },
    { name: 'Manjit Kaur', village: 'Jalalabad', district: 'Fazilka', land: 14.50, aadhaar: '422222222222' },
    { name: 'Ranjodh Singh', village: 'Abohar', district: 'Fazilka', land: 8.00, aadhaar: '433333333333' },
    { name: 'Sukhdev Singh', village: 'Zira', district: 'Ferozepur', land: 1.50, aadhaar: '444444444444' },
    { name: 'Kamaljit Kaur', village: 'Guru Har Sahai', district: 'Ferozepur', land: 5.25, aadhaar: '455555555555' },
    { name: 'Harjinder Singh', village: 'Patti', district: 'Tarn Taran', land: 10.00, aadhaar: '466666666666' },
    { name: 'Buta Singh', village: 'Khadoor Sahib', district: 'Tarn Taran', land: 30.00, aadhaar: '477777777777' },
    { name: 'Jaswinder Kaur', village: 'Phagwara', district: 'Kapurthala', land: 2.75, aadhaar: '488888888888' },
    { name: 'Mohan Singh', village: 'Sultanpur Lodhi', district: 'Kapurthala', land: 7.00, aadhaar: '499999999999' },
    { name: 'Prabhjot Singh', village: 'Dhar Kalan', district: 'Pathankot', land: 4.50, aadhaar: '511111111111' },
    { name: 'Simran Kaur', village: 'Dera Baba Nanak', district: 'Gurdaspur', land: 16.00, aadhaar: '522222222222' },
    { name: 'Tejinder Singh', village: 'Batala', district: 'Gurdaspur', land: 9.50, aadhaar: '533333333333' },
  ];

  const farmers = [];
  for (let i = 0; i < farmerData.length; i++) {
    const f = farmerData[i];
    const phone = '98765' + String(43210 + i).padStart(5, '0');
    const user = await prisma.user.create({
      data: {
        name: f.name, email: `farmer${i + 1}@agri.in`, password,
        contact_no: phone, address: `Village ${f.village}, ${f.district}, Punjab`,
        user_type: 'FARMER',
        farmer: { create: { aadhaar_no: f.aadhaar, land_area: f.land } },
      },
    });
    farmers.push({ ...user, land_area: f.land });
  }
  console.log('   ✓ 30 farmers registered');

  // ══════════════════════════════════════════════════════════
  // EQUIPMENT OWNERS — 10 businesses
  // ══════════════════════════════════════════════════════════
  const ownerNames = [
    { name: 'Balwinder Singh Machinery', address: 'GT Road, Ludhiana' },
    { name: 'Punjab Agro Equipments', address: 'Industrial Area, Patiala' },
    { name: 'Gill Farm Solutions', address: 'Bypass Road, Jalandhar' },
    { name: 'Malwa Agri Services', address: 'Main Market, Bathinda' },
    { name: 'Doaba Farm Rentals', address: 'Civil Lines, Hoshiarpur' },
    { name: 'Majha Agro Centre', address: 'GT Road, Amritsar' },
    { name: 'Sharma Equipment House', address: 'Grain Market, Sangrur' },
    { name: 'Singh Brothers Machinery', address: 'Industrial Area, Moga' },
    { name: 'Khalsa Agri Rentals', address: 'Bypass Road, Ferozepur' },
    { name: 'Golden Harvest Equipments', address: 'NH-1, Rajpura' },
  ];

  const owners = [];
  for (let i = 0; i < ownerNames.length; i++) {
    const o = ownerNames[i];
    const phone = '98765' + String(43240 + i).padStart(5, '0');
    const user = await prisma.user.create({
      data: {
        name: o.name, email: `owner${i + 1}@agri.in`, password,
        contact_no: phone, address: `${o.address}, Punjab`,
        user_type: 'EQUIPMENT_OWNER',
        equipmentOwner: { create: {} },
      },
    });
    owners.push(user);
  }
  console.log('   ✓ 10 equipment owners registered');

  // ══════════════════════════════════════════════════════════
  // EQUIPMENT — 60 items
  // ══════════════════════════════════════════════════════════
  const equipmentData = [
    { name: 'Mahindra 575 DI Tractor', type: 'Tractor', rate: 1500, oi: 0 },
    { name: 'Swaraj 744 FE Tractor', type: 'Tractor', rate: 1800, oi: 0 },
    { name: 'Massey Ferguson 1035 DI', type: 'Tractor', rate: 1600, oi: 1 },
    { name: 'John Deere 5310 Tractor', type: 'Tractor', rate: 2200, oi: 2 },
    { name: 'Sonalika DI 750 III', type: 'Tractor', rate: 1400, oi: 3 },
    { name: 'Eicher 557 Tractor', type: 'Tractor', rate: 1300, oi: 4 },
    { name: 'New Holland 3630 TX', type: 'Tractor', rate: 2000, oi: 5 },
    { name: 'Farmtrac 60 EPI T20', type: 'Tractor', rate: 1700, oi: 6 },
    { name: 'Preet 6049 Tractor', type: 'Tractor', rate: 1550, oi: 7 },
    { name: 'Indo Farm 3048 DI', type: 'Tractor', rate: 1450, oi: 8 },
    { name: 'Mahindra Arjun NOVO 605', type: 'Tractor', rate: 2100, oi: 9 },
    { name: 'Kubota MU5502 4WD', type: 'Tractor', rate: 2500, oi: 0 },
    { name: 'Combine Harvester TC-5070', type: 'Harvester', rate: 5000, oi: 1 },
    { name: 'Kartar 4000 Harvester', type: 'Harvester', rate: 4500, oi: 2 },
    { name: 'Preet 987 Combine', type: 'Harvester', rate: 4800, oi: 3 },
    { name: 'Dasmesh 9100 Harvester', type: 'Harvester', rate: 5200, oi: 5 },
    { name: 'Standard S-390 Combine', type: 'Harvester', rate: 4200, oi: 6 },
    { name: 'John Deere W70 Harvester', type: 'Harvester', rate: 5500, oi: 9 },
    { name: 'Rotavator 7 Feet', type: 'Tiller', rate: 800, oi: 0 },
    { name: 'Rotavator 5 Feet', type: 'Tiller', rate: 600, oi: 2 },
    { name: 'Cultivator 9 Tyne', type: 'Tiller', rate: 500, oi: 3 },
    { name: 'Power Tiller 15HP', type: 'Tiller', rate: 900, oi: 4 },
    { name: 'MB Plough 3 Furrow', type: 'Tiller', rate: 700, oi: 5 },
    { name: 'Disc Plough 3 Disc', type: 'Tiller', rate: 750, oi: 7 },
    { name: 'Chisel Plough 7 Tyne', type: 'Tiller', rate: 650, oi: 8 },
    { name: 'Sub Soiler Single Shank', type: 'Tiller', rate: 550, oi: 9 },
    { name: 'Seed Drill Machine 9 Row', type: 'Seeder', rate: 1200, oi: 1 },
    { name: 'Happy Seeder', type: 'Seeder', rate: 1500, oi: 1 },
    { name: 'Zero Till Seed Drill', type: 'Seeder', rate: 1100, oi: 3 },
    { name: 'Pneumatic Planter', type: 'Seeder', rate: 1800, oi: 5 },
    { name: 'Super Seeder', type: 'Seeder', rate: 1600, oi: 6 },
    { name: 'Rice Transplanter Walk', type: 'Seeder', rate: 2000, oi: 7 },
    { name: 'Spray Pump 16L Knapsack', type: 'Sprayer', rate: 200, oi: 2 },
    { name: 'Boom Sprayer 500L', type: 'Sprayer', rate: 1000, oi: 4 },
    { name: 'Battery Sprayer 12L', type: 'Sprayer', rate: 150, oi: 6 },
    { name: 'Power Sprayer 25L', type: 'Sprayer', rate: 350, oi: 8 },
    { name: 'Drone Sprayer DJI T30', type: 'Sprayer', rate: 3000, oi: 9 },
    { name: 'Mist Blower Sprayer', type: 'Sprayer', rate: 450, oi: 0 },
    { name: 'Laser Land Leveler', type: 'Leveler', rate: 3500, oi: 1 },
    { name: 'Drag Bucket Leveler', type: 'Leveler', rate: 1200, oi: 3 },
    { name: 'GPS Land Leveler', type: 'Leveler', rate: 4000, oi: 5 },
    { name: 'Channel Former', type: 'Leveler', rate: 800, oi: 7 },
    { name: 'Disc Harrow 18-Disc', type: 'Harrow', rate: 1000, oi: 0 },
    { name: 'Disc Harrow 14-Disc', type: 'Harrow', rate: 800, oi: 4 },
    { name: 'Offset Disc Harrow 20', type: 'Harrow', rate: 1200, oi: 6 },
    { name: 'Tandem Disc Harrow', type: 'Harrow', rate: 950, oi: 8 },
    { name: 'Submersible Pump 5HP', type: 'Pump', rate: 600, oi: 2 },
    { name: 'Submersible Pump 7.5HP', type: 'Pump', rate: 800, oi: 4 },
    { name: 'Drip Irrigation Kit 1Acre', type: 'Pump', rate: 1500, oi: 6 },
    { name: 'Sprinkler System 1 Acre', type: 'Pump', rate: 1200, oi: 8 },
    { name: 'Diesel Pump Set 5HP', type: 'Pump', rate: 500, oi: 9 },
    { name: 'Solar Water Pump 3HP', type: 'Pump', rate: 700, oi: 1 },
    { name: 'Paddy Transplanter Riding', type: 'Transplanter', rate: 2500, oi: 2 },
    { name: 'Straw Baler Machine', type: 'Baler', rate: 2000, oi: 3 },
    { name: 'Mulcher Machine', type: 'Mulcher', rate: 1800, oi: 5 },
    { name: 'Crop Reaper Binder', type: 'Reaper', rate: 1500, oi: 7 },
    { name: 'Thresher Machine', type: 'Thresher', rate: 1000, oi: 9 },
    { name: 'Chaff Cutter Electric', type: 'Chaff Cutter', rate: 400, oi: 0 },
    { name: 'Trolley Hydraulic 10T', type: 'Trolley', rate: 600, oi: 4 },
    { name: 'Potato Digger Machine', type: 'Digger', rate: 1100, oi: 8 },
  ];

  const equipList = [];
  for (const eq of equipmentData) {
    const e = await prisma.equipment.create({
      data: { name: eq.name, type: eq.type, rental_rate: eq.rate, status: 'AVAILABLE', owner_id: owners[eq.oi].user_id },
    });
    equipList.push(e);
  }
  console.log('   ✓ 60 equipment items');

  // ══════════════════════════════════════════════════════════
  // RENTALS — 300 across various statuses
  // ══════════════════════════════════════════════════════════
  const durations = [1, 2, 3, 4, 5, 7, 10, 14];
  const months = [
    [2025, 7], [2025, 8], [2025, 9], [2025, 10], [2025, 11], [2025, 12],
    [2026, 1], [2026, 2], [2026, 3], [2026, 4],
  ];

  let rentalCount = 0;
  const allRentals = [];

  for (const [year, mon] of months) {
    for (let r = 0; r < 30; r++) {
      const farmerIdx = (rentalCount) % farmers.length;
      const equipIdx = (rentalCount * 7 + r * 3) % equipList.length;
      const dur = durations[(rentalCount + r) % durations.length];
      const total = equipList[equipIdx].rental_rate * dur;
      const day = Math.min(28, (r % 28) + 1);
      const dateStr = new Date(year, mon - 1, day);

      // Status distribution: 60% VERIFIED, 20% COMPLETED, 10% APPROVED, 10% REQUESTED
      let status, verified;
      if (rentalCount < 180) { status = 'VERIFIED'; verified = true; }
      else if (rentalCount < 240) { status = 'COMPLETED'; verified = false; }
      else if (rentalCount < 270) { status = 'APPROVED'; verified = false; }
      else { status = 'REQUESTED'; verified = false; }

      const rental = await prisma.rental.create({
        data: {
          farmer_id: farmers[farmerIdx].user_id,
          equipment_id: equipList[equipIdx].equipment_id,
          duration: dur,
          total_amount: total,
          status,
          verified,
          rental_date: dateStr,
        },
      });
      allRentals.push(rental);
      rentalCount++;
    }
  }
  console.log(`   ✓ ${rentalCount} rentals (180 verified, 60 completed, 30 approved, 30 requested)`);

  // ══════════════════════════════════════════════════════════
  // SUBSIDY APPLICATIONS — ~150 (only for verified rentals)
  // ══════════════════════════════════════════════════════════
  const statuses = ['APPROVED', 'APPROVED', 'APPROVED', 'PENDING', 'PENDING', 'REJECTED'];
  let appCount = 0;

  for (let i = 0; i < 180 && appCount < 150; i++) {
    if (i % 3 === 0) continue; // skip some for variety

    const rental = allRentals[i];
    const farmerIdx = farmers.findIndex(f => f.user_id === rental.farmer_id);
    const landArea = farmerIdx >= 0 ? farmerData[farmerIdx].land : 5;

    let pct = landArea < 5 ? 0.50 : landArea <= 15 ? 0.35 : 0.20;
    const subsidyAmt = Math.round(rental.total_amount * pct * 100) / 100;
    const approvalStatus = statuses[appCount % statuses.length];

    const appDate = new Date(rental.rental_date);
    appDate.setDate(appDate.getDate() + (appCount % 10) + 3);

    await prisma.subsidyApplication.create({
      data: {
        rental_id: rental.rental_id,
        subsidy_amount: subsidyAmt,
        approval_status: approvalStatus,
        remarks: approvalStatus === 'REJECTED' ? 'Incomplete documentation' : approvalStatus === 'APPROVED' ? 'Verified and approved' : null,
        officer_id: approvalStatus !== 'PENDING' ? officer.user_id : null,
        application_date: appDate,
      },
    });
    appCount++;
  }
  console.log(`   ✓ ${appCount} subsidy applications`);

  // ══════════════════════════════════════════════════════════
  // AUDIT LOGS — Sample entries
  // ══════════════════════════════════════════════════════════
  const auditActions = [
    { action: 'USER_LOGIN', type: 'USER', details: 'Login from system' },
    { action: 'RENTAL_REQUESTED', type: 'RENTAL', details: 'New rental booking' },
    { action: 'RENTAL_APPROVED', type: 'RENTAL', details: 'Owner approved rental' },
    { action: 'RENTAL_COMPLETED', type: 'RENTAL', details: 'Rental completed' },
    { action: 'RENTAL_VERIFIED', type: 'RENTAL', details: 'Verifier confirmed usage' },
    { action: 'SUBSIDY_APPLIED', type: 'SUBSIDY', details: 'Farmer applied for subsidy' },
    { action: 'SUBSIDY_APPROVED', type: 'SUBSIDY', details: 'Officer approved subsidy' },
  ];

  for (let i = 0; i < 50; i++) {
    const a = auditActions[i % auditActions.length];
    const userId = [admin.user_id, verifier.user_id, officer.user_id, farmers[i % farmers.length].user_id][i % 4];
    await prisma.auditLog.create({
      data: { user_id: userId, action: a.action, entity_type: a.type, entity_id: i + 1, details: a.details },
    });
  }
  console.log('   ✓ 50 audit log entries');

  // ── Update equipment statuses for active rentals
  const approvedRentals = allRentals.filter(r => r.status === 'APPROVED');
  for (const r of approvedRentals.slice(0, 5)) {
    await prisma.equipment.update({ where: { equipment_id: r.equipment_id }, data: { status: 'IN_USE' } });
  }

  // ── Final counts
  const counts = {
    users: await prisma.user.count(),
    farmers: await prisma.farmer.count(),
    owners: await prisma.equipmentOwner.count(),
    equipment: await prisma.equipment.count(),
    rentals: await prisma.rental.count(),
    subsidies: await prisma.subsidyApplication.count(),
    auditLogs: await prisma.auditLog.count(),
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  console.log(`\n📊 Total records: ${total}`);
  console.log(`   USERS: ${counts.users} | FARMERS: ${counts.farmers} | OWNERS: ${counts.owners}`);
  console.log(`   EQUIPMENT: ${counts.equipment} | RENTALS: ${counts.rentals} | SUBSIDIES: ${counts.subsidies}`);
  console.log(`   AUDIT_LOGS: ${counts.auditLogs}`);
  console.log('\n✅ Seed data loaded successfully!\n');
  console.log('   📧 Login credentials (all passwords: password123):');
  console.log('   Admin:    admin@agri.gov.in');
  console.log('   Verifier: verifier@agri.gov.in');
  console.log('   Officer:  officer@agri.gov.in');
  console.log('   Farmer:   farmer1@agri.in ... farmer30@agri.in');
  console.log('   Owner:    owner1@agri.in ... owner10@agri.in\n');
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
