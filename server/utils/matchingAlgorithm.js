/**
 * Skill matching algorithm
 * Calculates compatibility score between two users based on their skills and preferences
 */

const calculateMatchScore = (user1, user2) => {
  let score = 0;
  let maxScore = 0;

  // 1. Skill Compatibility (40 points)
  const skillMatch = calculateSkillMatch(user1, user2);
  score += skillMatch.score;
  maxScore += 40;

  // 2. Rating Score (20 points)
  const ratingScore = calculateRatingScore(user2);
  score += ratingScore;
  maxScore += 20;

  // 3. Location Proximity (15 points)
  const locationScore = calculateLocationScore(user1, user2);
  score += locationScore;
  maxScore += 15;

  // 4. Availability Overlap (15 points)
  const availabilityScore = calculateAvailabilityScore(user1, user2);
  score += availabilityScore;
  maxScore += 15;

  // 5. Activity Score (10 points)
  const activityScore = calculateActivityScore(user2);
  score += activityScore;
  maxScore += 10;

  return {
    totalScore: score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    breakdown: {
      skillMatch: skillMatch.score,
      rating: ratingScore,
      location: locationScore,
      availability: availabilityScore,
      activity: activityScore,
    },
  };
};

const calculateSkillMatch = (user1, user2) => {
  let score = 0;
  let matches = [];

  // Check if user1 wants to learn what user2 offers
  user1.skillsDesired.forEach((desired) => {
    const offered = user2.skillsOffered.find(
      (skill) => skill.name.toLowerCase() === desired.name.toLowerCase()
    );

    if (offered) {
      // Base match: 20 points
      let matchScore = 20;

      // Level compatibility bonus (max 10 points)
      const levelBonus = calculateLevelBonus(desired.level, offered.level);
      matchScore += levelBonus;

      score += matchScore;
      matches.push({
        skill: desired.name,
        user1Wants: desired.level,
        user2Offers: offered.level,
        score: matchScore,
      });
    }
  });

  // Check reverse: if user2 wants to learn what user1 offers (mutual benefit)
  user2.skillsDesired.forEach((desired) => {
    const offered = user1.skillsOffered.find(
      (skill) => skill.name.toLowerCase() === desired.name.toLowerCase()
    );

    if (offered) {
      // Mutual benefit bonus: 10 points
      score += 10;
    }
  });

  return {
    score: Math.min(score, 40), // Cap at 40 points
    matches,
  };
};

const calculateLevelBonus = (desiredLevel, offeredLevel) => {
  const levels = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  };

  const desired = levels[desiredLevel] || 1;
  const offered = levels[offeredLevel] || 1;

  // Perfect match or teacher is more advanced
  if (offered >= desired) {
    return 10;
  }

  // Teacher is slightly less advanced
  if (offered === desired - 1) {
    return 5;
  }

  return 0;
};

const calculateRatingScore = (user) => {
  if (user.rating.count === 0) {
    return 10; // Neutral score for new users
  }

  // Scale rating (0-5) to score (0-20)
  return (user.rating.average / 5) * 20;
};

const calculateLocationScore = (user1, user2) => {
  // If no location data, return neutral score
  if (
    !user1.location?.coordinates ||
    !user2.location?.coordinates
  ) {
    return 7.5; // Neutral score
  }

  const distance = calculateDistance(
    user1.location.coordinates.lat,
    user1.location.coordinates.lng,
    user2.location.coordinates.lat,
    user2.location.coordinates.lng
  );

  // Score based on distance (in km)
  if (distance < 10) return 15;
  if (distance < 50) return 12;
  if (distance < 100) return 9;
  if (distance < 500) return 6;
  return 3;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

const calculateAvailabilityScore = (user1, user2) => {
  if (!user1.availability?.length || !user2.availability?.length) {
    return 7.5; // Neutral score
  }

  let overlappingSlots = 0;
  let totalSlots = 0;

  user1.availability.forEach((day1) => {
    const day2 = user2.availability.find((d) => d.day === day1.day);
    if (day2) {
      day1.slots.forEach((slot1) => {
        day2.slots.forEach((slot2) => {
          if (slotsOverlap(slot1, slot2)) {
            overlappingSlots++;
          }
        });
      });
    }
    totalSlots += day1.slots.length;
  });

  if (totalSlots === 0) return 7.5;

  const overlapRatio = overlappingSlots / totalSlots;
  return overlapRatio * 15;
};

const slotsOverlap = (slot1, slot2) => {
  const start1 = timeToMinutes(slot1.start);
  const end1 = timeToMinutes(slot1.end);
  const start2 = timeToMinutes(slot2.start);
  const end2 = timeToMinutes(slot2.end);

  return start1 < end2 && start2 < end1;
};

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const calculateActivityScore = (user) => {
  if (!user.lastActive) return 5;

  const daysSinceActive = Math.floor(
    (Date.now() - new Date(user.lastActive)) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceActive < 1) return 10;
  if (daysSinceActive < 7) return 8;
  if (daysSinceActive < 30) return 6;
  if (daysSinceActive < 90) return 4;
  return 2;
};

const findMatches = async (User, userId, filters = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get all potential matches
    let query = { _id: { $ne: userId }, isActive: true };

    // Apply filters
    if (filters.skillName) {
      query['skillsOffered.name'] = new RegExp(filters.skillName, 'i');
    }

    if (filters.location) {
      query['location.city'] = new RegExp(filters.location, 'i');
    }

    const potentialMatches = await User.find(query);

    // Calculate match scores
    const matches = potentialMatches
      .map((match) => ({
        user: match,
        matchScore: calculateMatchScore(user, match),
      }))
      .filter((match) => match.matchScore.percentage >= 30) // Minimum 30% match
      .sort((a, b) => b.matchScore.percentage - a.matchScore.percentage);

    return matches;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  calculateMatchScore,
  findMatches,
};
