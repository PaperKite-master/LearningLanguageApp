import { PrismaClient } from '@prisma/client';
import { signUp } from './src/Infrastructure/SupabaseAuthClient.js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Đang tìm kiếm tài khoản ADMIN trong cơ sở dữ liệu...');
  
  const admins = await prisma.profiles.findMany({
    where: { role: 'ADMIN' },
    include: { users: { select: { email: true } } }
  });

  if (admins.length > 0) {
    console.log(`\n✅ Đã tìm thấy ${admins.length} tài khoản ADMIN:`);
    admins.forEach(admin => {
      console.log(`- Email: ${admin.users?.email || 'N/A'} (ID: ${admin.id})`);
    });
    console.log('\nBạn có thể sử dụng các email trên để login (nếu nhớ password).');
    return;
  }

  console.log('\n⚠️ Không tìm thấy tài khoản ADMIN nào!');
  console.log('⏳ Đang tạo một tài khoản Admin mặc định...');

  const adminEmail = 'admin@example.com';
  const adminPassword = 'adminPassword123!';

  try {
    // 1. Tạo user qua Supabase Auth
    const data = await signUp(adminEmail, adminPassword);
    const userId = data.user?.id;

    if (!userId) {
      throw new Error('Supabase trả về rỗng, kiểm tra lại cấu hình Supabase URL và ANON KEY trong .env');
    }

    // 2. Ép kiểu Role thành ADMIN trong bảng profiles
    await prisma.profiles.upsert({
      where: { id: userId },
      update: { role: 'ADMIN', full_name: 'System Admin' },
      create: { id: userId, role: 'ADMIN', full_name: 'System Admin' },
    });

    console.log('\n🎉 ĐÃ TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!');
    console.log(`- Email: ${adminEmail}`);
    console.log(`- Password: ${adminPassword}`);
    console.log('\nBây giờ bạn có thể dùng tài khoản này để gọi API Admin!');

  } catch (error) {
    console.error('\n❌ Lỗi khi tạo Admin:', error.message);
    if (error.statusCode === 422 || error.message.includes('already registered')) {
        console.log(`\nEmail ${adminEmail} đã được đăng ký nhưng chưa có quyền Admin.`);
        console.log(`Sửa quyền bằng lệnh SQL trong Supabase:\nUPDATE profiles SET role = 'ADMIN' WHERE id = (SELECT id FROM auth.users WHERE email = '${adminEmail}');`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
