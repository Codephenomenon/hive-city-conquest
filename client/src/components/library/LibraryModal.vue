<template>
  <div class="library-container">
    <!-- Fixed position toggle button -->
    <button
      type="button"
      class="icon-button"
      :aria-expanded="isOpen"
      aria-controls="library-modal"
      @click="toggleModal"
    >
      <img
        :src="OpenLibrary"
        class="icon-button__icon"
      >
    </button>

    <!-- Modal (without Teleport) -->
    <div
      v-if="isOpen"
      id="library-modal"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div
        class="modal-container"
        @click.stop
      >
        <!-- Modal header with search -->
        <div class="modal-header">
          <div class="search-container">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search library..."
              class="search-input"
            >
            <span class="search-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                />
                <line
                  x1="21"
                  y1="21"
                  x2="16.65"
                  y2="16.65"
                />
              </svg>
            </span>
          </div>
          <button
            class="close-button"
            aria-label="Close modal"
            @click="closeModal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
              />
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
              />
            </svg>
          </button>
        </div>
        
        <!-- Modal content with two panels -->
        <div class="modal-content">
          <!-- Left panel with categories -->
          <div class="left-panel">
            <h3>Navigation</h3>
            <ul class="category-list">
              <library-entry
                v-for="entry in libraryEntries"
                :key="entry.id"
                :entry="entry"
                :is-active="selectedEntry && selectedEntry.id === entry.id"
                @select="selectEntry"
              />
            </ul>
          </div>
          
          <!-- Right panel with content -->
          <div class="right-panel">
            <div
              v-if="searchTerm && filteredEntries.length > 0"
              class="search-results"
            >
              <h3>Search Results</h3>
              <ul class="result-list">
                <library-entry
                  v-for="entry in filteredEntries"
                  :key="entry.id"
                  :entry="entry"
                  @select="selectEntry"
                />
              </ul>
            </div>
            <div
              v-else-if="searchTerm && filteredEntries.length === 0"
              class="no-results"
            >
              <p>No results found for "{{ searchTerm }}"</p>
            </div>
            <div
              v-else-if="selectedEntry"
              class="entry-content"
            >
              <h2>{{ selectedEntry.title }}</h2>
              <div v-html="selectedEntry.content" />
            </div>
            <div
              v-else
              class="placeholder"
            >
              <p>Select an entry from the left panel or search for specific content.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import OpenLibrary from '@/assets/icons/open-library.svg';
  import LibraryEntry from './LibraryEntry.vue';
  import overviewEntry from '@/content/overview.js';
  import matrixEntry from '@/content/matrix.js';

  // State management
  const isOpen = ref(false);
  const searchTerm = ref('');
  const selectedEntry = ref(null);

  // Sample library data - replace with your actual data
  const libraryEntries = ref([
    overviewEntry,
    matrixEntry
  ]);

  // Methods
  const toggleModal = () => {
    console.log('Toggle modal called, current state:', isOpen.value);
    isOpen.value = !isOpen.value;
    // Reset search when opening modal
    if (isOpen.value) {
      searchTerm.value = '';
    }
    console.log('New state:', isOpen.value);
  };

  const closeModal = () => {
    isOpen.value = false;
  };

  const selectEntry = (entry) => {
    selectedEntry.value = entry;
    searchTerm.value = '';
  };

  // Computed properties
  const filteredEntries = computed(() => {
    if (!searchTerm.value) return [];
    
    const term = searchTerm.value.toLowerCase();
    return libraryEntries.value.filter(entry => {
      // Check if the search term is in the title
      if (entry.title.toLowerCase().includes(term)) return true;
      
      // Check if the search term is in the content
      if (entry.content.toLowerCase().includes(term)) return true;
      
      // Check if the search term matches any keywords
      if (entry.keywords.some(keyword => keyword.toLowerCase().includes(term))) return true;
      
      return false;
    });
  });
</script>

<style scoped>
</style>
