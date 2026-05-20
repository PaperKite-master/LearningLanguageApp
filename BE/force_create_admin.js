import { PrismaClient } from '@prisma/client';
import { signUp } from './src/Infrastructure/SupabaseAuthClient.js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin_super@test.com';
  const adminPassword = 'Password123!';

  console.log('⏳ Đang tạo một tài khoản Admin MỚI HOÀN TOÀN...');

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
      update: { role: 'ADMIN', full_name: 'Super Admin' },
      create: { id: userId, role: 'ADMIN', full_name: 'Super Admin' },
    });

    console.log('\n🎉 ĐÃ TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!');
    console.log(`- Email: ${adminEmail}`);
    console.log(`- Mật khẩu: ${adminPassword}`);
    console.log('\nBây giờ bạn dùng tài khoản này để đăng nhập nhé!');

  } catch (error) {
    if (error.statusCode === 422 || error.message.includes('already registered')) {
        console.log(`\nEmail ${adminEmail} đã tồn tại. Để đổi mật khẩu, bạn cần dùng chức năng quên mật khẩu hoặc tạo một email khác.`);
        
        // Cố gắng cập nhật quyền cho nó luôn đề phòng trường hợp nó chưa là admin
        console.log('Đang thử set quyền ADMIN cho tài khoản này luôn...');
        try {
            const user = await prisma.profiles.findFirst({ where: { users: { email: adminEmail } } });
            if(user) {
                await prisma.profiles.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
                console.log(`Đã set quyền ADMIN cho ${adminEmail} thành công. (Nhưng bạn vẫn phải tự nhớ mật khẩu cũ).`);
            }
        } catch(e) {}
    } else {
        console.error('\n❌ Lỗi khi tạo Admin:', error.message);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
