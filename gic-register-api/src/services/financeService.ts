import { titheOfferingRepository, userRepository } from '../repositories';
import { NotFoundError, BadRequestError, getPaginationMeta } from '../utils';
import { PaymentMethod, PaymentStatus } from '../types';

export const financeService = {
  /**
   * Submit a tithe/offering record
   */
  async submitTitheOffering(userId: string, data: {
    amount: number;
    method: PaymentMethod;
    transactionReference?: string;
    cryptoWalletAddress?: string;
    proofImageUrl?: string;
  }) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    // Validate crypto-specific fields
    if (data.method === 'CRYPTO' && !data.cryptoWalletAddress) {
      throw new BadRequestError('Crypto wallet address is required for cryptocurrency payments');
    }

    return titheOfferingRepository.create({ userId, ...data });
  },

  /**
   * Get user's tithe/offering history
   */
  async getMyOfferings(userId: string, page: number, limit: number) {
    const { offerings, total } = await titheOfferingRepository.findByUser(
      userId,
      page,
      limit
    );
    return {
      data: offerings,
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  /**
   * Get all tithe/offerings (admin)
   */
  async getAllOfferings(
    page: number,
    limit: number,
    method?: PaymentMethod,
    status?: PaymentStatus
  ) {
    const { offerings, total } = await titheOfferingRepository.findAll(
      page,
      limit,
      method,
      status
    );
    return {
      data: offerings,
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  /**
   * Confirm a tithe/offering payment (admin)
   */
  async confirmPayment(offeringId: string, confirmedById: string) {
    const offering = await titheOfferingRepository.findById(offeringId);
    if (!offering) throw new NotFoundError('Tithe/offering record not found');

    if (offering.status === 'CONFIRMED') {
      throw new BadRequestError('This payment has already been confirmed');
    }

    return titheOfferingRepository.confirm(offeringId, confirmedById);
  },

  /**
   * Get tithe/offering statistics (admin dashboard)
   */
  async getStats(startDate?: Date, endDate?: Date) {
    return titheOfferingRepository.getStats(startDate, endDate);
  },
};
