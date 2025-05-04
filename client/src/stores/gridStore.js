import { defineStore } from 'pinia';
import { usePlayerStore } from './playerStore';

/**
 * Utility class for managing hex maps and location assignments
 */
class HexMapManager {
  constructor(hexes, locations) {
    this.hexes = hexes;
    this.locations = locations;
  }

  /**
   * Creates a hex map with randomly assigned unique locations
   * @param {Object} options - Configuration options
   * @param {boolean} options.includeSpecialLocations - Whether to include special locations
   * @param {number} options.specialLocationProbability - Probability (0-1) of assigning a special location
   * @returns {Array} - Array of hex objects with assigned locations
   */
  createHexMap(options = {}) {
    const {
      includeSpecialLocations = true,
      specialLocationProbability = 0.3,
    } = options;

    // Create a copy of locations to work with
    let availableLocations = [...this.locations];

    // Filter locations if needed based on options
    if (!includeSpecialLocations) {
      availableLocations = availableLocations.filter(location => !location.special);
    }

    // Shuffle the locations to ensure random distribution
    this.shuffleArray(availableLocations);

    // Ensure we have enough locations
    if (availableLocations.length < this.hexes.length) {
      throw new Error('Not enough unique locations for all hexes');
    }

    // Create new array of hexes with assigned locations
    return this.hexes.map((hex, index) => {
      // Determine if this hex should get a special location
      let locationIndex = index;

      // If we're including special locations, consider the probability
      if (includeSpecialLocations) {
        // Find special locations
        const specialLocationIndices = availableLocations
          .map((loc, i) => loc.special ? i : -1)
          .filter(i => i !== -1);
        
        // Check if we should assign a special location based on probability
        const shouldAssignSpecial = specialLocationIndices.length > 0 && 
          Math.random() < specialLocationProbability;
        
        if (shouldAssignSpecial) {
          // Get a random special location
          const randomSpecialIndex = Math.floor(Math.random() * specialLocationIndices.length);
          locationIndex = specialLocationIndices[randomSpecialIndex];
        }
      }

      // Create the combined hex object
      const newHex = {
        ...hex,
        location: availableLocations[locationIndex],
        controlledBy: null, // Can be set to player ID later
        upgrades: [], // Can store upgrade IDs
        isRazed: false
      };

      // Remove the used location from available locations
      availableLocations.splice(locationIndex, 1);

      return newHex;
    });
  }

  /**
   * Shuffles array in place using Fisher-Yates algorithm
   * @param {Array} array - Array to shuffle
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

export const useGridStore = defineStore('gridStore', {
  state: () => ({
    activeCampaign: null,
    selectedHexId: null,
    hexMap: {
      gridSize: 5,
      hexes: []
    },
    gameData: null
  }),

  getters: {
    getHexMap: (state) => state.hexMap,
    getHexes: (state) => state.hexMap.hexes,
    getHexById: (state) => (hexId) => {
      return state.hexMap.hexes.find(hex => hex.id === hexId);
    },
    getHexByCoordinates: (state) => (x, y) => {
      return state.hexMap.hexes.find(hex => hex.x === x && hex.y === y);
    },
    getActiveCampaign: (state) => state.activeCampaign,
    getPlayerHexes: (state) => (playerId) => {
      return state.hexMap.hexes.filter(hex => hex.controlledBy === playerId);
    },
    getSpecialLocationHexes: (state) => {
      return state.hexMap.hexes.filter(hex => hex.location?.special === true);
    },
    getResourceValue: (state) => (playerId) => {
      return state.hexMap.hexes
        .filter(hex => hex.controlledBy === playerId && !hex.isRazed)
        .reduce((total, hex) => total + (hex.location?.['resource-value'] || 0), 0);
    },
    getStrategicValue: (state) => (playerId) => {
      return state.hexMap.hexes
        .filter(hex => hex.controlledBy === playerId && !hex.isRazed)
        .reduce((total, hex) => total + (hex.location?.['strategic-value'] || 0), 0);
    }
  },

  actions: {
    // Load game data from JSON file
    async loadGameData() {
      try {
        if (!this.gameData) {
          // Use fetch or import for static assets
          const response = await fetch('/src/data/game.json');
          this.gameData = await response.json();
        }
        return this.gameData;
      } catch (error) {
        console.error('Failed to load game data:', error);
        throw error;
      }
    },

    // Initialize the hex map with locations
    async initializeHexMap(options = {}) {
      try {
        // Create HexMapManager and generate the map
        const hexMapManager = new HexMapManager(this.gameData.hexes, this.gameData.locations);
        const mappedHexes = hexMapManager.createHexMap(options);
        
        // Update the store state
        this.hexMap = {
          gridSize: 5,
          hexes: mappedHexes
        };
        
        // Apply campaign mode rules if there's an active campaign
        if (this.activeCampaign) {
          this.applyCampaignModeRules();
        }
      } catch (error) {
        console.error('Failed to initialize hex map:', error);
        throw error;
      }
    },

    updateHex(hexId, updatedProperties) {
      const hexIndex = this.hexMap.hexes.findIndex(hex => hex.id === hexId);
      if (hexIndex !== -1) {
        this.hexMap.hexes[hexIndex] = {
          ...this.hexMap.hexes[hexIndex],
          ...updatedProperties
        };
      }
    },

    setSelectedHex(hexId) {
      this.selectedHexId = hexId;
    },

    setHexControl(hexId, playerId) {
      // Get the current owner of the hex (if any)
      const hex = this.getHexById(hexId);
      const oldOwnerId = hex ? hex.controlledBy : null;
      
      // Update the hex with the new owner
      this.updateHex(hexId, { controlledBy: playerId });
      
      // Import playerStore to update stats
      const playerStore = usePlayerStore();
      
      // Update territory stats for the affected players
      if (oldOwnerId) {
        // Decrease old owner's territory count
        const oldOwnerTerritoryIndex = playerStore.getPlayerById(oldOwnerId)?.stats.findIndex(stat => stat.label === "Territory");
        if (oldOwnerTerritoryIndex !== -1) {
          playerStore.decrementStat(oldOwnerId, "Territory");
        }
      }
      
      if (playerId) {
        // Increase new owner's territory count
        const newOwnerTerritoryIndex = playerStore.getPlayerById(playerId)?.stats.findIndex(stat => stat.label === "Territory");
        if (newOwnerTerritoryIndex !== -1) {
          playerStore.incrementStat(playerId, "Territory");
        }
      }

      // Update activeCampaign's hexMap to match current hexMap
      if (this.activeCampaign) {
        this.activeCampaign.hexMap = this.hexMap;
      }
    },

    razeLocation(hexId) {
      this.updateHex(hexId, { isRazed: true });
    },

    addUpgradeToHex(hexId, upgradeId) {
      const hex = this.getHexById(hexId);
      if (hex && !hex.isRazed) {
        const upgrades = [...hex.upgrades, upgradeId];
        this.updateHex(hexId, { upgrades });
      }
    },

    setActiveCampaign(campaign) {
      this.activeCampaign = campaign;
      
      // Make sure we have hexes
      if (campaign && (!campaign.hexMap || !campaign.hexMap.hexes || campaign.hexMap.hexes.length === 0)) {
        console.log('Campaign has no hexes, initializing...');
        // Initialize the hex map with a small delay to ensure Vue reactivity
        setTimeout(async () => {
          try {
            await this.initializeHexMap();
            // Update the campaign with the new hex map
            this.activeCampaign = {
              ...this.activeCampaign,
              hexMap: this.hexMap
            };
            console.log('Hex map initialized:', this.hexMap.hexes.length);
          } catch (error) {
            console.error('Failed to initialize hex map:', error);
          }
        }, 50);
      } else {
        // If the campaign already has hexes, update our hexMap
        this.hexMap = campaign?.hexMap || { gridSize: 5, hexes: [] };
        console.log('Using existing hexes:', this.hexMap.hexes.length);
      }
    },

    clearActiveCampaign() {
      this.activeCampaign = null;
      this.selectedHexId = null;
      this.hexMap.hexes = [];
    },

    getStrategicGoals() {
      if (!this.activeCampaign) return null;

      const modeMap = {
        'Urban Conquest': 'urban-conquest',
        'Under Siege': 'under-seige',
        'Scattered Outposts': 'scattered-outposts'
      };
      
      const modeKey = modeMap[this.activeCampaign.campaignMode];

      // Get the strategic goal for the current campaign mode
      return this.gameData.strategicGoals.find(goal => goal.mode === modeKey);
    },

    applyCampaignModeRules() {
      if (!this.activeCampaign) return;

      const mode = this.activeCampaign.campaignMode;

      // Apply specific rules based on campaign mode
      switch(mode) {
        case 'Urban Conquest':
          this.setupUrbanConquest();
          break;
        case 'Under Siege':
          this.setupUnderSiege();
          break;
        case 'Scattered Outposts':
          this.setupScatteredOutposts();
          break;
      }

      this.updateAllPlayerTerritoryStats();
    },

    updateAllPlayerTerritoryStats() {
      const playerStore = usePlayerStore();
      playerStore.calculateTerritoryStats();
    },

    setupUrbanConquest() {
      const players = this.activeCampaign.players;
      const hexCount = Math.floor(this.hexMap.hexes.length / players.length);
      
      // Divide map roughly equally between players
      players.forEach((player, index) => {
        for (let i = 0; i < hexCount; i++) {
          const hexIndex = index * hexCount + i;
          if (hexIndex < this.hexMap.hexes.length) {
            this.setHexControl(this.hexMap.hexes[hexIndex].id, player.id);
          }
        }
      });
    },

    setupUnderSiege() {
      const players = this.activeCampaign.players;
      
      // Identify defender (player 0) and invader(s)
      const defender = players[0];
      
      // Get special locations for the defender's power base
      const specialLocations = this.getSpecialLocationHexes;
      
      // Assign 1/3 of the map to defender, clustered around a power base
      if (specialLocations.length > 0) {
        // Choose a special location as power base
        const powerBaseHex = specialLocations[0];
        this.setHexControl(powerBaseHex.id, defender.id);
        
        // Mark as power base (you'll need to add this property to the hex)
        this.updateHex(powerBaseHex.id, { isPowerBase: true });
        
        // Find adjacent hexes and assign them to defender
        const adjacentHexes = this.findAdjacentHexes(powerBaseHex.id);
        adjacentHexes.forEach(hex => {
          this.setHexControl(hex.id, defender.id);
        });
      }
      
      // Divide remaining hexes among invaders
      // Place invaders on opposite sides of the map
      // (For simplicity, this is a basic implementation)
      const remainingHexes = this.hexMap.hexes.filter(hex => !hex.controlledBy);
      
      for (let i = 1; i < players.length; i++) {
        const invader = players[i];
        const hexesPerInvader = Math.floor(remainingHexes.length / (players.length - 1));
        
        // Start from the opposite end of the map from the defender
        const startIdx = (i - 1) * hexesPerInvader;
        for (let j = 0; j < hexesPerInvader; j++) {
          const hexIdx = startIdx + j;
          if (hexIdx < remainingHexes.length) {
            this.setHexControl(remainingHexes[hexIdx].id, invader.id);
          }
        }
      }
    },

    setupScatteredOutposts() {
      const players = this.activeCampaign.players;
      
      // Create clusters of territory for each player, ensuring they're not adjacent
      players.forEach((player) => {
        // Create outposts for each player
        const outpostsPerPlayer = 3; // Adjust as needed
        const possibleOutposts = this.hexMap.hexes.filter(hex => !hex.controlledBy);
        
        for (let i = 0; i < outpostsPerPlayer; i++) {
          if (possibleOutposts.length === 0) break;
          
          // Choose random hex as outpost center
          const randomIndex = Math.floor(Math.random() * possibleOutposts.length);
          const outpostCenter = possibleOutposts[randomIndex];
          
          // Assign to player
          this.setHexControl(outpostCenter.id, player.id);
          
          // Remove from available hexes
          possibleOutposts.splice(randomIndex, 1);
          
          // Remove adjacent hexes from possible outposts to ensure separation
          const adjacentHexIds = outpostCenter.adjacentHexes;
          for (let j = possibleOutposts.length - 1; j >= 0; j--) {
            if (adjacentHexIds.includes(possibleOutposts[j].id)) {
              possibleOutposts.splice(j, 1);
            }
          }
        }
      });
    },

    findAdjacentHexes(hexId) {
      // Helper function to find adjacent hexes
      const hex = this.getHexById(hexId);
      if (!hex) return [];
      
      return hex.adjacentHexes.map(id => this.getHexById(id)).filter(h => h);
    },


  }
});
