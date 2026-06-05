import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { authenticate } from '../../middlewares/authenticate';
import prisma from '../../config/database/postgresql/prisma';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../../middlewares/authenticate';
import { enqueueNotification } from '../../queues/notification.queue';

const router = Router();
router.use(authenticate);

// --- Budget ---
router.post('/trips/:tripId/budget', catchAsync(async (req: AuthRequest, res) => {
  const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, userId: req.user!.id } });
  if (!trip) throw AppError.notFound('Trip');

  const budget = await prisma.budget.upsert({
    where: { tripId_userId: { tripId: req.params.tripId, userId: req.user!.id } },
    update: req.body,
    create: { tripId: req.params.tripId, userId: req.user!.id, ...req.body },
    include: { expenses: true },
  });
  ApiResponse.created(res, budget, 'Budget saved');
}));

router.get('/trips/:tripId/budget', catchAsync(async (req: AuthRequest, res) => {
  const budget = await prisma.budget.findUnique({
    where: { tripId_userId: { tripId: req.params.tripId, userId: req.user!.id } },
    include: { expenses: true },
  });
  if (!budget) throw AppError.notFound('Budget');
  ApiResponse.success(res, budget);
}));

// --- Expenses ---
router.post('/trips/:tripId/expenses', catchAsync(async (req: AuthRequest, res) => {
  const budget = await prisma.budget.findUnique({
    where: { tripId_userId: { tripId: req.params.tripId, userId: req.user!.id } },
  });
  if (!budget) throw AppError.notFound('Budget');

  const expense = await prisma.expense.create({ data: { budgetId: budget.id, ...req.body } });

  // Update spent amount
  const totalSpent = await prisma.expense.aggregate({
    where: { budgetId: budget.id },
    _sum: { amount: true },
  });

  const spent = totalSpent._sum.amount ?? 0;
  await prisma.budget.update({ where: { id: budget.id }, data: { spentAmount: spent } });

  // Budget alert
  if (budget.alertEnabled && budget.alertAt) {
    const percent = (spent / budget.totalAmount) * 100;
    if (percent >= budget.alertAt) {
      const trip = await prisma.trip.findUnique({ where: { id: req.params.tripId } });
      await enqueueNotification({
        userId: req.user!.id,
        type: 'BUDGET_ALERT',
        title: '⚠️ Budget Alert',
        body: `You've used ${Math.round(percent)}% of your budget for "${trip?.name}"`,
        data: { tripId: req.params.tripId, percent },
      });
    }
  }

  ApiResponse.created(res, expense, 'Expense added');
}));

router.get('/trips/:tripId/expenses', catchAsync(async (req: AuthRequest, res) => {
  const budget = await prisma.budget.findUnique({
    where: { tripId_userId: { tripId: req.params.tripId, userId: req.user!.id } },
  });
  if (!budget) throw AppError.notFound('Budget');

  const expenses = await prisma.expense.findMany({
    where: { budgetId: budget.id },
    orderBy: { date: 'desc' },
  });
  ApiResponse.success(res, expenses);
}));

router.put('/trips/:tripId/expenses/:id', catchAsync(async (req: AuthRequest, res) => {
  const expense = await prisma.expense.update({ where: { id: req.params.id }, data: req.body });
  ApiResponse.success(res, expense, 'Expense updated');
}));

router.delete('/trips/:tripId/expenses/:id', catchAsync(async (req: AuthRequest, res) => {
  await prisma.expense.delete({ where: { id: req.params.id } });
  ApiResponse.noContent(res);
}));

router.get('/trips/:tripId/budget/report', catchAsync(async (req: AuthRequest, res) => {
  const budget = await prisma.budget.findUnique({
    where: { tripId_userId: { tripId: req.params.tripId, userId: req.user!.id } },
    include: { expenses: true },
  });
  if (!budget) throw AppError.notFound('Budget');

  const byCategory = budget.expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
    return acc;
  }, {});

  ApiResponse.success(res, {
    budget: { total: budget.totalAmount, spent: budget.spentAmount, remaining: budget.totalAmount - budget.spentAmount },
    byCategory,
    expenses: budget.expenses,
    percentUsed: Math.round((budget.spentAmount / budget.totalAmount) * 100),
  });
}));

export default router;
