import { db } from "@/lib/db";

interface SyncCustomerInput {
  fullName: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  address?: string | null;
  total: number;
  orderDate: Date;
}

export async function syncCustomerFromOrder(
  shopId: string,
  input: SyncCustomerInput
): Promise<void> {
  const phone = input.phone.replace(/\s/g, "");

  const existing = await db.customer.findUnique({
    where: {
      shopId_phone: {
        shopId,
        phone,
      },
    },
  });

  if (existing) {
    const newTotalOrders = existing.totalOrders + 1;
    const newTotalSpent = existing.totalSpent + input.total;
    const newAverageOrder = Math.round(newTotalSpent / newTotalOrders);

    await db.customer.update({
      where: { id: existing.id },
      data: {
        fullName: input.fullName,
        email: input.email ?? existing.email,
        city: input.city ?? existing.city,
        address: input.address ?? existing.address,
        totalOrders: newTotalOrders,
        totalSpent: newTotalSpent,
        averageOrder: newAverageOrder,
        lastOrderAt: input.orderDate,
      },
    });
  } else {
    await db.customer.create({
      data: {
        shopId,
        fullName: input.fullName,
        phone,
        email: input.email || null,
        city: input.city || null,
        address: input.address || null,
        totalOrders: 1,
        totalSpent: input.total,
        averageOrder: input.total,
        firstOrderAt: input.orderDate,
        lastOrderAt: input.orderDate,
      },
    });
  }
}

export async function backfillCustomersFromOrders(
  shopId: string
): Promise<{ created: number }> {
  const orders = await db.order.findMany({
    where: { shopId },
    orderBy: { createdAt: "asc" },
    select: {
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      customerCity: true,
      customerAddress: true,
      total: true,
      createdAt: true,
    },
  });

  const byPhone = new Map<string, typeof orders>();
  for (const order of orders) {
    const key = order.customerPhone.replace(/\s/g, "");
    if (!byPhone.has(key)) byPhone.set(key, []);
    byPhone.get(key)!.push(order);
  }

  let created = 0;
  for (const [phone, customerOrders] of byPhone.entries()) {
    const first = customerOrders[0];
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
    const averageOrder = Math.round(totalSpent / totalOrders);

    await db.customer.upsert({
      where: {
        shopId_phone: { shopId, phone },
      },
      create: {
        shopId,
        fullName: first.customerName,
        phone,
        email:
          customerOrders.find((o) => o.customerEmail)?.customerEmail || null,
        city: first.customerCity,
        address: first.customerAddress,
        totalOrders,
        totalSpent,
        averageOrder,
        firstOrderAt: customerOrders[0].createdAt,
        lastOrderAt: customerOrders[customerOrders.length - 1].createdAt,
      },
      update: {
        totalOrders,
        totalSpent,
        averageOrder,
        firstOrderAt: customerOrders[0].createdAt,
        lastOrderAt: customerOrders[customerOrders.length - 1].createdAt,
      },
    });
    created++;
  }

  return { created };
}
