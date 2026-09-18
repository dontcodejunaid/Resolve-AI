import * as THREE from 'three';

const CODING_THOUGHTS = [
  'Writing React UI components on laptop 💻',
  'Compiling TypeScript build on laptop ⚡',
  'Reviewing code diffs on laptop 🔍',
  'Fixing unit test edge cases on laptop 🧪',
  'Optimizing bundle rendering performance 🚀',
  'Implementing micro-animations in Three.js 🎨',
  'Refactoring state management logic 🧼',
  'Deploying latest release to staging 🌐',
];

export class EmployeeAIController {
  constructor(workerData, worker3D, deskLocation) {
    this.data = workerData;
    this.model = worker3D.root;
    this.bones = worker3D.bones;
    this.deskLoc = deskLocation;

    // Seating position directly on the chair cushion at desk
    const seatOffsetZ = deskLocation.rot === 0 ? 0.50 : -0.50;
    this.seatPos = new THREE.Vector3(
      deskLocation.x,
      0,
      deskLocation.z + seatOffsetZ
    );

    this.deskFacingRot = deskLocation.rot === 0 ? Math.PI : 0;

    // State: Seated at desk working on laptop
    this.state = 'CODING';
    this.timer = 5 + Math.random() * 8;
    this.animTime = Math.random() * 10;
    this.typingSpeed = 5 + Math.random() * 2;

    // Lock position and rotation right in the chair
    this.model.position.copy(this.seatPos);
    this.model.rotation.y = this.deskFacingRot;
    this.data.thought = CODING_THOUGHTS[this.data.id % CODING_THOUGHTS.length];
  }

  update(delta, simSpeed = 1) {
    const dt = delta * simSpeed;
    this.animTime += dt * this.typingSpeed;
    this.timer -= dt;

    // Keep firmly seated in chair at workstation
    this.model.position.copy(this.seatPos);
    this.model.rotation.y = this.deskFacingRot;

    this.updateCodingAnimation(dt);

    if (this.timer <= 0) {
      this.timer = 6 + Math.random() * 10;
      this.data.thought = CODING_THOUGHTS[Math.floor(Math.random() * CODING_THOUGHTS.length)];
    }
  }

  updateCodingAnimation(dt) {
    // 1. Seated pelvis positioned flush on chair cushion
    this.bones.hips.position.y = 0.37;

    // 2. Legs resting naturally bent forward under desk
    this.bones.leftLegPivot.rotation.x = -Math.PI / 2.1;
    this.bones.rightLegPivot.rotation.x = -Math.PI / 2.1;

    // 3. Subtle torso breathing and leaning towards laptop
    const torsoLean = 0.13 + Math.sin(this.animTime * 0.4) * 0.025;
    this.bones.torso.rotation.x = torsoLean;

    // 4. Bobblehead rhythmic nodding & slight tilt while typing on laptop
    const bobbleNod = Math.sin(this.animTime * 0.8) * 0.12;
    const bobbleTilt = Math.sin(this.animTime * 0.4) * 0.06;
    this.bones.headPivot.rotation.x = 0.22 + bobbleNod;
    this.bones.headPivot.rotation.z = bobbleTilt;
    this.bones.headPivot.rotation.y = Math.sin(this.animTime * 0.25) * 0.08;

    // 5. Arms reaching forward down onto laptop keyboard
    const tapL = Math.sin(this.animTime * 1.6);
    const tapR = Math.cos(this.animTime * 1.6);

    this.bones.leftArmPivot.rotation.x = -1.35 + tapL * 0.05;
    this.bones.leftArmPivot.rotation.y = 0.28;
    this.bones.leftArmPivot.rotation.z = -0.15;

    this.bones.rightArmPivot.rotation.x = -1.35 + tapR * 0.05;
    this.bones.rightArmPivot.rotation.y = -0.28;
    this.bones.rightArmPivot.rotation.z = 0.15;

    // 6. Hands angled flat directly over laptop keys & trackpad
    if (this.bones.leftHandGroup) {
      this.bones.leftHandGroup.rotation.x = 0.45 + tapL * 0.08;
      this.bones.leftHandGroup.rotation.z = 0.1;
    }
    if (this.bones.rightHandGroup) {
      this.bones.rightHandGroup.rotation.x = 0.45 + tapR * 0.08;
      this.bones.rightHandGroup.rotation.z = -0.1;
    }

    // 7. Fast alternating 5-finger typing on laptop keys
    if (this.bones.leftFingers) {
      this.bones.leftFingers.forEach((finger, i) => {
        finger.rotation.x = Math.PI / 2 + Math.sin(this.animTime * 2.2 + i * 1.4) * 0.28;
      });
    }
    if (this.bones.rightFingers) {
      this.bones.rightFingers.forEach((finger, i) => {
        finger.rotation.x = Math.PI / 2 + Math.cos(this.animTime * 2.2 + i * 1.4) * 0.28;
      });
    }
  }
}
