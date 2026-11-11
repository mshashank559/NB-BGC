import { addDays, format, parseISO, subDays } from 'date-fns';
import { Installment, PaymentPlan } from '../types';

/**
 * Computes date adding exact fixed days to a base YYYY-MM-DD date.
 */
export function addDaysToDateString(baseDate: string, days: number): string {
  const date = parseISO(baseDate);
  return format(addDays(date, days), 'yyyy-MM-dd');
}

/**
 * Calculates email reminder date (Due Date minus 2 days).
 */
export function calculateReminderDate(dueDateString: string): string {
  const dueDate = parseISO(dueDateString);
  return format(subDays(dueDate, 2), 'yyyy-MM-dd');
}

/**
 * Splits an amount into N parts using integer minor units (cents)
 * with any remainder placed into the last installment.
 */
export function splitAmountEqually(totalAmount: number, parts: number): number[] {
  if (parts <= 0) return [totalAmount];
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / parts);
  const remainderCents = totalCents - baseCents * parts;

  const amounts: number[] = [];
  for (let i = 0; i < parts; i++) {
    const isLast = i === parts - 1;
    const cents = isLast ? baseCents + remainderCents : baseCents;
    amounts.push(cents / 100);
  }
  return amounts;
}

/**
 * Standard 4-part (or N-part) installment schedule generator.
 * Golden test verified:
 * $8400, 4 parts, joining 2026-10-18:
 * - Installment 1: $2100, 2026-11-17
 * - Installment 2: $2100, 2026-12-17
 * - Installment 3: $2100, 2027-01-16
 * - Installment 4: $2100, 2027-02-15
 */
export function generateStandardInstallments(
  totalPayable: number,
  installmentCount: number = 4,
  joiningDate: string,
  cycleGapDays: number = 30
): Installment[] {
  const amounts = splitAmountEqually(totalPayable, installmentCount);
  const installments: Installment[] = [];

  for (let k = 1; k <= installmentCount; k++) {
    const dueDate = addDaysToDateString(joiningDate, cycleGapDays * k);
    const reminderDate = calculateReminderDate(dueDate);

    installments.push({
      id: `inst-${k}-${Date.now().toString(36)}`,
      number: k,
      tier: 'STANDARD',
      amount: amounts[k - 1],
      dueDate,
      dueDateIsManual: false,
      status: 'PENDING',
      reminderStatus: 'SCHEDULED',
      reminderScheduledFor: `${reminderDate}T09:00:00+05:30`,
    });
  }

  return installments;
}

/**
 * Custom Payment Flexibility Window (Special Requirement):
 * Allows candidates to pay:
 * - On-offer / Upfront amount in 2 to 3 installments (e.g. Day 0, Day 15, Day 30)
 * - Remaining amount in 5 to 6 monthly installments
 */
export function generateCustomSplitInstallments(
  totalPayable: number,
  upfrontAmount: number,
  onOfferCount: number, // 2 or 3
  remainingCount: number, // 5 or 6
  joiningDate: string,
  cycleGapDays: number = 30
): Installment[] {
  const safeUpfront = Math.min(upfrontAmount, totalPayable);
  const remainingAmount = Math.max(0, totalPayable - safeUpfront);

  const upfrontAmounts = splitAmountEqually(safeUpfront, onOfferCount);
  const remainingAmounts = splitAmountEqually(remainingAmount, remainingCount);

  const installments: Installment[] = [];
  let slotNumber = 1;

  // Tier 1: Upfront / On-Offer Installments
  for (let i = 0; i < onOfferCount; i++) {
    // E.g. Slot 1 on Joining Date, Slot 2 on Joining Date + 15 days, etc.
    const dayOffset = Math.round((cycleGapDays / onOfferCount) * i);
    const dueDate = addDaysToDateString(joiningDate, dayOffset);
    const reminderDate = calculateReminderDate(dueDate);

    installments.push({
      id: `inst-${slotNumber}-${Date.now().toString(36)}`,
      number: slotNumber,
      tier: 'UPFRONT',
      amount: upfrontAmounts[i],
      dueDate,
      dueDateIsManual: false,
      status: 'PENDING',
      reminderStatus: 'SCHEDULED',
      reminderScheduledFor: `${reminderDate}T09:00:00+05:30`,
    });
    slotNumber++;
  }

  // Tier 2: Remaining Balance Installments (30-day cycles starting from Joining Date + 30 days)
  for (let j = 1; j <= remainingCount; j++) {
    const dueDate = addDaysToDateString(joiningDate, cycleGapDays * j);
    const reminderDate = calculateReminderDate(dueDate);

    installments.push({
      id: `inst-${slotNumber}-${Date.now().toString(36)}`,
      number: slotNumber,
      tier: 'REMAINING',
      amount: remainingAmounts[j - 1],
      dueDate,
      dueDateIsManual: false,
      status: 'PENDING',
      reminderStatus: 'SCHEDULED',
      reminderScheduledFor: `${reminderDate}T09:00:00+05:30`,
    });
    slotNumber++;
  }

  return installments;
}

/**
 * Collapses schedule to One-Shot payment (Joining Date + 30 days).
 */
export function generateOneShotInstallment(
  totalPayable: number,
  joiningDate: string
): Installment[] {
  const dueDate = addDaysToDateString(joiningDate, 30);
  const reminderDate = calculateReminderDate(dueDate);

  return [
    {
      id: `inst-1-${Date.now().toString(36)}`,
      number: 1,
      tier: 'STANDARD',
      amount: totalPayable,
      dueDate,
      dueDateIsManual: false,
      status: 'PENDING',
      reminderStatus: 'SCHEDULED',
      reminderScheduledFor: `${reminderDate}T09:00:00+05:30`,
    },
  ];
}

/**
 * Dynamically shifts due dates when the Joining Date changes.
 * Manually edited dates retain their values and remain flagged.
 */
export function recalculateScheduleForNewJoiningDate(
  plan: PaymentPlan,
  newJoiningDate: string
): Installment[] {
  return plan.installments.map((inst, index) => {
    if (inst.dueDateIsManual) {
      // Retain manually edited date
      return inst;
    }
    const k = index + 1;
    const newDueDate = addDaysToDateString(newJoiningDate, plan.cycleGapDays * k);
    const reminderDate = calculateReminderDate(newDueDate);

    return {
      ...inst,
      dueDate: newDueDate,
      reminderScheduledFor: `${reminderDate}T09:00:00+05:30`,
      reminderStatus: inst.status === 'PAID' ? 'CANCELLED' : 'RESCHEDULED',
    };
  });
}

