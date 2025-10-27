/**
 * NOTIFICATIONS.JS - Système de notifications
 */

const Notifications = {
  // Permission state
  permission: 'default',

  // Messages motivationnels
  motivationalQuotes: [
    "Le succès est la somme de petits efforts répétés jour après jour.",
    "Chaque jour est une nouvelle opportunité de s'améliorer.",
    "La discipline est le pont entre les objectifs et l'accomplissement.",
    "Ne comptez pas les jours, faites que les jours comptent.",
    "Les bonnes habitudes sont la clé du succès.",
    "Un voyage de mille lieues commence toujours par un premier pas.",
    "La motivation vous fait démarrer, l'habitude vous fait continuer.",
    "Le seul mauvais entraînement est celui que vous n'avez pas fait.",
    "Soyez plus fort que vos excuses.",
    "Le changement commence à la fin de votre zone de confort.",
    "Votre seule limite, c'est vous.",
    "Transformez vos rêves en objectifs, vos objectifs en habitudes.",
    "Chaque petit progrès compte.",
    "Croyez en vous et en vos capacités.",
    "La constance bat le talent.",
    "Avancez, même si c'est lentement.",
    "Le meilleur moment pour commencer, c'était hier. Le deuxième meilleur, c'est maintenant.",
    "Les champions sont faits d'efforts quotidiens.",
    "Soyez la meilleure version de vous-même.",
    "Le succès n'est pas un accident, c'est un choix quotidien."
  ],

  /**
   * Initialise le système de notifications
   */
  async init() {
    this.permission = Notification.permission;

    // Vérifie si les notifications sont supportées
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    return true;
  },

  /**
   * Demande la permission pour les notifications
   * @returns {Promise<string>}
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      return 'denied';
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  },

  /**
   * Vérifie si les notifications sont autorisées
   * @returns {boolean}
   */
  isGranted() {
    return this.permission === 'granted';
  },

  /**
   * Envoie une notification
   * @param {string} title
   * @param {Object} options
   * @returns {Notification|null}
   */
  async send(title, options = {}) {
    // Vérifie les paramètres utilisateur
    const settings = Storage.loadSettings();
    if (!settings.notifications) {
      return null;
    }

    // Vérifie la permission
    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return null;
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-192.png',
        vibrate: [200, 100, 200],
        ...options
      });

      // Son optionnel
      if (settings.sounds) {
        this.playSound();
      }

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  },

  /**
   * Envoie une notification de rappel pour une habitude
   * @param {Habit} habit
   */
  sendHabitReminder(habit) {
    this.send(`Rappel: ${habit.name}`, {
      body: `Il est temps de ${habit.name.toLowerCase()} !`,
      tag: `habit-${habit.id}`,
      icon: habit.icon,
      requireInteraction: false
    });
  },

  /**
   * Envoie une notification de félicitations
   * @param {Habit} habit
   */
  sendCongratulations(habit) {
    const streak = habit.getCurrentStreak();
    const message = habit.getMotivationalMessage();

    this.send(`${habit.icon} ${habit.name}`, {
      body: message,
      tag: `congrats-${habit.id}`,
      requireInteraction: false
    });
  },

  /**
   * Envoie une notification de milestone
   * @param {Habit} habit
   * @param {number} milestone
   */
  sendMilestone(habit, milestone) {
    const messages = {
      7: `7 jours consécutifs ! Vous êtes sur la bonne voie ! 🔥`,
      21: `21 jours ! Vous avez formé une vraie habitude ! 🎯`,
      30: `30 jours incroyables ! Vous êtes un champion ! 🏆`,
      50: `50 jours consécutifs ! Incroyable persévérance ! 💪`,
      100: `100 JOURS LÉGENDAIRES ! VOUS ÊTES UNE LÉGENDE ! 👑`
    };

    this.send(`${habit.icon} Milestone atteint !`, {
      body: messages[milestone] || `${milestone} jours consécutifs ! Continuez ! 🔥`,
      tag: `milestone-${habit.id}-${milestone}`,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200]
    });
  },

  /**
   * Envoie une notification de streak en danger
   * @param {Habit} habit
   */
  sendStreakWarning(habit) {
    const streak = habit.getCurrentStreak();

    this.send(`⚠️ Streak en danger !`, {
      body: `Votre série de ${streak} jours pour "${habit.name}" n'attend que vous !`,
      tag: `warning-${habit.id}`,
      requireInteraction: true
    });
  },

  /**
   * Envoie un rappel quotidien global
   */
  sendDailyReminder() {
    const todayHabits = HabitManager.getTodayHabits();
    const completedCount = HabitManager.getCompletedCount();
    const totalCount = todayHabits.length;

    if (totalCount === 0) return;

    let body = '';
    const percentage = (completedCount / totalCount) * 100;

    if (percentage === 0) {
      body = `Vous n'avez pas encore commencé aujourd'hui. ${totalCount} habitude(s) vous attendent !`;
    } else if (percentage < 50) {
      body = `${completedCount}/${totalCount} habitudes complétées. Continuez !`;
    } else if (percentage < 100) {
      body = `${completedCount}/${totalCount} habitudes ! Encore un petit effort !`;
    } else {
      body = `🎉 Toutes vos habitudes sont complétées ! Bravo !`;
    }

    this.send('HabitFlow - Rappel quotidien', {
      body,
      tag: 'daily-reminder',
      requireInteraction: false
    });
  },

  /**
   * Planifie les rappels pour les habitudes
   */
  scheduleHabitReminders() {
    const habits = HabitManager.getTodayHabits();

    habits.forEach(habit => {
      if (habit.reminderTime && !habit.isCompletedOn(new Date())) {
        this.scheduleReminder(habit);
      }
    });
  },

  /**
   * Planifie un rappel pour une habitude
   * @param {Habit} habit
   */
  scheduleReminder(habit) {
    if (!habit.reminderTime) return;

    const [hours, minutes] = habit.reminderTime.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date(now);
    reminderTime.setHours(hours, minutes, 0, 0);

    // Si l'heure est déjà passée aujourd'hui, planifie pour demain
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime - now;

    setTimeout(() => {
      if (!habit.isCompletedOn(new Date())) {
        this.sendHabitReminder(habit);
      }
    }, delay);
  },

  /**
   * Planifie le rappel quotidien global
   */
  scheduleDailyReminder() {
    const settings = Storage.loadSettings();
    const [hours, minutes] = settings.dailyReminderTime.split(':').map(Number);

    const now = new Date();
    const reminderTime = new Date(now);
    reminderTime.setHours(hours, minutes, 0, 0);

    // Si l'heure est déjà passée aujourd'hui, planifie pour demain
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime - now;

    setTimeout(() => {
      this.sendDailyReminder();
      // Replanifie pour le lendemain
      this.scheduleDailyReminder();
    }, delay);
  },

  /**
   * Vérifie les streaks en danger
   */
  checkStreaksInDanger() {
    const habitsInDanger = HabitManager.getHabitsInDanger();

    habitsInDanger.forEach(habit => {
      this.sendStreakWarning(habit);
    });
  },

  /**
   * Obtient une citation motivationnelle aléatoire
   * @returns {string}
   */
  getRandomQuote() {
    return Utils.randomChoice(this.motivationalQuotes);
  },

  /**
   * Joue un son de notification
   */
  playSound() {
    try {
      const audio = new Audio('/assets/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      console.log('Sound not available:', error);
    }
  },

  /**
   * Joue un son de célébration
   */
  playCelebrationSound() {
    try {
      const audio = new Audio('/assets/sounds/celebration.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      console.log('Sound not available:', error);
    }
  },

  /**
   * Démarre les vérifications périodiques
   */
  startPeriodicChecks() {
    // Vérifie les streaks en danger toutes les heures
    setInterval(() => {
      this.checkStreaksInDanger();
    }, 60 * 60 * 1000);

    // Planifie le rappel quotidien
    this.scheduleDailyReminder();

    // Planifie les rappels d'habitudes
    this.scheduleHabitReminders();
  }
};

// Initialise au chargement
if (typeof window !== 'undefined') {
  Notifications.init();
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Notifications;
}
