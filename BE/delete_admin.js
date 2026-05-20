import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin_super@test.com';

  console.log(`⏳ Đang tiến hành xoá tài khoản ${adminEmail}...`);

  try {
    const user = await prisma.users.findFirst({
      where: { email: adminEmail }
    });

    if (!user) {
      console.log(`Tài khoản ${adminEmail} không tồn tại trong hệ thống.`);
      return;
    }

    await prisma.users.delete({
      where: { id: user.id }
    });

    console.log(`✅ Đã xoá thành công tài khoản ${adminEmail} và mọi dữ liệu liên quan.`);
  } catch (error) {
    console.error('❌ Có lỗi xảy ra khi xoá:', error.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
