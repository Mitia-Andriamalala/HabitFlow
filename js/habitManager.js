/**
 * HABITMANAGER.JS - Gestionnaire des habitudes
 */

const HabitManager = {
  // Liste des habitudes
  habits: [],

  // Listeners pour les changements
  listeners: [],

  /**
   * Initialise le gestionnaire
   */
  init() {
    this.loadHabits();
  },

  /**
   * Charge les habitudes depuis le storage
   */
  loadHabits() {
    this.habits = Storage.loadHabits();
    this.notifyListeners('load');
  },

  /**
   * Sauvegarde les habitudes dans le storage
   */
  saveHabits() {
    const success = Storage.saveHabits(this.habits);
    if (success) {
      this.notifyListeners('save');
    }
    return success;
  },

  /**
   * Ajoute une nouvelle habitude
   * @param {Object} habitData
   * @returns {Habit|null}
   */
  addHabit(habitData) {
    // Valide les données
    const validation = Habit.validate(habitData);
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return null;
    }

    // Crée la nouvelle habitude
    const habit = new Habit(habitData);
    this.habits.push(habit);

    // Sauvegarde
    this.saveHabits();
    this.notifyListeners('add', habit);

    return habit;
  },

  /**
   * Met à jour une habitude existante
   * @param {string} habitId
   * @param {Object} updates
   * @returns {Habit|null}
   */
  updateHabit(habitId, updates) {
    const habit = this.getHabitById(habitId);
    if (!habit) {
      console.error('Habit not found:', habitId);
      return null;
    }

    // Valide les données mises à jour
    const updatedData = { ...habit.toJSON(), ...updates };
    const validation = Habit.validate(updatedData);
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return null;
    }

    // Applique les mises à jour
    Object.assign(habit, updates);

    // Sauvegarde
    this.saveHabits();
    this.notifyListeners('update', habit);

    return habit;
  },

  /**
   * Supprime une habitude
   * @param {string} habitId
   * @returns {boolean}
   */
  deleteHabit(habitId) {
    const index = this.habits.findIndex(h => h.id === habitId);
    if (index === -1) {
      console.error('Habit not found:', habitId);
      return false;
    }

    const habit = this.habits[index];
    this.habits.splice(index, 1);

    // Sauvegarde
    this.saveHabits();
    this.notifyListeners('delete', habit);

    return true;
  },

  /**
   * Archive une habitude
   * @param {string} habitId
   * @returns {boolean}
   */
  archiveHabit(habitId) {
    const habit = this.getHabitById(habitId);
    if (!habit) return false;

    habit.archive();
    this.saveHabits();
    this.notifyListeners('archive', habit);

    return true;
  },

  /**
   * Désarchive une habitude
   * @param {string} habitId
   * @returns {boolean}
   */
  unarchiveHabit(habitId) {
    const habit = this.getHabitById(habitId);
    if (!habit) return false;

    habit.unarchive();
    this.saveHabits();
    this.notifyListeners('unarchive', habit);

    return true;
  },

  /**
   * Toggle la complétion d'une habitude pour une date
   * @param {string} habitId
   * @param {Date|string} date
   * @returns {boolean}
   */
  toggleHabitCompletion(habitId, date = new Date()) {
    const habit = this.getHabitById(habitId);
    if (!habit) return false;

    const isCompleted = habit.toggle(date);
    this.saveHabits();
    this.notifyListeners('toggle', { habit, date, isCompleted });

    return isCompleted;
  },

  /**
   * Marque une habitude comme complétée
   * @param {string} habitId
   * @param {Date|string} date
   * @returns {boolean}
   */
  completeHabit(habitId, date = new Date()) {
    const habit = this.getHabitById(habitId);
    if (!habit) return false;

    habit.complete(date);
    this.saveHabits();
    this.notifyListeners('complete', { habit, date });

    return true;
  },

  /**
   * Démarque une habitude
   * @param {string} habitId
   * @param {Date|string} date
   * @returns {boolean}
   */
  uncompleteHabit(habitId, date = new Date()) {
    const habit = this.getHabitById(habitId);
    if (!habit) return false;

    habit.uncomplete(date);
    this.saveHabits();
    this.notifyListeners('uncomplete', { habit, date });

    return true;
  },

  /**
   * Obtient une habitude par son ID
   * @param {string} habitId
   * @returns {Habit|null}
   */
  getHabitById(habitId) {
    return this.habits.find(h => h.id === habitId) || null;
  },

  /**
   * Obtient toutes les habitudes actives (non archivées)
   * @returns {Habit[]}
   */
  getActiveHabits() {
    return this.habits.filter(h => !h.archived);
  },

  /**
   * Obtient toutes les habitudes archivées
   * @returns {Habit[]}
   */
  getArchivedHabits() {
    return this.habits.filter(h => h.archived);
  },

  /**
   * Obtient les habitudes actives pour une date donnée
   * @param {Date} date
   * @returns {Habit[]}
   */
  getHabitsForDate(date = new Date()) {
    return this.getActiveHabits().filter(h => h.isActiveOn(date));
  },

  /**
   * Obtient les habitudes actives pour aujourd'hui
   * @returns {Habit[]}
   */
  getTodayHabits() {
    return this.getHabitsForDate(new Date());
  },

  /**
   * Obtient le nombre d'habitudes complétées pour une date
   * @param {Date} date
   * @returns {number}
   */
  getCompletedCount(date = new Date()) {
    return this.getHabitsForDate(date).filter(h => h.isCompletedOn(date)).length;
  },

  /**
   * Obtient le nombre total d'habitudes actives pour une date
   * @param {Date} date
   * @returns {number}
   */
  getTotalCount(date = new Date()) {
    return this.getHabitsForDate(date).length;
  },

  /**
   * Obtient le pourcentage de complétion pour une date
   * @param {Date} date
   * @returns {number}
   */
  getCompletionPercentage(date = new Date()) {
    const total = this.getTotalCount(date);
    if (total === 0) return 0;

    const completed = this.getCompletedCount(date);
    return Math.round((completed / total) * 100);
  },

  /**
   * Obtient les habitudes avec streak en danger
   * @returns {Habit[]}
   */
  getHabitsInDanger() {
    return this.getActiveHabits().filter(h => h.isStreakInDanger());
  },

  /**
   * Obtient les habitudes par niveau de streak
   * @param {string} level - 'bronze', 'silver', 'gold', 'platinum'
   * @returns {Habit[]}
   */
  getHabitsByStreakLevel(level) {
    return this.getActiveHabits().filter(h => h.getStreakLevel() === level);
  },

  /**
   * Trie les habitudes
   * @param {string} sortBy - 'name', 'created', 'streak', 'completion'
   * @param {string} order - 'asc' ou 'desc'
   * @returns {Habit[]}
   */
  sortHabits(sortBy = 'created', order = 'asc') {
    const sorted = [...this.getActiveHabits()];

    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'created':
          compareValue = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'streak':
          compareValue = a.getCurrentStreak() - b.getCurrentStreak();
          break;
        case 'completion':
          compareValue = a.getSuccessRate() - b.getSuccessRate();
          break;
        default:
          compareValue = 0;
      }

      return order === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  },

  /**
   * Recherche des habitudes par nom
   * @param {string} query
   * @returns {Habit[]}
   */
  searchHabits(query) {
    const lowerQuery = query.toLowerCase().trim();
    return this.getActiveHabits().filter(h =>
      h.name.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Obtient les statistiques globales
   * @returns {Object}
   */
  getGlobalStats() {
    const activeHabits = this.getActiveHabits();
    const totalHabits = activeHabits.length;

    if (totalHabits === 0) {
      return {
        totalHabits: 0,
        totalCompletions: 0,
        averageSuccessRate: 0,
        bestStreak: 0,
        currentStreak: 0,
        todayCompletionRate: 0
      };
    }

    const totalCompletions = activeHabits.reduce((sum, h) => sum + h.getTotalCompletions(), 0);
    const averageSuccessRate = Math.round(
      activeHabits.reduce((sum, h) => sum + h.getSuccessRate(), 0) / totalHabits
    );
    const bestStreak = Math.max(...activeHabits.map(h => h.getBestStreak()));
    const currentStreak = Math.max(...activeHabits.map(h => h.getCurrentStreak()));
    const todayCompletionRate = this.getCompletionPercentage(new Date());

    return {
      totalHabits,
      totalCompletions,
      averageSuccessRate,
      bestStreak,
      currentStreak,
      todayCompletionRate
    };
  },

  /**
   * Obtient l'habitude la plus régulière
   * @returns {Habit|null}
   */
  getMostConsistentHabit() {
    const activeHabits = this.getActiveHabits();
    if (activeHabits.length === 0) return null;

    return activeHabits.reduce((best, current) =>
      current.getSuccessRate() > best.getSuccessRate() ? current : best
    );
  },

  /**
   * Obtient les données de heatmap pour l'année
   * @param {number} year
   * @returns {Object} - { date: count }
   */
  getYearHeatmapData(year = new Date().getFullYear()) {
    const heatmapData = {};
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Pour chaque jour de l'année
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = Utils.formatDate(d);
      const habitsForDay = this.getHabitsForDate(d);
      const completedCount = habitsForDay.filter(h => h.isCompletedOn(d)).length;

      heatmapData[dateStr] = completedCount;
    }

    return heatmapData;
  },

  /**
   * Ajoute un listener pour les changements
   * @param {Function} callback
   */
  addListener(callback) {
    this.listeners.push(callback);
  },

  /**
   * Retire un listener
   * @param {Function} callback
   */
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  },

  /**
   * Notifie tous les listeners
   * @param {string} event
   * @param {*} data
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  },

  /**
   * Exporte les données
   * @returns {Object}
   */
  exportData() {
    return Storage.exportData();
  },

  /**
   * Importe des données
   * @param {Object} data
   * @returns {Object}
   */
  importData(data) {
    const result = Storage.importData(data);
    if (result.success) {
      this.loadHabits();
    }
    return result;
  },

  /**
   * Réinitialise toutes les données
   * @returns {boolean}
   */
  reset() {
    const success = Storage.reset();
    if (success) {
      this.loadHabits();
      this.notifyListeners('reset');
    }
    return success;
  }
};

// Initialise au chargement
if (typeof window !== 'undefined') {
  HabitManager.init();
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HabitManager;
}
