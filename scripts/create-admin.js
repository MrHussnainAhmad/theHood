/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  const [, , emailArg, passwordArg, nameArg] = process.argv;
  const email = (emailArg || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = passwordArg || process.env.ADMIN_PASSWORD || "";
  const name = (nameArg || process.env.ADMIN_NAME || "Admin").trim();

  if (!email || !password) {
    console.error(
      "Usage: node scripts/create-admin.js <email> <password> [name]\n" +
        "Or set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME in .env"
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: "ADMIN",
      isBanned: false,
    },
    create: {
      email,
      name,
      password: hashedPassword,
      role: "ADMIN",
      isBanned: false,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  console.log("Admin ready:", admin);
}

main()
  .catch((error) => {
    console.error("Failed to create admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

