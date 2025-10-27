/**
 * STORAGE.JS - Gestion du stockage LocalStorage
 */

const Storage = {
  // Clés de stockage
  KEYS: {
    HABITS: 'habitflow_habits',
    SETTINGS: 'habitflow_settings',
    VERSION: 'habitflow_version'
  },

  // Version actuelle des données
  CURRENT_VERSION: '1.0.0',

  /**
   * Initialise le storage
   */
  init() {
    // Vérifie si c'est la première utilisation
    if (!this.get(this.KEYS.VERSION)) {
      this.set(this.KEYS.VERSION, this.CURRENT_VERSION);
      this.initDefaults();
    }

    // Vérifie et migre les données si nécessaire
    this.checkAndMigrate();
  },

  /**
   * Initialise les valeurs par défaut
   */
  initDefaults() {
    if (!this.get(this.KEYS.HABITS)) {
      this.set(this.KEYS.HABITS, []);
    }

    if (!this.get(this.KEYS.SETTINGS)) {
      this.set(this.KEYS.SETTINGS, this.getDefaultSettings());
    }
  },

  /**
   * Obtient les paramètres par défaut
   * @returns {Object}
   */
  getDefaultSettings() {
    return {
      theme: 'auto',
      notifications: true,
      sounds: true,
      dailyReminderTime: '20:00',
      weekStartsOn: 'monday',
      language: 'fr',
      firstLaunch: true
    };
  },

  /**
   * Sauvegarde une valeur dans le localStorage
   * @param {string} key
   * @param {*} value
   * @returns {boolean}
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Storage.set error:', error);

      // Vérifie si le quota est dépassé
      if (error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded();
      }

      return false;
    }
  },

  /**
   * Récupère une valeur du localStorage
   * @param {string} key
   * @param {*} defaultValue
   * @returns {*}
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage.get error:', error);
      return defaultValue;
    }
  },

  /**
   * Supprime une clé du localStorage
   * @param {string} key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage.remove error:', error);
      return false;
    }
  },

  /**
   * Vide tout le localStorage de l'app
   */
  clear() {
    try {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Storage.clear error:', error);
      return false;
    }
  },

  /**
   * Sauvegarde toutes les habitudes
   * @param {Habit[]} habits
   * @returns {boolean}
   */
  saveHabits(habits) {
    const habitsData = habits.map(habit => habit.toJSON());
    return this.set(this.KEYS.HABITS, habitsData);
  },

  /**
   * Charge toutes les habitudes
   * @returns {Habit[]}
   */
  loadHabits() {
    const habitsData = this.get(this.KEYS.HABITS, []);
    return habitsData.map(data => Habit.fromJSON(data));
  },

  /**
   * Sauvegarde les paramètres
   * @param {Object} settings
   * @returns {boolean}
   */
  saveSettings(settings) {
    return this.set(this.KEYS.SETTINGS, settings);
  },

  /**
   * Charge les paramètres
   * @returns {Object}
   */
  loadSettings() {
    return this.get(this.KEYS.SETTINGS, this.getDefaultSettings());
  },

  /**
   * Met à jour un paramètre spécifique
   * @param {string} key
   * @param {*} value
   * @returns {boolean}
   */
  updateSetting(key, value) {
    const settings = this.loadSettings();
    settings[key] = value;
    return this.saveSettings(settings);
  },

  /**
   * Exporte toutes les données
   * @returns {Object}
   */
  exportData() {
    return {
      version: this.get(this.KEYS.VERSION),
      habits: this.get(this.KEYS.HABITS, []),
      settings: this.get(this.KEYS.SETTINGS, this.getDefaultSettings()),
      exportedAt: new Date().toISOString()
    };
  },

  /**
   * Importe des données
   * @param {Object} data
   * @returns {Object} - { success: boolean, message: string }
   */
  importData(data) {
    try {
      // Valide les données
      if (!data || typeof data !== 'object') {
        return {
          success: false,
          message: 'Données invalides'
        };
      }

      // Valide la version
      if (data.version && data.version !== this.CURRENT_VERSION) {
        console.warn('Version différente détectée, tentative de migration...');
      }

      // Sauvegarde les anciennes données (backup)
      const backup = this.exportData();

      try {
        // Importe les nouvelles données
        if (data.habits) {
          this.set(this.KEYS.HABITS, data.habits);
        }

        if (data.settings) {
          this.set(this.KEYS.SETTINGS, {
            ...this.getDefaultSettings(),
            ...data.settings
          });
        }

        return {
          success: true,
          message: 'Données importées avec succès'
        };
      } catch (error) {
        // Restaure le backup en cas d'erreur
        this.set(this.KEYS.HABITS, backup.habits);
        this.set(this.KEYS.SETTINGS, backup.settings);
        throw error;
      }
    } catch (error) {
      console.error('Storage.importData error:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'import: ' + error.message
      };
    }
  },

  /**
   * Réinitialise toutes les données
   * @returns {boolean}
   */
  reset() {
    try {
      this.clear();
      this.initDefaults();
      return true;
    } catch (error) {
      console.error('Storage.reset error:', error);
      return false;
    }
  },

  /**
   * Obtient des statistiques sur le stockage
   * @returns {Object}
   */
  getStorageStats() {
    const info = Utils.getStorageInfo();
    const habitsCount = this.loadHabits().length;
    const habitsSize = JSON.stringify(this.get(this.KEYS.HABITS, [])).length;

    return {
      ...info,
      habitsCount,
      habitsSizeMB: (habitsSize / (1024 * 1024)).toFixed(2)
    };
  },

  /**
   * Vérifie si le stockage est disponible
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Gère le quota dépassé
   */
  handleQuotaExceeded() {
    console.warn('LocalStorage quota exceeded!');

    // Émet un événement personnalisé
    window.dispatchEvent(new CustomEvent('storage-quota-exceeded', {
      detail: this.getStorageStats()
    }));
  },

  /**
   * Vérifie et migre les données si nécessaire
   */
  checkAndMigrate() {
    const currentVersion = this.get(this.KEYS.VERSION);

    if (currentVersion !== this.CURRENT_VERSION) {
      this.migrateData(currentVersion, this.CURRENT_VERSION);
      this.set(this.KEYS.VERSION, this.CURRENT_VERSION);
    }
  },

  /**
   * Migre les données d'une version à une autre
   * @param {string} fromVersion
   * @param {string} toVersion
   */
  migrateData(fromVersion, toVersion) {
    console.log(`Migrating data from ${fromVersion} to ${toVersion}`);

    // Ici, on pourrait ajouter des migrations spécifiques
    // par version si nécessaire dans le futur

    // Pour l'instant, on s'assure juste que les paramètres
    // ont toutes les nouvelles clés
    const settings = this.loadSettings();
    const defaultSettings = this.getDefaultSettings();

    const mergedSettings = {
      ...defaultSettings,
      ...settings
    };

    this.saveSettings(mergedSettings);
  },

  /**
   * Crée un backup automatique
   * @returns {string|null} - Backup data en JSON
   */
  createBackup() {
    try {
      const data = this.exportData();
      return JSON.stringify(data);
    } catch (error) {
      console.error('Storage.createBackup error:', error);
      return null;
    }
  },

  /**
   * Restaure depuis un backup
   * @param {string} backupString
   * @returns {boolean}
   */
  restoreBackup(backupString) {
    try {
      const data = JSON.parse(backupString);
      const result = this.importData(data);
      return result.success;
    } catch (error) {
      console.error('Storage.restoreBackup error:', error);
      return false;
    }
  },

  /**
   * Nettoie les anciennes données (si nécessaire)
   * @param {number} daysToKeep - Nombre de jours à conserver
   */
  cleanOldData(daysToKeep = 365) {
    try {
      const habits = this.loadHabits();
      const cutoffDate = Utils.addDays(new Date(), -daysToKeep);
      const cutoffStr = Utils.formatDate(cutoffDate);

      habits.forEach(habit => {
        // Supprime les complétions plus anciennes que la limite
        Object.keys(habit.completions).forEach(dateStr => {
          if (dateStr < cutoffStr) {
            delete habit.completions[dateStr];
          }
        });
      });

      this.saveHabits(habits);
      return true;
    } catch (error) {
      console.error('Storage.cleanOldData error:', error);
      return false;
    }
  },

  /**
   * Écoute les changements de storage (pour sync entre onglets)
   */
  onStorageChange(callback) {
    window.addEventListener('storage', (event) => {
      if (Object.values(this.KEYS).includes(event.key)) {
        callback({
          key: event.key,
          oldValue: event.oldValue ? JSON.parse(event.oldValue) : null,
          newValue: event.newValue ? JSON.parse(event.newValue) : null
        });
      }
    });
  }
};

// Initialise le storage au chargement
if (typeof window !== 'undefined') {
  Storage.init();
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
