const UserAvailability = require('../models/UserAvailability');
const Session = require('../models/Session');

const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map((x) => parseInt(x, 10));
  return h * 60 + m;
}

function fromMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad(h)}:${pad(m)}`;
}

function dateToYMD(date) {
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  return `${y}-${m}-${d}`;
}

function combineDateTimeUTC(dateStr, timeStr) {
  // Interpret timeStr as UTC for simplicity
  return new Date(`${dateStr}T${timeStr}:00.000Z`);
}

function mergeIntervals(intervals) {
  if (!intervals.length) return [];
  const sorted = intervals
    .map((i) => ({ start: i.start, end: i.end }))
    .sort((a, b) => a.start - b.start);
  const result = [];
  let current = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    if (next.start <= current.end) {
      current.end = Math.max(current.end, next.end);
    } else {
      result.push(current);
      current = next;
    }
  }
  result.push(current);
  return result;
}

function subtractIntervals(baseIntervals, removeIntervals) {
  if (!baseIntervals.length) return [];
  if (!removeIntervals.length) return baseIntervals.slice();

  let result = baseIntervals.slice();
  for (const rem of removeIntervals) {
    const newResult = [];
    for (const base of result) {
      // No overlap
      if (rem.end <= base.start || rem.start >= base.end) {
        newResult.push(base);
        continue;
      }
      // Overlap: split
      if (rem.start > base.start) {
        newResult.push({ start: base.start, end: Math.min(rem.start, base.end) });
      }
      if (rem.end < base.end) {
        newResult.push({ start: Math.max(rem.end, base.start), end: base.end });
      }
    }
    result = newResult;
  }
  return result;
}

async function getUserAvailabilityDoc(userId) {
  const doc = await UserAvailability.findOne({ user: userId });
  return doc || null;
}

function buildDailyBaseIntervalsForDate(avDoc, date) {
  if (!avDoc || !avDoc.rules || !avDoc.rules.length) return [];
  const day = date.getUTCDay(); // 0-6
  const dateStr = dateToYMD(date);
  const dayRule = avDoc.rules.find((r) => r.day === day);
  if (!dayRule || !dayRule.intervals || !dayRule.intervals.length) return [];
  return dayRule.intervals.map((intv) => {
    const start = combineDateTimeUTC(dateStr, intv.start).getTime();
    const end = combineDateTimeUTC(dateStr, intv.end).getTime();
    return { start, end };
  });
}

function applyExceptionsForDate(avDoc, date, intervals) {
  if (!avDoc || !avDoc.exceptions || !avDoc.exceptions.length) return intervals;
  const dateStr = dateToYMD(date);
  const exceptions = avDoc.exceptions.filter((e) => e.date === dateStr);
  if (!exceptions.length) return intervals;
  let result = intervals.slice();
  for (const ex of exceptions) {
    const exIntervals = (ex.intervals || []).map((i) => ({
      start: combineDateTimeUTC(dateStr, i.start).getTime(),
      end: combineDateTimeUTC(dateStr, i.end).getTime(),
    }));
    if (ex.type === 'unavailable') {
      result = subtractIntervals(result, exIntervals);
    } else if (ex.type === 'available') {
      result = mergeIntervals(result.concat(exIntervals));
    }
  }
  return result;
}

function generateSlotsFromIntervals(intervals, durationMin, stepMin) {
  const slots = [];
  const durationMs = durationMin * 60 * 1000;
  const stepMs = stepMin * 60 * 1000;
  for (const intv of intervals) {
    for (let t = intv.start; t + durationMs <= intv.end; t += stepMs) {
      slots.push({ start: new Date(t), end: new Date(t + durationMs) });
    }
  }
  return slots;
}

function intervalsFromSessions(sessions) {
  return sessions.map((s) => {
    const start = new Date(s.scheduledDate).getTime();
    const end = start + (s.duration || 60) * 60 * 1000;
    return { start, end };
  });
}

function filterSlotsAgainstBusy(slots, busyIntervals) {
  if (!busyIntervals.length) return slots;
  return slots.filter((slot) => {
    const s = slot.start.getTime();
    const e = slot.end.getTime();
    for (const busy of busyIntervals) {
      if (e > busy.start && s < busy.end) {
        return false; // overlap
      }
    }
    return true;
  });
}

async function getUserBusySessions(userId, start, end) {
  // Fetch sessions overlapping the window
  const windowStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
  const windowEnd = new Date(end.getTime() + 24 * 60 * 60 * 1000);

  const sessions = await Session.find({
    status: 'scheduled',
    $or: [{ teacher: userId }, { learner: userId }],
    scheduledDate: { $gte: windowStart, $lte: windowEnd },
  });
  return sessions;
}

async function computeBookableSlots(userId, start, end, durationMin, stepMin = null) {
  const avDoc = await getUserAvailabilityDoc(userId);
  const step = stepMin || durationMin; // default: slots match duration

  // Build availability intervals per day in range
  const allIntervals = [];
  const current = new Date(start);
  current.setUTCHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setUTCHours(0, 0, 0, 0);

  for (
    let d = new Date(current);
    d.getTime() <= endDay.getTime();
    d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
  ) {
    let intervals = buildDailyBaseIntervalsForDate(avDoc, d);
    intervals = applyExceptionsForDate(avDoc, d, intervals);
    allIntervals.push(...intervals);
  }

  const merged = mergeIntervals(allIntervals);
  let slots = generateSlotsFromIntervals(merged, durationMin, step);

  // Filter to within requested window
  slots = slots.filter((s) => s.start >= start && s.end <= end);

  // Busy from sessions
  const sessions = await getUserBusySessions(userId, start, end);
  const busyIntervals = intervalsFromSessions(sessions);

  const freeSlots = filterSlotsAgainstBusy(slots, busyIntervals);
  return freeSlots;
}

async function isSlotAvailable(userId, startDate, durationMin) {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  const slots = await computeBookableSlots(userId, start, end, durationMin, durationMin);
  // Check if an exact slot starting at start exists
  return slots.some((s) => s.start.getTime() === start.getTime());
}

module.exports = {
  toMinutes,
  fromMinutes,
  computeBookableSlots,
  isSlotAvailable,
};
