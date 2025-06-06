import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const purchase = await db.inventoryPurchase.findUnique({
      where: {
        id: params.purchaseId,
        userId,
      },
    });

    if (!purchase) {
      return new NextResponse("Purchase not found", { status: 404 });
    }

    // Update inventory item quantity
    const existingItem = await db.inventoryItem.findFirst({
      where: {
        name: purchase.productName,
        userId,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity - purchase.quantity;
      if (newQuantity <= 0) {
        // Delete the item if quantity becomes 0 or negative
        await db.inventoryItem.delete({
          where: { id: existingItem.id },
        });
      } else {
        // Update the quantity
        await db.inventoryItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            lastUpdated: new Date(),
          },
        });
      }
    }

    // Delete the purchase record
    await db.inventoryPurchase.delete({
      where: {
        id: params.purchaseId,
      },
    });

    // Delete the corresponding daybook entry
    await db.daybookEntry.deleteMany({
      where: {
        description: `Purchase: ${purchase.productName}`,
        date: purchase.date,
        userId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[INVENTORY_PURCHASE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
