const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, '..', 'public', 'models', 'corridor.glb');
console.log('Reading GLB from:', glbPath);

try {
  const buffer = fs.readFileSync(glbPath);
  
  // GLB Header: Magic (4 bytes), Version (4 bytes), Total Length (4 bytes)
  const magic = buffer.toString('utf8', 0, 4);
  console.log('Magic:', magic);
  
  if (magic !== 'glTF') {
    console.error('Not a valid GLB file');
    process.exit(1);
  }
  
  // JSON Chunk Header: Chunk Length (4 bytes), Chunk Type (4 bytes, 'JSON')
  const chunkLength = buffer.readUInt32LE(12);
  const chunkType = buffer.toString('utf8', 16, 20);
  console.log('Chunk Type:', chunkType, 'Length:', chunkLength);
  
  if (chunkType !== 'JSON') {
    console.error('First chunk is not JSON');
    process.exit(1);
  }
  
  const jsonString = buffer.toString('utf8', 20, 20 + chunkLength);
  const gltf = JSON.parse(jsonString);
  
  console.log('Animations count:', gltf.animations ? gltf.animations.length : 0);
  
  if (gltf.animations) {
    gltf.animations.forEach((anim, i) => {
      console.log(`\nAnimation ${i}: "${anim.name}"`);
      if (anim.channels) {
        console.log('  Channels count:', anim.channels.length);
        // Look at the first channel
        if (anim.channels.length > 0) {
          const channel = anim.channels[0];
          const target = channel.target;
          const nodeIdx = target.node;
          const nodeName = gltf.nodes && gltf.nodes[nodeIdx] ? gltf.nodes[nodeIdx].name : `Node ${nodeIdx}`;
          console.log(`    Channel 0: targets node "${nodeName}" (index ${nodeIdx}) property "${target.path}"`);
        }
      }
    });
  }
} catch (err) {
  console.error('Error parsing GLB:', err);
}
