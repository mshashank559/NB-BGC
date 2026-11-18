import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentReminderEmail } from '@/lib/emailService';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      candidateId,
      candidateName,
      recipientEmail,
      installmentId,
      installmentNumber,
      totalInstallments = 4,
      amount,
      dueDate,
      paymentLink,
      triggeredBy = 'Account Manager',
      userId = 'acc-manager-1',
      userRole = 'ACCOUNT_MANAGER',
    } = body;

    // Validate inputs
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid candidate email address is required.' },
        { status: 400 }
      );
    }

    if (!paymentLink || !paymentLink.trim().startsWith('http')) {
      return NextResponse.json(
        { success: false, error: 'A valid payment link starting with http:// or https:// is required.' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'A valid positive installment amount is required.' },
        { status: 400 }
      );
    }

    // Dispatch email via Gmail SMTP
    const result = await sendPaymentReminderEmail({
      candidateName,
      recipientEmail: recipientEmail.trim(),
      installmentNumber: Number(installmentNumber) || 1,
      totalInstallments: Number(totalInstallments) || 4,
      amount: Number(amount),
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
      paymentLink: paymentLink.trim(),
      candidateId,
      installmentId,
      triggeredBy,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to dispatch email via Gmail SMTP gateway.' },
        { status: 500 }
      );
    }

    // Log to Supabase reminder_logs
    try {
      if (supabaseAdmin) {
        await supabaseAdmin.from('reminder_logs').insert([
          {
            candidate_id: candidateId || 'manual-entry',
            candidate_name: candidateName || 'Candidate',
            installment_number: Number(installmentNumber) || 1,
            recipient_email: recipientEmail.trim(),
            amount: Number(amount),
            due_date: dueDate || new Date().toISOString().slice(0, 10),
            scheduled_for: new Date().toISOString(),
            sent_at: new Date().toISOString(),
            status: 'SENT',
          },
        ]);

        // Record in audit log
        await supabaseAdmin.from('audit_entries').insert([
          {
            candidate_id: candidateId || 'manual-entry',
            candidate_name: candidateName || 'Candidate',
            field: 'EMAIL_REMINDER',
            old_value: 'SCHEDULED',
            new_value: 'SENT',
            remark: `Real-time payment reminder with payment link dispatched to ${recipientEmail} by ${triggeredBy}. Link: ${paymentLink}`,
            user_id: userId,
            user_name: triggeredBy,
            role_at_time: userRole,
          },
        ]);
      }
    } catch (dbErr) {
      console.warn('[API/send-reminder] Supabase logging notice (email was sent):', dbErr);
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      recipientEmail: recipientEmail.trim(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API/send-reminder] Unexpected server error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

