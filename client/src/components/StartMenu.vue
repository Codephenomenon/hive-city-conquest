<template>
  <div class="overlay">
    <div class="overlay-content">
      <h1>Start Campaign</h1>

      <div class="tabs">
        <button 
          :class="{ active: activeTab === 'create' }" 
          @click="activeTab = 'create'"
        >
          Create New World
        </button>
        <button 
          :class="{ active: activeTab === 'load' }" 
          @click="activeTab = 'load'"
        >
          Load Existing World
        </button>
      </div>

      <div
        v-if="activeTab === 'create'"
        class="create-form"
      >
        <h2>New Hivecity Campaign</h2>

        <div class="form-group">
          <label for="hivecity-name">Hivecity Name:</label>
          <input 
            id="hivecity-name" 
            v-model="campaignData.hivecityName" 
            type="text" 
            placeholder="Enter Hivecity name"
            required
          >
        </div>

        <div class="form-group">
          <label for="campaign-mode">Campaign Mode:</label>
          <select
            id="campaign-mode"
            v-model="campaignData.campaignMode"
          >
            <option value="Urban Conquest">
              Urban Conquest
            </option>
            <option value="Under Siege">
              Under Siege
            </option>
            <option value="Scattered Outposts">
              Scattered Outposts
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="rounds">Number of Rounds:</label>
          <select
            id="rounds"
            v-model="campaignData.rounds"
          >
            <option :value="6">
              6
            </option>
            <option :value="8">
              8
            </option>
            <option :value="10">
              10
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="player-count">Number of Players:</label>
          <select
            id="player-count"
            v-model="campaignData.playerCount"
            @change="updatePlayers"
          >
            <option :value="2">
              2 Players
            </option>
            <option :value="3">
              3 Players
            </option>
            <option :value="4">
              4 Players
            </option>
          </select>
        </div>

        <h3>Player Configuration</h3>
        <div 
          v-for="(player, index) in campaignData.players" 
          :key="index" 
          class="player-config"
        >
          <h4>Player {{ index + 1 }}</h4>

          <div class="form-group">
            <label :for="`player-${index}-alliance`">Alliance:</label>
            <select 
              :id="`player-${index}-alliance`" 
              v-model="player.alliance" 
              @change="updatePlayerColor(index)"
            >
              <option value="imperial">
                Imperial
              </option>
              <option value="chaos">
                Chaos
              </option>
              <option value="xenos">
                Xenos
              </option>
            </select>
          </div>

          <div class="form-group">
            <label :for="`player-${index}-faction`">Faction:</label>
            <select 
              :id="`player-${index}-faction`" 
              v-model="player.faction"
            >
              <option 
                v-for="faction in factionsByAlliance[player.alliance]" 
                :key="faction.value" 
                :value="faction.value"
              >
                {{ faction.label }}
              </option>
            </select>
          </div>

          <div class="form-group color-picker">
            <label :for="`player-${index}-color`">Player Color:</label>
            <input 
              :id="`player-${index}-color`" 
              v-model="player.color" 
              type="color" 
            >
            <span class="color-value">{{ player.color }}</span>
          </div>
        </div>

        <button
          class="create-button"
          @click="createCampaign"
        >
          Create Campaign
        </button>
      </div>

      <div
        v-if="activeTab === 'load'"
        class="load-form"
      >
        <h2>Load Existing Campaign</h2>

        <div class="form-group">
          <label for="campaign-file">Upload Campaign File:</label>
          <input 
            id="campaign-file" 
            type="file" 
            accept=".json" 
            @change="handleFileUpload"
          >
        </div>

        <div
          v-if="savedCampaigns.length > 0"
          class="saved-campaigns"
        >
          <h3>Saved Campaigns</h3>
          <ul>
            <li 
              v-for="(campaign, index) in savedCampaigns" 
              :key="index" 
              @click="loadCampaign(campaign)"
            >
              {{ campaign.hivecityName }} - {{ campaign.playerCount }} players
            </li>
          </ul>
        </div>

        <button
          class="load-button"
          :disabled="!selectedCampaign"
          @click="loadSelectedCampaign"
        >
          Load Campaign
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useGridStore } from '@/stores/gridStore';
  import { usePlayerStore } from '@/stores/playerStore';

  // Define emits
  const emit = defineEmits(['campaign-created', 'campaign-loaded']);

  // Store instance
  const gridStore = useGridStore();
  const playerStore = usePlayerStore();

  // State
  const activeTab = ref('create');
  const defaultColors = {
    imperial: '#0047AB', // Imperial Blue
    chaos: '#8B0000',    // Chaos Dark Red
    xenos: '#FF8C00'     // Xenos Dark Orange
  };

  const factionsByAlliance = {
    imperial: [
      { value: 'spaceMarines', label: 'Space Marines' },
      { value: 'adeptaSororitas', label: 'Adepta Sororitas' },
      { value: 'adeptusCustodes', label: 'Adeptus Custodes' },
      { value: 'adeptusMechanicus', label: 'Adeptus Mechanicus' },
      { value: 'astraMilitarum', label: 'Astra Militarum' },
      { value: 'greyKnights', label: 'Grey Knights' },
      { value: 'imperialAgents', label: 'Imperial Agents' },
      { value: 'imperialKnights', label: 'Imperial Knights' }
    ],
    chaos: [
      { value: 'chaosSpaceMarines', label: 'Chaos Space Marines' },
      { value: 'chaosDaemons', label: 'Chaos Daemons' },
      { value: 'chaosKnights', label: 'Chaos Knights' },
      { value: 'deathGuard', label: 'Death Guard' },
      { value: 'thousandSons', label: 'Thousand Sons' },
      { value: 'worldEaters', label: 'World Eaters' },
      { value: 'emperorsChildren', label: 'Emperor\'s Children' }
    ],
    xenos: [
      { value: 'aeldari', label: 'Aeldari' },
      { value: 'drukhari', label: 'Drukhari' },
      { value: 'genestealerCults', label: 'Genestealer Cults' },
      { value: 'leaguesOfVotann', label: 'Leagues of Votann' },
      { value: 'necrons', label: 'Necrons' },
      { value: 'orks', label: 'Orks' },
      { value: 'tAuEmpire', label: 'T\'au Empire' },
      { value: 'tyranids', label: 'Tyranids' }
    ]
  };
  
  const defaultFactions = {
    imperial: 'spaceMarines',
    chaos: 'chaosSpaceMarines',
    xenos: 'necrons'
  };

  const campaignData = reactive({
    hivecityName: '',
    campaignMode: 'Urban Conquest',
    playerCount: 2,
    rounds: 8,
    players: [
      {
        alliance: 'imperial',
        color: '#0047AB',
        faction: 'spaceMarines',
      },
      {
        alliance: 'chaos',
        color: '#8B0000',
        faction: 'chaosSpaceMarines',
      }
    ],
    hexMap: {}
  });

  const savedCampaigns = ref([]);
  const selectedCampaign = ref(null);

  // Methods
  const updatePlayers = () => {
    const count = campaignData.playerCount;
    const currentPlayers = [...campaignData.players];
    
    // If reducing player count, remove extras
    if (currentPlayers.length > count) {
      campaignData.players = currentPlayers.slice(0, count);
    } 
          // If adding players, add with default values
    else if (currentPlayers.length < count) {
      const alliances = ['imperial', 'chaos', 'xenos'];
      
      for (let i = currentPlayers.length; i < count; i++) {
        // Use a different default alliance for each new player
        const alliance = alliances[i % alliances.length];
        const faction = defaultFactions[alliance];
        
        campaignData.players.push({
          alliance: alliance,
          color: defaultColors[alliance],
          faction: faction
        });
      }
    }
  }

  const updatePlayerColor = (playerIndex) => {
    const player = campaignData.players[playerIndex];
    // Update color based on alliance
    player.color = defaultColors[player.alliance];
    
    // Update faction when alliance changes
    // Check if the current faction is valid for the new alliance
    const validFactions = factionsByAlliance[player.alliance].map(f => f.value);
    if (!validFactions.includes(player.faction)) {
      // Reset to default faction for this alliance
      player.faction = defaultFactions[player.alliance];
    }
  }

  const createCampaign = async () => {
    if (!campaignData.hivecityName) {
      alert('Please enter a Hivecity name');
      return;
    }

    // Initialize the map when campaign is created
    try {
      // Load game data first if not already loaded
      await gridStore.loadGameData();
      
      // Use the playerStore to initialize players properly
      const initializedPlayers = playerStore.initializePlayers(campaignData);

      // Create a campaign object with current date
      const campaign = {
        ...campaignData,
        players: initializedPlayers,
        createdAt: new Date().toISOString(),
        id: Date.now().toString()
      };
      
      // Set as active campaign in the store
      gridStore.setActiveCampaign(campaign);
      
      // Now initialize the hex map with the campaign mode rules
      await gridStore.initializeHexMap();
      
      // Add the hex map to the campaign object
      campaign.hexMap = gridStore.getHexMap;
      
      // Update the active campaign with the hex map
      gridStore.setActiveCampaign(campaign);

      // Save to localStorage
      saveCampaign(campaign);
      emit('campaign-created', campaign);
      resetForm();
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  const resetForm = () => {
    campaignData.hivecityName = '';
    campaignData.campaignMode = 'Urban Conquest';
    campaignData.playerCount = 2;
    campaignData.rounds = 8;
    campaignData.players = [
      {
        alliance: 'imperial',
        color: '#0047AB',
        faction: 'spaceMarines'
      },
      {
        alliance: 'chaos',
        color: '#8B0000',
        faction: 'chaosSpaceMarines'
      }
    ];
  }

  const saveCampaign = (campaign) => {
    // Get existing campaigns from localStorage
    let campaigns = JSON.parse(localStorage.getItem('hivecityCampaigns') || '[]');
    
    // Add new campaign
    campaigns.push(campaign);
    
    // Save back to localStorage
    localStorage.setItem('hivecityCampaigns', JSON.stringify(campaigns));
    
    // Update saved campaigns list
    loadSavedCampaigns();
  }

  const loadSavedCampaigns = () => {
    // Load campaigns from localStorage
    savedCampaigns.value = JSON.parse(localStorage.getItem('hivecityCampaigns') || '[]');
    
    // Sort by date created, newest first
    savedCampaigns.value.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const campaign = JSON.parse(e.target.result);
        selectedCampaign.value = campaign;
      } catch (error) {
        alert('Invalid campaign file');
        console.error('Error parsing campaign file:', error);
      }
    };
    reader.readAsText(file);
  }

  const loadCampaign = (campaign) => {
    selectedCampaign.value = campaign;
  }

  const loadSelectedCampaign = () => {
    if (!selectedCampaign.value) return;
    
    // Set as active campaign in the store
    gridStore.setActiveCampaign(selectedCampaign.value);
    
    // Emit event to parent component
    emit('campaign-loaded', selectedCampaign.value);
    
    console.log('Campaign loaded:', selectedCampaign.value);
  }

  async function initializeData() {
    try {
      await gridStore.loadGameData();
    } catch (error) {
      console.error('Error loading game data:', error);
    }
  }

  // Lifecycle hooks
  onMounted(async () => {
    loadSavedCampaigns();
    await initializeData();
  });
</script>

<style scoped>
</style>
