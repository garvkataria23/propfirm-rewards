const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reconcileBalances() {
  console.log('[Reconcile] Starting user balance reconciliation from PointsLedger...');
  const users = await prisma.user.findMany({ select: { id: true, email: true, pointsBalance: true } });

  let updatedCount = 0;
  for (const user of users) {
    const latestTx = await prisma.pointsLedger.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { balanceAfter: true },
    });

    const correctBalance = latestTx ? latestTx.balanceAfter : 0;
    if (user.pointsBalance !== correctBalance) {
      console.log(`[Reconcile] Reconciling ${user.email}: ${user.pointsBalance} -> ${correctBalance}`);
      await prisma.user.update({
        where: { id: user.id },
        data: { pointsBalance: correctBalance },
      });
      updatedCount++;
    }
  }

  console.log(`[Reconcile] Reconciliation complete. Reconciled ${updatedCount} user accounts.`);
  await prisma.$disconnect();
}

reconcileBalances().catch((err) => {
  console.error('Reconciliation failed:', err);
  process.exit(1);
});
