import * as THREE from 'three';

/**
 * Creates a truly realistic, seamless, organically-proportioned 3D human Software Engineer
 * dressed in a tailored business suit with a silk necktie, crisp shirt, formal slacks, and leather shoes.
 * 
 * Built with continuous smooth vertex-normal topology (no disjointed balloon capsules or puffball seams).
 */
export function create3DWorker({
  id,
  name = 'Alex T.',
  role = 'Software Engineer',
  suitColor = 0x24324d,     // Premium Slate Navy Suit
  shirtColor = 0xffffff,    // Crisp White Shirt
  tieColor = 0x1d4ed8,      // Royal Blue Silk Tie
  pantsColor = 0x24324d,    // Matching Trousers
  skinColor = 0xf5d0b5,     // Natural Human Skin
  hairColor = 0x3d2314,     // Rich Warm Brown Hair
  hasGlasses = true,
  hasCoffeeMug = true,
}) {
  const root = new THREE.Group();
  root.name = `worker-${id}`;
  root.scale.set(1.42, 1.42, 1.42);

  const enableShadows = (mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  };

  // --- Premium Photorealistic Shaders ---
  const suitMat = new THREE.MeshStandardMaterial({
    color: suitColor,
    roughness: 0.72,
    metalness: 0.04,
  });

  const lapelMat = new THREE.MeshStandardMaterial({
    color: suitColor,
    roughness: 0.65,
    metalness: 0.08,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: shirtColor,
    roughness: 0.45,
    metalness: 0.0,
  });

  const tieMat = new THREE.MeshStandardMaterial({
    color: tieColor,
    roughness: 0.32,
    metalness: 0.22, // silk sheen
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: pantsColor,
    roughness: 0.72,
    metalness: 0.04,
  });

  const beltMat = new THREE.MeshStandardMaterial({
    color: 0x3e2312, // dark brown leather
    roughness: 0.4,
  });

  const buckleMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // brass gold
    metalness: 0.9,
    roughness: 0.2,
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0x4a2511, // polished cognac leather
    roughness: 0.35,
    metalness: 0.15,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.52,
    metalness: 0.0,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: hairColor,
    roughness: 0.6,
    metalness: 0.05,
  });

  const glassesMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.25,
    metalness: 0.3,
  });

  const mugMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.2,
  });

  const coffeeMat = new THREE.MeshStandardMaterial({
    color: 0x1f140e,
    roughness: 0.1,
  });

  // ==========================================
  // 1. HIPS & WAIST (Continuous Tailored Trouser Rise)
  // ==========================================
  const hips = new THREE.Group();
  hips.position.y = 0.43;
  root.add(hips);

  // Seamless Pelvis / Waist
  const waistGeo = new THREE.CylinderGeometry(0.12, 0.105, 0.14, 16);
  const waistMesh = new THREE.Mesh(waistGeo, pantsMat);
  waistMesh.scale.set(1.15, 1.0, 0.85); // Natural human hip ratio
  enableShadows(waistMesh);
  hips.add(waistMesh);

  // Leather Belt with Gold Buckle
  const beltGeo = new THREE.CylinderGeometry(0.122, 0.122, 0.024, 16);
  const beltMesh = new THREE.Mesh(beltGeo, beltMat);
  beltMesh.position.y = 0.05;
  beltMesh.scale.set(1.16, 1.0, 0.86);
  hips.add(beltMesh);

  const buckleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.01), buckleMat);
  buckleMesh.position.set(0, 0.05, 0.108);
  hips.add(buckleMesh);

  // ==========================================
  // 2. TORSO (Seamless V-Taper Suit Jacket & Sloping Shoulders)
  // ==========================================
  const torso = new THREE.Group();
  torso.position.y = 0.07;
  hips.add(torso);

  // Single Continuous Tailored Jacket Body (Smooth V-Taper from chest to waist)
  const jacketGeo = new THREE.CylinderGeometry(0.155, 0.12, 0.34, 18);
  const jacketMesh = new THREE.Mesh(jacketGeo, suitMat);
  jacketMesh.position.y = 0.17;
  jacketMesh.scale.set(1.22, 1.0, 0.82); // Broad shoulders to slim waist
  enableShadows(jacketMesh);
  torso.add(jacketMesh);

  // Natural Sloping Shoulders Cap
  const shoulderSlopeGeo = new THREE.CylinderGeometry(0.06, 0.155, 0.08, 18);
  const shoulderSlope = new THREE.Mesh(shoulderSlopeGeo, suitMat);
  shoulderSlope.position.y = 0.34;
  shoulderSlope.scale.set(1.22, 1.0, 0.82);
  enableShadows(shoulderSlope);
  torso.add(shoulderSlope);

  // Crisp White Shirt Inset (V-Opening)
  const shirtInsetGeo = new THREE.BoxGeometry(0.08, 0.22, 0.02);
  const shirtInset = new THREE.Mesh(shirtInsetGeo, shirtMat);
  shirtInset.position.set(0, 0.23, 0.086);
  torso.add(shirtInset);

  // Shirt Collar Wings
  const collarL = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.012), shirtMat);
  collarL.position.set(-0.028, 0.32, 0.092);
  collarL.rotation.z = -0.35;
  collarL.rotation.y = 0.15;
  torso.add(collarL);

  const collarR = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.012), shirtMat);
  collarR.position.set(0.028, 0.32, 0.092);
  collarR.rotation.z = 0.35;
  collarR.rotation.y = -0.15;
  torso.add(collarR);

  // Silk Necktie (Tie Knot + Slender Tapered Blade)
  const tieKnot = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.01, 0.028, 6), tieMat);
  tieKnot.position.set(0, 0.305, 0.098);
  torso.add(tieKnot);

  const tieBlade = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.18, 0.008), tieMat);
  tieBlade.position.set(0, 0.20, 0.098);
  torso.add(tieBlade);

  const tieTip = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.024, 4), tieMat);
  tieTip.position.set(0, 0.098, 0.098);
  tieTip.rotation.z = Math.PI;
  tieTip.rotation.y = Math.PI / 4;
  torso.add(tieTip);

  // Tailored Suit Notched Lapels
  const lapelL = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.20, 0.016), lapelMat);
  lapelL.position.set(-0.052, 0.23, 0.09);
  lapelL.rotation.z = -0.22;
  enableShadows(lapelL);
  torso.add(lapelL);

  const lapelR = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.20, 0.016), lapelMat);
  lapelR.position.set(0.052, 0.23, 0.09);
  lapelR.rotation.z = 0.22;
  enableShadows(lapelR);
  torso.add(lapelR);

  // Suit Buttons & Breast Pocket Square
  const btnMat = new THREE.MeshStandardMaterial({ color: 0x1f140e });
  const btn1 = new THREE.Mesh(new THREE.SphereGeometry(0.004, 6, 6), btnMat);
  btn1.position.set(0, 0.11, 0.10);
  torso.add(btn1);

  const btn2 = new THREE.Mesh(new THREE.SphereGeometry(0.004, 6, 6), btnMat);
  btn2.position.set(0, 0.05, 0.096);
  torso.add(btn2);

  const pocketSquare = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.01, 0.006), shirtMat);
  pocketSquare.position.set(-0.08, 0.25, 0.088);
  pocketSquare.rotation.z = 0.12;
  torso.add(pocketSquare);

  // ==========================================
  // 3. HEAD & FACE (Clean Sculpted Pixar Human Head)
  // ==========================================
  const headPivot = new THREE.Group();
  headPivot.position.y = 0.38;
  torso.add(headPivot);

  // Proportional Clean Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.046, 0.06, 12), skinMat);
  neck.position.set(0, 0.02, 0);
  enableShadows(neck);
  headPivot.add(neck);

  // Head Group (Iconic Bobblehead Proportions)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.11, 0);
  headGroup.scale.set(1.58, 1.58, 1.58);

  // Anatomical Head (Cranium + Jaw contour)
  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.092, 18, 18), skinMat);
  cranium.position.set(0, 0.02, -0.01);
  cranium.scale.set(0.95, 1.06, 0.96);
  enableShadows(cranium);
  headGroup.add(cranium);

  // Defined Chin & Jaw
  const jaw = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.055, 0.09, 14), skinMat);
  jaw.position.set(0, -0.035, 0.01);
  jaw.scale.set(0.9, 1.0, 0.95);
  enableShadows(jaw);
  headGroup.add(jaw);

  const chin = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), skinMat);
  chin.position.set(0, -0.075, 0.04);
  headGroup.add(chin);

  // Subtle Jaw Shadow / Stubble
  const stubbleMat = new THREE.MeshStandardMaterial({ color: 0xdfb496, roughness: 0.8 });
  const stubble = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.055, 0.05, 14), stubbleMat);
  stubble.position.set(0, -0.045, 0.015);
  stubble.scale.set(0.92, 1.0, 0.96);
  headGroup.add(stubble);

  // Nose
  const nose = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.024, 4, 8), skinMat);
  nose.position.set(0, -0.005, 0.088);
  nose.rotation.x = -0.25;
  headGroup.add(nose);

  // Eyes (Sclera + Brown Iris)
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyeIrisMat = new THREE.MeshBasicMaterial({ color: 0x3d2314 });

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), eyeWhiteMat);
  eyeL.position.set(-0.034, 0.012, 0.08);
  eyeL.scale.set(1.1, 0.85, 0.8);
  headGroup.add(eyeL);

  const irisL = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 8, 8), eyeIrisMat);
  irisL.position.set(-0.034, 0.012, 0.089);
  headGroup.add(irisL);

  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), eyeWhiteMat);
  eyeR.position.set(0.034, 0.012, 0.08);
  eyeR.scale.set(1.1, 0.85, 0.8);
  headGroup.add(eyeR);

  const irisR = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 8, 8), eyeIrisMat);
  irisR.position.set(0.034, 0.012, 0.089);
  headGroup.add(irisR);

  // Eyebrows
  const browMat = new THREE.MeshBasicMaterial({ color: hairColor });
  const browL = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.004, 0.006), browMat);
  browL.position.set(-0.034, 0.028, 0.086);
  browL.rotation.z = 0.06;
  headGroup.add(browL);

  const browR = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.004, 0.006), browMat);
  browR.position.set(0.034, 0.028, 0.086);
  browR.rotation.z = -0.06;
  headGroup.add(browR);

  // Friendly Smile / Mouth
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.004, 0.005), new THREE.MeshStandardMaterial({ color: 0x9b5443 }));
  mouth.position.set(0, -0.04, 0.082);
  headGroup.add(mouth);

  // Ears
  const earL = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.0045, 6, 10, Math.PI * 1.3), skinMat);
  earL.position.set(-0.09, 0.005, -0.005);
  earL.rotation.y = -Math.PI / 2;
  headGroup.add(earL);

  const earR = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.0045, 6, 10, Math.PI * 1.3), skinMat);
  earR.position.set(0.09, 0.005, -0.005);
  earR.rotation.y = Math.PI / 2;
  headGroup.add(earR);

  // Volumetric Sculpted Pompadour Hair
  const hairGroup = new THREE.Group();

  const hairBase = new THREE.Mesh(
    new THREE.SphereGeometry(0.098, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hairBase.position.set(0, 0.035, -0.01);
  hairBase.scale.set(0.98, 1.05, 1.02);
  enableShadows(hairBase);
  hairGroup.add(hairBase);

  // Swept Top Wavy Locks
  const lock1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.07, 6, 10), hairMat);
  lock1.position.set(-0.015, 0.105, 0.02);
  lock1.rotation.x = Math.PI / 2.3;
  lock1.rotation.y = 0.18;
  lock1.scale.set(1.2, 0.8, 1.1);
  enableShadows(lock1);
  hairGroup.add(lock1);

  const lock2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.034, 0.065, 6, 10), hairMat);
  lock2.position.set(0.028, 0.11, 0.01);
  lock2.rotation.x = Math.PI / 2.2;
  lock2.rotation.y = -0.15;
  lock2.scale.set(1.1, 0.75, 1.0);
  enableShadows(lock2);
  hairGroup.add(lock2);

  // Sideburns
  const sbL = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.032, 0.016), hairMat);
  sbL.position.set(-0.09, 0.01, 0.015);
  hairGroup.add(sbL);

  const sbR = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.032, 0.016), hairMat);
  sbR.position.set(0.09, 0.01, 0.015);
  hairGroup.add(sbR);

  headGroup.add(hairGroup);

  // Thick Black Acetate Glasses
  if (hasGlasses) {
    const glassesGroup = new THREE.Group();

    const lRim = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.024, 0.004), glassesMat);
    lRim.position.set(-0.034, 0.012, 0.096);
    glassesGroup.add(lRim);

    const rRim = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.024, 0.004), glassesMat);
    rRim.position.set(0.034, 0.012, 0.096);
    glassesGroup.add(rRim);

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.004, 0.004), glassesMat);
    bridge.position.set(0, 0.016, 0.096);
    glassesGroup.add(bridge);

    const templeL = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.004, 0.09), glassesMat);
    templeL.position.set(-0.048, 0.016, 0.045);
    glassesGroup.add(templeL);

    const templeR = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.004, 0.09), glassesMat);
    templeR.position.set(0.048, 0.016, 0.045);
    glassesGroup.add(templeR);

    headGroup.add(glassesGroup);
  }

  headPivot.add(headGroup);

  // ==========================================
  // 4. ARMS & HANDS (Seamless Suit Sleeves & Cuffs)
  // ==========================================
  function createHandWithFingers(isLeft = false) {
    const handGroup = new THREE.Group();

    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.012, 0.036), skinMat);
    palm.position.set(0, 0, 0.015);
    enableShadows(palm);
    handGroup.add(palm);

    const fingerGeo = (len) => new THREE.CapsuleGeometry(0.0042, len, 4, 6);
    const fingers = [];

    // Index
    const indexF = new THREE.Mesh(fingerGeo(0.02), skinMat);
    indexF.rotation.x = Math.PI / 2;
    indexF.position.set(isLeft ? 0.012 : -0.012, 0, 0.042);
    enableShadows(indexF);
    handGroup.add(indexF);
    fingers.push(indexF);

    // Middle
    const midF = new THREE.Mesh(fingerGeo(0.024), skinMat);
    midF.rotation.x = Math.PI / 2;
    midF.position.set(isLeft ? 0.004 : -0.004, 0, 0.045);
    enableShadows(midF);
    handGroup.add(midF);
    fingers.push(midF);

    // Ring
    const ringF = new THREE.Mesh(fingerGeo(0.02), skinMat);
    ringF.rotation.x = Math.PI / 2;
    ringF.position.set(isLeft ? -0.004 : 0.004, 0, 0.042);
    enableShadows(ringF);
    handGroup.add(ringF);
    fingers.push(ringF);

    // Pinky
    const pinkyF = new THREE.Mesh(fingerGeo(0.015), skinMat);
    pinkyF.rotation.x = Math.PI / 2;
    pinkyF.position.set(isLeft ? -0.012 : 0.012, 0, 0.038);
    enableShadows(pinkyF);
    handGroup.add(pinkyF);
    fingers.push(pinkyF);

    // Thumb
    const thumbF = new THREE.Mesh(fingerGeo(0.014), skinMat);
    thumbF.rotation.x = Math.PI / 2.3;
    thumbF.rotation.y = isLeft ? 0.6 : -0.6;
    thumbF.position.set(isLeft ? 0.02 : -0.02, 0, 0.018);
    enableShadows(thumbF);
    handGroup.add(thumbF);
    fingers.push(thumbF);

    return { handGroup, fingers };
  }

  // Left Arm (Sleeve + Cuff + Hand)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.165, 0.29, 0);
  torso.add(leftArmPivot);

  const sleeveGeo = new THREE.CylinderGeometry(0.036, 0.032, 0.22, 12);
  const leftSleeve = new THREE.Mesh(sleeveGeo, suitMat);
  leftSleeve.position.y = -0.11;
  enableShadows(leftSleeve);
  leftArmPivot.add(leftSleeve);

  const cuffGeo = new THREE.CylinderGeometry(0.031, 0.031, 0.02, 10);
  const leftCuff = new THREE.Mesh(cuffGeo, shirtMat);
  leftCuff.position.y = -0.22;
  leftArmPivot.add(leftCuff);

  const { handGroup: leftHandGroup, fingers: leftFingers } = createHandWithFingers(true);
  leftHandGroup.position.set(0, -0.24, 0.012);
  leftArmPivot.add(leftHandGroup);

  // Right Arm (Sleeve + Cuff + Hand)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.165, 0.29, 0);
  torso.add(rightArmPivot);

  const rightSleeve = new THREE.Mesh(sleeveGeo, suitMat);
  rightSleeve.position.y = -0.11;
  enableShadows(rightSleeve);
  rightArmPivot.add(rightSleeve);

  const rightCuff = new THREE.Mesh(cuffGeo, shirtMat);
  rightCuff.position.y = -0.22;
  rightArmPivot.add(rightCuff);

  const { handGroup: rightHandGroup, fingers: rightFingers } = createHandWithFingers(false);
  rightHandGroup.position.set(0, -0.24, 0.012);
  rightArmPivot.add(rightHandGroup);

  // ==========================================
  // 5. LEGS & SHOES (Seamless Trousers & Cognac Oxfords)
  // ==========================================
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.065, -0.04, 0);
  hips.add(leftLegPivot);

  const trouserGeo = new THREE.CylinderGeometry(0.044, 0.038, 0.36, 12);
  const leftTrouser = new THREE.Mesh(trouserGeo, pantsMat);
  leftTrouser.position.y = -0.18;
  enableShadows(leftTrouser);
  leftLegPivot.add(leftTrouser);

  // Left Cognac Brown Oxford Shoe
  const shoeGroupL = new THREE.Group();
  shoeGroupL.position.set(0, -0.36, 0.015);

  const shoeUpperL = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.068, 6, 10), shoeMat);
  shoeUpperL.rotation.x = Math.PI / 2;
  shoeUpperL.scale.set(0.85, 1.25, 0.7);
  enableShadows(shoeUpperL);
  shoeGroupL.add(shoeUpperL);

  const soleL = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.015, 0.15), beltMat);
  soleL.position.y = -0.022;
  shoeGroupL.add(soleL);
  leftLegPivot.add(shoeGroupL);

  // Right Leg
  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.065, -0.04, 0);
  hips.add(rightLegPivot);

  const rightTrouser = new THREE.Mesh(trouserGeo, pantsMat);
  rightTrouser.position.y = -0.18;
  enableShadows(rightTrouser);
  rightLegPivot.add(rightTrouser);

  // Right Cognac Brown Oxford Shoe
  const shoeGroupR = new THREE.Group();
  shoeGroupR.position.set(0, -0.36, 0.015);

  const shoeUpperR = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.068, 6, 10), shoeMat);
  shoeUpperR.rotation.x = Math.PI / 2;
  shoeUpperR.scale.set(0.85, 1.25, 0.7);
  enableShadows(shoeUpperR);
  shoeGroupR.add(shoeUpperR);

  const soleR = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.015, 0.15), beltMat);
  soleR.position.y = -0.022;
  shoeGroupR.add(soleR);
  rightLegPivot.add(shoeGroupR);

  return {
    root,
    bones: {
      hips,
      torso,
      headPivot,
      leftArmPivot,
      rightArmPivot,
      leftHandGroup,
      rightHandGroup,
      leftFingers,
      rightFingers,
      leftLegPivot,
      rightLegPivot,
    },
    materials: {
      suitMat,
      shirtMat,
      tieMat,
      pantsMat,
      skinMat,
    },
  };
}
