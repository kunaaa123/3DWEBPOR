import struct
import json

glb_path = "c:/Users/Gnis_ha/Desktop/งานผม/Web3D portfolio/public/models/corridor.glb"

try:
    with open(glb_path, "rb") as f:
        header = f.read(12)
        if len(header) < 12:
            print("Error: GLB file too short")
            exit(1)
        magic, version, length = struct.unpack("<4sII", header)
        if magic != b"glTF":
            print(f"Error: Not a glTF file (magic is {magic})")
            exit(1)
        
        chunk_header = f.read(8)
        if len(chunk_header) < 8:
            print("Error: Chunk header too short")
            exit(1)
        chunk_length, chunk_type = struct.unpack("<II", chunk_header)
        
        json_data = f.read(chunk_length)
        if len(json_data) < chunk_length:
            print("Error: JSON data truncated")
            exit(1)
            
        gltf = json.loads(json_data.decode("utf-8"))
        
        nodes = gltf.get("nodes", [])
        print(f"Total nodes in GLB: {len(nodes)}")
        
        # Let's count woodenDoor_01 nodes and unique doors
        # We also want to find names of meshes, translation/position, etc.
        unique_doors = []
        all_door_nodes = []
        for i, node in enumerate(nodes):
            name = node.get("name", "")
            # We look for nodes containing woodenDoor_01
            if "woodendoor_01" in name.lower():
                # Let's see if this node has a translation/position
                translation = node.get("translation", [0, 0, 0])
                all_door_nodes.append((i, name, translation))
                # Deduplicate by Z coordinate (approximate since they might be grouped or have parents)
                z = translation[2]
                if not any(abs(d[2] - z) < 2.0 for d in unique_doors):
                    unique_doors.append((name, translation, z))
        
        print("\n=== ALL WOODENDOOR_01 NODES ===")
        for idx, name, trans in all_door_nodes:
            print(f"Node {idx}: '{name}' at translation {trans}")
            
        print("\n=== UNIQUE ROOM DOORS DETECTED ===")
        unique_doors.sort(key=lambda x: x[2], reverse=True) # sort from start of corridor to end (Z is positive to negative)
        for name, trans, z in unique_doors:
            print(f"Door name: '{name}', Translation: {trans}, Z: {z:.2f}")

        # Let's check other nodes containing "aboutme", "project", "dev", "text"
        special_nodes = []
        for i, node in enumerate(nodes):
            name = node.get("name", "")
            lower = name.toLowerCase() if hasattr(name, "toLowerCase") else name.lower()
            if any(k in lower for k in ["aboutme", "project", "dev_", "text_"]):
                special_nodes.append((i, name, node.get("translation", [0, 0, 0])))
        
        print("\n=== SPECIAL NODES (AboutMe, Project, Dev, Text) ===")
        for idx, name, trans in special_nodes:
            print(f"Node {idx}: '{name}' at translation {trans}")

except Exception as e:
    print(f"Error parsing GLB: {e}")
