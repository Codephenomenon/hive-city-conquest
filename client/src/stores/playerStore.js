import { defineStore } from 'pinia';
import { useGridStore } from './gridStore';

export const usePlayerStore = defineStore('playerStore', {
  state: () => ({
    currentPlayerIndex: 0
  }),

  getters: {
    players() {
      const gridStore = useGridStore();
      return gridStore.getActiveCampaign?.players || [];
    },  

    getPlayerById() {
      return (playerId) => {
        return this.players.find(player => player.id === playerId);
      };
    },

    getCurrentPlayer() {
      return this.players[this.currentPlayerIndex] || null;
    },

    getPlayerStats: (playerId) => {
      const player = this.players.find(player => player.id === playerId);
      return player ? player.stats : null;
    },

    getAllPlayers() {
      return this.players;
    }
  },

  actions: {
    initializePlayers(campaignData) {
      if (!campaignData.players || !Array.isArray(campaignData.players)) {
        console.error("Invalid players data:", campaignData.players);
        return [];
      }
      
      const initializedPlayers = campaignData.players.map((player, index) => {
        return {
          id: `player-${index}`,
          alliance: player.alliance,
          faction: player.faction,
          color: player.color,
          stats: [
            { label: "Glory", value: 0 },
            { label: "Strategy Points", value: 0 },
            { label: "Territory", value: 0 }
          ],
          cards: []
        };
      });

      // Return the initialized players but don't store them locally
      return initializedPlayers;
    },

    updatePlayerStat(playerId, statName, value) {
      const player = this.getPlayerById(playerId);
      if (!player) return;
      
      const statIndex = player.stats.findIndex(stat => stat.label === statName);
      if (statIndex === -1) return;

      // Prevent negative values
      if (player.stats[statIndex].value <= 0 && value < 0) return;
      
      // Directly update the player stat in the grid store's campaign
      player.stats[statIndex].value += value;
      
      // No need to sync - we've modified the original object
    },

    incrementStat(playerId, statName) {
      this.updatePlayerStat(playerId, statName, 1);
    },

    decrementStat(playerId, statName) {
      this.updatePlayerStat(playerId, statName, -1);
    },

    setNextPlayer() {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    },

    resetPlayerStats() {
      this.players.forEach(player => {
        player.stats.forEach(stat => {
          stat.value = 0;
        });
      });
    },

    calculateTerritoryStats() {
      const gridStore = useGridStore();
    
      // Update territory count for each player
      this.players.forEach(player => {
        const playerHexes = gridStore.getPlayerHexes(player.id);
        
        // Find the territory stat and update it
        const territoryStatIndex = player.stats.findIndex(stat => stat.label === "Territory");
        if (territoryStatIndex !== -1) {
          player.stats[territoryStatIndex].value = playerHexes.length;
        } else {
          // If territory stat doesn't exist, add it
          player.stats.push({ label: "Territory", value: playerHexes.length });
        }
      });
    }
  }
});
