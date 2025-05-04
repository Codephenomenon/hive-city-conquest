import jsLint from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';

export default [
  // Base ESLint recommended rules
  jsLint.configs.recommended,
  
  // Add Vue-specific flat configuration
  ...pluginVue.configs['flat/recommended'],
  
  // Vue file configuration
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      // Add browser and node environments
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  
  // JavaScript file configuration
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // Add browser and node environments
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  
  // Custom rules
  {
    rules: {
      // Add your custom rules here
      'no-console': 'off',  // Allow console
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    }
  },
  
  // Files to ignore
  {
    ignores: ['node_modules/**', 'dist/**']
  }
];
