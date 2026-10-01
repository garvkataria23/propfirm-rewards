import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto, UpdateUserStatusDto } from './dto/user.dto';

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
  async adminGetUsers(query: { search?: string; status?: string; role?: string }) {
    const { search, status, role } = query;

    const users = await this.prisma.user.findMany({
      where: {
        ...(status && { status }),
        ...(role && { role }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { country: { contains: search } },
          ],
        }),
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
        _count: {
          select: {
            submissions: true,
            redemptions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Attach latest balance for each user
    const usersWithBalance = await Promise.all(
      users.map(async (u) => {
        const lastTx = await this.prisma.pointsLedger.findFirst({
          where: { userId: u.id },
          orderBy: { createdAt: 'desc' },
          select: { balanceAfter: true },
        });
        return {
          ...u,
          availablePoints: lastTx ? lastTx.balanceAfter : 0,
        };
      }),
    );

    return usersWithBalance;
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
}
