// Strict validator for n8n workflow JSON
// Node 18+
// Checks: name, nodes[], minimal node fields, unique node names, connections references

const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'workflows');
if (!fs.existsSync(dir)) {
  console.log('[validate] No workflows directory, skipping');
  process.exit(0);
}

let errors = 0;
const jsonFiles = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
if (jsonFiles.length === 0) {
  console.log('[validate] No workflow json files found');
  process.exit(0);
}

function fail(msg) {
  console.error('✗', msg);
  errors++;
}

function ok(msg) {
  console.log('✓', msg);
}

for (const file of jsonFiles) {
  const full = path.join(dir, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (e) {
    fail(`${file}: invalid JSON syntax`);
    continue;
  }

  // Basic fields
  if (!data.name || typeof data.name !== 'string') fail(`${file}: .name is required string`);
  if (!Array.isArray(data.nodes) || data.nodes.length === 0) fail(`${file}: .nodes must be non-empty array`);
  if (!data.connections || typeof data.connections !== 'object') fail(`${file}: .connections object required`);

  // Node checks
  const nodeNames = new Set();
  const ids = new Set();
  if (Array.isArray(data.nodes)) {
    for (const n of data.nodes) {
      if (!n || typeof n !== 'object') { fail(`${file}: node is not an object`); continue; }
      if (!n.name || typeof n.name !== 'string') fail(`${file}: node without .name`);
      if (!n.id || typeof n.id !== 'string') fail(`${file}: node ${n.name || ''} without .id`);
      if (!n.type || typeof n.type !== 'string') fail(`${file}: node ${n.name || ''} without .type`);
      if (typeof n.typeVersion === 'undefined') fail(`${file}: node ${n.name || ''} without .typeVersion`);
      if (!Array.isArray(n.position) || n.position.length !== 2) fail(`${file}: node ${n.name || ''} must have .position [x,y]`);
      if (n.name) {
        if (nodeNames.has(n.name)) fail(`${file}: duplicate node name "${n.name}"`);
        nodeNames.add(n.name);
      }
      if (n.id) {
        if (ids.has(n.id)) fail(`${file}: duplicate node id "${n.id}"`);
        ids.add(n.id);
      }
    }
  }

  // Connections reference check: keys must be existing node names
  if (data.connections && typeof data.connections === 'object') {
    for (const fromName of Object.keys(data.connections)) {
      if (!nodeNames.has(fromName)) fail(`${file}: connections key "${fromName}" is not an existing node name`);
      const arr = data.connections[fromName]?.main;
      if (!Array.isArray(arr)) continue;
      for (const group of arr) {
        if (!Array.isArray(group)) continue;
        for (const link of group) {
          const toName = link?.node;
          if (toName && !nodeNames.has(toName)) {
            fail(`${file}: connection from "${fromName}" to unknown node "${toName}"`);
          }
        }
      }
    }
  }

  // Webhook sanity checks (optional)
  if (Array.isArray(data.nodes)) {
    for (const n of data.nodes) {
      if (typeof n.type === 'string' && n.type.includes('webhook')) {
        const p = n.parameters || {};
        if (!p.httpMethod) fail(`${file}: webhook node "${n.name}" missing parameters.httpMethod`);
        if (!p.path) fail(`${file}: webhook node "${n.name}" missing parameters.path`);
      }
    }
  }

  ok(`${file} validated`);
}

if (errors > 0) {
  console.error(`Validation failed with ${errors} error(s)`);
  process.exit(1);
} else {
  console.log('All workflow files valid');
}
