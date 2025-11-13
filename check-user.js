const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@hood.com' }
  });

  if (user) {
    console.log('✅ User found:', {
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });
  } else {
    console.log('❌ User not found!');
  }

  await prisma.$disconnect();
}

checkUser();