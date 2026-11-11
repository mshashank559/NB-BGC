import { describe, it, expect } from 'vitest';
import {
  generateStandardInstallments,
  splitAmountEqually,
  generateCustomSplitInstallments,
  calculateReminderDate,
} from '../src/lib/paymentEngine';

describe('Payment Engine Unit Tests', () => {
  it('passes the Golden Test specified in Section 10 of PRD', () => {
    const totalPayable = 8400;
    const installments = generateStandardInstallments(totalPayable, 4, '2026-10-18', 30);

    expect(installments).toHaveLength(4);

    // Slot 1
    expect(installments[0].amount).toBe(2100);
    expect(installments[0].dueDate).toBe('2026-11-17');
    expect(calculateReminderDate(installments[0].dueDate)).toBe('2026-11-15');

    // Slot 2
    expect(installments[1].amount).toBe(2100);
    expect(installments[1].dueDate).toBe('2026-12-17');
    expect(calculateReminderDate(installments[1].dueDate)).toBe('2026-12-15');

    // Slot 3
    expect(installments[2].amount).toBe(2100);
    expect(installments[2].dueDate).toBe('2027-01-16');
    expect(calculateReminderDate(installments[2].dueDate)).toBe('2027-01-14');

    // Slot 4
    expect(installments[3].amount).toBe(2100);
    expect(installments[3].dueDate).toBe('2027-02-15');
    expect(calculateReminderDate(installments[3].dueDate)).toBe('2027-02-13');
  });

  it('handles cent rounding correctly with remainder in the last installment', () => {
    // $1000 / 3 = 333.33, 333.33, 333.34
    const parts = splitAmountEqually(1000, 3);
    expect(parts).toEqual([333.33, 333.33, 333.34]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(1000);
  });

  it('generates custom split schedule: 2 upfront + 5 remaining installments', () => {
    const totalPayable = 10000;
    const upfrontAmount = 2500;
    const installments = generateCustomSplitInstallments(
      totalPayable,
      upfrontAmount,
      2, // 2 upfront
      5, // 5 remaining
      '2026-10-18',
      30
    );

    expect(installments).toHaveLength(7);

    // Upfront installments sum to 2500
    const upfrontSum = installments
      .filter((i) => i.tier === 'UPFRONT')
      .reduce((s, i) => s + i.amount, 0);
    expect(upfrontSum).toBe(2500);

    // Remaining installments sum to 7500
    const remainingSum = installments
      .filter((i) => i.tier === 'REMAINING')
      .reduce((s, i) => s + i.amount, 0);
    expect(remainingSum).toBe(7500);

    // Total equals 10000
    const totalSum = installments.reduce((s, i) => s + i.amount, 0);
    expect(totalSum).toBe(10000);
  });
});

