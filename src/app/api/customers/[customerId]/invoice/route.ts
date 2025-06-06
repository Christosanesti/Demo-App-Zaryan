import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get customer details
    const customer = await db.customer.findUnique({
      where: {
        id: params.customerId,
        userId: user.id,
      },
    });

    if (!customer) {
      return new NextResponse("Customer not found", { status: 404 });
    }

    // Get all sales for the customer
    const sales = await db.sale.findMany({
      where: {
        customerId: params.customerId,
        userId: user.id,
      },
      include: {
        item: true,
        installments: {
          orderBy: {
            dueDate: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate total amounts
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalPaid = sales.reduce((sum, sale) => {
      const paidInstallments = sale.installments.filter(
        (i) => i.status === "PAID"
      );
      return sum + paidInstallments.reduce((s, i) => s + i.amount, 0);
    }, 0);
    const totalDue = totalSales - totalPaid;

    // Format the data for the invoice
    const invoice = {
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
      },
      sales: sales.map((sale) => ({
        reference: sale.reference,
        date: sale.createdAt,
        item: sale.item.name,
        totalAmount: sale.totalAmount,
        advanceAmount: sale.advanceAmount,
        remainingAmount: sale.totalAmount - sale.advanceAmount,
        installments: sale.installments.map((i) => ({
          dueDate: i.dueDate,
          amount: i.amount,
          status: i.status,
          paidAt: i.paidAt,
        })),
      })),
      summary: {
        totalSales,
        totalPaid,
        totalDue,
      },
      generatedAt: new Date(),
    };

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[CUSTOMER_INVOICE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
