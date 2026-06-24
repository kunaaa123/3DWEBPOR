import fs from 'fs';
import path from 'path';

const glbPath = path.resolve('public/models/corridor.glb');

try {
  const buffer = fs.readFileSync(glbPath);
  if (buffer.length < 12) {
    console.error('Error: GLB file too short');
    process.exit(1);
  }
  
  const magic = buffer.toString('utf8', 0, 4);
  if (magic !== 'glTF') {
    console.error('Error: Not a glTF file (magic is ' + magic + ')');
    process.exit(1);
  }
  
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);
  
  const chunkLength = buffer.readUInt32LE(12);
  const chunkType = buffer.readUInt32LE(16);
  
  const jsonBuffer = buffer.subarray(20, 20 + chunkLength);
  const gltf = JSON.parse(jsonBuffer.toString('utf8'));
  
  const nodes = gltf.nodes || [];
  console.log(`Total nodes in GLB: ${nodes.length}`);
  
  const uniqueDoors = [];
  const allDoorNodes = [];
  
  nodes.forEach((node, idx) => {
    const name = node.name || '';
    if (name.toLowerCase().includes('woodendoor_01')) {
      const translation = node.translation || [0, 0, 0];
      allDoorNodes.push({ idx, name, translation });
      const z = translation[2];
      if (!uniqueDoors.some(d => Math.abs(d.z - z) < 2.0)) {
        uniqueDoors.push({ name, translation, z });
      }
    }
  });
  
  console.log('\n=== ALL WOODENDOOR_01 NODES ===');
  allDoorNodes.forEach(d => {
    console.log(`Node ${d.idx}: '${d.name}' at translation ${JSON.stringify(d.translation)}`);
  });
  
  console.log('\n=== UNIQUE ROOM DOORS DETECTED ===');
  uniqueDoors.sort((a, b) => b.z - a.z); // Sort Z from corridor start to end
  uniqueDoors.forEach(d => {
    console.log(`Door name: '${d.name}', Translation: ${JSON.stringify(d.translation)}, Z: ${d.z.toFixed(2)}`);
  });

  const specialNodes = [];
  nodes.forEach((node, idx) => {
    const name = node.name || '';
    const lower = name.toLowerCase();
    if (['aboutme', 'project', 'dev_', 'text_'].some(k => lower.includes(k))) {
      specialNodes.push({ idx, name, translation: node.translation || [0, 0, 0] });
    }
  });

  console.log('\n=== SPECIAL NODES ===');
  specialNodes.forEach(n => {
    console.log(`Node ${n.idx}: '${n.name}' at translation ${JSON.stringify(n.translation)}`);
  });

} catch (err) {
  console.error('Error parsing GLB:', err);
}
