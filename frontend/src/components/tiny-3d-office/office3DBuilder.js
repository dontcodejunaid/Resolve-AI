import * as THREE from 'three';

/**
 * Procedurally generates the 3D office furniture and environment.
 * Minimalist, modern tech workspace focused on laptop workstations,
 * Elements 6P ergonomic mesh chairs, and an open floor plan for moving around.
 */
export function build3DOfficeEnvironment(scene) {
  const officeGroup = new THREE.Group();
  officeGroup.name = 'office-environment';

  const enableShadows = (mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  };

  // Materials
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x18202f, // sleek dark slate
    roughness: 0.35,
    metalness: 0.15,
  });

  const rugMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.9,
  });

  const woodDeskMat = new THREE.MeshStandardMaterial({
    color: 0x92400e, // warm modern walnut wood
    roughness: 0.45,
    metalness: 0.05,
  });

  const deskPadMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b, // midnight gray leather desk pad
    roughness: 0.8,
  });

  const metalLegMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.25,
    metalness: 0.75,
  });

  const laptopChassisMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db, // anodized silver/space gray aluminum
    roughness: 0.3,
    metalness: 0.6,
  });

  const laptopKeyboardMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.6,
  });

  const laptopScreenBezelMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.4,
  });

  const screenCodeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8, // glowing cyan code
  });

  const screenTerminalMat = new THREE.MeshBasicMaterial({
    color: 0x34d399, // glowing green terminal
  });

  const screenPurpleMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7, // glowing violet IDE
  });

  const screenColors = [screenCodeMat, screenTerminalMat, screenPurpleMat];

  // 1. Office Floor (Open, spacious layout)
  const floorGeo = new THREE.BoxGeometry(16, 0.4, 14);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.2;
  floor.receiveShadow = true;
  officeGroup.add(floor);

  // Center Area Rug
  const rugGeo = new THREE.BoxGeometry(9, 0.02, 6);
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.position.set(0, 0.01, 0);
  rug.receiveShadow = true;
  officeGroup.add(rug);

  // Helper: Create single Desk Station focused cleanly on their Laptop
  function createDeskStation(id, x, z, rotationY = 0) {
    const station = new THREE.Group();
    station.position.set(x, 0, z);
    station.rotation.y = rotationY;

    // Table Top
    const topGeo = new THREE.BoxGeometry(2.2, 0.07, 1.1);
    const top = new THREE.Mesh(topGeo, woodDeskMat);
    top.position.y = 0.78;
    enableShadows(top);
    station.add(top);

    // Desk Legs
    const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.78, 8);
    const legPositions = [
      [-1.0, 0.39, -0.45],
      [1.0, 0.39, -0.45],
      [-1.0, 0.39, 0.45],
      [1.0, 0.39, 0.45],
    ];

    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, metalLegMat);
      leg.position.set(lx, ly, lz);
      enableShadows(leg);
      station.add(leg);
    });

    // Sleek Desk Pad (Center of desk)
    const pad = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.008, 0.6), deskPadMat);
    pad.position.set(0, 0.816, 0.08);
    station.add(pad);

    // --- Modern Sleek Laptop (Workstation Core) ---
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0, 0.822, 0.08);

    // Laptop Lower Base
    const baseChassis = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.016, 0.36), laptopChassisMat);
    baseChassis.position.set(0, 0.008, 0);
    enableShadows(baseChassis);
    laptopGroup.add(baseChassis);

    // Laptop Keyboard Well & Trackpad
    const laptopKeyboard = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.004, 0.18), laptopKeyboardMat);
    laptopKeyboard.position.set(0, 0.018, -0.04);
    laptopGroup.add(laptopKeyboard);

    const laptopTrackpad = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.002, 0.1), laptopChassisMat);
    laptopTrackpad.position.set(0, 0.017, 0.10);
    laptopGroup.add(laptopTrackpad);

    // Laptop Open Display Screen (Angled towards seated worker)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.016, -0.17); // Hinge location
    lidGroup.rotation.x = -0.32; // Open 110-degree laptop angle

    const screenLid = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.34, 0.012), laptopScreenBezelMat);
    screenLid.position.set(0, 0.17, 0);
    enableShadows(screenLid);
    lidGroup.add(screenLid);

    // Glowing Code Screen Display
    const currentScreenMat = screenColors[id % screenColors.length];
    const screenDisplay = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.30), currentScreenMat);
    screenDisplay.position.set(0, 0.17, 0.007);
    lidGroup.add(screenDisplay);

    laptopGroup.add(lidGroup);
    station.add(laptopGroup);

    // --- Elements 6P Workstation Ergonomic Mesh Task Chair ---
    const chair = new THREE.Group();
    chair.position.set(0, 0, 0.50);

    const chairFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // matte black / dark graphite frame
      roughness: 0.4,
      metalness: 0.3,
    });

    const meshBackMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // breathable dark mesh
      roughness: 0.8,
      metalness: 0.1,
    });

    const cushionMat = new THREE.MeshStandardMaterial({
      color: 0x18202f, // high-density upholstered foam cushion
      roughness: 0.7,
      metalness: 0.05,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // polished chrome gas cylinder
      metalness: 0.9,
      roughness: 0.15,
    });

    // 1. 5-Star Spider Base & Castor Wheels
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.04, 10), chairFrameMat);
    hub.position.y = 0.08;
    chair.add(hub);

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.28), chairFrameMat);
      spoke.position.set(Math.sin(angle) * 0.14, 0.06, Math.cos(angle) * 0.14);
      spoke.rotation.y = angle;
      enableShadows(spoke);
      chair.add(spoke);

      // Rolling double castor wheel
      const castor = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.028, 8), chairFrameMat);
      castor.rotation.z = Math.PI / 2;
      castor.position.set(Math.sin(angle) * 0.28, 0.035, Math.cos(angle) * 0.28);
      enableShadows(castor);
      chair.add(castor);
    }

    // 2. Central Hydraulic Chrome Gas Cylinder
    const gasCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.032, 0.38, 12), chromeMat);
    gasCylinder.position.y = 0.26;
    enableShadows(gasCylinder);
    chair.add(gasCylinder);

    // 3. Under-seat Tilt Mechanism Box & Lever
    const mechBox = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.2), chairFrameMat);
    mechBox.position.y = 0.44;
    enableShadows(mechBox);
    chair.add(mechBox);

    const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 6), chromeMat);
    lever.rotation.z = Math.PI / 2.3;
    lever.position.set(0.14, 0.44, 0);
    chair.add(lever);

    // 4. Ergonomic Waterfall-Edge Seat Cushion
    const seatCushion = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.46), cushionMat);
    seatCushion.position.set(0, 0.49, 0);
    enableShadows(seatCushion);
    chair.add(seatCushion);

    // Waterfall front edge curve
    const waterfall = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.48, 12), cushionMat);
    waterfall.rotation.z = Math.PI / 2;
    waterfall.position.set(0, 0.48, -0.23);
    chair.add(waterfall);

    // 5. Ergonomic Mesh Backrest with Lumbar Support
    const spineArm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.04), chairFrameMat);
    spineArm.position.set(0, 0.65, 0.24);
    spineArm.rotation.x = 0.15;
    enableShadows(spineArm);
    chair.add(spineArm);

    const backFrame = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.52, 0.04), chairFrameMat);
    backFrame.position.set(0, 0.82, 0.24);
    backFrame.rotation.x = 0.12;
    enableShadows(backFrame);
    chair.add(backFrame);

    const meshPanel = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.46, 0.02), meshBackMat);
    meshPanel.position.set(0, 0.82, 0.23);
    meshPanel.rotation.x = 0.12;
    chair.add(meshPanel);

    const lumbarBar = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.07, 0.03), chairFrameMat);
    lumbarBar.position.set(0, 0.70, 0.21);
    lumbarBar.rotation.x = 0.12;
    chair.add(lumbarBar);

    // 6. Adjustable T-Armrests
    const armStemL = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.22, 8), chairFrameMat);
    armStemL.position.set(-0.25, 0.58, 0.02);
    chair.add(armStemL);

    const armPadL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.025, 0.2), chairFrameMat);
    armPadL.position.set(-0.25, 0.69, 0.02);
    enableShadows(armPadL);
    chair.add(armPadL);

    const armStemR = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.22, 8), chairFrameMat);
    armStemR.position.set(0.25, 0.58, 0.02);
    chair.add(armStemR);

    const armPadR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.025, 0.2), chairFrameMat);
    armPadR.position.set(0.25, 0.69, 0.02);
    enableShadows(armPadR);
    chair.add(armPadR);

    station.add(chair);
    return station;
  }

  // Define Workstations Layout (5 Desks with spacious walkways)
  const deskLocations = [
    { id: 0, x: -3.5, z: -2, rot: 0 },
    { id: 1, x: 0, z: -2, rot: 0 },
    { id: 2, x: 3.5, z: -2, rot: 0 },
    { id: 3, x: -2.0, z: 2.2, rot: Math.PI },
    { id: 4, x: 2.0, z: 2.2, rot: Math.PI },
  ];

  deskLocations.forEach((loc) => {
    const station = createDeskStation(loc.id, loc.x, loc.z, loc.rot);
    officeGroup.add(station);
  });

  scene.add(officeGroup);

  return {
    officeGroup,
    deskLocations,
  };
}
