import { defineStore } from 'pinia';
import { useGridStore } from './gridStore';
import { usePlayerStore } from './playerStore';

export const useRoundStore = defineStore('roundStore', {
  state: () => ({
    currentRound: 1,
    totalRounds: 8,
    currentPhase: 'action', // 'action' or 'strategy'
    phaseStep: 'setup', // Different steps within each phase
    actionPhaseData: {
      currentBattle: null,
      gloryPointsEarned: {},
      battleResults: []
    },
    strategyPhaseData: {
      currentEvent: null,
      resourcePointsSpent: {},
      territoryChanges: []
    }
  }),

  getters: {
    getCurrentRoundInfo: (state) => {
      return {
        round: state.currentRound,
        phase: state.currentPhase,
        step: state.phaseStep
      };
    },
    
    getRemainingRounds: (state) => {
      return state.totalRounds - state.currentRound;
    },
    
    getPhaseData: (state) => {
      return state.currentPhase === 'action' 
        ? state.actionPhaseData 
        : state.strategyPhaseData;
    },
    
    isLastRound: (state) => {
      return state.currentRound === state.totalRounds;
    }
  },

  actions: {
    initializeRoundData(campaign) {
      this.totalRounds = campaign.rounds || 8;
      this.currentRound = 1;
      this.currentPhase = 'action';
      this.phaseStep = 'setup';
      
      // Initialize player-specific data
      const playerStore = usePlayerStore();
      const players = playerStore.getAllPlayers;
      
      // Reset action phase data
      this.actionPhaseData = {
        currentBattle: null,
        gloryPointsEarned: {},
        battleResults: []
      };
      
      // Initialize glory points tracking for each player
      players.forEach(player => {
        this.actionPhaseData.gloryPointsEarned[player.id] = 0;
      });
      
      // Reset strategy phase data
      this.strategyPhaseData = {
        currentEvent: null,
        resourcePointsSpent: {},
        territoryChanges: []
      };
      
      // Initialize resource points tracking for each player
      players.forEach(player => {
        this.strategyPhaseData.resourcePointsSpent[player.id] = 0;
      });
    },
    
    nextPhase() {
      if (this.currentPhase === 'action') {
        // Transition from action to strategy phase
        this.currentPhase = 'strategy';
        this.phaseStep = 'generateEvent';
        
        // Calculate resource points based on territories
        this.calculateResourcePoints();
      } else {
        // End of round, start new round
        this.currentRound++;
        this.currentPhase = 'action';
        this.phaseStep = 'setup';
        
        // Reset phase data for the new round
        this.resetPhaseData();
      }
    },
    
    setPhaseStep(step) {
      this.phaseStep = step;
    },
    
    recordBattleResult(attackerId, defenderId, winner, gloryPoints) {
      // Record battle result
      this.actionPhaseData.battleResults.push({
        round: this.currentRound,
        attacker: attackerId,
        defender: defenderId,
        winner,
        gloryPoints
      });
      
      // Update glory points
      if (this.actionPhaseData.gloryPointsEarned[winner]) {
        this.actionPhaseData.gloryPointsEarned[winner] += gloryPoints;
      } else {
        this.actionPhaseData.gloryPointsEarned[winner] = gloryPoints;
      }
      
      // Update player stats
      const playerStore = usePlayerStore();
      playerStore.updatePlayerStat(winner, 'Glory', gloryPoints);
    },
    
    calculateResourcePoints() {
      const gridStore = useGridStore();
      const playerStore = usePlayerStore();
      const players = playerStore.getAllPlayers;
      
      // Calculate resource points for each player based on controlled territories
      players.forEach(player => {
        const resourceValue = gridStore.getResourceValue(player.id);
        const strategicValue = gridStore.getStrategicValue(player.id);
        
        // Calculate total strategy points (formula from game rules)
        const strategyPoints = resourceValue + strategicValue; 
        
        // Update player stats
        playerStore.updatePlayerStat(player.id, 'Strategy Points', strategyPoints);
      });
    },
    
    recordTerritoryChange(hexId, newOwnerId, oldOwnerId = null) {
      this.strategyPhaseData.territoryChanges.push({
        round: this.currentRound,
        hexId,
        newOwner: newOwnerId,
        previousOwner: oldOwnerId
      });
    },
    
    spendResourcePoints(playerId, amount) {
      // Track resource points spent
      if (this.strategyPhaseData.resourcePointsSpent[playerId]) {
        this.strategyPhaseData.resourcePointsSpent[playerId] += amount;
      } else {
        this.strategyPhaseData.resourcePointsSpent[playerId] = amount;
      }
      
      // Update player stats
      const playerStore = usePlayerStore();
      playerStore.updatePlayerStat(playerId, 'Strategy Points', -amount);
    },
    
    generateRandomEvent() {
      const gridStore = useGridStore();
      const events = gridStore.gameData.randomEvents;
      
      // Choose random event
      const randomIndex = Math.floor(Math.random() * events.length);
      this.strategyPhaseData.currentEvent = events[randomIndex];
      
      return this.strategyPhaseData.currentEvent;
    },
    
    resetPhaseData() {
      const playerStore = usePlayerStore();
      const players = playerStore.getAllPlayers;
      
      // Reset action phase data for the new round
      this.actionPhaseData = {
        currentBattle: null,
        gloryPointsEarned: {},
        battleResults: []
      };
      
      // Initialize glory points tracking for each player
      players.forEach(player => {
        this.actionPhaseData.gloryPointsEarned[player.id] = 0;
      });
      
      // Reset strategy phase data
      this.strategyPhaseData = {
        currentEvent: null,
        resourcePointsSpent: {},
        territoryChanges: []
      };
      
      // Initialize resource points tracking for each player
      players.forEach(player => {
        this.strategyPhaseData.resourcePointsSpent[player.id] = 0;
      });
    }
  }
});
