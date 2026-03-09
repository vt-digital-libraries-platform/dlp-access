#!/usr/bin/env node

/**
 * Generate schema.js from schema.graphql
 * 
 * This script automatically converts the GraphQL schema file to a JavaScript module
 * that can be imported by Create React App (which doesn't natively support .graphql imports).
 * 
 * This runs automatically via npm pre-start and pre-build hooks, so developers
 * dont need to run it manually.
 */

const fs = require('fs');
const path = require('path');

// Paths
const schemaPath = path.join(__dirname, '../amplify/backend/api/vtdlp/schema.graphql');
const outputPath = path.join(__dirname, '../src/schema.js');

try {
  // Read the GraphQL schema
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Generate JavaScript module with template literal
  const jsContent = `// Auto-generated from schema.graphql
// Do not edit directly - edit schema.graphql instead
// This file is regenerated automatically before start/build

const schemaText = \`${schema}\`;

export default schemaText;
`;

  // Write the output file
  fs.writeFileSync(outputPath, jsContent);
  
  console.log('✓ Generated schema.js from schema.graphql (' + schema.length + ' characters)');
  
} catch (error) {
  console.error('✗ Failed to generate schema.js:', error.message);
  process.exit(1);
}
