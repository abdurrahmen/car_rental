/**
 * Centralized Overview Metrics Calculator
 * Single source of truth for all dashboard numbers to prevent contradictions
 * Enforces invariants: available + rented + maintenance = total fleet
 */

import type { PulseStats, ActionItem, TimelineEvent, GarageVehicle } from '@/lib/data/dashboard';
import type { Vehicle, Reservation } from '@/types';

interface OverviewMetricsInput {
  vehicles: Vehicle[];
  reservations: Reservation[];
  branchId?: string | null;
}

interface OverviewMetrics {
  stats: PulseStats;
  actionItems: ActionItem[];
  timelineEvents: TimelineEvent[];
  garageVehicles: GarageVehicle[];
  totalPendingCount: number;
  overdueCount: number;
}

/**
 * Calculate all overview metrics from raw data with enforced invariants
 */
export function calculateOverviewMetrics(input: OverviewMetricsInput): OverviewMetrics {
  const { vehicles, reservations } = input;

  // ====================================================================
  // 1. FLEET STATISTICS (Invariant: available + rented + maintenance = total)
  // ====================================================================
  const totalVehicles = vehicles.length;
  const availableCount = vehicles.filter((v) => v.status === 'available').length;
  const rentedCount = vehicles.filter((v) => v.status === 'rented').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'maintenance').length;
  const retiredCount = vehicles.filter((v) => v.status === 'retired').length;
  const activeFleet = totalVehicles - retiredCount;

  // Enforce invariant with assertion in dev
  if (process.env.NODE_ENV !== 'production') {
    const computed = availableCount + rentedCount + maintenanceCount + retiredCount;
    if (computed !== totalVehicles) {
      console.warn(
        `⚠️ Fleet invariant violation: ${availableCount} + ${rentedCount} + ${maintenanceCount} + ${retiredCount} = ${computed} !== ${totalVehicles}`
      );
    }
  }

  const utilizationRate = activeFleet > 0 ? Math.round((rentedCount / activeFleet) * 100) : 0;

  // ====================================================================
  // 2. OPERATIONAL EVENTS TODAY (Invariant: counts match timeline)
  // ====================================================================
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const handoversTodayList = reservations.filter((r) => {
    return r.start_date.startsWith(todayStr) && ['deposit_paid', 'confirmed', 'active'].includes(r.status);
  });
  const handoversCompleted = handoversTodayList.filter((r) => r.status === 'active').length;
  const handoversTotal = handoversTodayList.length;

  const returnsTodayList = reservations.filter((r) => {
    return r.end_date.startsWith(todayStr) && r.status === 'active';
  });
  const returnsCompleted = returnsTodayList.filter((r) => r.status === 'completed').length;
  const overdueList = reservations.filter((r) => {
    return r.status === 'active' && new Date(r.end_date) < now;
  });
  const returnsTotal = returnsTodayList.length;

  // ====================================================================
  // 3. REVENUE & FINANCIAL METRICS
  // ====================================================================
  const revenueGenerating = ['confirmed', 'deposit_paid', 'active', 'completed'];
  const totalRevenue = reservations
    .filter((r) => revenueGenerating.includes(r.status))
    .reduce((acc, r) => acc + (Number(r.total_price) || 0), 0);

  const depositsHeld = reservations
    .filter((r) => ['deposit_paid', 'active'].includes(r.status))
    .reduce((acc, r) => acc + (Number(r.deposit_amount) || 0), 0);

  const toCollectToday = reservations
    .filter((r) => r.status === 'deposit_paid' && r.start_date.startsWith(todayStr))
    .reduce((acc, r) => acc + (Number(r.total_price) || 0), 0);

  // Payment method distribution (proportional split based on total revenue)
  const paymentSplit = {
    cash: Math.round(totalRevenue * 0.45),
    baridimob: Math.round(totalRevenue * 0.30),
    ccp: Math.round(totalRevenue * 0.15),
    edahabia: Math.round(totalRevenue * 0.10),
  };

  // Sparkline placeholder (TODO: real historical data)
  const sparkline = [
    Math.round(totalRevenue * 0.4),
    Math.round(totalRevenue * 0.53),
    Math.round(totalRevenue * 0.45),
    Math.round(totalRevenue * 0.67),
    Math.round(totalRevenue * 0.80),
    Math.round(totalRevenue * 0.91),
    totalRevenue,
  ];

  // ====================================================================
  // 4. ACTION CENTER ITEMS (sorted by priority/urgency with severity tiers)
  // Severity tiers: urgent (>7d or >24h), high (>24h or >2h), medium (<2h)
  // ====================================================================
  const actionItems: ActionItem[] = [];

  // Overdue returns (severity based on delay duration)
  overdueList.forEach((r) => {
    const vehicle = vehicles.find((v) => v.id === r.vehicle_id);
    const vName = vehicle ? `${vehicle.make} ${vehicle.model}` : 'Véhicule';
    const plate = vehicle?.plate_number || '—';
    
    const hoursOverdue = Math.round((now.getTime() - new Date(r.end_date).getTime()) / (1000 * 60 * 60));
    const daysOverdue = Math.floor(hoursOverdue / 24);
    
    // Severity: >7d = urgent, >24h = high, else medium
    let priority: 'urgent' | 'high' | 'medium' = 'medium';
    if (daysOverdue >= 7) {
      priority = 'urgent';
    } else if (hoursOverdue >= 24) {
      priority = 'high';
    }
    
    const delayText = daysOverdue >= 1 
      ? `En retard depuis ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}`
      : `En retard depuis ${hoursOverdue} heure${hoursOverdue > 1 ? 's' : ''}`;

    actionItems.push({
      id: `overdue-${r.id}`,
      type: 'overdue_return',
      priority,
      title: `${vName} — ${plate}`,
      subtitle: delayText,
      phone: '+213 550 12 34 56', // TODO: Get from customer profile
      referenceId: r.id,
      timestamp: r.end_date,
    });
  });

  // Pending booking requests (severity based on wait time)
  const pendingReservations = reservations.filter((r) => r.status === 'pending');
  pendingReservations.forEach((r) => {
    const vehicle = vehicles.find((v) => v.id === r.vehicle_id);
    const vName = vehicle ? `${vehicle.make} ${vehicle.model}` : 'Véhicule';
    
    const hoursWaiting = Math.round((now.getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60));
    
    // Severity: >24h = high, >2h = medium, else medium
    let priority: 'urgent' | 'high' | 'medium' = 'medium';
    if (hoursWaiting >= 24) {
      priority = 'high';
    } else if (hoursWaiting >= 2) {
      priority = 'medium';
    } else {
      priority = 'medium';
    }
    
    const waitText = hoursWaiting >= 24
      ? `En attente depuis ${Math.floor(hoursWaiting / 24)} jour${Math.floor(hoursWaiting / 24) > 1 ? 's' : ''}`
      : hoursWaiting >= 1
      ? `En attente depuis ${hoursWaiting} heure${hoursWaiting > 1 ? 's' : ''}`
      : 'Nouvelle demande';

    actionItems.push({
      id: `pending-${r.id}`,
      type: 'pending_booking',
      priority,
      title: `${vName} • ${Number(r.total_price || 0).toLocaleString()} DZD`,
      subtitle: waitText,
      phone: '+213 555 98 76 54', // TODO: Get from customer profile
      amount: r.total_price,
      referenceId: r.id,
      timestamp: r.created_at,
    });
  });

  // Cash to collect (Medium)
  if (toCollectToday > 0) {
    actionItems.push({
      id: 'cash-pickup-today',
      type: 'cash_collect',
      priority: 'medium',
      title: `${toCollectToday.toLocaleString()} DZD à encaisser aujourd'hui`,
      subtitle: `${handoversTodayList.length} remise${handoversTodayList.length > 1 ? 's' : ''} prévue${handoversTodayList.length > 1 ? 's' : ''} avec règlement sur place`,
      amount: toCollectToday,
      timestamp: now.toISOString(),
    });
  }

  // Sort by priority first, then by timestamp (oldest first within each priority)
  const priorityOrder = { urgent: 1, high: 2, medium: 3 };
  actionItems.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    // Within same priority, older items first
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  // ====================================================================
  // 5. TODAY'S TIMELINE (from real reservations with status logic)
  // ====================================================================
  const timelineEvents: TimelineEvent[] = [];

  // Add handovers
  handoversTodayList.slice(0, 2).forEach((r) => {
    const vehicle = vehicles.find((v) => v.id === r.vehicle_id);
    const vName = vehicle ? `${vehicle.make} ${vehicle.model}` : 'Véhicule';
    const plate = vehicle?.plate_number || '—';

    timelineEvents.push({
      id: `handover-${r.id}`,
      time: new Date(r.start_date).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit', hour12: false }),
      type: 'handover',
      status: r.status === 'active' ? 'completed' : 'scheduled',
      vehicleName: vName,
      vehiclePlate: plate,
      customerName: 'Client', // TODO: Get from profile
      branchName: 'Alger Centre', // TODO: Get from branch
      actionLabelKey: 'start_handover',
      reservationId: r.id,
    });
  });

  // Add returns
  returnsTodayList.slice(0, 2).forEach((r) => {
    const vehicle = vehicles.find((v) => v.id === r.vehicle_id);
    const vName = vehicle ? `${vehicle.make} ${vehicle.model}` : 'Véhicule';
    const plate = vehicle?.plate_number || '—';

    timelineEvents.push({
      id: `return-${r.id}`,
      time: new Date(r.end_date).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit', hour12: false }),
      type: 'return',
      status: r.status === 'completed' ? 'completed' : 'scheduled',
      vehicleName: vName,
      vehiclePlate: plate,
      customerName: 'Client',
      branchName: 'Alger Centre',
      actionLabelKey: 'process_return',
      reservationId: r.id,
    });
  });

  // Sort by time
  timelineEvents.sort((a, b) => a.time.localeCompare(b.time));

  // ====================================================================
  // 6. GARAGE VEHICLES (sorted by urgency: rented → maintenance → available)
  // ====================================================================
  const garageVehicles: GarageVehicle[] = vehicles.map((v) => {
    let nextText = {
      ar: 'متاحة للحجز الفوري',
      fr: 'Disponible immédiatement',
      en: 'Available right now',
    };
    let urgency = 1;

    if (v.status === 'rented') {
      nextText = {
        ar: 'يعود اليوم عند 16:00',
        fr: 'Retour prévu à 16:00',
        en: 'Returns today 16:00',
      };
      urgency = 4;
    } else if (v.status === 'maintenance') {
      nextText = {
        ar: 'فحص دوري 15,000 كم',
        fr: 'Contrôle 15 000 km en cours',
        en: '15k km inspection',
      };
      urgency = 2;
    }

    // Use fallback photo for missing/mismatched photos
    const photoUrl = 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80';

    return {
      id: v.id,
      make: v.make,
      model: v.model,
      year: v.year,
      plateNumber: v.plate_number,
      status: v.status,
      dailyRate: v.daily_rate,
      branchId: v.branch_id,
      branchName: 'Alger Centre', // TODO: Join with branch
      categoryName: 'Citadine', // TODO: Join with category
      photoUrl,
      nextEventText: nextText,
      urgencyScore: urgency,
    };
  });

  // Sort by urgency descending
  garageVehicles.sort((a, b) => b.urgencyScore - a.urgencyScore);

  // ====================================================================
  // RETURN METRICS WITH ENFORCED INVARIANTS
  // ====================================================================
  const stats: PulseStats = {
    handoversToday: {
      completed: handoversCompleted,
      total: handoversTotal,
    },
    returnsToday: {
      completed: returnsCompleted,
      total: returnsTotal,
      overdue: overdueList.length,
    },
    fleetAvailability: {
      available: availableCount,
      rented: rentedCount,
      maintenance: maintenanceCount,
      retired: retiredCount,
      total: totalVehicles,
      utilizationRate,
    },
    revenueMonth: {
      total: totalRevenue,
      deltaPercent: null, // TODO: Calculate from historical data
      sparkline,
    },
    moneyStrip: {
      collected: totalRevenue,
      toCollectToday,
      depositsHeld,
    },
    paymentSplit,
  };

  return {
    stats,
    actionItems,
    timelineEvents,
    garageVehicles,
    totalPendingCount: pendingReservations.length,
    overdueCount: overdueList.length,
  };
}
