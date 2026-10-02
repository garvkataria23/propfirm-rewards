import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { SupportService } from './support.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('ChatGateway (WebSocket Security, Auth & RBAC)', () => {
  let gateway: ChatGateway;
  let supportService: any;
  let prisma: any;
  let jwtService: any;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-secure-32chars!!';

    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      supportTicket: {
        findUnique: jest.fn(),
      },
    };

    supportService = {
      addMessage: jest.fn(),
      getTicketById: jest.fn(),
    };

    jwtService = {
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: SupportService, useValue: supportService },
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('Connection Authentication Handshake', () => {
    it('should reject and disconnect socket if no JWT is provided', async () => {
      const mockSocket: any = {
        id: 'sock-1',
        handshake: { auth: {}, headers: {}, query: {} },
        emit: jest.fn(),
        disconnect: jest.fn(),
      };

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'auth_error',
        expect.objectContaining({ message: expect.stringContaining('Authentication required') }),
      );
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });

    it('should reject and disconnect socket if JWT is invalid or forged', async () => {
      const mockSocket: any = {
        id: 'sock-2',
        handshake: { auth: { token: 'invalid.forged.jwt' } },
        emit: jest.fn(),
        disconnect: jest.fn(),
      };

      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('auth_error', expect.anything());
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });

    it('should authenticate socket and attach verified user identity from database', async () => {
      const mockSocket: any = {
        id: 'sock-valid',
        handshake: { auth: { token: 'valid.jwt.token' } },
        data: {},
        emit: jest.fn(),
        join: jest.fn(),
        disconnect: jest.fn(),
      };

      jwtService.verify.mockReturnValue({ sub: 'user-123', role: 'USER' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        name: 'Jordan Belfort',
        email: 'jordan@trader.com',
        role: 'USER',
        status: 'ACTIVE',
      });

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).not.toHaveBeenCalled();
      expect(mockSocket.data.user).toEqual(
        expect.objectContaining({
          id: 'user-123',
          role: 'USER',
        }),
      );
    });
  });

  describe('Ticket Room Authorization & Isolation', () => {
    it('should forbid trader from joining another user ticket room', async () => {
      const mockSocket: any = {
        id: 'sock-trader',
        data: {
          user: { id: 'trader-1', role: 'USER', name: 'Trader One' },
        },
        emit: jest.fn(),
        join: jest.fn(),
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      };

      // Ticket belongs to 'trader-2'
      prisma.supportTicket.findUnique.mockResolvedValue({
        id: 'ticket-99',
        userId: 'trader-2',
      });

      await gateway.handleJoinTicket(mockSocket, { ticketId: 'ticket-99' });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: expect.stringContaining('Forbidden') }),
      );
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it('should allow trader to join their own ticket room', async () => {
      const mockSocket: any = {
        id: 'sock-trader',
        data: {
          user: { id: 'trader-1', role: 'USER', name: 'Trader One' },
        },
        emit: jest.fn(),
        join: jest.fn(),
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      };

      prisma.supportTicket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        userId: 'trader-1',
      });

      await gateway.handleJoinTicket(mockSocket, { ticketId: 'ticket-1' });

      expect(mockSocket.join).toHaveBeenCalledWith('ticket_ticket-1');
      expect(mockSocket.to).toHaveBeenCalledWith('ticket_ticket-1');
    });
  });

  describe('Message Spoofing Prevention & Staff Permissions', () => {
    it('should strip internal note privileges if a regular trader attempts to post an internal note', async () => {
      const mockSocket: any = {
        id: 'sock-trader',
        data: {
          user: { id: 'trader-1', role: 'USER', name: 'Trader One' },
        },
        emit: jest.fn(),
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      };

      supportService.addMessage.mockResolvedValue({
        message: {
          id: 'msg-1',
          ticketId: 'ticket-1',
          senderId: 'trader-1',
          senderRole: 'USER',
          isInternalNote: false, // Must be coerced to false
          message: 'Hello, need help!',
        },
        ticket: {
          id: 'ticket-1',
          lastMessageAt: new Date(),
          status: 'OPEN',
        },
      });

      // Attacking trader sends client payload with forged role and internal note
      await gateway.handleSendMessage(mockSocket, {
        ticketId: 'ticket-1',
        message: 'Malicious attempt to create internal note',
        senderId: 'admin-999', // forged ID
        senderRole: 'ADMIN', // forged role
        isInternalNote: true, // attempting internal note
      } as any);

      expect(supportService.addMessage).toHaveBeenCalledWith(
        'ticket-1',
        'trader-1', // derived from verified session, ignoring client
        'USER', // derived from verified session, ignoring client
        expect.objectContaining({
          isInternalNote: false, // coerced to false for non-staff
        }),
      );
    });
  });
});
