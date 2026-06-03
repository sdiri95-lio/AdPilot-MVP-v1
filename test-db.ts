import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying AIUsageLog table...');
  
  // Need a user to link to since AIUsageLog requires a user relation
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: 'test-user-' + Date.now(),
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        clerkId: 'clerk-test-' + Date.now(),
        usage: {
          create: {}
        }
      }
    });
    console.log('Created test user:', user.id);
  }

  // Insert test record
  console.log('Inserting test record...');
  const insertResult = await prisma.aIUsageLog.create({
    data: {
      userId: user.id,
      feature: 'test_feature',
      model: 'test_model',
      tokensInput: 10,
      tokensOutput: 20,
      totalTokens: 30
    }
  });
  console.log('Insert Result:', insertResult.id);

  // Read test record
  console.log('Reading test record...');
  const readResult = await prisma.aIUsageLog.findUnique({
    where: { id: insertResult.id }
  });
  console.log('Read Result:', readResult?.id, readResult?.feature);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
