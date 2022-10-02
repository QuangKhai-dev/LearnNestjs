import { ConfigService } from '@nestjs/config';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';

// băm mật khẩu
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(dto: AuthDto) {
    // băm mật khẩu
    const hash = await argon.hash(dto.password);
    try {
      // lưu người dùng mới lên db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      delete user.hash;

      return user;
    } catch (err) {
      //Check lỗi nếu prisma báo lỗi là do email đã tồn tại
      if (err instanceof PrismaClientKnownRequestError) {
        //p2002 là mã lỗi của prisma báo trùng lặp
        if (err.code === 'P2002') {
          // nếu trùng lặp thì throw ra lỗi ForbiddenException
          throw new ForbiddenException('Email already in use');
        }
      }
    }
  }

  async signIn(dto: AuthDto) {
    //tìm người dùng bằng email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // không tìm thấy quăng lỗi
    if (!user) {
      throw new ForbiddenException('Không tìm thấy người dùng');
    }
    // so sánh mật khẩu
    const pwMatched = await argon.verify(user.hash, dto.password);
    // nếu không đúng quăng lỗi
    if (!pwMatched) {
      throw new ForbiddenException('Sai mật khẩu');
    }

    //xoá mật khẩu không cho người dùng thấy
    delete user.hash;

    //thay vì trả về người dùng, trả về token  Jwt
    // return user;

    return await this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payLoad = {
      sub: userId,
      email,
    };
    const token = await this.jwt.signAsync(payLoad, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });
    return {
      access_token: token,
    };
  }
}
