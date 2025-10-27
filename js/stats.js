/**
 * STATS.JS - Calculs statistiques
 */

const Stats = {
  /**
   * Obtient les statistiques globales
   * @returns {Object}
   */
  getGlobalStats() {
    return HabitManager.getGlobalStats();
  },

  /**
   * Obtient les statistiques pour une habitude
   * @param {string} habitId
   * @returns {Object|null}
   */
  getHabitStats(habitId) {
    const habit = HabitManager.getHabitById(habitId);
    if (!habit) return null;

    return {
      id: habit.id,
      name: habit.name,
      currentStreak: habit.getCurrentStreak(),
      bestStreak: habit.getBestStreak(),
      successRate: habit.getSuccessRate(),
      successRate7Days: habit.getSuccessRate(7),
      successRate30Days: habit.getSuccessRate(30),
      totalCompletions: habit.getTotalCompletions(),
      lastCompletion: habit.getLastCompletionDate(),
      isRecordStreak: habit.isRecordStreak(),
      streakLevel: habit.getStreakLevel(),
      isInDanger: habit.isStreakInDanger()
    };
  },

  /**
   * Obtient les statistiques du mois en cours
   * @returns {Object}
   */
  getCurrentMonthStats() {
    const now = new Date();
    return this.getMonthStats(now.getFullYear(), now.getMonth());
  },

  /**
   * Obtient les statistiques pour un mois donné
   * @param {number} year
   * @param {number} month (0-11)
   * @returns {Object}
   */
  getMonthStats(year, month) {
    const date = new Date(year, month, 1);
    const days = Utils.getDaysInMonth(date);

    let totalActiveDays = 0;
    let totalCompletedDays = 0;
    let perfectDays = 0; // Tous les jours où 100% des habitudes sont faites

    days.forEach(day => {
      const habitsForDay = HabitManager.getHabitsForDate(day);
      if (habitsForDay.length > 0) {
        totalActiveDays++;

        const completedCount = habitsForDay.filter(h => h.isCompletedOn(day)).length;
        if (completedCount > 0) {
          totalCompletedDays++;
        }

        if (completedCount === habitsForDay.length) {
          perfectDays++;
        }
      }
    });

    return {
      year,
      month,
      totalDays: days.length,
      totalActiveDays,
      totalCompletedDays,
      perfectDays,
      completionRate: totalActiveDays > 0
        ? Math.round((totalCompletedDays / totalActiveDays) * 100)
        : 0,
      perfectDayRate: totalActiveDays > 0
        ? Math.round((perfectDays / totalActiveDays) * 100)
        : 0
    };
  },

  /**
   * Obtient les données pour un graphique de progression sur N jours
   * @param {number} days
   * @returns {Array}
   */
  getProgressChartData(days = 30) {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = Utils.addDays(now, -i);
      const dateStr = Utils.formatDate(date);
      const habitsForDay = HabitManager.getHabitsForDate(date);
      const total = habitsForDay.length;
      const completed = habitsForDay.filter(h => h.isCompletedOn(date)).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      data.push({
        date: dateStr,
        dateObj: new Date(date),
        total,
        completed,
        percentage
      });
    }

    return data;
  },

  /**
   * Obtient les données pour un graphique hebdomadaire
   * @returns {Array}
   */
  getWeeklyChartData() {
    const data = [];
    const now = new Date();
    const dayOfWeek = now.getDay();

    // Obtient le lundi de cette semaine
    const monday = Utils.addDays(now, -(dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    for (let i = 0; i < 7; i++) {
      const date = Utils.addDays(monday, i);
      const dateStr = Utils.formatDate(date);
      const dayName = Utils.getDayName(date, 'fr-FR');
      const habitsForDay = HabitManager.getHabitsForDate(date);
      const total = habitsForDay.length;
      const completed = habitsForDay.filter(h => h.isCompletedOn(date)).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      data.push({
        date: dateStr,
        dateObj: new Date(date),
        dayName: Utils.capitalize(dayName.substring(0, 3)),
        total,
        completed,
        percentage
      });
    }

    return data;
  },

  /**
   * Obtient les données de heatmap pour l'année
   * @param {number} year
   * @returns {Object}
   */
  getHeatmapData(year = new Date().getFullYear()) {
    return HabitManager.getYearHeatmapData(year);
  },

  /**
   * Obtient le niveau d'intensité pour la heatmap (0-4)
   * @param {number} count
   * @param {number} maxCount
   * @returns {number}
   */
  getHeatmapLevel(count, maxCount) {
    if (count === 0) return 0;
    if (maxCount === 0) return 0;

    const percentage = (count / maxCount) * 100;

    if (percentage < 25) return 1;
    if (percentage < 50) return 2;
    if (percentage < 75) return 3;
    return 4;
  },

  /**
   * Obtient les habitudes les mieux notées
   * @param {number} limit
   * @returns {Array}
   */
  getTopHabits(limit = 5) {
    const habits = HabitManager.getActiveHabits();
    return habits
      .map(habit => ({
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        successRate: habit.getSuccessRate(),
        currentStreak: habit.getCurrentStreak(),
        totalCompletions: habit.getTotalCompletions()
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, limit);
  },

  /**
   * Obtient les meilleurs streaks
   * @param {number} limit
   * @returns {Array}
   */
  getTopStreaks(limit = 5) {
    const habits = HabitManager.getActiveHabits();
    return habits
      .map(habit => ({
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        currentStreak: habit.getCurrentStreak(),
        bestStreak: habit.getBestStreak(),
        streakLevel: habit.getStreakLevel()
      }))
      .filter(h => h.currentStreak > 0)
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, limit);
  },

  /**
   * Calcule le score de constance (0-100)
   * @param {string} habitId
   * @param {number} days
   * @returns {number}
   */
  getConsistencyScore(habitId, days = 30) {
    const habit = HabitManager.getHabitById(habitId);
    if (!habit) return 0;

    const successRate = habit.getSuccessRate(days);
    const currentStreak = habit.getCurrentStreak();
    const maxStreak = Math.min(days, 30);

    // 70% basé sur le taux de réussite, 30% sur le streak
    const scoreFromRate = (successRate * 0.7);
    const scoreFromStreak = ((currentStreak / maxStreak) * 100) * 0.3;

    return Math.min(100, Math.round(scoreFromRate + scoreFromStreak));
  },

  /**
   * Obtient les tendances (amélioration ou régression)
   * @param {string} habitId
   * @returns {Object}
   */
  getTrend(habitId) {
    const habit = HabitManager.getHabitById(habitId);
    if (!habit) return null;

    const last7Days = habit.getSuccessRate(7);
    const last30Days = habit.getSuccessRate(30);

    const diff = last7Days - last30Days;

    let trend = 'stable';
    if (diff > 10) trend = 'improving';
    else if (diff < -10) trend = 'declining';

    return {
      last7Days,
      last30Days,
      difference: diff,
      trend
    };
  },

  /**
   * Obtient un résumé des statistiques pour affichage
   * @returns {Object}
   */
  getSummary() {
    const globalStats = this.getGlobalStats();
    const monthStats = this.getCurrentMonthStats();
    const topHabits = this.getTopHabits(3);
    const topStreaks = this.getTopStreaks(3);

    return {
      global: globalStats,
      month: monthStats,
      topHabits,
      topStreaks
    };
  },

  /**
   * Calcule le score de productivité du jour
   * @param {Date} date
   * @returns {Object}
   */
  getDayScore(date = new Date()) {
    const habitsForDay = HabitManager.getHabitsForDate(date);
    const total = habitsForDay.length;
    const completed = habitsForDay.filter(h => h.isCompletedOn(date)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    let grade = 'F';
    let emoji = '😞';

    if (percentage >= 90) {
      grade = 'A+';
      emoji = '🏆';
    } else if (percentage >= 80) {
      grade = 'A';
      emoji = '🌟';
    } else if (percentage >= 70) {
      grade = 'B';
      emoji = '😊';
    } else if (percentage >= 60) {
      grade = 'C';
      emoji = '😐';
    } else if (percentage >= 50) {
      grade = 'D';
      emoji = '😕';
    }

    return {
      date: Utils.formatDate(date),
      total,
      completed,
      percentage,
      grade,
      emoji
    };
  },

  /**
   * Obtient les prévisions/objectifs
   * @param {string} habitId
   * @returns {Object}
   */
  getProjection(habitId) {
    const habit = HabitManager.getHabitById(habitId);
    if (!habit) return null;

    const currentStreak = habit.getCurrentStreak();
    const successRate = habit.getSuccessRate(30);

    // Calcule la probabilité d'atteindre des milestones
    const milestones = [7, 21, 30, 50, 100];
    const nextMilestone = milestones.find(m => m > currentStreak);

    if (!nextMilestone) {
      return {
        currentStreak,
        nextMilestone: null,
        daysToMilestone: 0,
        probability: 100
      };
    }

    const daysToMilestone = nextMilestone - currentStreak;
    const probability = Math.min(100, Math.round(successRate * 0.9));

    return {
      currentStreak,
      nextMilestone,
      daysToMilestone,
      probability,
      estimatedDate: Utils.formatDate(Utils.addDays(new Date(), daysToMilestone))
    };
  },

  /**
   * Exporte les statistiques en CSV
   * @returns {string}
   */
  exportToCSV() {
    const habits = HabitManager.getActiveHabits();
    let csv = 'Habitude,Streak Actuel,Meilleur Streak,Taux de Réussite,Total Complétions\n';

    habits.forEach(habit => {
      csv += `"${habit.name}",${habit.getCurrentStreak()},${habit.getBestStreak()},${habit.getSuccessRate()}%,${habit.getTotalCompletions()}\n`;
    });

    return csv;
  }
};

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Stats;
}
