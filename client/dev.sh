#!/bin/bash
npm run vite-dev 2>&1 | grep -v -E 'DEPRECATION WARNING|Recommendation:|More info|src/styles/|╷|│|╵'