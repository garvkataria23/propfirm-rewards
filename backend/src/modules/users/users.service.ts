import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto, UpdateUserStatusDto, CreateUserAdminDto, UpdateUserAdminDto, ResetPasswordAdminDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // User addresses
  async getAddresses(userId: string) {
    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const count = await this.prisma.userAddress.count({ where: { userId } });

    return this.prisma.userAddress.create({
      data: {
        userId,
        fullName: dto.fullName,
        phone: dto.phone,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2 || null,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        isDefault: dto.isDefault || count === 0,
      },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.userAddress.delete({ where: { id: addressId } });
    return { message: 'Address removed successfully' };
  }

  // Admin user management
  async adminGetUsers(query: { search?: string; status?: string; role?: string; limit?: number | string; offset?: number | string }) {
    const { search, status, role } = query;
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100);
    const offset = Math.max(Number(query.offset) || 0, 0);

    const where = {
      ...(status && { status }),
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { country: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          country: true,
          role: true,
          status: true,
          pointsBalance: true, // Materialized balance: eliminates N+1 query loop!
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              submissions: true,
              redemptions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.user.count({ where }),
    ]);

    const usersWithBalance = users.map((u) => ({
      ...u,
      availablePoints: u.pointsBalance ?? 0,
    }));

    return {
      users: usersWithBalance,
      total,
      limit,
      offset,
    };
  }

  async adminGetUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        submissions: {
          include: { propFirm: true, proofs: true },
          orderBy: { createdAt: 'desc' },
        },
        redemptions: {
          include: { reward: true, shippingAddress: true },
          orderBy: { createdAt: 'desc' },
        },
        pointsLedger: {
          include: { createdBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const lastTx = await this.prisma.pointsLedger.findFirst({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      select: { balanceAfter: true },
    });

    const { passwordHash, ...safeUser } = user;

    return {
      ...safeUser,
      availablePoints: lastTx ? lastTx.balanceAfter : 0,
    };
  }

  async adminUpdateUserStatus(id: string, dto: UpdateUserStatusDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const previousStatus = user.status;
    const newStatus = dto.status.toUpperCase();

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    // Notify user
    await this.prisma.notification.create({
      data: {
        userId: id,
        title: `Account Status Changed: ${newStatus}`,
        message: `Your account status was updated to ${newStatus}. Note: "${dto.reason}"`,
        type: 'SYSTEM',
      },
    });

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: newStatus === 'SUSPENDED' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
        entity: 'User',
        entityId: id,
        previousValue: JSON.stringify({ status: previousStatus }),
        newValue: JSON.stringify({ status: newStatus, reason: dto.reason }),
        notes: `Admin reason: ${dto.reason}`,
      },
    });

    return updated;
  }

  async adminCreateUser(dto: CreateUserAdminDto, adminId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException('A user with this email address already exists');
    }

    if (dto.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Creating additional Super Administrator accounts via admin panel is prohibited');
    }

    const initialPoints = dto.initialPoints ? Number(dto.initialPoints) : 0;
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        name: dto.name.trim(),
        phone: dto.phone || null,
        country: dto.country || null,
        role: dto.role || 'USER',
        status: dto.status || 'ACTIVE',
        emailVerified: true,
        pointsBalance: initialPoints,
      },
    });

    let initialBalance = 0;
    if (initialPoints > 0) {
      await this.prisma.pointsLedger.create({
        data: {
          userId: user.id,
          type: 'ADMIN_CREDIT',
          points: initialPoints,
          balanceBefore: 0,
          balanceAfter: initialPoints,
          referenceType: 'ADMIN_INIT',
          referenceId: adminId,
          idempotencyKey: `user-init-${user.id}`,
          description: dto.notes || 'Initial signup / welcome points assigned by admin',
          reason: 'Manual account creation with bonus points',
          createdById: adminId,
        },
      });
      initialBalance = initialPoints;
    }

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'CREATE_USER',
        entity: 'User',
        entityId: user.id,
        newValue: JSON.stringify({
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          initialPoints: initialBalance,
        }),
        notes: `Admin manually created user: ${user.name} (${user.email})`,
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return {
      ...safeUser,
      availablePoints: initialBalance,
    };
  }

  async adminUpdateUser(id: string, dto: UpdateUserAdminDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === adminId && dto.role && dto.role !== user.role) {
      throw new BadRequestException('Self-role modification is strictly prohibited');
    }

    if (user.role === 'SUPER_ADMIN' && dto.role && dto.role !== 'SUPER_ADMIN') {
      throw new BadRequestException('The Super Administrator account cannot be demoted');
    }

    // Check unique email if email is being changed
    if (dto.email && dto.email.toLowerCase().trim() !== user.email) {
      const emailConflict = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });
      if (emailConflict) {
        throw new ConflictException('Another user with this email already exists');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.email !== undefined && { email: dto.email.toLowerCase().trim() }),
        ...(dto.phone !== undefined && { phone: dto.phone.trim() || null }),
        ...(dto.country !== undefined && { country: dto.country.trim() || null }),
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.emailVerified !== undefined && { emailVerified: dto.emailVerified }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        country: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'UPDATE_USER',
        entity: 'User',
        entityId: id,
        previousValue: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          phone: user.phone,
          country: user.country,
        }),
        newValue: JSON.stringify(dto),
        notes: `Admin updated user details for: ${updated.name} (${updated.email})`,
      },
    });

    return updated;
  }

  async adminResetPassword(id: string, dto: ResetPasswordAdminDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!dto.newPassword || dto.newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    // Notify user
    await this.prisma.notification.create({
      data: {
        userId: id,
        title: 'Security Alert: Password Reset by Support',
        message: `Your account password was updated by an administrator. Reason: ${dto.reason || 'Support assistance'}`,
        type: 'SECURITY',
      },
    });

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'RESET_PASSWORD',
        entity: 'User',
        entityId: id,
        notes: `Admin reset password for user: ${user.name} (${user.email}). Reason: ${dto.reason || 'Not specified'}`,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async adminDeleteUser(id: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Super Administrator accounts are permanently protected and cannot be deleted');
    }

    if (user.id === adminId) {
      throw new BadRequestException('You cannot delete your own staff account');
    }

    // Delete user (cascade will delete points, submissions, addresses, etc.)
    await this.prisma.user.delete({ where: { id } });

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'DELETE_USER',
        entity: 'User',
        entityId: id,
        previousValue: JSON.stringify({ name: user.name, email: user.email, role: user.role }),
        notes: `Admin deleted user account: ${user.name} (${user.email})`,
      },
    });

    return { message: 'User deleted successfully' };
  }
}

