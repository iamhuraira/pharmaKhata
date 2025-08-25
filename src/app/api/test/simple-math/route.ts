import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const advanceAmount = parseFloat(searchParams.get('advance') || '2000');
    const orderAmount = parseFloat(searchParams.get('order') || '5000');
    
    // Scenario: Customer gives advance, then creates order
    const scenario1 = {
      description: "Customer gives advance, then creates order (advance used for order)",
      advance: advanceAmount,
      order: orderAmount,
      advanceUsed: Math.min(advanceAmount, orderAmount),
      remainingAdvance: Math.max(0, advanceAmount - orderAmount),
      netAmountDue: orderAmount - advanceAmount,
      finalBalance: orderAmount - advanceAmount,
      explanation: `Customer owes ${orderAmount - advanceAmount} PKR after using ${Math.min(advanceAmount, orderAmount)} PKR advance`
    };

    const scenario2 = {
      description: "Customer gives advance, then creates order (advance kept separate)",
      advance: advanceAmount,
      order: orderAmount,
      advanceKept: advanceAmount,
      orderDebt: orderAmount,
      totalBalance: -orderAmount + advanceAmount,
      explanation: `Customer has ${advanceAmount} PKR advance and owes ${orderAmount} PKR, net balance: ${-orderAmount + advanceAmount} PKR`
    };

    const scenario3 = {
      description: "Customer gives advance, then creates order, advance allocated to order",
      advance: advanceAmount,
      order: orderAmount,
      advanceAllocated: Math.min(advanceAmount, orderAmount),
      remainingDebt: orderAmount - advanceAmount,
      finalBalance: -(orderAmount - advanceAmount),
      explanation: `After allocating ${Math.min(advanceAmount, orderAmount)} PKR advance to order, customer owes ${orderAmount - advanceAmount} PKR`
    };

    return NextResponse.json({
      success: true,
      data: {
        input: {
          advanceAmount,
          orderAmount
        },
        scenarios: {
          scenario1,
          scenario2,
          scenario3
        },
        question: "Which scenario is correct? The image shows -1,000 PKR final balance.",
        analysis: {
          expectedDueAmount: orderAmount - advanceAmount,
          expectedBalance: -(orderAmount - advanceAmount),
          imageShows: -1000,
          matchesExpected: (orderAmount - advanceAmount) === 1000
        }
      }
    });

  } catch (error) {
    console.error('Simple math test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
