/**
 * HABIT.JS - Classe Habit
 */

class Habit {
  /**
   * Constructeur de l'habitude
   * @param {Object} data - Données de l'habitude
   */
  constructor(data = {}) {
    this.id = data.id || Utils.generateId();
    this.name = data.name || '';
    this.icon = data.icon || '⭐';
    this.color = data.color || '#3498db';
    this.frequency = data.frequency || 'daily'; // 'daily' ou array de jours ['lundi', 'mardi']
    this.reminderTime = data.reminderTime || null; // Format "HH:MM" ou null
    this.createdAt = data.createdAt || new Date().toISOString();
    this.archived = data.archived || false;
    this.completions = data.completions || {}; // { "2025-10-26": true }
  }

  /**
   * Marque l'habitude comme complétée pour une date donnée
   * @param {Date|string} date - Date à marquer (par défaut aujourd'hui)
   */
  complete(date = new Date()) {
    const dateStr = typeof date === 'string' ? date : Utils.formatDate(date);
    this.completions[dateStr] = true;
  }

  /**
   * Démarque l'habitude pour une date donnée
   * @param {Date|string} date - Date à démarquer
   */
  uncomplete(date = new Date()) {
    const dateStr = typeof date === 'string' ? date : Utils.formatDate(date);
    delete this.completions[dateStr];
  }

  /**
   * Toggle l'état de completion pour une date
   * @param {Date|string} date
   * @returns {boolean} - Nouvel état
   */
  toggle(date = new Date()) {
    if (this.isCompletedOn(date)) {
      this.uncomplete(date);
      return false;
    } else {
      this.complete(date);
      return true;
    }
  }

  /**
   * Vérifie si l'habitude est complétée pour une date donnée
   * @param {Date|string} date
   * @returns {boolean}
   */
  isCompletedOn(date = new Date()) {
    const dateStr = typeof date === 'string' ? date : Utils.formatDate(date);
    return this.completions[dateStr] === true;
  }

  /**
   * Vérifie si l'habitude est active pour un jour donné
   * @param {Date} date
   * @returns {boolean}
   */
  isActiveOn(date = new Date()) {
    if (this.frequency === 'daily') {
      return true;
    }

    if (Array.isArray(this.frequency)) {
      const dayName = Utils.getDayName(date).toLowerCase();
      return this.frequency.map(d => d.toLowerCase()).includes(dayName);
    }

    return false;
  }

  /**
   * Obtient le streak actuel (nombre de jours consécutifs)
   * @returns {number}
   */
  getCurrentStreak() {
    let streak = 0;
    let currentDate = new Date();

    // Commence par aujourd'hui ou hier si pas complété aujourd'hui
    if (!this.isCompletedOn(currentDate)) {
      currentDate = Utils.addDays(currentDate, -1);
    }

    // Compte les jours consécutifs en remontant
    while (this.isCompletedOn(currentDate)) {
      streak++;
      currentDate = Utils.addDays(currentDate, -1);
    }

    return streak;
  }

  /**
   * Obtient le meilleur streak de tous les temps
   * @returns {number}
   */
  getBestStreak() {
    const dates = Object.keys(this.completions)
      .filter(date => this.completions[date])
      .sort();

    if (dates.length === 0) return 0;

    let bestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = Utils.parseDate(dates[i - 1]);
      const currDate = Utils.parseDate(dates[i]);
      const daysDiff = Utils.daysBetween(prevDate, currDate);

      if (daysDiff === 1) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return bestStreak;
  }

  /**
   * Obtient le taux de réussite sur N jours
   * @param {number} days - Nombre de jours à analyser
   * @returns {number} - Pourcentage (0-100)
   */
  getSuccessRate(days = 30) {
    let completed = 0;
    let total = 0;

    for (let i = 0; i < days; i++) {
      const date = Utils.addDays(new Date(), -i);

      // Ne compte que les jours où l'habitude était active
      if (this.isActiveOn(date)) {
        total++;
        if (this.isCompletedOn(date)) {
          completed++;
        }
      }
    }

    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  /**
   * Obtient le nombre total de complétions
   * @returns {number}
   */
  getTotalCompletions() {
    return Object.values(this.completions).filter(Boolean).length;
  }

  /**
   * Obtient toutes les dates de completion
   * @returns {string[]} - Array de dates au format YYYY-MM-DD
   */
  getCompletionDates() {
    return Object.keys(this.completions)
      .filter(date => this.completions[date])
      .sort();
  }

  /**
   * Obtient les stats pour un mois donné
   * @param {Date} date - Date du mois
   * @returns {Object}
   */
  getMonthStats(date = new Date()) {
    const days = Utils.getDaysInMonth(date);
    let completed = 0;
    let active = 0;

    days.forEach(day => {
      if (this.isActiveOn(day)) {
        active++;
        if (this.isCompletedOn(day)) {
          completed++;
        }
      }
    });

    return {
      completed,
      active,
      total: days.length,
      percentage: active > 0 ? Math.round((completed / active) * 100) : 0
    };
  }

  /**
   * Vérifie si le streak est en danger (habitude pas complétée aujourd'hui)
   * @returns {boolean}
   */
  isStreakInDanger() {
    const currentStreak = this.getCurrentStreak();
    const completedToday = this.isCompletedOn(new Date());
    return currentStreak >= 3 && !completedToday && this.isActiveOn(new Date());
  }

  /**
   * Obtient la dernière date de completion
   * @returns {string|null}
   */
  getLastCompletionDate() {
    const dates = this.getCompletionDates();
    return dates.length > 0 ? dates[dates.length - 1] : null;
  }

  /**
   * Vérifie si c'est un record de streak
   * @returns {boolean}
   */
  isRecordStreak() {
    return this.getCurrentStreak() === this.getBestStreak() && this.getCurrentStreak() > 0;
  }

  /**
   * Obtient le niveau de streak (pour les couleurs/badges)
   * @returns {string} - 'none', 'bronze', 'silver', 'gold', 'platinum'
   */
  getStreakLevel() {
    const streak = this.getCurrentStreak();
    if (streak === 0) return 'none';
    if (streak < 7) return 'bronze';
    if (streak < 30) return 'silver';
    if (streak < 100) return 'gold';
    return 'platinum';
  }

  /**
   * Obtient la classe CSS pour le streak
   * @returns {string}
   */
  getStreakClass() {
    const streak = this.getCurrentStreak();
    if (streak >= 100) return 'streak-100';
    if (streak >= 30) return 'streak-30';
    if (streak >= 7) return 'streak-7';
    if (streak >= 3) return 'streak-3';
    return '';
  }

  /**
   * Archive l'habitude
   */
  archive() {
    this.archived = true;
  }

  /**
   * Désarchive l'habitude
   */
  unarchive() {
    this.archived = false;
  }

  /**
   * Clone l'habitude
   * @returns {Habit}
   */
  clone() {
    return new Habit(Utils.deepClone(this.toJSON()));
  }

  /**
   * Réinitialise toutes les complétions
   */
  resetCompletions() {
    this.completions = {};
  }

  /**
   * Exporte l'habitude en JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      color: this.color,
      frequency: this.frequency,
      reminderTime: this.reminderTime,
      createdAt: this.createdAt,
      archived: this.archived,
      completions: this.completions
    };
  }

  /**
   * Crée une habitude depuis JSON
   * @param {Object} json
   * @returns {Habit}
   */
  static fromJSON(json) {
    return new Habit(json);
  }

  /**
   * Valide les données d'une habitude
   * @param {Object} data
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Le nom de l\'habitude est obligatoire');
    }

    if (data.name && data.name.length > 50) {
      errors.push('Le nom ne peut pas dépasser 50 caractères');
    }

    if (data.icon && data.icon.length > 5) {
      errors.push('L\'icône n\'est pas valide');
    }

    if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
      errors.push('La couleur n\'est pas valide');
    }

    if (data.frequency && data.frequency !== 'daily' && !Array.isArray(data.frequency)) {
      errors.push('La fréquence n\'est pas valide');
    }

    if (data.reminderTime && !/^\d{2}:\d{2}$/.test(data.reminderTime)) {
      errors.push('L\'heure de rappel n\'est pas valide');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtient un message motivationnel basé sur le streak
   * @returns {string}
   */
  getMotivationalMessage() {
    const streak = this.getCurrentStreak();
    const level = this.getStreakLevel();

    const messages = {
      none: [
        'Commencez dès maintenant !',
        'Le premier pas est le plus important',
        'Aujourd\'hui est le jour parfait pour commencer'
      ],
      bronze: [
        `${streak} jours ! Vous êtes sur la bonne voie !`,
        'Continuez comme ça !',
        'Chaque jour compte !'
      ],
      silver: [
        `Impressionnant ! ${streak} jours consécutifs !`,
        'Vous formez de bonnes habitudes !',
        'Ne vous arrêtez pas maintenant !'
      ],
      gold: [
        `Incroyable ! ${streak} jours de suite !`,
        'Vous êtes une machine !',
        'Cette habitude fait partie de vous maintenant !'
      ],
      platinum: [
        `LÉGENDAIRE ! ${streak} jours ! 🏆`,
        'Vous êtes un champion absolu !',
        'Rien ne peut vous arrêter maintenant !'
      ]
    };

    return Utils.randomChoice(messages[level]);
  }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Habit;
}
